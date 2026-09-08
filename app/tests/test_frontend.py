"""Servidor real: novo build opcional, laboratório legado e isolamento de arquivos."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[2]


class TestFrontend(unittest.TestCase):
    def test_build_opcional_preserva_legado_e_nao_expoe_arquivos_externos(self):
        with tempfile.TemporaryDirectory(prefix="phb-front-static-") as tmp:
            base = Path(tmp)
            build = base / "build"
            (build / "assets").mkdir(parents=True)
            (build / "index.html").write_text("<html>novo produto</html>")
            (build / "assets" / "app.css").write_text("body{color:navy}")
            (base / "fora.txt").write_text("nao servir")
            os.symlink(base / "fora.txt", build / "atalho.txt")
            proc = subprocess.Popen([sys.executable, "-m", "app.server", "--porta", "0", "--dados", str(base / "dados"), "--frontend", str(build)], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            try:
                url = "http://127.0.0.1:" + str(json.loads(proc.stdout.readline())["porta"])
                for path in ("/produto", "/produto/"):
                    with urllib.request.urlopen(url + path, timeout=5) as response:
                        self.assertIn("novo produto", response.read().decode())
                with urllib.request.urlopen(url + "/produto/assets/app.css", timeout=5) as response:
                    self.assertIn("text/css", response.headers["Content-Type"])
                with urllib.request.urlopen(url + "/", timeout=5) as response:
                    self.assertIn('id="personas"', response.read().decode())
                with urllib.request.urlopen(url + "/api/personas", timeout=5) as response:
                    self.assertEqual(json.load(response), {"personas": []})
                for path in ("/produto/%2e%2e/fora.txt", "/produto/atalho.txt", "/produto/assets/inexistente.js"):
                    with self.assertRaises(urllib.error.HTTPError) as error:
                        urllib.request.urlopen(url + path, timeout=5)
                    self.assertEqual(error.exception.code, 404)
            finally:
                proc.terminate()
                proc.wait(timeout=5)
                proc.stdout.close()
                proc.stderr.close()

    def test_diretorio_sem_build_falha_no_inicio(self):
        with tempfile.TemporaryDirectory() as tmp:
            result = subprocess.run([sys.executable, "-m", "app.server", "--frontend", tmp], cwd=ROOT, capture_output=True, text=True, timeout=5)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("index.html", result.stderr)
