"""
`python3 -m app.server [--porta N] [--dados DIR]` — servidor HTTP stdlib
com a API de personas, sessões e turnos sobre o motor v3.

A primeira linha impressa no stdout é `{"porta": N, "dados": "..."}` (com
flush imediato), para quem sobe o servidor num subprocesso descobrir a
porta escolhida (útil com `--porta 0`).
"""
import argparse
import json
import os
from http.server import ThreadingHTTPServer

from .handler import Handler

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Servidor(ThreadingHTTPServer):
    allow_reuse_address = True

    def __init__(self, endereco, handler_cls, dados_dir: str):
        self.dados_dir = dados_dir
        super().__init__(endereco, handler_cls)


def main(argv=None) -> None:
    ap = argparse.ArgumentParser(description="Servidor HTTP do PHB v3 (personas, sessões, turnos)")
    ap.add_argument("--porta", type=int, default=8000, help="porta TCP (0 escolhe uma livre)")
    ap.add_argument("--dados", default=REPO_ROOT, help="diretório de dados (personas/, sessoes/)")
    args = ap.parse_args(argv)

    dados_dir = os.path.abspath(args.dados)
    os.makedirs(dados_dir, exist_ok=True)
    servidor = Servidor(("127.0.0.1", args.porta), Handler, dados_dir)
    porta = servidor.server_address[1]
    print(json.dumps({"porta": porta, "dados": dados_dir}), flush=True)
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        servidor.server_close()


if __name__ == "__main__":
    main()
