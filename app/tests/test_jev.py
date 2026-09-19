"""
Testes de integração do interpretador Jev (`app/jev.py`, `PHB_INTERPRETADOR=jev`).

Mesmo padrão de `test_llm.py`: sobem o servidor real numa porta efêmera e,
além do stub da API de chat (o narrador), um stub local da Decisions API do
OpenRouter (`POST /api/alpha/decisions`), apontado por `PHB_JEV_URL` — nenhuma
chamada sai para a internet (CLAUDE.md, invariante 4). A chave
`OPENROUTER_API_KEY=chave-de-teste` só existe no ambiente do subprocesso do
servidor; os testes verificam que nunca aparece em resposta HTTP nem no
stderr (invariante 6).

O que se prova aqui:
- o Jev só classifica: `eventos` vem do mapeamento tipado (P(sim) ≥ limiar,
  intensidade lida da rubrica) e quem calcula o estado é `engine_v3.step()`;
- a trilha `interpretacao` (probabilidades, confiança, custo) entra no turno;
- `POST /api/sessoes/{id}/interpretar` devolve a leitura sem persistir nada;
- falhas de transporte/contrato viram 502 genérico, com uma retentativa em
  timeout (endpoint alpha) e sem persistir turno parcial;
- `/api/config` reporta `interpretador` e `modelo_interpretador`.

Negative control: na base, `interpretacao` não existe no turno e a rota
`/interpretar` é 404 — este arquivo falha ali.

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

import app  # noqa: F401  (garante phb/ no sys.path, via app/__init__.py)
from engine_v3 import EVENTS

from .test_llm import StubMessagesAPI

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

CHAVE_TESTE = "chave-de-teste"
CHAVE_ANTHROPIC_TESTE = "chave-anthropic-de-teste"
TIPOS = [tipo for tipo in EVENTS if tipo != "neutro"]


def respostas_jev(**presentes) -> dict:
    """Corpo de resposta da Decisions API com todos os eventos ausentes
    (P(sim)=0.02, score 0), exceto os passados como `tipo=(p_sim, score)`."""
    answers = {}
    for tipo in TIPOS:
        p_sim, score = presentes.get(tipo, (0.02, 0.0))
        answers[tipo] = {"type": "noul", "noul": p_sim}
        answers[f"intensidade_{tipo}"] = {
            "type": "score", "score": score, "confidence": 0.8,
            "legend": {"0": "leve", "1": "moderada", "2": "forte", "3": "extrema"},
            "probabilities": {"0": 0.1, "1": 0.2, "2": 0.5, "3": 0.2},
        }
    return {
        "model": "typesafe/jev-1.13-20260917", "provider": "TypeSafe", "id": "gen-dec-1",
        "answers": answers,
        "usage": {"input_tokens": 900, "output_tokens": 140, "cost": 0.0000378},
    }


class StubDecisionsAPI(BaseHTTPRequestHandler):
    """Imita `POST https://openrouter.ai/api/alpha/decisions`: devolve um
    corpo da fila `respostas` (dict ou bytes crus), com status/atraso/
    redirect configuráveis por requisição."""

    respostas: list = []
    status = 200
    atrasos: list = []
    redirect_url = None
    requisicoes: list = []

    @classmethod
    def zerar(cls):
        cls.respostas, cls.status, cls.atrasos = [], 200, []
        cls.redirect_url, cls.requisicoes = None, []

    def do_POST(self):
        tamanho = int(self.headers.get("Content-Length") or 0)
        bruto = self.rfile.read(tamanho)
        StubDecisionsAPI.requisicoes.append({
            "path": self.path,
            "headers": {k.lower(): v for k, v in self.headers.items()},
            "body": json.loads(bruto.decode("utf-8")),
        })
        if StubDecisionsAPI.atrasos:
            time.sleep(StubDecisionsAPI.atrasos.pop(0))
        try:
            if StubDecisionsAPI.redirect_url:
                self.send_response(307)
                self.send_header("Location", StubDecisionsAPI.redirect_url)
                self.end_headers()
                return
            if StubDecisionsAPI.status != 200:
                corpo = json.dumps({"error": {"message": "falha simulada"}}).encode("utf-8")
                self.send_response(StubDecisionsAPI.status)
            else:
                proxima = StubDecisionsAPI.respostas.pop(0) if StubDecisionsAPI.respostas else respostas_jev()
                corpo = proxima if isinstance(proxima, bytes) else json.dumps(proxima).encode("utf-8")
                self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(corpo)))
            self.end_headers()
            self.wfile.write(corpo)
        except (BrokenPipeError, ConnectionResetError):
            pass  # o cliente já desistiu (timeout) — esperado no teste de retentativa

    def log_message(self, formato, *args):
        pass


class ServidorComJevTestCase(unittest.TestCase):
    """Sobe o stub da Decisions API e o stub do narrador, e o servidor real
    apontando `PHB_JEV_URL`/`PHB_LLM_URL` para eles."""

    env_extra: dict = {
        "PHB_INTERPRETADOR": "jev",
        "PHB_LLM_PROVIDER": "openrouter",
        "OPENROUTER_API_KEY": CHAVE_TESTE,
        "PHB_MODEL": "z-ai/glm-5.3-flash",
    }

    def setUp(self):
        StubDecisionsAPI.zerar()
        StubMessagesAPI.respostas = []
        StubMessagesAPI.modo_500 = False
        StubMessagesAPI.ultima_chave_recebida = None
        StubMessagesAPI.requisicoes = []
        StubMessagesAPI.respostas_brutas = []
        StubMessagesAPI.status = 200
        StubMessagesAPI.redirect_url = None
        StubMessagesAPI.atraso = 0
        StubMessagesAPI.desconectar = False

        self.stub_jev = ThreadingHTTPServer(("127.0.0.1", 0), StubDecisionsAPI)
        self.stub_jev_thread = threading.Thread(target=self.stub_jev.serve_forever, daemon=True)
        self.stub_jev_thread.start()
        self.stub_llm = ThreadingHTTPServer(("127.0.0.1", 0), StubMessagesAPI)
        self.stub_llm_thread = threading.Thread(target=self.stub_llm.serve_forever, daemon=True)
        self.stub_llm_thread.start()

        self.tmp_dir = tempfile.mkdtemp(prefix="phb-app-jev-teste-")
        env = dict(os.environ)
        for chave in ("ANTHROPIC_API_KEY", "OPENROUTER_API_KEY", "PHB_LLM_PROVIDER", "PHB_MODEL",
                      "PHB_MAX_TOKENS", "PHB_LLM_TIMEOUT", "PHB_INTERPRETADOR", "PHB_JEV_MODEL",
                      "PHB_JEV_LIMIAR", "PHB_JEV_URL"):
            env.pop(chave, None)
        env["PHB_JEV_URL"] = f"http://127.0.0.1:{self.stub_jev.server_address[1]}/api/alpha/decisions"
        env["PHB_LLM_URL"] = f"http://127.0.0.1:{self.stub_llm.server_address[1]}/v1/chat/completions"
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
            raise RuntimeError(f"servidor não subiu: {primeira_linha!r}\n{self.proc.stderr.read()}")
        self.base_url = f"http://127.0.0.1:{info['porta']}"

    def _encerrar_servidor_e_ler_stderr(self) -> str:
        if self.proc.poll() is None:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.proc.kill()
                self.proc.wait(timeout=5)
        return self.proc.stderr.read()

    def tearDown(self):
        self._encerrar_servidor_e_ler_stderr()
        self.proc.stdout.close()
        self.proc.stderr.close()
        shutil.rmtree(self.tmp_dir, ignore_errors=True)
        for servidor, thread in ((self.stub_jev, self.stub_jev_thread), (self.stub_llm, self.stub_llm_thread)):
            servidor.shutdown()
            servidor.server_close()
            thread.join(timeout=5)

    def _request(self, method, path, corpo=None):
        dados = json.dumps(corpo).encode("utf-8") if corpo is not None else None
        headers = {"Content-Type": "application/json"} if dados is not None else {}
        req = urllib.request.Request(self.base_url + path, data=dados, method=method, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
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


class TestConfigComJev(ServidorComJevTestCase):
    def test_config_reporta_interpretador_jev_e_narrador(self):
        status, corpo = self._get("/api/config")
        self.assertEqual(status, 200)
        self.assertEqual(corpo, {
            "llm": True, "modelo": "z-ai/glm-5.3-flash",
            "interpretador": "jev", "modelo_interpretador": "typesafe/jev-1.13",
        })


class TestMensagemComJev(ServidorComJevTestCase):
    def test_jev_classifica_motor_calcula_llm_narra(self):
        _, sessao = self._criar_persona_e_sessao()
        StubDecisionsAPI.respostas = [respostas_jev(deboche=(0.91, 2.0), lisonja=(0.2, 1.0))]
        StubMessagesAPI.respostas = ["Nossa, também não precisava dessa, hein?"]

        status, turno = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem",
            {"quem": "dan", "texto": "vc é ridícula com esse papo de quiet luxury"},
        )

        self.assertEqual(status, 200)
        # só deboche passou do limiar 0.5; intensidade = (score 2 + 1) / 4 níveis
        self.assertEqual(turno["eventos"], [{"tipo": "deboche", "intensidade": 0.75}])
        self.assertEqual(turno["narrativa"], "Nossa, também não precisava dessa, hein?")
        # o motor calculou a partir do evento (o Jev só classificou)
        self.assertGreater(turno["snapshot"]["rel"]["irritacao"], 0.0)
        self.assertEqual(turno["log"]["eventos"], [["deboche", 0.75]])

        trilha = turno["interpretacao"]
        self.assertEqual(trilha["interpretador"], "jev")
        self.assertEqual(trilha["modelo"], "typesafe/jev-1.13-20260917")
        self.assertEqual(trilha["limiar"], 0.5)
        self.assertEqual(trilha["decisoes"]["deboche"],
                         {"probabilidade": 0.91, "intensidade": 0.75, "confianca": 0.8, "emitido": True})
        self.assertEqual(trilha["decisoes"]["lisonja"]["emitido"], False)
        self.assertEqual(trilha["decisoes"]["lisonja"]["probabilidade"], 0.2)
        self.assertEqual(set(trilha["decisoes"]), set(TIPOS))
        self.assertEqual(trilha["uso"], {"tokens_entrada": 900, "tokens_saida": 140, "custo_usd": 0.0000378})

        # a requisição ao Jev: endpoint, credencial, modelo e perguntas tipadas
        self.assertEqual(len(StubDecisionsAPI.requisicoes), 1)
        pedido = StubDecisionsAPI.requisicoes[0]
        self.assertEqual(pedido["path"], "/api/alpha/decisions")
        self.assertEqual(pedido["headers"]["authorization"], f"Bearer {CHAVE_TESTE}")
        self.assertEqual(pedido["body"]["model"], "typesafe/jev-1.13")
        self.assertEqual(pedido["body"]["state"]["mensagem"], "vc é ridícula com esse papo de quiet luxury")
        self.assertEqual(pedido["body"]["state"]["interlocutor"], "dan")
        self.assertEqual(pedido["body"]["state"]["persona"]["nome"], "Mariana Teste")
        perguntas = pedido["body"]["questions"]
        self.assertEqual(len(perguntas), 2 * len(TIPOS))
        self.assertEqual(perguntas["deboche"]["type"], "noul")
        self.assertEqual(set(perguntas["deboche"]["criteria"]), {"true", "false"})
        self.assertEqual(perguntas["intensidade_deboche"]["type"], "score")
        self.assertEqual(perguntas["intensidade_deboche"]["criteria"], ["leve", "moderada", "forte", "extrema"])
        self.assertNotIn("neutro", perguntas)
        # nada do estado interno do motor vai para o Jev
        self.assertNotIn("snapshot", json.dumps(pedido["body"]))

        # o narrador recebeu os eventos e o snapshot, na API de chat
        self.assertEqual(len(StubMessagesAPI.requisicoes), 1)
        contexto = json.loads(StubMessagesAPI.requisicoes[0]["body"]["messages"][1]["content"])
        self.assertEqual(contexto["eventos_interpretados"], [{"tipo": "deboche", "intensidade": 0.75}])

        # persistido com a trilha
        _, salva = self._get(f"/api/sessoes/{sessao['id']}")
        self.assertEqual(salva["turnos"][0]["interpretacao"]["decisoes"]["deboche"]["emitido"], True)

        for corpo in (turno, salva):
            self.assertNotIn(CHAVE_TESTE, json.dumps(corpo, ensure_ascii=False))
        self.assertNotIn(CHAVE_TESTE, self._encerrar_servidor_e_ler_stderr())

    def test_varios_eventos_na_ordem_do_catalogo_e_intensidade_fracionaria(self):
        _, sessao = self._criar_persona_e_sessao()
        StubDecisionsAPI.respostas = [respostas_jev(deboche=(0.6, 0.0), elogio_especifico=(0.5, 1.6))]
        StubMessagesAPI.respostas = ["Ok."]
        status, turno = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual(status, 200)
        # P(sim) == limiar conta como presente; score fracionário vira intensidade contínua
        self.assertEqual(turno["eventos"], [
            {"tipo": "elogio_especifico", "intensidade": 0.65},
            {"tipo": "deboche", "intensidade": 0.25},
        ])

    def test_nada_acima_do_limiar_vira_neutro(self):
        _, sessao = self._criar_persona_e_sessao()
        StubDecisionsAPI.respostas = [respostas_jev(deboche=(0.49, 3.0))]
        StubMessagesAPI.respostas = ["Tranquilo."]
        status, turno = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual(status, 200)
        self.assertEqual(turno["eventos"], [{"tipo": "neutro", "intensidade": 0.0}])
        self.assertEqual(turno["interpretacao"]["decisoes"]["deboche"]["emitido"], False)

    def test_score_fora_da_rubrica_e_clampado(self):
        _, sessao = self._criar_persona_e_sessao()
        StubDecisionsAPI.respostas = [respostas_jev(deboche=(1.0, 9.0), lisonja=(0.7, -3.0))]
        StubMessagesAPI.respostas = ["Ok."]
        status, turno = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual(status, 200)
        self.assertEqual(turno["eventos"], [
            {"tipo": "lisonja", "intensidade": 0.0},
            {"tipo": "deboche", "intensidade": 1.0},
        ])


class TestLimiarConfiguravel(ServidorComJevTestCase):
    env_extra = {**ServidorComJevTestCase.env_extra, "PHB_JEV_LIMIAR": "0.9"}

    def test_limiar_do_ambiente_e_aplicado_e_registrado(self):
        _, sessao = self._criar_persona_e_sessao()
        StubDecisionsAPI.respostas = [respostas_jev(deboche=(0.91, 2.0), lisonja=(0.85, 1.0))]
        StubMessagesAPI.respostas = ["Ok."]
        status, turno = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual(status, 200)
        self.assertEqual(turno["eventos"], [{"tipo": "deboche", "intensidade": 0.75}])
        self.assertEqual(turno["interpretacao"]["limiar"], 0.9)


class TestLimiarInvalido(ServidorComJevTestCase):
    env_extra = {**ServidorComJevTestCase.env_extra, "PHB_JEV_LIMIAR": "1.5"}

    def test_limiar_invalido_desliga_o_jev(self):
        status, corpo = self._get("/api/config")
        self.assertEqual((status, corpo), (200, {
            "llm": False, "modelo": "z-ai/glm-5.3-flash",
            "interpretador": "jev", "modelo_interpretador": None,
        }))


class TestInterpretarSemPersistir(ServidorComJevTestCase):
    def test_interpretar_devolve_eventos_e_trilha_sem_turno(self):
        _, sessao = self._criar_persona_e_sessao()
        _, original = self._get(f"/api/sessoes/{sessao['id']}")
        StubDecisionsAPI.respostas = [respostas_jev(lisonja=(0.77, 1.0))]

        status, corpo = self._post(
            f"/api/sessoes/{sessao['id']}/interpretar", {"quem": "dan", "texto": "vc é perfeita"},
        )
        self.assertEqual(status, 200)
        self.assertEqual(corpo["quem"], "dan")
        self.assertEqual(corpo["texto"], "vc é perfeita")
        self.assertEqual(corpo["eventos"], [{"tipo": "lisonja", "intensidade": 0.5}])
        self.assertEqual(corpo["interpretacao"]["decisoes"]["lisonja"]["probabilidade"], 0.77)
        self.assertNotIn("snapshot", corpo)
        # nenhum turno, nenhuma relação, nenhuma chamada ao narrador
        _, depois = self._get(f"/api/sessoes/{sessao['id']}")
        self.assertEqual(depois["turnos"], [])
        self.assertEqual(depois["relacoes"], original["relacoes"])
        self.assertEqual(StubMessagesAPI.requisicoes, [])
        self.assertNotIn(CHAVE_TESTE, json.dumps(corpo, ensure_ascii=False))

    def test_interpretar_valida_corpo_e_sessao(self):
        _, sessao = self._criar_persona_e_sessao()
        status, corpo = self._post(f"/api/sessoes/{sessao['id']}/interpretar", {"quem": "dan", "texto": " "})
        self.assertEqual(status, 400)
        self.assertIn("erro", corpo)
        status, corpo = self._post(f"/api/sessoes/{sessao['id']}/interpretar", {"quem": "", "texto": "oi"})
        self.assertEqual(status, 400)
        status, _ = self._post("/api/sessoes/nao-existe-000000/interpretar", {"quem": "dan", "texto": "oi"})
        self.assertEqual(status, 404)
        self.assertEqual(StubDecisionsAPI.requisicoes, [])


class TestFalhasDoJev(ServidorComJevTestCase):
    def _mensagem(self, sessao):
        return self._post(f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"})

    def test_http_erro_vira_502_sem_persistir(self):
        for codigo in (401, 429, 500, 503):
            with self.subTest(codigo=codigo):
                StubDecisionsAPI.status = codigo
                _, sessao = self._criar_persona_e_sessao()
                status, corpo = self._mensagem(sessao)
                self.assertEqual((status, corpo), (502, {"erro": "falha ao chamar o Jev"}))
                _, salva = self._get(f"/api/sessoes/{sessao['id']}")
                self.assertEqual(salva["turnos"], [])
        self.assertEqual(StubMessagesAPI.requisicoes, [])
        self.assertNotIn(CHAVE_TESTE, self._encerrar_servidor_e_ler_stderr())

    def test_respostas_fora_do_contrato_sao_502(self):
        sem_intensidade = respostas_jev()
        del sem_intensidade["answers"]["intensidade_deboche"]
        tipo_trocado = respostas_jev()
        tipo_trocado["answers"]["deboche"] = {"type": "choice", "choice": "sim"}
        noul_texto = respostas_jev()
        noul_texto["answers"]["deboche"]["noul"] = "0.9"
        score_bool = respostas_jev()
        score_bool["answers"]["intensidade_deboche"]["score"] = True
        casos = [
            b"nao-json", b"{}", b'{"answers": []}', b'{"answers": {}}',
            b'{"error": {"message": "sem creditos"}, "answers": {}}',
            json.dumps(sem_intensidade).encode(), json.dumps(tipo_trocado).encode(),
            json.dumps(noul_texto).encode(), json.dumps(score_bool).encode(),
        ]
        for resposta in casos:
            with self.subTest(resposta=resposta[:60]):
                _, sessao = self._criar_persona_e_sessao()
                StubDecisionsAPI.respostas = [resposta]
                status, corpo = self._mensagem(sessao)
                self.assertEqual((status, corpo), (502, {"erro": "falha ao chamar o Jev"}))
        self.assertEqual(StubMessagesAPI.requisicoes, [])

    def test_redirect_e_recusado(self):
        StubDecisionsAPI.redirect_url = f"{self.base_url}/api/config"
        _, sessao = self._criar_persona_e_sessao()
        status, corpo = self._mensagem(sessao)
        self.assertEqual((status, corpo), (502, {"erro": "falha ao chamar o Jev"}))

    def test_falha_do_narrador_depois_do_jev_nao_persiste(self):
        _, sessao = self._criar_persona_e_sessao()
        StubDecisionsAPI.respostas = [respostas_jev(deboche=(0.9, 1.0))]
        StubMessagesAPI.modo_500 = True
        status, corpo = self._mensagem(sessao)
        self.assertEqual((status, corpo), (502, {"erro": "falha ao chamar o LLM"}))
        _, salva = self._get(f"/api/sessoes/{sessao['id']}")
        self.assertEqual(salva["turnos"], [])


class TestRetentativaEmTimeout(ServidorComJevTestCase):
    env_extra = {**ServidorComJevTestCase.env_extra, "PHB_LLM_TIMEOUT": "1"}

    def test_um_timeout_e_retentado_uma_vez(self):
        _, sessao = self._criar_persona_e_sessao()
        StubDecisionsAPI.atrasos = [2]           # 1ª chamada pendura; 2ª responde na hora
        StubDecisionsAPI.respostas = [respostas_jev(deboche=(0.9, 1.0)), respostas_jev(deboche=(0.9, 1.0))]
        StubMessagesAPI.respostas = ["Ok."]
        status, turno = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual(status, 200)
        self.assertEqual(turno["eventos"], [{"tipo": "deboche", "intensidade": 0.5}])
        self.assertEqual(len(StubDecisionsAPI.requisicoes), 2)

    def test_dois_timeouts_viram_502(self):
        _, sessao = self._criar_persona_e_sessao()
        StubDecisionsAPI.atrasos = [2, 2]
        status, corpo = self._post(
            f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"},
        )
        self.assertEqual((status, corpo), (502, {"erro": "falha ao chamar o Jev"}))
        self.assertEqual(len(StubDecisionsAPI.requisicoes), 2)


class TestJevSemChave(ServidorComJevTestCase):
    env_extra = {"PHB_INTERPRETADOR": "jev", "ANTHROPIC_API_KEY": CHAVE_ANTHROPIC_TESTE}

    def test_jev_selecionado_sem_chave_openrouter_desliga_conversa(self):
        status, corpo = self._get("/api/config")
        self.assertEqual((status, corpo), (200, {
            "llm": False, "modelo": "claude-sonnet-5",
            "interpretador": "jev", "modelo_interpretador": None,
        }))
        _, sessao = self._criar_persona_e_sessao()
        status, corpo = self._post(f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"})
        self.assertEqual((status, corpo), (503, {"erro": "Jev não configurado"}))
        status, corpo = self._post(f"/api/sessoes/{sessao['id']}/interpretar", {"quem": "dan", "texto": "oi"})
        self.assertEqual((status, corpo), (503, {"erro": "Jev não configurado"}))
        self.assertEqual(StubDecisionsAPI.requisicoes, [])


class TestJevSemNarrador(ServidorComJevTestCase):
    env_extra = {"PHB_INTERPRETADOR": "jev", "OPENROUTER_API_KEY": CHAVE_TESTE}  # provedor anthropic sem chave

    def test_interpretar_funciona_sem_narrador_mas_mensagem_nao(self):
        status, corpo = self._get("/api/config")
        self.assertEqual((status, corpo), (200, {
            "llm": False, "modelo": None,
            "interpretador": "jev", "modelo_interpretador": "typesafe/jev-1.13",
        }))
        _, sessao = self._criar_persona_e_sessao()
        status, corpo = self._post(f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"})
        self.assertEqual((status, corpo), (503, {"erro": "LLM não configurado"}))
        StubDecisionsAPI.respostas = [respostas_jev(pedido_intimo=(0.95, 3.0))]
        status, corpo = self._post(f"/api/sessoes/{sessao['id']}/interpretar", {"quem": "dan", "texto": "oi"})
        self.assertEqual(status, 200)
        self.assertEqual(corpo["eventos"], [{"tipo": "pedido_intimo", "intensidade": 1.0}])


class TestJevComNarradorAnthropic(ServidorComJevTestCase):
    env_extra = {
        "PHB_INTERPRETADOR": "jev", "OPENROUTER_API_KEY": CHAVE_TESTE,
        "ANTHROPIC_API_KEY": CHAVE_ANTHROPIC_TESTE, "PHB_JEV_MODEL": "~typesafe/jev-latest",
    }

    def setUp(self):
        super().setUp()

    def test_cada_chave_vai_so_para_o_seu_destino(self):
        # o narrador Anthropic fala com o stub da Messages API (mesmo stub, rota diferente)
        status, config = self._get("/api/config")
        self.assertEqual(config, {"llm": True, "modelo": "claude-sonnet-5",
                                  "interpretador": "jev", "modelo_interpretador": "~typesafe/jev-latest"})
        _, sessao = self._criar_persona_e_sessao()
        StubDecisionsAPI.respostas = [respostas_jev(humor_compartilhado=(0.8, 2.0))]
        StubMessagesAPI.respostas = ["Haha, boa."]
        status, turno = self._post(f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "kkk"})
        self.assertEqual(status, 200)
        self.assertEqual(turno["eventos"], [{"tipo": "humor_compartilhado", "intensidade": 0.75}])
        pedido_jev = StubDecisionsAPI.requisicoes[0]
        self.assertEqual(pedido_jev["headers"]["authorization"], f"Bearer {CHAVE_TESTE}")
        self.assertNotIn("x-api-key", pedido_jev["headers"])
        self.assertEqual(pedido_jev["body"]["model"], "~typesafe/jev-latest")
        pedido_llm = StubMessagesAPI.requisicoes[0]
        self.assertEqual(pedido_llm["headers"]["x-api-key"], CHAVE_ANTHROPIC_TESTE)
        self.assertNotIn("authorization", pedido_llm["headers"])
        stderr = self._encerrar_servidor_e_ler_stderr()
        self.assertNotIn(CHAVE_TESTE, stderr)
        self.assertNotIn(CHAVE_ANTHROPIC_TESTE, stderr)


class TestInterpretarComLLM(ServidorComJevTestCase):
    """Sem `PHB_INTERPRETADOR`, tudo continua como antes — e `/interpretar`
    também funciona com o LLM, para comparar os dois na mesma mensagem."""
    env_extra = {"PHB_LLM_PROVIDER": "openrouter", "OPENROUTER_API_KEY": CHAVE_TESTE,
                 "PHB_MODEL": "z-ai/glm-5.3-flash"}

    def test_default_continua_llm_e_registra_trilha_minima(self):
        status, config = self._get("/api/config")
        self.assertEqual(config, {"llm": True, "modelo": "z-ai/glm-5.3-flash",
                                  "interpretador": "llm", "modelo_interpretador": "z-ai/glm-5.3-flash"})
        _, sessao = self._criar_persona_e_sessao()
        StubMessagesAPI.respostas = ['[{"tipo": "deboche", "intensidade": 0.8}]']
        status, corpo = self._post(f"/api/sessoes/{sessao['id']}/interpretar", {"quem": "dan", "texto": "oi"})
        self.assertEqual(status, 200)
        self.assertEqual(corpo["eventos"], [{"tipo": "deboche", "intensidade": 0.8}])
        self.assertEqual(corpo["interpretacao"], {"interpretador": "llm", "modelo": "z-ai/glm-5.3-flash"})
        self.assertEqual(StubDecisionsAPI.requisicoes, [])
        StubMessagesAPI.respostas = ['[{"tipo": "deboche", "intensidade": 0.8}]', "Ok."]
        status, turno = self._post(f"/api/sessoes/{sessao['id']}/mensagem", {"quem": "dan", "texto": "oi"})
        self.assertEqual(status, 200)
        self.assertEqual(turno["interpretacao"], {"interpretador": "llm", "modelo": "z-ai/glm-5.3-flash"})


if __name__ == "__main__":
    unittest.main()
