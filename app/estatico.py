"""
Resolução segura de arquivos estáticos (`app/static/`).

`resolver_arquivo` normaliza o caminho pedido e exige que o resultado
continue dentro de `STATIC_DIR` — nenhum `..` (cru ou percent-encoded, já
decodificado pelo chamador) escapa do diretório.
"""
import os

STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

MIME_TIPOS = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
}
MIME_PADRAO = "application/octet-stream"


def resolver_arquivo(caminho_pedido: str, diretorio=None):
    """Retorna `(caminho_absoluto, mime)` para `caminho_pedido` relativo a
    `STATIC_DIR`, ou `None` se o arquivo não existir ou o caminho escapar
    de `STATIC_DIR`."""
    raiz = os.path.realpath(diretorio or STATIC_DIR)
    alvo = os.path.realpath(os.path.join(raiz, caminho_pedido.lstrip("/")))
    dentro_da_raiz = os.path.commonpath([raiz, alvo]) == raiz
    if not dentro_da_raiz or not os.path.isfile(alvo):
        return None
    _, ext = os.path.splitext(alvo)
    return alvo, MIME_TIPOS.get(ext, MIME_PADRAO)
