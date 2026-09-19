"""
Interpretador via Jev (TypeSafe) pela Decisions API do OpenRouter.

Jev é um modelo "System One": não gera texto. Recebe um `state` mais um mapa
de perguntas tipadas (`noul` = sim/não, `choice` = uma opção, `score` =
posição numa rubrica ordenada) e devolve, por construção, respostas tipadas
com probabilidades calibradas — não há JSON para parsear nem tipo fora do
catálogo para descartar. É exatamente o formato da etapa ① do pipeline
(mensagem → eventos do catálogo), por isso este módulo só substitui
`llm.interpretar`; a narração (etapa ③) continua com o LLM de `app/llm.py`,
porque o Jev não escreve texto.

O LLM nunca calcula (CLAUDE.md, invariante 1): o Jev só classifica. Este
módulo converte a resposta tipada no mesmo formato `{"tipo", "intensidade"}`
que `engine_v3.step()` já consome — presença por limiar sobre P(sim) e
intensidade lida da rubrica ordenada (`(score + 1) / níveis`). Nenhum eixo,
OCEAN, goodwill ou ruptura é tocado aqui.

Ligado por `PHB_INTERPRETADOR=jev` (default `llm`, comportamento anterior
intacto). Usa `OPENROUTER_API_KEY` (lida uma vez, nunca logada — invariante
6), `PHB_JEV_MODEL` (default `typesafe/jev-1.13`), `PHB_JEV_URL` (default
`https://openrouter.ai/api/alpha/decisions`; sobrescrito nos testes por um
stub local), `PHB_JEV_LIMIAR` (P(sim) mínimo para emitir o evento, default
`0.5`) e o mesmo `PHB_LLM_TIMEOUT`. `urllib.request` da stdlib — nenhuma
dependência pip (invariante 3).

Atenção: o endpoint do OpenRouter é *alpha* (`/api/alpha/decisions`) e a
comunidade relatou chamadas que penduram até o timeout; por isso há uma
única retentativa com backoff curto. O contrato está descrito em
`docs/jev-avaliacao.md`.
"""
import http.client
import json
import os
import time
import urllib.error
import urllib.request

from .llm import _SemRedirect, _chave_valida, _inteiro_positivo

INTERPRETADOR = os.environ.get("PHB_INTERPRETADOR", "llm").strip().lower()
_CHAVE = os.environ.get("OPENROUTER_API_KEY")
URL_DEFAULT = "https://openrouter.ai/api/alpha/decisions"
JEV_URL = os.environ.get("PHB_JEV_URL") or URL_DEFAULT
MODELO = os.environ.get("PHB_JEV_MODEL", "typesafe/jev-1.13").strip()

_TIMEOUT_SEGUNDOS = _inteiro_positivo("PHB_LLM_TIMEOUT", 60)
_TENTATIVAS = 2                 # 1 chamada + 1 retentativa (endpoint alpha)
_BACKOFF_SEGUNDOS = 0.5

# Rubrica ordenada de intensidade. `score` volta como média ponderada pelas
# probabilidades (pode ser fracionário, ex.: 1.6), então a intensidade é
# contínua: (score + 1) / len(NIVEIS) ∈ [0.25, 1.0].
NIVEIS_INTENSIDADE = ["leve", "moderada", "forte", "extrema"]

# Descrições em português dos eventos do catálogo — é o mesmo conteúdo que o
# prompt de `llm._prompt_interpretar` lista, agora como critérios tipados.
DESCRICOES = {
    "elogio_especifico": "elogio concreto e específico a algo que a persona fez, disse ou é",
    "humor_compartilhado": "piada, brincadeira ou humor que convida a persona a rir junto",
    "vulnerabilidade_compartilhada": "o interlocutor se abre, confessa fragilidade ou algo pessoal",
    "respeito_a_limite": "o interlocutor aceita um não, recua ou respeita um limite da persona",
    "apoio_momento_dificil": "apoio, acolhimento ou solidariedade num momento difícil da persona",
    "desculpa_genuina": "pedido de desculpas sincero, que assume responsabilidade",
    "lisonja": "elogio vago, exagerado ou interesseiro; bajulação",
    "pressao_politica": "pressão para a persona se posicionar, tomar partido ou entrar em polêmica",
    "deboche": "deboche, ironia agressiva, ridicularização ou desprezo",
    "exposicao_indevida": "expõe ou ameaça expor algo privado da persona sem consentimento",
    "traicao": "quebra grave de confiança: mentira revelada, promessa traída, uso da persona contra ela",
    "pedido_intimo": "pedido de intimidade, de exposição pessoal ou de acesso ao que é privado",
}


def _limiar() -> float:
    bruto = os.environ.get("PHB_JEV_LIMIAR", "0.5")
    try:
        valor = float(bruto)
    except ValueError:
        return None
    return valor if 0.0 < valor <= 1.0 else None


