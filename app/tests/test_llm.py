"""
Testes de integração do turno com LLM (`app/llm.py`, `POST
/api/sessoes/{id}/mensagem`).

Sobem o servidor real (mesmo padrão de `test_server.py`) e, além disso, um
stub HTTP local (stdlib, `http.server`) que imita a Messages API — nenhuma
chamada sai para a internet (CLAUDE.md, invariante 4: nada é mockado, mas
aqui o "servidor real" do lado do LLM é o próprio stub, apontado via
`PHB_LLM_URL`). `ANTHROPIC_API_KEY=chave-de-teste` é passada só no ambiente
do subprocesso do servidor; os testes verificam que essa string nunca
aparece no corpo de nenhuma resposta nem no stderr do servidor
(CLAUDE.md, invariante 6).

Negative control: na base, `POST /api/sessoes/{id}/mensagem` é 404 (a
rota não existe) — este arquivo falha ali porque espera 200/503/502.

Rodar: python3 -m unittest discover -s app/tests -t .   (ou via `make test`)
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import unittest
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

CHAVE_TESTE = "chave-de-teste"


class StubMessagesAPI(BaseHTTPRequestHandler):
    """Imita `POST https://api.anthropic.com/v1/messages`: devolve
    `content[0].text` fixo por chamada, de uma fila populada pelo teste, ou
    um erro 500 quando `modo_500` está ligado. Guarda o header `x-api-key`
    recebido para o teste confirmar que a chave é enviada — sem nunca expor
    isso numa resposta HTTP real."""

    respostas: list = []
    modo_500 = False
    ultima_chave_recebida = None
    requisicoes: list = []
    respostas_brutas: list = []
    status = 200
    redirect_url = None
    atraso = 0
    desconectar = False

    def do_POST(self):
        tamanho = int(self.headers.get("Content-Length") or 0)
        bruto_recebido = self.rfile.read(tamanho)
        StubMessagesAPI.ultima_chave_recebida = self.headers.get("x-api-key")
        pedido = {
            "path": self.path,
            "headers": {k.lower(): v for k, v in self.headers.items()},
            "body": json.loads(bruto_recebido.decode("utf-8")),
        }
        StubMessagesAPI.requisicoes.append(pedido)
        if StubMessagesAPI.desconectar:
            self.connection.shutdown(2)
            self.connection.close()
            return
        if StubMessagesAPI.atraso:
            time.sleep(StubMessagesAPI.atraso)

        if StubMessagesAPI.redirect_url:
            self.send_response(307)
            self.send_header("Location", StubMessagesAPI.redirect_url)
            self.end_headers()
            return

        if StubMessagesAPI.modo_500 or StubMessagesAPI.status != 200:
            corpo = json.dumps({"erro": "falha simulada no LLM"}).encode("utf-8")
            self.send_response(500 if StubMessagesAPI.modo_500 else StubMessagesAPI.status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(corpo)))
            self.end_headers()
            self.wfile.write(corpo)
            return

        if StubMessagesAPI.respostas_brutas:
            corpo = StubMessagesAPI.respostas_brutas.pop(0)
        else:
            texto = StubMessagesAPI.respostas.pop(0) if StubMessagesAPI.respostas else ""
            if pedido["headers"].get("authorization"):
                resposta = {"choices": [{"message": {"content": texto}}]}
            else:
                resposta = {"content": [{"type": "text", "text": texto}]}
            corpo = json.dumps(resposta).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    def log_message(self, formato, *args):  # silencia o log de acesso padrão
        pass


class ServidorComStubTestCase(unittest.TestCase):
    """Sobe o stub da Messages API numa porta efêmera e, apontando
    `PHB_LLM_URL` para ele, o servidor real do app — mesmo padrão de
    subprocesso + porta efêmera de `test_server.py`, com o ambiente extra
    de cada subclasse (`env_extra`)."""

    env_extra: dict = {"ANTHROPIC_API_KEY": CHAVE_TESTE}

    def setUp(self):
        StubMessagesAPI.respostas = []
        StubMessagesAPI.modo_500 = False
        StubMessagesAPI.ultima_chave_recebida = None
        StubMessagesAPI.requisicoes = []
        StubMessagesAPI.respostas_brutas = []
        StubMessagesAPI.status = 200
        StubMessagesAPI.redirect_url = None
        StubMessagesAPI.atraso = 0
        StubMessagesAPI.desconectar = False
        self.stub = ThreadingHTTPServer(("127.0.0.1", 0), StubMessagesAPI)
        self.stub_thread = threading.Thread(target=self.stub.serve_forever, daemon=True)
        self.stub_thread.start()
        stub_url = f"http://127.0.0.1:{self.stub.server_address[1]}/v1/messages"

        self.tmp_dir = tempfile.mkdtemp(prefix="phb-app-llm-teste-")
        env = dict(os.environ)
        env.pop("ANTHROPIC_API_KEY", None)
        env.pop("OPENROUTER_API_KEY", None)
        env.pop("PHB_LLM_PROVIDER", None)
        env.pop("PHB_MODEL", None)
        env.pop("PHB_MAX_TOKENS", None)
        env.pop("PHB_LLM_TIMEOUT", None)
        env["PHB_LLM_URL"] = stub_url
        env.update(self.env_extra)

        self.proc = subprocess.Popen(
            [sys.executable, "-m", "app.server", "--porta", "0", "--dados", self.tmp_dir],
            cwd=REPO_ROOT, env=env,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        )
        primeira_linha = self.proc.stdout.readline()
        try:
            info = json.loads(primeira_linha)
        except json.JSONDecodeError:
            self.proc.terminate()
            saida_err = self.proc.stderr.read()
            raise RuntimeError(f"servidor não subiu: {primeira_linha!r}\n{saida_err}")
        self.porta = info["porta"]
        self.base_url = f"http://127.0.0.1:{self.porta}"

    def _encerrar_servidor_e_ler_stderr(self) -> str:
        """Termina o processo do servidor e devolve TODO o stderr
        capturado — usado pelos testes que precisam garantir que a chave
        nunca vazou para lá."""
        if self.proc.poll() is None:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.proc.kill()
                self.proc.wait(timeout=5)
        return self.proc.stderr.read()

    def tearDown(self):
        if self.proc.poll() is None:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.proc.kill()
                self.proc.wait(timeout=5)
        self.proc.stdout.close()
        self.proc.stderr.close()
        shutil.rmtree(self.tmp_dir, ignore_errors=True)
        self.stub.shutdown()
        self.stub.server_close()
        self.stub_thread.join(timeout=5)

    def _request(self, method, path, corpo=None):
        dados = json.dumps(corpo).encode("utf-8") if corpo is not None else None
        headers = {"Content-Type": "application/json"} if dados is not None else {}
        req = urllib.request.Request(self.base_url + path, data=dados, method=method, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                bruto = resp.read().decode("utf-8")
                return resp.status, (json.loads(bruto) if bruto else None)
        except urllib.error.HTTPError as e:
            bruto = e.read().decode("utf-8")
            return e.code, (json.loads(bruto) if bruto else None)

    def _get(self, path):
        return self._request("GET", path)

    def _post(self, path, corpo):
        return self._request("POST", path, corpo)

    def _criar_persona_e_sessao(self):
        payload = {
            "nome": "Mariana Teste",
            "bio": "Influenciadora de lifestyle, despojada, foge de polêmica.",
            "voz": "carioca leve, sarcástica, confiante",
            "ocean_base": {
                "abertura": 7.5, "conscienciosidade": 7.0, "extroversao": 7.5,
                "amabilidade": 6.0, "neuroticismo": 3.0,
            },
        }
        _, persona = self._post("/api/personas", payload)
        _, sessao = self._post("/api/sessoes", {"persona_id": persona["id"]})
        return persona, sessao


class TestConfigComChave(ServidorComStubTestCase):
    def test_config_reporta_llm_ligado_com_o_modelo(self):
        status, corpo = self._get("/api/config")
        self.assertEqual(status, 200)
        self.assertEqual(corpo["llm"], True)
        self.assertIn("modelo", corpo)
        self.assertTrue(corpo["modelo"])


class TestMensagemFluxoCompleto(ServidorComStubTestCase):
    def test_mensagem_interpreta_calcula_e_narra(self):
        _, sessao = self._criar_persona_e_sessao()

        StubMessagesAPI.respostas = [
            '[{"tipo": "deboche", "intensidade": 0.8}]',
            "Nossa, também não precisava dessa, hein? Mas tá tudo bem, eu sigo no meu quiet luxury.",
        ]

        status, turno = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem",
            {"quem": "dan", "texto": "vc é ridícula com esse papo de quiet luxury"},
        )

        self.assertEqual(status, 200)
        self.assertEqual(turno["turno"], 1)
        self.assertEqual(turno["quem"], "dan")
        self.assertEqual(turno["texto"], "vc é ridícula com esse papo de quiet luxury")
        self.assertEqual(turno["eventos"], [{"tipo": "deboche", "intensidade": 0.8}])
        self.assertIn("narrativa", turno)
        self.assertTrue(turno["narrativa"])

        # irritação sobe (parte de 0.0) após o deboche interpretado — o
        # motor calculou, o LLM só classificou e narrou (invariante 1).
        self.assertGreater(turno["snapshot"]["rel"]["irritacao"], 0.0)

        # a chave foi de fato enviada ao stub (prova de que a integração
        # está ligada), mas nunca aparece numa resposta HTTP do servidor.
        self.assertEqual(StubMessagesAPI.ultima_chave_recebida, CHAVE_TESTE)
        pedido = StubMessagesAPI.requisicoes[0]
        self.assertNotIn("authorization", pedido["headers"])
        self.assertEqual(pedido["headers"]["anthropic-version"], "2023-06-01")
        self.assertEqual(pedido["body"]["model"], "claude-sonnet-5")
        self.assertIn("system", pedido["body"])
        self.assertEqual(pedido["body"]["messages"][0]["role"], "user")

        status_sessao, corpo_sessao = self._get(f"/api/sessoes/{sessao['id']}")
        self.assertEqual(status_sessao, 200)
        self.assertEqual(len(corpo_sessao["turnos"]), 1)
        self.assertEqual(corpo_sessao["turnos"][0]["narrativa"], turno["narrativa"])

        for corpo in (turno, corpo_sessao):
            self.assertNotIn(CHAVE_TESTE, json.dumps(corpo, ensure_ascii=False))

        stderr = self._encerrar_servidor_e_ler_stderr()
        self.assertNotIn(CHAVE_TESTE, stderr)

    def test_eventos_fora_do_catalogo_e_tipo_invalido_sao_descartados(self):
        """Parse defensivo (AC1): tipo fora do catálogo é descartado; se a
        lista resultante fica vazia, vira `neutro` intensidade 0.0."""
        _, sessao = self._criar_persona_e_sessao()
        StubMessagesAPI.respostas = [
            '```json\n[{"tipo": "evento_que_nao_existe", "intensidade": 5}]\n```',
            "Tranquilo, sem climão nenhum.",
        ]
        status, turno = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem",
            {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual(status, 200)
        self.assertEqual(turno["eventos"], [{"tipo": "neutro", "intensidade": 0.0}])

    def test_intensidade_e_clampada_em_0_1(self):
        """AC1: intensidade fora de 0..1 é limitada, não descartada (ao
        contrário de um tipo fora do catálogo)."""
        _, sessao = self._criar_persona_e_sessao()
        StubMessagesAPI.respostas = [
            '[{"tipo": "deboche", "intensidade": 1.7}]',
            "Ok, mas com estilo.",
        ]
        status, turno = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem",
            {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual(status, 200)
        self.assertEqual(turno["eventos"], [{"tipo": "deboche", "intensidade": 1.0}])


class TestMensagemSemChave(ServidorComStubTestCase):
    env_extra: dict = {}  # sem ANTHROPIC_API_KEY

    def test_config_reporta_llm_desligado(self):
        status, corpo = self._get("/api/config")
        self.assertEqual(status, 200)
        self.assertEqual(corpo, {"llm": False, "modelo": None})

    def test_mensagem_sem_chave_503(self):
        _, sessao = self._criar_persona_e_sessao()
        status, corpo = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem",
            {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual(status, 503)
        self.assertEqual(corpo, {"erro": "LLM não configurado"})


class TestMensagemStubComErro(ServidorComStubTestCase):
    def test_stub_500_vira_502(self):
        _, sessao = self._criar_persona_e_sessao()
        StubMessagesAPI.modo_500 = True
        status, corpo = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem",
            {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual(status, 502)
        self.assertIn("erro", corpo)
        self.assertNotIn(CHAVE_TESTE, corpo["erro"])

        stderr = self._encerrar_servidor_e_ler_stderr()
        self.assertNotIn(CHAVE_TESTE, stderr)


class TestOpenRouter(ServidorComStubTestCase):
    env_extra = {
        "PHB_LLM_PROVIDER": "openrouter",
        "OPENROUTER_API_KEY": CHAVE_TESTE,
        "ANTHROPIC_API_KEY": "chave-anthropic-nao-selecionada",
        "PHB_MODEL": "z-ai/glm-5.3-flash",
    }

    def test_payload_headers_modelo_e_selecao_explicita(self):
        _, sessao = self._criar_persona_e_sessao()
        StubMessagesAPI.respostas = [
            '[{"tipo": "deboche", "intensidade": 0.4}]', "Resposta segura.",
        ]
        status, turno = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual(status, 200)
        self.assertEqual(turno["narrativa"], "Resposta segura.")
        pedido = StubMessagesAPI.requisicoes[0]
        self.assertEqual(pedido["headers"]["authorization"], f"Bearer {CHAVE_TESTE}")
        self.assertNotIn("x-api-key", pedido["headers"])
        self.assertNotIn("anthropic-version", pedido["headers"])
        self.assertEqual(pedido["body"]["model"], "z-ai/glm-5.3-flash")
        self.assertEqual(pedido["body"]["max_tokens"], 600)
        self.assertEqual([m["role"] for m in pedido["body"]["messages"]], ["system", "user"])

    def test_falha_na_segunda_chamada_nao_persiste_turno(self):
        _, sessao = self._criar_persona_e_sessao()
        StubMessagesAPI.respostas_brutas = [
            json.dumps({"choices": [{"message": {"content": '[{"tipo":"neutro","intensidade":0}]'}}]}).encode(),
            json.dumps({"choices": [{"message": {"content": "   "}}]}).encode(),
        ]
        status, corpo = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual((status, corpo), (502, {"erro": "falha ao chamar o LLM"}))
        _, salva = self._get(f"/api/sessoes/{sessao['id']}")
        self.assertEqual(salva["turnos"], [])


class TestOpenRouterSemModelo(ServidorComStubTestCase):
    env_extra = {"PHB_LLM_PROVIDER": "openrouter", "OPENROUTER_API_KEY": CHAVE_TESTE}

    def test_openrouter_exige_modelo_explicito(self):
        status, corpo = self._get("/api/config")
        self.assertEqual((status, corpo), (200, {"llm": False, "modelo": None}))


class TestProvedorInvalido(ServidorComStubTestCase):
    env_extra = {"PHB_LLM_PROVIDER": "outro", "ANTHROPIC_API_KEY": CHAVE_TESTE}

    def test_provedor_invalido_nao_finge_disponibilidade(self):
        status, corpo = self._get("/api/config")
        self.assertEqual((status, corpo), (200, {"llm": False, "modelo": None}))


class TestChaveOpenRouterSemSelecao(ServidorComStubTestCase):
    env_extra = {"OPENROUTER_API_KEY": CHAVE_TESTE}

    def test_chave_openrouter_nao_substitui_anthropic_default(self):
        status, corpo = self._get("/api/config")
        self.assertEqual((status, corpo), (200, {"llm": False, "modelo": None}))


class TestOpenRouterTimeout(TestOpenRouter):
    env_extra = {**TestOpenRouter.env_extra, "PHB_LLM_TIMEOUT": "1"}

    def test_timeout_vira_erro_generico(self):
        StubMessagesAPI.atraso = 2
        _, sessao = self._criar_persona_e_sessao()
        status, corpo = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual((status, corpo), (502, {"erro": "falha ao chamar o LLM"}))


class TestRespostasInvalidasOpenRouter(TestOpenRouter):
    def test_falha_de_rede_vira_erro_generico(self):
        StubMessagesAPI.desconectar = True
        _, sessao = self._criar_persona_e_sessao()
        status, corpo = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual((status, corpo), (502, {"erro": "falha ao chamar o LLM"}))

    def test_json_e_shapes_invalidos_sao_erro_generico(self):
        casos = [b"nao-json", b"{}", b'{"choices":[]}',
                 b'{"choices":[{"message":{"content":null}}]}',
                 b'{"choices":[{"message":{"content":""}}]}']
        for resposta in casos:
            with self.subTest(resposta=resposta):
                _, sessao = self._criar_persona_e_sessao()
                StubMessagesAPI.respostas_brutas = [resposta]
                status, corpo = self._post(
                    f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"},
                )
                self.assertEqual((status, corpo), (502, {"erro": "falha ao chamar o LLM"}))

    def test_erros_http_sao_genericos(self):
        for codigo in (401, 429, 500, 503):
            with self.subTest(codigo=codigo):
                StubMessagesAPI.status = codigo
                _, sessao = self._criar_persona_e_sessao()
                status, corpo = self._post(
                    f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"},
                )
                self.assertEqual((status, corpo), (502, {"erro": "falha ao chamar o LLM"}))

    def test_redirect_e_recusado_sem_enviar_credencial_ao_destino(self):
        recebidas_destino = []

        class Destino(BaseHTTPRequestHandler):
            def do_POST(self):
                recebidas_destino.append(dict(self.headers))
                self.send_response(200)
                self.end_headers()
            def log_message(self, formato, *args):
                pass

        destino = ThreadingHTTPServer(("127.0.0.1", 0), Destino)
        thread = threading.Thread(target=destino.serve_forever, daemon=True)
        thread.start()
        try:
            StubMessagesAPI.redirect_url = f"http://127.0.0.1:{destino.server_address[1]}/roubo"
            _, sessao = self._criar_persona_e_sessao()
            status, corpo = self._post(
                f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"},
            )
            self.assertEqual((status, corpo), (502, {"erro": "falha ao chamar o LLM"}))
            self.assertEqual(recebidas_destino, [])
        finally:
            destino.shutdown(); destino.server_close(); thread.join(timeout=5)


class TestMensagemValidacao(ServidorComStubTestCase):
    def test_mensagem_texto_vazio_400(self):
        _, sessao = self._criar_persona_e_sessao()
        status, corpo = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem",
            {"quem": "dan", "texto": "   "},
        )
        self.assertEqual(status, 400)
        self.assertIn("erro", corpo)

    def test_mensagem_sessao_inexistente_404(self):
        status, corpo = self._post(
            "/api/sessoes/nao-existe-000000/mensagem",
            {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual(status, 404)


if __name__ == "__main__":
    unittest.main()
