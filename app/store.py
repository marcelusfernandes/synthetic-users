"""
Persistência de personas e sessões em JSON, sobre um diretório de dados
(`personas/`, `sessoes/` dentro dele).

O estado da sessão é serializado no mesmo formato de `phb/run_turn.py`
(as funções `salvar`/`carregar` de lá são reutilizadas por import, não
copiadas — via um arquivo temporário, já que elas só sabem falar com um
caminho no disco). Nenhum caminho vindo do cliente é usado para abrir
arquivo: todo id passa por `_validar_id` antes de virar nome de arquivo.
"""
import json
import os
import re
import secrets
import tempfile
from datetime import datetime, timezone

import run_turn  # noqa: E402  (phb/ está no sys.path via app/__init__.py)

ID_RE = re.compile(r"^[a-z0-9-]+$")


class IdInvalido(ValueError):
    """Id de persona ou sessão fora do formato `^[a-z0-9-]+$`."""


def agora_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def novo_id(nome: str) -> str:
    """Slug do nome + 6 hex aleatórios (ex.: `mariana-a1b2c3`)."""
    slug = re.sub(r"[^a-z0-9]+", "-", (nome or "").strip().lower()).strip("-")
    return f"{slug or 'sem-nome'}-{secrets.token_hex(3)}"


def _validar_id(id_: str) -> str:
    if not id_ or not ID_RE.match(id_):
        raise IdInvalido(f"id inválido: {id_!r}")
    return id_


def _dir_personas(dados_dir: str) -> str:
    d = os.path.join(dados_dir, "personas")
    os.makedirs(d, exist_ok=True)
    return d


def _dir_sessoes(dados_dir: str) -> str:
    d = os.path.join(dados_dir, "sessoes")
    os.makedirs(d, exist_ok=True)
    return d


def _ler_json(caminho: str):
    with open(caminho, encoding="utf-8") as f:
        return json.load(f)


def _escrever_json(caminho: str, dados: dict) -> None:
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Personas
# ---------------------------------------------------------------------------

def salvar_persona(dados_dir: str, persona: dict) -> dict:
    _validar_id(persona["id"])
    caminho = os.path.join(_dir_personas(dados_dir), f"{persona['id']}.json")
    _escrever_json(caminho, persona)
    return persona


def carregar_persona(dados_dir: str, id_: str):
    _validar_id(id_)
    caminho = os.path.join(_dir_personas(dados_dir), f"{id_}.json")
    if not os.path.isfile(caminho):
        return None
    return _ler_json(caminho)


def listar_personas(dados_dir: str) -> list:
    d = _dir_personas(dados_dir)
    return [_ler_json(os.path.join(d, nome)) for nome in sorted(os.listdir(d)) if nome.endswith(".json")]


# ---------------------------------------------------------------------------
# Sessões — o "estado" embutido no documento usa o formato de run_turn.salvar
# ---------------------------------------------------------------------------

def _estado_para_dict(estado) -> dict:
    """Serializa um Estado no formato de `run_turn.salvar`, sem duplicar a
    lógica de serialização (que só sabe escrever num caminho real)."""
    fd, tmp = tempfile.mkstemp(suffix=".json")
    os.close(fd)
    try:
        run_turn.salvar(estado, tmp)
        return _ler_json(tmp)
    finally:
        os.remove(tmp)


def _dict_para_estado(d: dict):
    """Reconstrói um Estado a partir do formato de `run_turn.carregar`."""
    fd, tmp = tempfile.mkstemp(suffix=".json")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(d, f)
        return run_turn.carregar(tmp)
    finally:
        os.remove(tmp)


def salvar_sessao(dados_dir: str, sessao: dict) -> dict:
    """`sessao` traz `id`, `persona_id`, `criada_em`, `turnos` e o Estado
    vivo em `estado_obj`; o documento salvo grava esse estado como `estado`
    no formato de `run_turn.salvar`."""
    _validar_id(sessao["id"])
    doc = {
        "id": sessao["id"],
        "persona_id": sessao["persona_id"],
        "criada_em": sessao["criada_em"],
        "turnos": sessao["turnos"],
        "estado": _estado_para_dict(sessao["estado_obj"]),
    }
    caminho = os.path.join(_dir_sessoes(dados_dir), f"{doc['id']}.json")
    _escrever_json(caminho, doc)
    return doc


def carregar_sessao(dados_dir: str, sessao_id: str):
    """Retorna o documento da sessão com `estado_obj` (um Estado pronto para
    `step()`) além dos campos persistidos, ou `None` se não existir."""
    _validar_id(sessao_id)
    caminho = os.path.join(_dir_sessoes(dados_dir), f"{sessao_id}.json")
    if not os.path.isfile(caminho):
        return None
    doc = _ler_json(caminho)
    doc["estado_obj"] = _dict_para_estado(doc["estado"])
    return doc


def listar_sessoes(dados_dir: str) -> list:
    """Lista leve: não reconstrói o Estado (evita custo desnecessário numa
    listagem)."""
    d = _dir_sessoes(dados_dir)
    itens = []
    for nome in sorted(os.listdir(d)):
        if not nome.endswith(".json"):
            continue
        doc = _ler_json(os.path.join(d, nome))
        itens.append({
            "id": doc["id"], "persona_id": doc["persona_id"],
            "criada_em": doc["criada_em"], "turnos": doc["turnos"],
        })
    return itens