LIMIAR = _limiar()


class JevError(Exception):
    """Erro ao chamar o Jev (HTTP, timeout, resposta em formato inesperado).
    A mensagem é sempre genérica — nunca contém headers nem corpo da
    resposta (CLAUDE.md, invariante 6)."""


def ativo() -> bool:
    """`True` quando `PHB_INTERPRETADOR=jev` foi selecionado explicitamente."""
    return INTERPRETADOR == "jev"


def esta_configurado() -> bool:
    """`True` quando chave, modelo, limiar e timeout formam configuração válida."""
    return (_chave_valida(_CHAVE) and bool(MODELO) and LIMIAR is not None
            and _TIMEOUT_SEGUNDOS is not None)


def montar_perguntas(catalogo: list) -> dict:
    """Duas perguntas tipadas por evento do catálogo (exceto `neutro`, que é
    a ausência de todos): `<tipo>` (noul: a mensagem contém o evento?) e
    `intensidade_<tipo>` (score na rubrica `NIVEIS_INTENSIDADE`)."""
    perguntas = {}
    for evento in catalogo:
        tipo = evento["tipo"]
        if tipo == "neutro":
            continue
        descricao = DESCRICOES.get(tipo, tipo.replace("_", " "))
        perguntas[tipo] = {
            "type": "noul",
            "instructions": f"A mensagem do interlocutor contém o evento '{tipo}'?",
            "criteria": {
                "true": f"A mensagem expressa {descricao}.",
                "false": f"A mensagem não expressa {descricao}.",
            },
        }
        perguntas[f"intensidade_{tipo}"] = {
            "type": "score",
            "instructions": (f"Se a mensagem contiver '{tipo}' ({descricao}), "
                             "qual a intensidade desse evento?"),
            "criteria": list(NIVEIS_INTENSIDADE),
        }
    return perguntas


def montar_estado(texto: str, persona: dict, quem: str) -> dict:
    """O `state` que o Jev avalia: quem recebe, quem fala e o que foi dito.
    Mesmo contexto que `llm._prompt_interpretar` dá ao LLM — nada do
    estado interno do motor vai para cá (o Jev não vê eixos nem OCEAN)."""
    return {
        "persona": {"nome": persona.get("nome", ""), "bio": persona.get("bio", "")},
        "interlocutor": quem,
        "mensagem": texto,
        "idioma": "português",
    }


def _numero(valor):
    return isinstance(valor, (int, float)) and not isinstance(valor, bool)


def mapear_respostas(respostas: dict, catalogo: list, limiar: float) -> tuple:
    """Converte `answers` do Jev em eventos do catálogo + trilha auditável.

    Devolve `(eventos, decisoes)`: `eventos` é `[{"tipo", "intensidade"}]` na
    ordem do catálogo (ou `[neutro 0.0]` se nada passou do limiar);
    `decisoes` guarda, por tipo, `probabilidade` (P(sim)), `intensidade`
    lida da rubrica, `confianca` do score e `emitido`. Qualquer resposta
    fora do formato tipado é erro — o Jev é type-safe por construção, então
    aqui não há parse tolerante: ou o contrato foi cumprido, ou 502."""
    if not isinstance(respostas, dict):
        raise JevError("falha ao chamar o Jev")
    eventos, decisoes = [], {}
    for evento in catalogo:
        tipo = evento["tipo"]
        if tipo == "neutro":
            continue
        presenca = respostas.get(tipo)
        rubrica = respostas.get(f"intensidade_{tipo}")
        if not isinstance(presenca, dict) or not isinstance(rubrica, dict):
            raise JevError("falha ao chamar o Jev")
        probabilidade = presenca.get("noul")
        score = rubrica.get("score")
        if (presenca.get("type") != "noul" or rubrica.get("type") != "score"
                or not _numero(probabilidade) or not _numero(score)):
            raise JevError("falha ao chamar o Jev")
        probabilidade = max(0.0, min(1.0, float(probabilidade)))
        niveis = len(NIVEIS_INTENSIDADE)
        intensidade = max(0.0, min(1.0, (float(score) + 1.0) / niveis))
        confianca = rubrica.get("confidence")
        emitido = probabilidade >= limiar
        decisoes[tipo] = {
            "probabilidade": round(probabilidade, 3),
            "intensidade": round(intensidade, 3),
            "confianca": round(float(confianca), 3) if _numero(confianca) else None,
            "emitido": emitido,
        }
        if emitido:
            eventos.append({"tipo": tipo, "intensidade": round(intensidade, 3)})
    return (eventos or [{"tipo": "neutro", "intensidade": 0.0}]), decisoes


