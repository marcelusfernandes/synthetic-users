"""
Testes de integração do servidor HTTP (app/).

Sobem o servidor real (`python3 -m app.server --porta 0 --dados <tmp>`) num
subprocesso, leem a porta da primeira linha do stdout e falam HTTP com
`urllib` — nada é mockado (CLAUDE.md, invariante 4).

Rodar: python3 -m unittest discover -s app/tests -t .   (ou via `make test`)
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import unittest
import urllib.error
import urllib.request

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class ServidorTestCase(unittest.TestCase):
    """Base: sobe um servidor novo, com dados isolados, para cada teste."""

    def setUp(self):
        self.tmp_dir = tempfile.mkdtemp(prefix="phb-app-teste-")
        self.proc = subprocess.Popen(
            [sys.executable, "-m", "app.server", "--porta", "0", "--dados", self.tmp_dir],
            cwd=REPO_ROOT,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
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

    def tearDown(self):
        self.proc.terminate()
        try:
            self.proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            self.proc.kill()
            self.proc.wait(timeout=5)
        self.proc.stdout.close()
        self.proc.stderr.close()
        shutil.rmtree(self.tmp_dir, ignore_errors=True)

    def _request(self, method, path, corpo=None):
        dados = json.dumps(corpo).encode("utf-8") if corpo is not None else None
        headers = {"Content-Type": "application/json"} if dados is not None else {}
        req = urllib.request.Request(self.base_url + path, data=dados, method=method, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                bruto = resp.read().decode("utf-8")
                return resp.status, (json.loads(bruto) if bruto else None), dict(resp.headers)
        except urllib.error.HTTPError as e:
            bruto = e.read().decode("utf-8")
            return e.code, (json.loads(bruto) if bruto else None), dict(e.headers)

    def _get(self, path):
        return self._request("GET", path)

    def _post(self, path, corpo):
        return self._request("POST", path, corpo)

    def _criar_persona(self, nome="Teste", ocean=None):
        payload = {
            "nome": nome,
            "bio": "bio de teste",
            "voz": "voz de teste",
            "ocean_base": ocean or {
                "abertura": 7.0, "conscienciosidade": 6.0, "extroversao": 5.0,
                "amabilidade": 6.0, "neuroticismo": 3.0,
            },
        }
        status, corpo, _ = self._post("/api/personas", payload)
        return status, corpo


class TestPersonas(ServidorTestCase):
    def test_criar_e_listar_persona(self):
        status, persona = self._criar_persona("Fulana")
        self.assertEqual(status, 201)
        self.assertIn("id", persona)
        self.assertEqual(persona["nome"], "Fulana")
        self.assertIn("criada_em", persona)

        status, corpo, _ = self._get("/api/personas")
        self.assertEqual(status, 200)
        ids = [p["id"] for p in corpo["personas"]]
        self.assertIn(persona["id"], ids)

        status, corpo, _ = self._get(f"/api/personas/{persona['id']}")
        self.assertEqual(status, 200)
        self.assertEqual(corpo["id"], persona["id"])

    def test_get_persona_inexistente_404(self):
        status, corpo, _ = self._get("/api/personas/nao-existe-000000")
        self.assertEqual(status, 404)

    def test_persona_traco_fora_de_faixa_400(self):
        payload = {
            "nome": "Traço Ruim",
            "bio": "x", "voz": "x",
            "ocean_base": {
                "abertura": 11, "conscienciosidade": 6.0, "extroversao": 5.0,
                "amabilidade": 6.0, "neuroticismo": 3.0,
            },
        }
        status, corpo, _ = self._post("/api/personas", payload)
        self.assertEqual(status, 400)
        self.assertIn("erro", corpo)

    def test_persona_chave_desconhecida_400(self):
        payload = {
            "nome": "Chave Ruim", "bio": "x", "voz": "x",
            "ocean_base": {
                "abertura": 5.0, "conscienciosidade": 6.0, "extroversao": 5.0,
                "amabilidade": 6.0, "neuroticismo": 3.0, "carisma": 7.0,
            },
        }
        status, corpo, _ = self._post("/api/personas", payload)
        self.assertEqual(status, 400)
        self.assertIn("erro", corpo)

    def test_persona_nome_vazio_400(self):
        status, corpo = self._criar_persona(nome="   ")
        self.assertEqual(status, 400)
        self.assertIn("erro", corpo)

    def test_persona_json_invalido_400(self):
        req = urllib.request.Request(
            self.base_url + "/api/personas", data=b"{nao e json",
            method="POST", headers={"Content-Type": "application/json"},
        )
        try:
            urllib.request.urlopen(req, timeout=5)
            self.fail("deveria ter falhado com 400")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)


class TestSessoesETurnos(ServidorTestCase):
    def test_criar_sessao_para_persona_existente(self):
        _, persona = self._criar_persona("Sessão Ok")
        status, corpo, _ = self._post("/api/sessoes", {"persona_id": persona["id"]})
        self.assertEqual(status, 201)
        self.assertEqual(corpo["persona_id"], persona["id"])
        self.assertEqual(corpo["turnos"], [])

        status, corpo, _ = self._get("/api/sessoes")
        self.assertEqual(status, 200)
        self.assertEqual(len(corpo["sessoes"]), 1)
        self.assertEqual(corpo["sessoes"][0]["persona_nome"], "Sessão Ok")

    def test_criar_sessao_persona_inexistente_404(self):
        status, corpo, _ = self._post("/api/sessoes", {"persona_id": "nao-existe-000000"})
        self.assertEqual(status, 404)

    def test_dois_turnos_irritacao_cresce_e_persiste(self):
        _, persona = self._criar_persona("Dan Alvo")
        _, sessao = self._post("/api/sessoes", {"persona_id": persona["id"]})[:2]
        sessao_id = sessao["id"]

        status, turno1, _ = self._post(
            f"/api/sessoes/{sessao_id}/turno",
            {"quem": "dan", "eventos": [{"tipo": "elogio_especifico", "intensidade": 0.6}]},
        )
        self.assertEqual(status, 200)
        self.assertEqual(turno1["turno"], 1)

        status, turno2, _ = self._post(
            f"/api/sessoes/{sessao_id}/turno",
            {"quem": "dan", "eventos": [{"tipo": "deboche", "intensidade": 0.8}]},
        )
        self.assertEqual(status, 200)
        self.assertEqual(turno2["turno"], 2)

        self.assertGreater(turno2["snapshot"]["rel"]["irritacao"], turno1["snapshot"]["rel"]["irritacao"])

        caminho = os.path.join(self.tmp_dir, "sessoes", f"{sessao_id}.json")
        with open(caminho) as f:
            doc = json.load(f)
        self.assertEqual(len(doc["turnos"]), 2)

        status, corpo, _ = self._get(f"/api/sessoes/{sessao_id}")
        self.assertEqual(status, 200)
        self.assertIn("dan", corpo["relacoes"])
        self.assertEqual(len(corpo["turnos"]), 2)

    def test_turno_tipo_desconhecido_400(self):
        _, persona = self._criar_persona("Tipo Ruim")
        _, sessao = self._post("/api/sessoes", {"persona_id": persona["id"]})[:2]
        status, corpo, _ = self._post(
            f"/api/sessoes/{sessao['id']}/turno",
            {"quem": "dan", "eventos": [{"tipo": "evento_que_nao_existe", "intensidade": 0.5}]},
        )
        self.assertEqual(status, 400)
        self.assertIn("erro", corpo)

    def test_turno_intensidade_fora_de_faixa_400(self):
        _, persona = self._criar_persona("Intensidade Ruim")
        _, sessao = self._post("/api/sessoes", {"persona_id": persona["id"]})[:2]
        status, corpo, _ = self._post(
            f"/api/sessoes/{sessao['id']}/turno",
            {"quem": "dan", "eventos": [{"tipo": "elogio_especifico", "intensidade": 1.5}]},
        )
        self.assertEqual(status, 400)

    def test_turno_sessao_inexistente_404(self):
        status, corpo, _ = self._post(
            "/api/sessoes/nao-existe-000000/turno",
            {"quem": "dan", "eventos": [{"tipo": "elogio_especifico", "intensidade": 0.5}]},
        )
        self.assertEqual(status, 404)

    def test_persona_ocean_base_usado_no_snapshot(self):
        """Mata a mutação que faz `novo_estado` ignorar `ocean_base`: sem
        repassar o `ocean_base` da persona ao motor, o neuroticismo do
        snapshot seria o setpoint da Mariana (3.0), não o da persona (9.0).
        `relacoes` vem vazio antes do primeiro turno (AC3), então a
        checagem é feita no snapshot devolvido pelo turno, não antes dele."""
        _, persona = self._criar_persona("Neurótica", ocean={
            "abertura": 5.0, "conscienciosidade": 5.0, "extroversao": 5.0,
            "amabilidade": 5.0, "neuroticismo": 9.0,
        })
        _, sessao = self._post("/api/sessoes", {"persona_id": persona["id"]})[:2]
        status, turno, _ = self._post(
            f"/api/sessoes/{sessao['id']}/turno",
            {"quem": "dan", "eventos": [{"tipo": "elogio_especifico", "intensidade": 0.6}]},
        )
        self.assertEqual(status, 200)
        self.assertAlmostEqual(turno["snapshot"]["ocean"]["neuroticismo"], 9.0, delta=0.5)

    def test_sessao_arquivo_corrompido_retorna_500_sem_stack_no_corpo(self):
        """`json.JSONDecodeError` é subclasse de `ValueError`; um arquivo de
        sessão corrompido não pode virar 400 (isso não é erro do cliente
        que chamou /turno) — tem que cair no caminho de 500."""
        _, persona = self._criar_persona("Sessão Corrompida")
        _, sessao = self._post("/api/sessoes", {"persona_id": persona["id"]})[:2]
        caminho = os.path.join(self.tmp_dir, "sessoes", f"{sessao['id']}.json")
        with open(caminho, "w") as f:
            f.write("isto não é json{{{")

        status, corpo, _ = self._post(
            f"/api/sessoes/{sessao['id']}/turno",
            {"quem": "dan", "eventos": [{"tipo": "elogio_especifico", "intensidade": 0.5}]},
        )
        self.assertEqual(status, 500)
        self.assertIn("erro", corpo)
        self.assertNotIn("Traceback", corpo["erro"])
        self.assertNotIn('File "', corpo["erro"])

    def test_persona_arquivo_corrompido_ao_criar_sessao_500(self):
        """Mesmo caso do teste acima, mas para uma persona corrompida lida
        em POST /api/sessoes."""
        _, persona = self._criar_persona("Persona Corrompida")
        caminho = os.path.join(self.tmp_dir, "personas", f"{persona['id']}.json")
        with open(caminho, "w") as f:
            f.write("{ nao fecha")

        status, corpo, _ = self._post("/api/sessoes", {"persona_id": persona["id"]})
        self.assertEqual(status, 500)
        self.assertIn("erro", corpo)
        self.assertNotIn("Traceback", corpo["erro"])


class TestConfigECatalogo(ServidorTestCase):
    def test_config(self):
        status, corpo, _ = self._get("/api/config")
        self.assertEqual(status, 200)
        self.assertEqual(corpo, {"llm": False, "modelo": None})

    def test_catalogo(self):
        status, corpo, _ = self._get("/api/catalogo")
        self.assertEqual(status, 200)
        tipos = [e["tipo"] for e in corpo["eventos"]]
        self.assertIn("elogio_especifico", tipos)
        self.assertIn("deboche", tipos)


class TestEstatico(ServidorTestCase):
    def test_raiz_serve_html(self):
        with urllib.request.urlopen(self.base_url + "/", timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            self.assertIn("text/html", resp.headers.get("Content-Type", ""))

    def test_traversal_fora_de_static_404(self):
        try:
            urllib.request.urlopen(self.base_url + "/static/../Makefile", timeout=5)
            self.fail("deveria ter retornado 404")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 404)


if __name__ == "__main__":
    unittest.main()
