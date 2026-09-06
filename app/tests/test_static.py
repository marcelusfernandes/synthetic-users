"""
Testes de integração dos estáticos da página única (`app/static/`).

Sobem o servidor real (mesmo padrão de `test_server.py`) e falam HTTP com
`urllib` — nada é mockado (CLAUDE.md, invariante 4). Cobrem AC1-AC3 (a
página serve as três áreas) e AC4 (nenhuma aritmética sobre eixos/OCEAN em
`app.js`, checagem literal do grep pedido na issue).

Negative control: na base (placeholder de uma linha), `GET /` não contém
os três ids e este arquivo de teste falha.

Rodar: python3 -m unittest discover -s app/tests -t .   (ou via `make test`)
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
import urllib.request

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APP_JS = os.path.join(REPO_ROOT, "app", "static", "app.js")


class ServidorTestCase(unittest.TestCase):
    """Base: sobe um servidor novo, com dados isolados, para cada teste.

    Mesmo padrão de `test_server.py` — subprocesso real, porta efêmera lida
    da primeira linha do stdout."""

    def setUp(self):
        self.tmp_dir = tempfile.mkdtemp(prefix="phb-app-static-teste-")
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


class TestPaginaUnica(ServidorTestCase):
    def test_raiz_contem_as_tres_areas(self):
        with urllib.request.urlopen(self.base_url + "/", timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            self.assertIn("text/html", resp.headers.get("Content-Type", ""))
            corpo = resp.read().decode("utf-8")
        self.assertIn('id="personas"', corpo)
        self.assertIn('id="sessoes"', corpo)
        self.assertIn('id="turno"', corpo)

    def test_app_js_servido(self):
        with urllib.request.urlopen(self.base_url + "/static/app.js", timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            content_type = resp.headers.get("Content-Type", "")
        # nota (PR): app/estatico.py manda `application/javascript`, não
        # `text/javascript` — ver corpo do PR, não é campo desta issue.
        self.assertIn("javascript", content_type)

    def test_style_css_servido(self):
        with urllib.request.urlopen(self.base_url + "/static/style.css", timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            content_type = resp.headers.get("Content-Type", "")
        self.assertIn("text/css", content_type)


class TestAppJsSemAritmeticaDeEixos(unittest.TestCase):
    """AC4: nenhuma aritmética sobre eixos/OCEAN em app.js além de posicionar
    barras — checagem literal do grep pedido na issue."""

    def test_grep_sem_aritmetica_em_warmth_irritacao_goodwill(self):
        self.assertTrue(os.path.isfile(APP_JS), f"esperado {APP_JS}")
        with open(APP_JS, encoding="utf-8") as f:
            conteudo = f.read()
        padrao = re.compile(r"(warmth|irritacao|goodwill)[^\n]*[-+*/]=")
        achados = padrao.findall(conteudo)
        self.assertEqual(achados, [], f"aritmética sobre eixo encontrada em app.js: {achados}")


if __name__ == "__main__":
    unittest.main()