def _post(payload_requisicao: dict) -> dict:
    corpo = json.dumps(payload_requisicao, ensure_ascii=False).encode("utf-8")
    headers = {
        "Authorization": f"Bearer {_CHAVE}",
        "content-type": "application/json",
    }
    requisicao = urllib.request.Request(JEV_URL, data=corpo, method="POST", headers=headers)
    opener = urllib.request.build_opener(_SemRedirect())
    with opener.open(requisicao, timeout=_TIMEOUT_SEGUNDOS) as resp:
        return json.loads(resp.read().decode("utf-8"))


def decidir(estado: dict, perguntas: dict) -> dict:
    """Uma chamada à Decisions API (com uma retentativa em falha de
    transporte — o endpoint é alpha). Devolve o JSON bruto da resposta."""
    if not esta_configurado():
        raise JevError("Jev não configurado")
    payload_requisicao = {"model": MODELO, "state": estado, "questions": perguntas}
    payload = None
    for tentativa in range(_TENTATIVAS):
        try:
            payload = _post(payload_requisicao)
            break
        except urllib.error.HTTPError as e:
            e.close()
            raise JevError("falha ao chamar o Jev") from None
        except (ValueError, UnicodeDecodeError):
            # corpo que não é JSON: quebra de contrato, não de transporte — sem retentativa
            raise JevError("falha ao chamar o Jev") from None
        except (urllib.error.URLError, TimeoutError, OSError, http.client.HTTPException):
            if tentativa + 1 >= _TENTATIVAS:
                raise JevError("falha ao chamar o Jev") from None
            time.sleep(_BACKOFF_SEGUNDOS)
    if not isinstance(payload, dict) or "error" in payload:
        raise JevError("falha ao chamar o Jev")
    return payload


def interpretar(texto: str, persona: dict, catalogo: list, quem: str) -> tuple:
    """Mesma assinatura de `llm.interpretar`, mais a trilha: devolve
    `(eventos, interpretacao)`. `interpretacao` é o que vai para o turno —
    modelo servido, limiar, decisões por tipo e uso/custo reportado —
    para a cadeia causal mensagem → probabilidade → evento → delta ficar
    auditável (rastreabilidade PHB)."""
    payload = decidir(montar_estado(texto, persona, quem), montar_perguntas(catalogo))
    eventos, decisoes = mapear_respostas(payload.get("answers"), catalogo, LIMIAR)
    uso = payload.get("usage") if isinstance(payload.get("usage"), dict) else {}
    interpretacao = {
        "interpretador": "jev",
        "modelo": payload.get("model") if isinstance(payload.get("model"), str) else MODELO,
        "limiar": LIMIAR,
        "decisoes": decisoes,
        "uso": {
            "tokens_entrada": uso.get("input_tokens") if _numero(uso.get("input_tokens")) else None,
            "tokens_saida": uso.get("output_tokens") if _numero(uso.get("output_tokens")) else None,
            "custo_usd": uso.get("cost") if _numero(uso.get("cost")) else None,
        },
    }
    return eventos, interpretacao


def main(argv=None) -> None:
    """`python3 -m app.jev --quem dan "texto"` — sonda de exploração: manda
    UMA mensagem ao Jev (chamada paga, exige `OPENROUTER_API_KEY`) e imprime
    os eventos mapeados e a trilha de decisões. Não toca o motor nem
    persiste nada; a chave nunca é impressa."""
    import argparse
    import sys

    from engine_v3 import EVENTS  # phb/ está no sys.path via app/__init__.py

    ap = argparse.ArgumentParser(description="Sonda do interpretador Jev (Decisions API do OpenRouter)")
    ap.add_argument("texto", help="mensagem do interlocutor")
    ap.add_argument("--quem", default="visitante", help="id do interlocutor")
    ap.add_argument("--nome", default="Mariana", help="nome da persona que recebe")
    ap.add_argument("--bio", default="", help="bio da persona")
    ap.add_argument("--perguntas", action="store_true",
                    help="só imprime o payload que seria enviado, sem chamar o Jev")
    args = ap.parse_args(argv)

    catalogo = [{"tipo": tipo, "eixos": spec["axes"], "valencia": spec["valencia"]}
                for tipo, spec in EVENTS.items()]
    persona = {"nome": args.nome, "bio": args.bio}
    if args.perguntas:
        payload = {"model": MODELO, "state": montar_estado(args.texto, persona, args.quem),
                   "questions": montar_perguntas(catalogo)}
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        return
    if not esta_configurado():
        print(json.dumps({"erro": "Jev não configurado (OPENROUTER_API_KEY, PHB_JEV_MODEL, PHB_JEV_LIMIAR)"},
                         ensure_ascii=False))
        sys.exit(2)
    try:
        eventos, interpretacao = interpretar(args.texto, persona, catalogo, args.quem)
    except JevError as e:
        print(json.dumps({"erro": str(e)}, ensure_ascii=False))
        sys.exit(1)
    print(json.dumps({"eventos": eventos, "interpretacao": interpretacao}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
