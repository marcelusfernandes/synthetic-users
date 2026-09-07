"""
Turno com LLM opcional — interpretar mensagem em eventos, narrar o snapshot.

O provedor é escolhido explicitamente por `PHB_LLM_PROVIDER` (`anthropic`,
o default, ou `openrouter`). A chave correspondente é lida uma única vez,
no import deste módulo, para uma variável privada, e
nunca é escrita em log, arquivo, resposta ou mensagem de erro (CLAUDE.md,
invariante 6). O LLM nunca calcula (invariante 1): `interpretar` só produz
`{"tipo", "intensidade"}` do catálogo do motor; `narrar` só produz texto —
o cálculo do estado é sempre `engine_v3.step()`.

`urllib.request` (stdlib) contra a API do provedor. `PHB_LLM_URL` pode
sobrescrever o endpoint (inclusive em fixtures locais) — nenhuma dependência
`pip` (invariante 3).
"""
import http.client
import json
import os
import re
import urllib.error
import urllib.request

PROVEDOR = os.environ.get("PHB_LLM_PROVIDER", "anthropic").strip().lower()
_CHAVES = {
    "anthropic": os.environ.get("ANTHROPIC_API_KEY"),
    "openrouter": os.environ.get("OPENROUTER_API_KEY"),
}
_URLS = {
    "anthropic": "https://api.anthropic.com/v1/messages",
    "openrouter": "https://openrouter.ai/api/v1/chat/completions",
}
LLM_URL = os.environ.get("PHB_LLM_URL") or _URLS.get(PROVEDOR, "")
MODELO = os.environ.get("PHB_MODEL") or ("claude-sonnet-5" if PROVEDOR == "anthropic" else "")

_VERSAO_API = "2023-06-01"


def _inteiro_positivo(nome: str, default: int):
    try:
        valor = int(os.environ.get(nome, str(default)))
    except ValueError:
        return None
    return valor if valor > 0 else None


_TIMEOUT_SEGUNDOS = _inteiro_positivo("PHB_LLM_TIMEOUT", 60)
_MAX_TOKENS = _inteiro_positivo("PHB_MAX_TOKENS", 600)

_FENCE_ABRE_RE = re.compile(r"^```[a-zA-Z]*\n?")
_FENCE_FECHA_RE = re.compile(r"```\s*$")


class LLMError(Exception):
    """Erro ao chamar o LLM (HTTP, timeout, resposta em formato inesperado).

    A mensagem é sempre construída a partir de status codes e texto
    genérico — nunca dos headers da requisição, que carregam a chave em
    `x-api-key` (CLAUDE.md, invariante 6)."""


def esta_configurado() -> bool:
    """`True` quando provedor, chave e modelo formam configuração válida."""
    return (PROVEDOR in _CHAVES and _chave_valida(_CHAVES[PROVEDOR]) and bool(MODELO)
            and _TIMEOUT_SEGUNDOS is not None and _MAX_TOKENS is not None)


def _chave_valida(chave) -> bool:
    """Headers de autenticação aceitam somente ASCII visível, sem espaços."""
    return (isinstance(chave, str) and bool(chave)
            and all(33 <= ord(caractere) <= 126 for caractere in chave))


class _SemRedirect(urllib.request.HTTPRedirectHandler):
    """Recusa redirects para nunca reenviar credenciais a outro destino."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def _chamar_llm(system: str, mensagem_usuario: str) -> str:
    if not esta_configurado():
        raise LLMError("LLM não configurado")

    if PROVEDOR == "anthropic":
        payload_requisicao = {
            "model": MODELO, "max_tokens": _MAX_TOKENS, "system": system,
            "messages": [{"role": "user", "content": mensagem_usuario}],
        }
        headers = {
            "x-api-key": _CHAVES[PROVEDOR],
            "anthropic-version": _VERSAO_API,
            "content-type": "application/json",
        }
    else:
        payload_requisicao = {
            "model": MODELO, "max_tokens": _MAX_TOKENS,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": mensagem_usuario},
            ],
        }
        headers = {
            "Authorization": f"Bearer {_CHAVES[PROVEDOR]}",
            "content-type": "application/json",
        }
    corpo = json.dumps(payload_requisicao).encode("utf-8")

    try:
        requisicao = urllib.request.Request(
            LLM_URL,
            data=corpo,
            method="POST",
            headers=headers,
        )
        opener = urllib.request.build_opener(_SemRedirect())
        with opener.open(requisicao, timeout=_TIMEOUT_SEGUNDOS) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        e.close()
        raise LLMError("falha ao chamar o LLM") from None
    except (urllib.error.URLError, TimeoutError, OSError, ValueError, http.client.HTTPException,
            json.JSONDecodeError, UnicodeDecodeError):
        raise LLMError("falha ao chamar o LLM") from None

    try:
        if PROVEDOR == "anthropic":
            texto = payload["content"][0]["text"]
        else:
            escolha = payload["choices"][0]
            if not isinstance(escolha, dict):
                raise LLMError("falha ao chamar o LLM")
            motivo = escolha.get("finish_reason")
            if motivo is not None and motivo != "stop":
                raise LLMError("falha ao chamar o LLM")
            texto = escolha["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise LLMError("falha ao chamar o LLM") from None
    if not isinstance(texto, str) or not texto.strip():
        raise LLMError("falha ao chamar o LLM")
    return texto


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
