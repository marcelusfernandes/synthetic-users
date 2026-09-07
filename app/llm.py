"""
Turno com LLM opcional — interpretar mensagem em eventos, narrar o snapshot.

Só ativo quando `ANTHROPIC_API_KEY` está no ambiente do servidor; a chave é
lida uma única vez, no import deste módulo, para uma variável privada, e
nunca é escrita em log, arquivo, resposta ou mensagem de erro (CLAUDE.md,
invariante 6). O LLM nunca calcula (invariante 1): `interpretar` só produz
`{"tipo", "intensidade"}` do catálogo do motor; `narrar` só produz texto —
o cálculo do estado é sempre `engine_v3.step()`.

`urllib.request` (stdlib) contra a Messages API (`PHB_LLM_URL`, default
`https://api.anthropic.com/v1/messages`; modelo `PHB_MODEL`, default
`claude-sonnet-5`) — nenhuma dependência `pip` (invariante 3).
"""
import json
import os
import re
import urllib.error
import urllib.request

_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
LLM_URL = os.environ.get("PHB_LLM_URL", "https://api.anthropic.com/v1/messages")
MODELO = os.environ.get("PHB_MODEL", "claude-sonnet-5")

_VERSAO_API = "2023-06-01"
_TIMEOUT_SEGUNDOS = 60
_MAX_TOKENS = 600

_FENCE_ABRE_RE = re.compile(r"^```[a-zA-Z]*\n?")
_FENCE_FECHA_RE = re.compile(r"```\s*$")


class LLMError(Exception):
    """Erro ao chamar o LLM (HTTP, timeout, resposta em formato inesperado).

    A mensagem é sempre construída a partir de status codes e texto
    genérico — nunca dos headers da requisição, que carregam a chave em
    `x-api-key` (CLAUDE.md, invariante 6)."""


def esta_configurado() -> bool:
    """`True` quando `ANTHROPIC_API_KEY` estava presente no ambiente no
    momento em que este módulo foi importado."""
    return bool(_API_KEY)


def _chamar_llm(system: str, mensagem_usuario: str) -> str:
    if not _API_KEY:
        raise LLMError("LLM não configurado")

    corpo = json.dumps({
        "model": MODELO,
        "max_tokens": _MAX_TOKENS,
        "system": system,
        "messages": [{"role": "user", "content": mensagem_usuario}],
    }).encode("utf-8")

    requisicao = urllib.request.Request(
        LLM_URL,
        data=corpo,
        method="POST",
        headers={
            "x-api-key": _API_KEY,
            "anthropic-version": _VERSAO_API,
            "content-type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(requisicao, timeout=_TIMEOUT_SEGUNDOS) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        e.read()  # drena o corpo do erro sem usá-lo — pode ecoar a chave enviada
        raise LLMError(f"LLM respondeu com erro HTTP {e.code}") from None
    except urllib.error.URLError:
        raise LLMError("falha ao conectar ao LLM") from None
    except TimeoutError:
        raise LLMError("tempo esgotado ao chamar o LLM") from None
    except json.JSONDecodeError:
        raise LLMError("resposta do LLM não é JSON válido") from None

    try:
        return payload["content"][0]["text"]
    except (KeyError, IndexError, TypeError):
        raise LLMError("resposta do LLM em formato inesperado") from None


def _prompt_interpretar(persona: dict, catalogo: list, quem: str) -> str:
    linhas = [
        "Você é um interpretador de mensagens para uma simulação PHB — nunca "
        "calcula números, apenas classifica a mensagem do interlocutor em "
        "eventos de um catálogo fechado.",
        f"Persona que vai receber a mensagem: {persona.get('nome', '')}. "
        f"Bio: {persona.get('bio', '')}",
        f"A mensagem é do interlocutor identificado como '{quem}'.",
        "Catálogo de eventos válidos (tipo: eixos afetados, valência):",
    ]
    for evento in catalogo:
        linhas.append(f"- {evento['tipo']}: eixos={evento['eixos']} valencia={evento['valencia']}")
    linhas.append(
        "Devolva SOMENTE um array JSON, sem nenhum texto antes ou depois, no "
        'formato [{"tipo": "<um tipo do catálogo acima>", "intensidade": <0..1>}]. '
        "Se a mensagem misturar afeto e ataque, devolva os dois eventos no "
        "mesmo array. Nunca invente um tipo fora do catálogo. Se a mensagem "
        'for neutra, devolva [{"tipo": "neutro", "intensidade": 0.0}].'
    )
    return "\n".join(linhas)


def _parsear_eventos(resposta: str, catalogo: list) -> list:
    """Parse defensivo: tolera cercas de código markdown, JSON malformado ou
    tipos/intensidades fora do catálogo — nunca deixa um evento inválido
    chegar ao motor (fronteira de validação, CLAUDE.md `app/validacao.py`)."""
    tipos_validos = {evento["tipo"] for evento in catalogo}

    bruto = (resposta or "").strip()
    if bruto.startswith("```"):
        bruto = _FENCE_ABRE_RE.sub("", bruto)
        bruto = _FENCE_FECHA_RE.sub("", bruto)
        bruto = bruto.strip()

    try:
        dados = json.loads(bruto)
    except json.JSONDecodeError:
        dados = []
    if not isinstance(dados, list):
        dados = []

    eventos = []
    for item in dados:
        if not isinstance(item, dict):
            continue
        tipo = item.get("tipo")
        if tipo not in tipos_validos:
            continue
        intensidade = item.get("intensidade")
        if not isinstance(intensidade, (int, float)) or isinstance(intensidade, bool):
            continue
        eventos.append({"tipo": tipo, "intensidade": max(0.0, min(1.0, float(intensidade)))})

    return eventos or [{"tipo": "neutro", "intensidade": 0.0}]


def interpretar(texto: str, persona: dict, catalogo: list, quem: str) -> list:
    """Pede ao modelo um JSON de eventos restrito ao catálogo. Nunca calcula
    o estado — só classifica; `engine_v3.step()` faz a matemática."""
    resposta = _chamar_llm(_prompt_interpretar(persona, catalogo, quem), texto)
    return _parsear_eventos(resposta, catalogo)


def _prompt_narrar(persona: dict) -> str:
    return (
        f"Você é {persona.get('nome', '')}. Bio: {persona.get('bio', '')} "
        f"Voz: {persona.get('voz', '')}\n"
        "Responda ao interlocutor na sua própria voz, em português, com uma "
        "narrativa curta e natural — NUNCA cite números, porcentagens, nomes "
        "de eixos (warmth, irritação, confiança...) ou qualquer termo técnico "
        "do estado interno. A resposta deve ser proporcional ao snapshot "
        "recebido: se o snapshot contiver warmth e irritação ao mesmo tempo, "
        "a narrativa deve refletir os dois sentimentos simultaneamente, sem "
        "escolher só um."
    )


def narrar(texto: str, persona: dict, snapshot: dict, eventos: list, quem: str) -> str:
    """Pede a resposta na voz da persona, proporcional ao `snapshot` do
    motor — nunca decide números, só narra o que já foi calculado."""
    contexto = json.dumps({
        "interlocutor": quem,
        "mensagem": texto,
        "eventos_interpretados": eventos,
        "snapshot": snapshot,
    }, ensure_ascii=False)
    resposta = _chamar_llm(_prompt_narrar(persona), contexto)
    return resposta.strip()
