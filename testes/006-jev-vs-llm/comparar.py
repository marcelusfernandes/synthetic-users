#!/usr/bin/env python3
"""
Experimento 006 — Jev (TypeSafe) × LLM de chat na etapa ① do pipeline PHB.

A etapa ① é `mensagem do interlocutor → eventos do catálogo {tipo, intensidade}`.
Este script compara dois interpretadores dessa etapa sobre o corpus que já existe
no repositório (transcrições dos testes 003 e 005):

- **Jev** (`typesafe/jev-1.13`) pela Decisions API alpha do OpenRouter;
- **LLM de chat** (default `z-ai/glm-5.3-flash`) por chat completions do OpenRouter.

Os dois usam EXATAMENTE a mesma lógica do MVP: as perguntas tipadas, o estado e o
mapeamento vêm de `app/jev.py`; o prompt e o parse do array JSON vêm de `app/llm.py`.
O HTTP é feito aqui (os módulos leem a chave no import e têm URL própria), mas o
conteúdo enviado é o que o MVP enviaria — é isso que dá validade à comparação.

O LLM nunca calcula e o motor não entra nesta medição (CLAUDE.md, invariante 1):
aqui só se classifica mensagem em evento; nenhum eixo, OCEAN, goodwill ou ruptura é
tocado. `engine_v3` é importado apenas para ler o catálogo de eventos.

Modos:

    python3 comparar.py --extrair                      # offline: escreve corpus.jsonl
    python3 comparar.py --sonda --confirmar            # 2 chamadas: valida chave e contrato
    python3 comparar.py --rodar [--repeticoes 3] [--limite M] --confirmar
    python3 comparar.py --relatorio                    # offline: escreve relatorio.md

`--sonda` e `--rodar` são as etapas pagas: sem `--confirmar` elas só imprimem quantas
chamadas fariam e quanto isso custaria (checkpoint humano). Exige `OPENROUTER_API_KEY` no
ambiente — a chave nunca é impressa, gravada nem colocada em mensagem de erro
(CLAUDE.md, invariante 6).

Python 3.11+, stdlib apenas (invariante 3). Nada fora de `testes/006-jev-vs-llm/`
é lido para escrita; o script só lê transcrições e `personas/mariana.json`.
"""
import argparse
import http.client
import json
import os
import re
import statistics
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[1]
sys.path.insert(0, str(RAIZ))

from app.jev import (  # noqa: E402  (precisa do sys.path acima)
    JevError, mapear_respostas, montar_estado, montar_perguntas,
)
from app.llm import _parsear_eventos, _prompt_interpretar  # noqa: E402
from engine_v3 import EVENTS  # noqa: E402  (phb/ entra no sys.path via app/__init__.py)

# ───────────────────────────────────────────────────────────────────────────────
# CONTRATO DAS APIs — tudo que é incerto sobre os endpoints está NESTE bloco.
# Se algo mudar (o endpoint do Jev é alpha), é o único lugar a corrigir.
#
# Jev — Decisions API (alpha), documentado em docs/jev-avaliacao.md:
#   POST https://openrouter.ai/api/alpha/decisions
#   Authorization: Bearer $OPENROUTER_API_KEY
#   {"model": ..., "state": ..., "questions": {"<id>": {"type","instructions","criteria"}}}
#   → {"model", "answers": {"<id>": {"type","noul"|"choice"|"score",
#                                    "probabilities","confidence","legend"}},
#      "usage": {"input_tokens","output_tokens","cost"}, "id", "provider"}
#   INCERTO (1): se `usage.cost` vem sempre ou só em algumas contas/rotas.
#   INCERTO (2): forma exata do corpo de erro (aqui qualquer status != 200 vira erro
#                registrado; o corpo não é lido para não arriscar vazar cabeçalho).
#   INCERTO (3): se há rate limit específico do alpha (o script é sequencial, com
#                uma pausa opcional `--pausa` entre chamadas). 429 e 529 são
#                retentados com backoff exponencial, respeitando `Retry-After`.
#   INCERTO (4): ninguém confirmou publicamente 24 perguntas numa única chamada nem
#                `state` como objeto JSON neste endpoint (o único exemplo real usa
#                `state` string). Por isso `VARIANTES_JEV`: em 400, o script cai para
#                `state` serializado como string e, depois, para dois lotes de 12
#                perguntas (noul e score) com `answers` mesclados. A variante que
#                funcionou vai gravada em `resultados.jsonl` (`variante_requisicao`).
#   INCERTO (5): `legend` pode não vir no `score` — nada aqui depende dele
#                (`app.jev.mapear_respostas` só lê `score` e `confidence`).
#   FIXO: toda pergunta `noul` precisa de `criteria` com `true` E `false` — é o que
#         `app.jev.montar_perguntas` monta; não remover.
#   Modelo: `typesafe/jev-1.13` (default). O alias móvel é `~typesafe/jev-latest`
#           COM o til — sem ele o OpenRouter devolve 400 "Model does not exist".
#           Sobrescrever por `JEV_MODEL` ou `--modelo-jev`.
#
# Chat — chat completions do OpenRouter (mesmo caminho de app/llm.py):
#   POST https://openrouter.ai/api/v1/chat/completions
#   {"model","max_tokens","messages":[{"role":"system"},{"role":"user"}]}
#   → {"model","choices":[{"message":{"content"},"finish_reason"}],
#      "usage":{"prompt_tokens","completion_tokens","cost"?}}
#   INCERTO (6): `usage.cost` no OpenRouter costuma exigir `{"usage":{"include":true}}`
#                no corpo. Isso NÃO é enviado aqui porque mudaria o payload em relação
#                ao que o MVP (`app/llm.py`) manda; quando o custo não vier, o relatório
#                estima pelo preço informado em `--preco-*`.
JEV_URL_DEFAULT = "https://openrouter.ai/api/alpha/decisions"
CHAT_URL_DEFAULT = "https://openrouter.ai/api/v1/chat/completions"
JEV_MODELO_DEFAULT = "typesafe/jev-1.13"
CHAT_MODELO_DEFAULT = "z-ai/glm-5.3-flash"
# Preço do Jev em 19/09/2026 (docs/jev-avaliacao.md): US$ 0,042/M de entrada, saída grátis.
PRECO_JEV_ENTRADA = 0.042
# Preços do modelo de chat: NÃO conferidos — placeholders de ordem de grandeza de um
# modelo "flash". Ajuste por `--preco-chat-entrada/--preco-chat-saida` com o valor real
# da página do modelo no OpenRouter antes de usar a estimativa como decisão de custo.
PRECO_CHAT_ENTRADA_DEFAULT = 0.10
PRECO_CHAT_SAIDA_DEFAULT = 0.40
# Tamanhos típicos por chamada, para a estimativa a priori (o real vem de `usage`).
# O payload do Jev (24 perguntas tipadas + state) dá ~7,7 mil caracteres, ou seja
# ~2,2 mil tokens — bem mais que os ~900 citados em docs/jev-avaliacao.md, que
# contavam só a mensagem.
TOKENS_JEV_ENTRADA = 2200
TOKENS_CHAT_ENTRADA = 700
TOKENS_CHAT_SAIDA = 60
# ───────────────────────────────────────────────────────────────────────────────

CORPUS = AQUI / "corpus.jsonl"
RESULTADOS = AQUI / "resultados.jsonl"
RELATORIO = AQUI / "relatorio.md"

TESTE_003 = "003-mariana-individuacao-opacidade"
TESTE_005 = "005-llm-in-the-loop"

# Rótulos de fala do interlocutor no teste 003, conferidos à mão sessão a sessão
# (cada sessão usa um nome diferente). Tudo que não está aqui — "Mariana:",
# "Contexto interpretado:", "Cálculos OCEAN:", "Leitura do observador...:" — é
# narrativa ou metadado e NÃO entra no corpus.
# Comparados pelo NOME-BASE, sem o parêntese: as transcrições qualificam o mesmo
# falante turno a turno ("Lu (DM)", "Bia (dias depois)", "Bia (pós-café)",
# "Observador (cego)").
ROTULOS_INTERLOCUTOR_003 = {
    "Lu",            # E1-base-confianca, E1-espelhada-confianca
    "Interlocutor",  # E1-base-hostil, E1-espelhada-hostil
    "Bia",           # E2-cicatriz
    "Caio",          # E5-eixos
    "Observador",    # E4-opacidade
}
ROTULO_INTERLOCUTOR_005 = "Dan"

# Abreviações usadas nas anotações do 005 (`*Eventos: elogio 0.3, vulnerab. 0.5 ...*`)
# normalizadas para os tipos do catálogo v3.
ABREVIACOES = {
    "elogio": "elogio_especifico",
    "humor": "humor_compartilhado",
    "vulnerab": "vulnerabilidade_compartilhada",
    "vulnerabilidade": "vulnerabilidade_compartilhada",
    "respeito": "respeito_a_limite",
    "apoio": "apoio_momento_dificil",
    "desculpa": "desculpa_genuina",
    "pressao": "pressao_politica",
    "exposicao": "exposicao_indevida",
    "pedido": "pedido_intimo",
}

RE_TURNO = re.compile(r"^#{2,4}\s*\[?\s*TURNO\s+(\d+)", re.IGNORECASE)
# Captura o nome-base do falante e ignora o qualificador entre parênteses.
RE_FALA = re.compile(r"^\*\*([^*:(]+?)(?:\s*\([^)]*\))?\s*:\*\*\s*(.*)$")
RE_CONTEXTO = re.compile(r"^\*\*Contexto(?:\s+interpretado)?:\*\*\s*(.+)$", re.IGNORECASE)
RE_EVENTOS_005 = re.compile(r"^\*Eventos:\s*(.+)$", re.IGNORECASE)
RE_PAR_EVENTO = re.compile(r"([A-Za-zÀ-ÿ_]+)\.?\s+([01](?:[.,]\d+)?)")
# Comentário do autor da sessão colado no fim da fala, em itálico.
RE_NOTA_NARRADOR = re.compile(r"\s+[—–-]\s+\*[^*]+\*\s*$")

ASPAS_ABRE = "\"«“'"
ASPAS_FECHA = "\"»”'"


def catalogo_eventos() -> list:
    """O catálogo do motor no formato que `app/jev.py` e `app/llm.py` consomem."""
    return [{"tipo": tipo, "eixos": spec["axes"], "valencia": spec["valencia"]}
            for tipo, spec in EVENTS.items()]


def persona_mariana() -> dict:
    """`personas/mariana.json` se existir; senão um mínimo equivalente."""
    caminho = RAIZ / "personas" / "mariana.json"
    if caminho.exists():
        return json.loads(caminho.read_text(encoding="utf-8"))
    return {"nome": "Mariana",
            "bio": "Influenciadora de lifestyle Quiet Luxury no Rio de Janeiro."}


# ─────────────────────────────── extração ──────────────────────────────────────

def _normalizar_texto(bruto: str) -> str:
    """Deixa só o que o interlocutor disse.

    Duas limpezas importam para a validade do experimento:
    - a **nota do narrador** ao fim da linha (`… — *O print é da DM delas.*`)
      entrega a resposta ao interpretador (é o autor da sessão contando que
      houve traição) e por isso é cortada;
    - `**negrito**` é marcação do log, não da mensagem — o MVP nunca manda
      markdown no `state`/prompt."""
    texto = bruto.replace('\\"', '"').strip()
    texto = RE_NOTA_NARRADOR.sub("", texto)
    texto = texto.replace("**", "")
    return re.sub(r"\s+", " ", texto).strip()


def _tirar_aspas(texto: str):
    """Devolve `(texto_sem_aspas, estava_entre_aspas)`."""
    if len(texto) >= 2 and texto[0] in ASPAS_ABRE and texto[-1] in ASPAS_FECHA:
        return texto[1:-1].strip(), True
    return texto, False


def _normalizar_tipo(bruto: str) -> str:
    tipo = bruto.strip().strip(".").lower()
    if tipo in EVENTS:
        return tipo
    if tipo in ABREVIACOES:
        return ABREVIACOES[tipo]
    raise ValueError(f"tipo de evento não reconhecido na anotação: {bruto!r}")


def _parsear_eventos_anotados(linha: str) -> list:
    """`*Eventos: elogio 0.3, vulnerab. 0.5 → warmth 6.20, ...*` → lista de eventos.

    Só o trecho ANTES da primeira seta é anotação de evento; o resto é o snapshot
    que o motor devolveu naquele turno."""
    trecho = linha.split("→", 1)[0]
    trecho = trecho.replace("**", "").replace("*", "")
    trecho = re.sub(r"^\s*Eventos:\s*", "", trecho, flags=re.IGNORECASE)
    eventos = []
    for tipo_bruto, intensidade in RE_PAR_EVENTO.findall(trecho):
        eventos.append({"tipo": _normalizar_tipo(tipo_bruto),
                        "intensidade": float(intensidade.replace(",", "."))})
    return eventos


def extrair_003() -> list:
    """Falas do interlocutor nas 7 sessões do teste 003 (sem rótulo-ouro: o
    teste rodou no catálogo v2, então só sobra o `Contexto interpretado` em
    texto livre, guardado como referência qualitativa)."""
    falas = []
    pasta = RAIZ / "testes" / TESTE_003 / "sessoes"
    for arquivo in sorted(pasta.glob("*.md")):
        sessao = arquivo.stem
        turno, indice, pendente = None, 0, None
        for linha in arquivo.read_text(encoding="utf-8").splitlines():
            marca = RE_TURNO.match(linha)
            if marca:
                turno = int(marca.group(1))
                continue
            fala = RE_FALA.match(linha)
            if fala and fala.group(1).strip() in ROTULOS_INTERLOCUTOR_003:
                texto, _ = _tirar_aspas(_normalizar_texto(fala.group(2)))
                # Sem turno = ainda no cabeçalho: é a linha que DESCREVE o
                # interlocutor ("**Interlocutor:** Caio — crítico cultural…"),
                # não uma fala.
                if not texto or turno is None:
                    continue
                indice += 1
                pendente = {
                    "id": f"{TESTE_003}/{sessao}/{indice:02d}",
                    "teste": "003", "sessao": sessao, "turno": turno,
                    "quem": "visitante", "rotulo": fala.group(1).strip(),
                    "texto": texto,
                    # As transcrições do 003 registram a mensagem enviada tal e qual
                    # (algumas entre aspas, outras não) — todas são verbatim.
                    "verbatim": True,
                    "eventos_anotados": None, "contexto_anotado": None,
                }
                falas.append(pendente)
                continue
            contexto = RE_CONTEXTO.match(linha)
            if contexto and pendente is not None and pendente["contexto_anotado"] is None:
                pendente["contexto_anotado"] = _normalizar_texto(contexto.group(1))
    return falas


def extrair_005() -> list:
    """Falas de Dan na sessão 001 do teste 005 — os únicos rótulos-ouro no
    catálogo v3 (`*Eventos: ... → ...*` logo abaixo da fala)."""
    falas = []
    arquivo = RAIZ / "testes" / TESTE_005 / "sessoes" / "sessao_001.md"
    sessao = arquivo.stem
    turno, indice, pendente = None, 0, None
    for linha in arquivo.read_text(encoding="utf-8").splitlines():
        marca = RE_TURNO.match(linha)
        if marca:
            turno = int(marca.group(1))
            continue
        fala = RE_FALA.match(linha)
        if fala and fala.group(1).strip() == ROTULO_INTERLOCUTOR_005:
            texto, entre_aspas = _tirar_aspas(_normalizar_texto(fala.group(2)))
            if not texto or turno is None:
                continue
            indice += 1
            pendente = {
                "id": f"{TESTE_005}/{sessao}/{indice:02d}",
                "teste": "005", "sessao": sessao, "turno": turno,
                "quem": "dan", "rotulo": ROTULO_INTERLOCUTOR_005,
                "texto": texto,
                # Só a fala do turno 1 está transcrita palavra por palavra; as demais
                # são paráfrases do que Dan mandou (resumo do coordenador).
                "verbatim": entre_aspas,
                "eventos_anotados": None, "contexto_anotado": None,
            }
            falas.append(pendente)
            continue
        anotacao = RE_EVENTOS_005.match(linha)
        if anotacao and pendente is not None and pendente["eventos_anotados"] is None:
            pendente["eventos_anotados"] = _parsear_eventos_anotados(anotacao.group(1))
    return falas


def modo_extrair() -> None:
    falas = extrair_003() + extrair_005()
    with CORPUS.open("w", encoding="utf-8") as saida:
        for fala in falas:
            saida.write(json.dumps(fala, ensure_ascii=False) + "\n")
    por_sessao = {}
    for fala in falas:
        chave = (fala["teste"], fala["sessao"])
        registro = por_sessao.setdefault(chave, {"falas": 0, "ouro": 0, "verbatim": 0,
                                                 "contexto": 0})
        registro["falas"] += 1
        registro["ouro"] += 1 if fala["eventos_anotados"] else 0
        registro["verbatim"] += 1 if fala["verbatim"] else 0
        registro["contexto"] += 1 if fala["contexto_anotado"] else 0
    print(f"corpus escrito em {CORPUS} — {len(falas)} falas")
    print(f"{'teste/sessão':<52} {'falas':>6} {'ouro':>5} {'verbatim':>9} {'contexto':>9}")
    for (teste, sessao), registro in sorted(por_sessao.items()):
        print(f"{teste + '/' + sessao:<52} {registro['falas']:>6} {registro['ouro']:>5} "
              f"{registro['verbatim']:>9} {registro['contexto']:>9}")
    vazias = [f["id"] for f in falas if not f["texto"].strip()]
    if vazias:
        print(f"ATENÇÃO: {len(vazias)} falas vazias: {vazias}")


# ──────────────────────────────── rodada ───────────────────────────────────────

class _SemRedirect(urllib.request.HTTPRedirectHandler):
    """Recusa redirect para nunca reenviar a credencial a outro destino."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class ErroContrato(RuntimeError):
    """O endpoint respondeu 200, mas `answers` não cumpre o contrato tipado.
    Não é falha de transporte nem de forma da requisição: insistir custa dinheiro
    sem chance de sucesso, então a rodada aborta depois de algumas seguidas."""


class _ErroHTTP(Exception):
    """Status != 2xx. Guarda só o código e `Retry-After` — nunca o corpo, que
    pode ecoar cabeçalho de requisição (invariante 6)."""

    def __init__(self, status: int, retry_after=None):
        super().__init__(f"HTTP {status}")
        self.status = status
        self.retry_after = retry_after


STATUS_RETENTAVEIS = (429, 529)
MAX_TENTATIVAS_LIMITE = 4     # 429/529: 1 chamada + 3 retentativas com backoff
BACKOFF_INICIAL = 1.0
BACKOFF_MAXIMO = 30.0


def _post(url: str, chave: str, payload: dict, timeout: int):
    """POST JSON com Bearer. Devolve `(corpo, latencia_ms)`.

    Erros viram `_ErroHTTP` (status) ou `TimeoutError` (transporte) — a mensagem
    é construída só de status/tipo, nunca de cabeçalho ou corpo (a chave viaja no
    cabeçalho; invariante 6)."""
    corpo = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    requisicao = urllib.request.Request(
        url, data=corpo, method="POST",
        headers={"Authorization": f"Bearer {chave}", "content-type": "application/json"})
    opener = urllib.request.build_opener(_SemRedirect())
    inicio = time.monotonic()
    try:
        with opener.open(requisicao, timeout=timeout) as resposta:
            bruto_bytes = resposta.read()
    except urllib.error.HTTPError as e:
        status = e.code
        retry_after = e.headers.get("Retry-After") if e.headers else None
        e.close()
        raise _ErroHTTP(status, retry_after) from None
    except (TimeoutError, urllib.error.URLError, OSError, http.client.HTTPException) as e:
        # Timeout e quedas de transporte são retentáveis (o endpoint do Jev é alpha).
        raise TimeoutError(type(e).__name__) from None
    latencia = int((time.monotonic() - inicio) * 1000)
    try:
        bruto = bruto_bytes.decode("utf-8")
    except UnicodeDecodeError:
        raise RuntimeError("resposta não é UTF-8") from None
    try:
        return json.loads(bruto), latencia
    except ValueError:
        raise RuntimeError("resposta não é JSON") from None


def _espera(retry_after, padrao: float) -> float:
    """`Retry-After` em segundos quando vier legível; senão o backoff calculado."""
    try:
        return min(float(retry_after), BACKOFF_MAXIMO)
    except (TypeError, ValueError):
        return min(padrao, BACKOFF_MAXIMO)


def _post_resiliente(url, chave, payload, timeout):
    """Uma retentativa em timeout/transporte; até 3 em 429/529 com backoff
    exponencial (respeitando `Retry-After`). Qualquer outro status sobe como
    `_ErroHTTP` na hora — é o que deixa o fallback de variante do Jev ver o 400."""
    backoff = BACKOFF_INICIAL
    for tentativa in range(1, MAX_TENTATIVAS_LIMITE + 1):
        try:
            return _post(url, chave, payload, timeout)
        except TimeoutError as e:
            if tentativa > 1:
                raise RuntimeError(f"timeout/transporte ({e})") from None
            pausa = 0.5
        except _ErroHTTP as e:
            if e.status not in STATUS_RETENTAVEIS:
                raise
            if tentativa >= MAX_TENTATIVAS_LIMITE:
                raise RuntimeError(f"HTTP {e.status} após {tentativa} tentativas") from None
            pausa = _espera(e.retry_after, backoff)
            backoff *= 2
        time.sleep(pausa)
    raise RuntimeError("tentativas esgotadas")


# Variantes de requisição do Jev, tentadas nesta ordem enquanto o endpoint
# devolver 400 (ver INCERTO (4) no bloco de contrato). A primeira que funcionar
# fica memorizada em `_VARIANTE_JEV` e passa a ser a única usada na rodada.
VARIANTES_JEV = ("estado-objeto", "estado-string", "lotes")
_VARIANTE_JEV = None
MAX_CONTRATOS_SEGUIDOS = 3      # erros de contrato seguidos que abortam a rodada


def _chamar_jev_variante(args, chave, estado, perguntas, variante):
    """Uma leitura do Jev na variante pedida. Devolve `(corpo, latencia_ms)`;
    em `lotes`, o corpo é a mescla dos `answers` das duas chamadas."""
    if variante != "lotes":
        corpo_estado = estado if variante == "estado-objeto" else json.dumps(estado, ensure_ascii=False)
        return _post_resiliente(args.jev_url, chave,
                                {"model": args.modelo_jev, "state": corpo_estado,
                                 "questions": perguntas}, args.timeout)
    # Lotes: 12 perguntas `noul` e 12 `score`, com o `state` na forma mais
    # conservadora (string), mesclando `answers`, `usage` e latência.
    corpo_estado = json.dumps(estado, ensure_ascii=False)
    mesclado, latencia_total = {"answers": {}}, 0
    for tipo_pergunta in ("noul", "score"):
        lote = {k: v for k, v in perguntas.items() if v["type"] == tipo_pergunta}
        corpo, latencia = _post_resiliente(
            args.jev_url, chave,
            {"model": args.modelo_jev, "state": corpo_estado, "questions": lote}, args.timeout)
        if not isinstance(corpo, dict) or "error" in corpo:
            raise RuntimeError("resposta de erro do Jev")
        latencia_total += latencia
        respostas = corpo.get("answers")
        if isinstance(respostas, dict):
            mesclado["answers"].update(respostas)
        mesclado.setdefault("model", corpo.get("model"))
        uso_parcial = corpo.get("usage") if isinstance(corpo.get("usage"), dict) else {}
        uso = mesclado.setdefault("usage", {})
        for campo in ("input_tokens", "output_tokens", "cost"):
            if isinstance(uso_parcial.get(campo), (int, float)):
                uso[campo] = (uso.get(campo) or 0) + uso_parcial[campo]
    return mesclado, latencia_total


def chamar_jev(fala, persona, catalogo, args, chave) -> dict:
    global _VARIANTE_JEV
    estado = montar_estado(fala["texto"], persona, fala["quem"])
    perguntas = montar_perguntas(catalogo)
    ordem = [_VARIANTE_JEV] if _VARIANTE_JEV else list(VARIANTES_JEV)
    ultimo = None
    for variante in ordem:
        ultima_da_fila = variante == ordem[-1]
        try:
            corpo, latencia = _chamar_jev_variante(args, chave, estado, perguntas, variante)
            if not isinstance(corpo, dict) or "error" in corpo:
                raise RuntimeError("resposta de erro do Jev")
            eventos, decisoes = mapear_respostas(corpo.get("answers"), catalogo, args.limiar)
        except _ErroHTTP as e:
            # 400 = o endpoint recusou a FORMA da requisição: tenta a próxima variante.
            if e.status == 400 and not ultima_da_fila:
                ultimo = f"HTTP 400 na variante {variante}"
                continue
            raise RuntimeError(f"HTTP {e.status}") from None
        except JevError:
            # 200 com `answers` fora do contrato NÃO é problema de forma da
            # requisição: tentar as outras variantes só multiplicaria a conta
            # (4 chamadas por fala). Vira erro de contrato, e a rodada para
            # sozinha se isso se repetir (ver `modo_rodar`).
            raise ErroContrato(f"contrato do Jev quebrado (variante {variante})") from None
        _VARIANTE_JEV = variante
        uso = corpo.get("usage") if isinstance(corpo.get("usage"), dict) else {}
        return {
            "eventos": eventos, "decisoes": decisoes, "latencia_ms": latencia,
            "variante_requisicao": variante,
            "modelo_servido": corpo.get("model") if isinstance(corpo.get("model"), str) else None,
            "tokens_entrada": uso.get("input_tokens"), "tokens_saida": uso.get("output_tokens"),
            "custo_usd": uso.get("cost"),
        }
    raise RuntimeError(ultimo or "nenhuma variante de requisição do Jev funcionou")


def chamar_chat(fala, persona, catalogo, args, chave) -> dict:
    payload = {
        "model": args.modelo_chat,
        "max_tokens": args.max_tokens,
        "messages": [
            {"role": "system",
             "content": _prompt_interpretar(persona, catalogo, fala["quem"])},
            {"role": "user", "content": fala["texto"]},
        ],
    }
    try:
        corpo, latencia = _post_resiliente(args.chat_url, chave, payload, args.timeout)
    except _ErroHTTP as e:
        raise RuntimeError(f"HTTP {e.status}") from None
    if not isinstance(corpo, dict) or "error" in corpo:
        raise RuntimeError("resposta de erro do chat")
    try:
        escolha = corpo["choices"][0]
        texto = escolha["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise RuntimeError("resposta fora do formato de chat completions") from None
    # Mesma regra de `app/llm.py`: resposta truncada (`length`, `content_filter`…)
    # NÃO é leitura válida — sem isto o array JSON cortado viraria `[neutro]` e o
    # experimento mediria algo que o MVP recusaria.
    if escolha.get("finish_reason") not in (None, "stop"):
        raise RuntimeError("chat truncado")
    if not isinstance(texto, str) or not texto.strip():
        raise RuntimeError("resposta vazia do chat")
    uso = corpo.get("usage") if isinstance(corpo.get("usage"), dict) else {}
    return {
        "eventos": _parsear_eventos(texto, catalogo), "decisoes": None,
        "latencia_ms": latencia, "motivo_parada": escolha.get("finish_reason"),
        "modelo_servido": corpo.get("model") if isinstance(corpo.get("model"), str) else None,
        "tokens_entrada": uso.get("prompt_tokens"), "tokens_saida": uso.get("completion_tokens"),
        "custo_usd": uso.get("cost"),
    }


def _feitos(caminho: Path) -> dict:
    """`{(id, interpretador, repeticao): tem_erro}` do que já está gravado."""
    feitos = {}
    if not caminho.exists():
        return feitos
    for linha in caminho.read_text(encoding="utf-8").splitlines():
        if not linha.strip():
            continue
        try:
            registro = json.loads(linha)
        except ValueError:
            continue
        chave = (registro.get("id"), registro.get("interpretador"), registro.get("repeticao"))
        feitos[chave] = bool(registro.get("erro"))
    return feitos


def modo_rodar(args) -> int:
    if not CORPUS.exists():
        print(f"corpus não encontrado: {CORPUS} — rode `--extrair` antes.")
        return 2
    falas = [json.loads(l) for l in CORPUS.read_text(encoding="utf-8").splitlines() if l.strip()]
    if args.teste:
        falas = [f for f in falas if f["teste"] == args.teste]
    if args.limite:
        falas = falas[:args.limite]

    feitos = _feitos(RESULTADOS)
    pendentes = []
    for fala in falas:
        for repeticao in range(1, args.repeticoes + 1):
            for interpretador in ("jev", "chat"):
                chave = (fala["id"], interpretador, repeticao)
                if chave in feitos and not (feitos[chave] and args.refazer_erros):
                    continue
                pendentes.append((fala, interpretador, repeticao))

    chamadas_jev = sum(1 for _, i, _ in pendentes if i == "jev")
    chamadas_chat = len(pendentes) - chamadas_jev
    custo_jev = chamadas_jev * TOKENS_JEV_ENTRADA * PRECO_JEV_ENTRADA / 1e6
    custo_chat = chamadas_chat * (TOKENS_CHAT_ENTRADA * args.preco_chat_entrada
                                  + TOKENS_CHAT_SAIDA * args.preco_chat_saida) / 1e6
    print(f"Jev : {args.modelo_jev} @ {args.jev_url}")
    print(f"chat: {args.modelo_chat} @ {args.chat_url}")
    print(f"falas: {len(falas)} · repetições: {args.repeticoes} · limiar {args.limiar} · "
          f"já gravadas: {len(feitos)} chamadas")
    print(f"chamadas a fazer: {len(pendentes)} (Jev {chamadas_jev}, chat {chamadas_chat})")
    print(f"custo estimado: Jev US$ {custo_jev:.5f} "
          f"({TOKENS_JEV_ENTRADA} tok entrada × US$ {PRECO_JEV_ENTRADA}/M)")
    print(f"                chat US$ {custo_chat:.5f} "
          f"({TOKENS_CHAT_ENTRADA} entrada × US$ {args.preco_chat_entrada}/M + "
          f"{TOKENS_CHAT_SAIDA} saída × US$ {args.preco_chat_saida}/M — preço a conferir)")
    print(f"                TOTAL US$ {custo_jev + custo_chat:.5f}")
    if not args.confirmar:
        print("\nNADA foi chamado. Rode de novo com --confirmar para gastar (checkpoint humano).")
        return 0
    if not pendentes:
        print("\nnada pendente.")
        return 0

    chave_api = os.environ.get("OPENROUTER_API_KEY")
    if not chave_api or not all(33 <= ord(c) <= 126 for c in chave_api):
        print("OPENROUTER_API_KEY ausente ou inválida no ambiente.")
        return 2

    persona, catalogo = persona_mariana(), catalogo_eventos()
    erros, contratos_seguidos, abortou = 0, 0, False
    with RESULTADOS.open("a", encoding="utf-8") as saida:
        for posicao, (fala, interpretador, repeticao) in enumerate(pendentes, start=1):
            registro = {
                "id": fala["id"], "teste": fala["teste"], "sessao": fala["sessao"],
                "turno": fala["turno"], "quem": fala["quem"],
                "interpretador": interpretador, "repeticao": repeticao,
                "modelo_pedido": args.modelo_jev if interpretador == "jev" else args.modelo_chat,
                "limiar": args.limiar if interpretador == "jev" else None,
                "criado_em": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            }
            try:
                if interpretador == "jev":
                    registro.update(chamar_jev(fala, persona, catalogo, args, chave_api))
                else:
                    registro.update(chamar_chat(fala, persona, catalogo, args, chave_api))
                registro["erro"] = None
            except (RuntimeError, JevError) as e:
                # Falha de uma fala não derruba a rodada; fica gravada para o relatório.
                registro["erro"] = str(e)
                registro["eventos"] = None
                registro["erro_contrato"] = isinstance(e, ErroContrato)
                erros += 1
            if interpretador == "jev":
                # Conta só as leituras do Jev: as chamadas de chat no meio não
                # zeram a sequência (senão o aborto nunca dispararia).
                contratos_seguidos = (contratos_seguidos + 1
                                      if registro.get("erro_contrato") else 0)
            saida.write(json.dumps(registro, ensure_ascii=False) + "\n")
            saida.flush()
            estado = "erro: " + registro["erro"] if registro["erro"] else \
                ",".join(e["tipo"] for e in registro["eventos"]) + (
                    f"  [{registro['variante_requisicao']}]"
                    if registro.get("variante_requisicao") else "")
            print(f"[{posicao}/{len(pendentes)}] {interpretador} r{repeticao} "
                  f"{fala['id']} → {estado}")
            if contratos_seguidos >= MAX_CONTRATOS_SEGUIDOS:
                abortou = True
                print(f"\nABORTADO: {MAX_CONTRATOS_SEGUIDOS} leituras seguidas do Jev "
                      "vieram 200 com `answers` fora do contrato tipado. O endpoint é "
                      "alpha e pode ter mudado: rode `--sonda --confirmar` para ver a "
                      "resposta crua e ajuste o bloco CONTRATO DAS APIs no topo deste "
                      "arquivo. O que já foi lido está gravado; `--rodar` retoma daqui.")
                break
            if args.pausa:
                time.sleep(args.pausa)
    print(f"\ngravado em {RESULTADOS} · {posicao if abortou else len(pendentes)} "
          f"chamadas · {erros} erros")
    return 1 if abortou else 0


def modo_sonda(args) -> int:
    """UMA chamada ao Jev e UMA ao chat com a primeira fala do corpus, imprimindo
    a resposta crua. É o jeito barato de validar chave, contrato e idioma antes de
    autorizar o lote — o contrato do endpoint alpha (24 perguntas numa chamada,
    `state` como objeto) não está confirmado por ninguém publicamente."""
    if not CORPUS.exists():
        print(f"corpus não encontrado: {CORPUS} — rode `--extrair` antes.")
        return 2
    primeira = json.loads(CORPUS.read_text(encoding="utf-8").splitlines()[0])
    custo = (TOKENS_JEV_ENTRADA * PRECO_JEV_ENTRADA
             + TOKENS_CHAT_ENTRADA * args.preco_chat_entrada
             + TOKENS_CHAT_SAIDA * args.preco_chat_saida) / 1e6
    print(f"sonda: 2 chamadas (1 Jev + 1 chat) com a fala {primeira['id']}")
    print(f"Jev : {args.modelo_jev} @ {args.jev_url}")
    print(f"chat: {args.modelo_chat} @ {args.chat_url}")
    print(f"custo estimado: US$ {custo:.5f}")
    if not args.confirmar:
        print("\nNADA foi chamado. Rode de novo com --confirmar (checkpoint humano).")
        return 0
    chave_api = os.environ.get("OPENROUTER_API_KEY")
    if not chave_api or not all(33 <= ord(c) <= 126 for c in chave_api):
        print("OPENROUTER_API_KEY ausente ou inválida no ambiente.")
        return 2
    persona, catalogo = persona_mariana(), catalogo_eventos()
    estado = montar_estado(primeira["texto"], persona, primeira["quem"])
    perguntas = montar_perguntas(catalogo)
    print(f"\n── payload Jev: model={args.modelo_jev} · {len(perguntas)} perguntas "
          f"({sum(1 for p in perguntas.values() if p['type'] == 'noul')} noul + "
          f"{sum(1 for p in perguntas.values() if p['type'] == 'score')} score)")
    print("state:", json.dumps(estado, ensure_ascii=False)[:400])
    print("primeira pergunta:",
          json.dumps(dict(list(perguntas.items())[:1]), ensure_ascii=False, indent=2))
    for variante in ([_VARIANTE_JEV] if _VARIANTE_JEV else list(VARIANTES_JEV)):
        try:
            corpo, latencia = _chamar_jev_variante(args, chave_api, estado, perguntas, variante)
        except _ErroHTTP as e:
            print(f"\n── variante {variante}: FALHOU (HTTP {e.status})")
            if e.status != 400:
                # 401 (chave), 402 (crédito), 404 (modelo inexistente — lembre do
                # til em `~typesafe/jev-latest`): trocar a forma da requisição não
                # resolve, então a sonda para aqui.
                print("   status que não é de forma da requisição: a sonda para aqui.")
                break
            continue
        except RuntimeError as e:
            print(f"\n── variante {variante}: FALHOU ({e})")
            break
        print(f"\n── variante {variante}: OK em {latencia} ms · resposta crua:")
        print(json.dumps(corpo, ensure_ascii=False, indent=2)[:4000])
        if not isinstance(corpo, dict):
            print("resposta não é um objeto JSON — contrato diferente do esperado.")
            break
        try:
            eventos, _ = mapear_respostas(corpo.get("answers"), catalogo, args.limiar)
            print("eventos mapeados:", json.dumps(eventos, ensure_ascii=False))
        except JevError as e:
            print(f"mapeamento falhou: {e}")
        break
    print("\n── chat")
    try:
        leitura = chamar_chat(primeira, persona, catalogo, args, chave_api)
        print(json.dumps(leitura, ensure_ascii=False, indent=2))
    except RuntimeError as e:
        print(f"FALHOU ({e})")
    return 0


# ─────────────────────────────── relatório ─────────────────────────────────────

def _conjunto(eventos) -> set:
    return {e["tipo"] for e in (eventos or [])}


def _intensidades(eventos) -> dict:
    return {e["tipo"]: e["intensidade"] for e in (eventos or [])}


def _jaccard(a: set, b: set) -> float:
    if not a and not b:
        return 1.0
    return len(a & b) / len(a | b)


def _mediana(valores):
    return statistics.median(valores) if valores else None


def _tabela(cabecalho: list, linhas: list) -> str:
    saida = ["|" + "|".join(cabecalho) + "|", "|" + "|".join("---" for _ in cabecalho) + "|"]
    for linha in linhas:
        saida.append("|" + "|".join(str(c) for c in linha) + "|")
    return "\n".join(saida)


def _num(valor, casas=3):
    return "—" if valor is None else f"{valor:.{casas}f}".replace(".", ",")


def modo_relatorio(args) -> int:
    if not RESULTADOS.exists():
        print(f"resultados não encontrados: {RESULTADOS} — rode `--rodar --confirmar` antes.")
        return 2
    falas = {f["id"]: f for f in
             (json.loads(l) for l in CORPUS.read_text(encoding="utf-8").splitlines() if l.strip())}
    registros = [json.loads(l) for l in RESULTADOS.read_text(encoding="utf-8").splitlines()
                 if l.strip()]

    # índice: por_fala[id][interpretador][repeticao] = registro
    por_fala = {}
    for registro in registros:
        (por_fala.setdefault(registro["id"], {})
                 .setdefault(registro["interpretador"], {})[registro["repeticao"]]) = registro

    erros = [r for r in registros if r.get("erro")]
    ok = [r for r in registros if not r.get("erro")]

    # (a) concordância por par (mesma fala, mesma repetição) e (b) intensidade
    pares, por_teste, por_sessao = [], {}, {}
    for id_fala, leituras in por_fala.items():
        teste = falas.get(id_fala, {}).get("teste", "?")
        sessao = falas.get(id_fala, {}).get("sessao", "?")
        for repeticao, registro_jev in sorted(leituras.get("jev", {}).items()):
            registro_chat = leituras.get("chat", {}).get(repeticao)
            if not registro_chat or registro_jev.get("erro") or registro_chat.get("erro"):
                continue
            conjunto_jev, conjunto_chat = _conjunto(registro_jev["eventos"]), _conjunto(registro_chat["eventos"])
            intensidade_jev, intensidade_chat = _intensidades(registro_jev["eventos"]), _intensidades(registro_chat["eventos"])
            comuns = conjunto_jev & conjunto_chat
            diferencas = [abs(intensidade_jev[t] - intensidade_chat[t]) for t in comuns]
            par = {
                "id": id_fala, "teste": teste, "sessao": sessao, "repeticao": repeticao,
                "jaccard": _jaccard(conjunto_jev, conjunto_chat),
                "exato": conjunto_jev == conjunto_chat,
                "delta_intensidade": statistics.fmean(diferencas) if diferencas else None,
                "jev": conjunto_jev, "chat": conjunto_chat,
                "ev_jev": registro_jev["eventos"], "ev_chat": registro_chat["eventos"],
            }
            pares.append(par)
            por_teste.setdefault(teste, []).append(par)
            por_sessao.setdefault((teste, sessao), []).append(par)

    def _resumo(lista):
        if not lista:
            return ("—", "—", "—", 0)
        jaccard = statistics.fmean(p["jaccard"] for p in lista)
        exato = statistics.fmean(1.0 if p["exato"] else 0.0 for p in lista)
        deltas = [p["delta_intensidade"] for p in lista if p["delta_intensidade"] is not None]
        return (_num(jaccard), _num(exato), _num(statistics.fmean(deltas)) if deltas else "—",
                len(lista))

    linhas_concordancia = []
    for teste in sorted(por_teste):
        jaccard, exato, delta, n = _resumo(por_teste[teste])
        linhas_concordancia.append([teste, n, jaccard, exato, delta])
    jaccard, exato, delta, n = _resumo(pares)
    linhas_concordancia.append(["**total**", n, jaccard, exato, delta])

    # Por sessão, com as duas linhas que H1 pede: as sessões hostis (evento
    # negativo inequívoco) contra as de confiança/afeto.
    linhas_sessao = []
    for (teste, sessao) in sorted(por_sessao):
        jaccard, exato, delta, n = _resumo(por_sessao[(teste, sessao)])
        linhas_sessao.append([f"{teste}/{sessao}", n, jaccard, exato, delta])
    hostis = [p for p in pares if "hostil" in p["sessao"]]
    afetivas = [p for p in pares if "hostil" not in p["sessao"]]
    jaccard, exato, delta, n = _resumo(hostis)
    linhas_sessao.append(["**subconjunto hostil (H1)**", n, jaccard, exato, delta])
    jaccard, exato, delta, n = _resumo(afetivas)
    linhas_sessao.append(["**demais falas**", n, jaccard, exato, delta])

    # (c) rótulos-ouro do 005, por interpretador e por recorte verbatim×paráfrase
    def _metricas_ouro(interpretador, aceita_fala):
        vp = fp = fn = comparacoes = 0
        deltas_ouro = []
        for id_fala, leituras in por_fala.items():
            fala = falas.get(id_fala, {})
            ouro = fala.get("eventos_anotados")
            if not ouro or not aceita_fala(fala):
                continue
            conjunto_ouro = _conjunto(ouro)
            intensidade_ouro = _intensidades(ouro)
            for registro in leituras.get(interpretador, {}).values():
                if registro.get("erro"):
                    continue
                previsto = _conjunto(registro["eventos"])
                # O ouro do 005 nunca traz `neutro` (toda fala anotada tem evento),
                # então ler `neutro` é só a ausência de acerto: contar como FP e FN
                # ao mesmo tempo puniria a mesma omissão duas vezes.
                previsto.discard("neutro")
                intensidade_prevista = _intensidades(registro["eventos"])
                vp += len(previsto & conjunto_ouro)
                fp += len(previsto - conjunto_ouro)
                fn += len(conjunto_ouro - previsto)
                deltas_ouro += [abs(intensidade_prevista[t] - intensidade_ouro[t])
                                for t in previsto & conjunto_ouro]
                comparacoes += 1
        precisao = vp / (vp + fp) if vp + fp else None
        recall = vp / (vp + fn) if vp + fn else None
        f1 = None
        if precisao is not None and recall is not None:
            f1 = (2 * precisao * recall / (precisao + recall)) if precisao + recall else 0.0
        return [comparacoes, vp, fp, fn, _num(precisao), _num(recall), _num(f1),
                _num(statistics.fmean(deltas_ouro)) if deltas_ouro else "—"]

    recortes = (("todas", lambda f: True),
                ("verbatim", lambda f: f.get("verbatim")),
                ("paráfrase", lambda f: not f.get("verbatim")))
    linhas_ouro = []
    for interpretador in ("jev", "chat"):
        for nome, filtro in recortes:
            linhas_ouro.append([interpretador, nome] + _metricas_ouro(interpretador, filtro))

    # (d) estabilidade entre repetições
    linhas_estabilidade = []
    for interpretador in ("jev", "chat"):
        jaccards, identicos, desvios, falas_medidas = [], 0, [], 0
        for id_fala, leituras in por_fala.items():
            repeticoes = [r for r in leituras.get(interpretador, {}).values() if not r.get("erro")]
            if len(repeticoes) < 2:
                continue
            falas_medidas += 1
            conjuntos = [_conjunto(r["eventos"]) for r in repeticoes]
            pares_internos = [_jaccard(conjuntos[i], conjuntos[j])
                              for i in range(len(conjuntos)) for j in range(i + 1, len(conjuntos))]
            jaccards.append(statistics.fmean(pares_internos))
            identicos += 1 if all(c == conjuntos[0] for c in conjuntos) else 0
            intensidades = [_intensidades(r["eventos"]) for r in repeticoes]
            for tipo in set().union(*conjuntos):
                valores = [i[tipo] for i in intensidades if tipo in i]
                if len(valores) >= 2:
                    desvios.append(statistics.pstdev(valores))
        linhas_estabilidade.append([
            interpretador, falas_medidas,
            _num(statistics.fmean(jaccards)) if jaccards else "—",
            _num(identicos / falas_medidas) if falas_medidas else "—",
            _num(statistics.fmean(desvios)) if desvios else "—",
        ])

    # (e) ambiguidade do Jev: segunda maior probabilidade acima do corte.
    # H3 fala em FALAS ambíguas, não em chamadas — uma fala lida 3 vezes conta
    # uma vez. Por fala guardamos em quantas repetições ela foi ambígua e o
    # top-3 da repetição mais ambígua.
    ambiguidade_por_fala = {}
    falas_com_jev = set()
    for registro in ok:
        if registro["interpretador"] != "jev" or not registro.get("decisoes"):
            continue
        falas_com_jev.add(registro["id"])
        ordenadas = sorted(((t, d["probabilidade"]) for t, d in registro["decisoes"].items()),
                           key=lambda par: par[1], reverse=True)
        if len(ordenadas) < 2 or ordenadas[1][1] <= args.ambiguidade:
            continue
        atual = ambiguidade_por_fala.setdefault(
            registro["id"], {"repeticoes": 0, "segunda": 0.0, "topo": ordenadas[:3],
                             "repeticao": registro["repeticao"]})
        atual["repeticoes"] += 1
        if ordenadas[1][1] > atual["segunda"]:
            atual.update(segunda=ordenadas[1][1], topo=ordenadas[:3],
                         repeticao=registro["repeticao"])
    ambiguos = sorted(ambiguidade_por_fala.items(),
                      key=lambda item: item[1]["segunda"], reverse=True)
    fracao_ambigua = (len(ambiguidade_por_fala) / len(falas_com_jev)) if falas_com_jev else None
    # As falas ambíguas estão super-representadas entre as maiores discordâncias?
    # (a outra metade de H3)
    ids_ambiguos = set(ambiguidade_por_fala)

    # (f) latência e custo
    linhas_custo = []
    for interpretador in ("jev", "chat"):
        subconjunto = [r for r in ok if r["interpretador"] == interpretador]
        latencias = [r["latencia_ms"] for r in subconjunto if r.get("latencia_ms") is not None]
        custos = [r["custo_usd"] for r in subconjunto if isinstance(r.get("custo_usd"), (int, float))]
        entradas = [r["tokens_entrada"] for r in subconjunto
                    if isinstance(r.get("tokens_entrada"), (int, float))]
        saidas = [r["tokens_saida"] for r in subconjunto
                  if isinstance(r.get("tokens_saida"), (int, float))]
        linhas_custo.append([
            interpretador, len(subconjunto),
            _num(_mediana(latencias), 0) if latencias else "—",
            _num(statistics.fmean(entradas), 0) if entradas else "—",
            _num(statistics.fmean(saidas), 0) if saidas else "—",
            f"US$ {sum(custos):.6f}".replace(".", ",") if custos else "não reportado",
        ])

    # (g) as 10 maiores discordâncias — uma linha por FALA (média das repetições),
    # exibindo a repetição em que as leituras mais se afastaram.
    por_id = {}
    for par in pares:
        por_id.setdefault(par["id"], []).append(par)
    piores = sorted(
        ({"id": id_fala, "jaccard_medio": statistics.fmean(p["jaccard"] for p in lista),
          "pior": min(lista, key=lambda p: (p["jaccard"], -(p["delta_intensidade"] or 0))),
          "repeticoes": len(lista)}
         for id_fala, lista in por_id.items()),
        key=lambda item: item["jaccard_medio"])[:10]

    def _leitura(eventos):
        return ", ".join(f"{e['tipo']} {e['intensidade']:.2f}".replace(".", ",")
                         for e in eventos) or "—"

    partes = [
        "# Relatório — 006 Jev × LLM de chat na etapa ①",
        "",
        f"Gerado por `comparar.py --relatorio` em {datetime.now(timezone.utc).isoformat(timespec='seconds')}.",
        f"Chamadas gravadas: **{len(registros)}** ({len(ok)} ok, {len(erros)} com erro) · "
        f"falas cobertas: **{len(por_fala)}** · pares Jev×chat comparáveis: **{len(pares)}**.",
        "",
        "## (a) Concordância no conjunto de tipos emitidos",
        "",
        "Cada par compara a leitura do Jev e a do chat para a MESMA fala na MESMA repetição. "
        "`neutro` conta como tipo (concordar que a mensagem é neutra é concordância).",
        "",
        _tabela(["teste", "pares", "Jaccard médio", "conjunto idêntico", "Δ intensidade médio"],
                linhas_concordancia),
        "",
        "Por sessão — é o recorte que **H1** pede (evento negativo inequívoco nas "
        "sessões hostis contra as falas afetivas mistas):",
        "",
        _tabela(["sessão", "pares", "Jaccard médio", "conjunto idêntico",
                 "Δ intensidade médio"], linhas_sessao),
        "",
        "## (b) Diferença de intensidade nos tipos em comum",
        "",
        f"Média das diferenças absolutas, só nos tipos que os dois emitiram: "
        f"**{_num(statistics.fmean([p['delta_intensidade'] for p in pares if p['delta_intensidade'] is not None]) if any(p['delta_intensidade'] is not None for p in pares) else None)}**"
        " (0 = leituras idênticas; a coluna por teste está na tabela acima).",
        "",
        "## (c) Contra os rótulos-ouro do teste 005",
        "",
        "Micro-média sobre as chamadas das falas com anotação no catálogo v3. `neutro` "
        "previsto é descartado antes da contagem (o ouro nunca traz `neutro`). O recorte "
        "separa a única fala transcrita palavra por palavra das 4 paráfrases do "
        "coordenador — interpretar um resumo não é interpretar a mensagem.",
        "",
        _tabela(["interpretador", "recorte", "chamadas", "VP", "FP", "FN", "precisão",
                 "recall", "F1", "Δ intensidade vs ouro"], linhas_ouro),
        "",
        "## (d) Estabilidade entre repetições",
        "",
        _tabela(["interpretador", "falas com ≥2 repetições", "Jaccard médio entre repetições",
                 "fração com conjunto idêntico", "desvio-padrão médio da intensidade"],
                linhas_estabilidade),
        "",
        "## (e) Casos ambíguos do Jev (2ª maior probabilidade > "
        + _num(args.ambiguidade, 2) + ")",
        "",
    ]
    if ambiguos:
        linhas_ambiguas = []
        for id_fala, dado in ambiguos[:20]:
            texto = falas.get(id_fala, {}).get("texto", "")
            linhas_ambiguas.append([
                "/".join(id_fala.split("/")[-2:]),
                dado["repeticoes"],
                (texto[:110] + "…") if len(texto) > 110 else texto,
                " · ".join(f"{t} {pr:.2f}".replace(".", ",") for t, pr in dado["topo"]),
            ])
        partes.append(_tabela(["fala", "repetições ambíguas", "texto",
                               "top-3 P(sim) na repetição mais ambígua"], linhas_ambiguas))
        partes.append("")
        partes.append(f"Falas ambíguas: **{len(ambiguidade_por_fala)}** de "
                      f"{len(falas_com_jev)} lidas pelo Jev "
                      f"(**{_num(fracao_ambigua)}** — H3 pede ≥ 0,150).")
        if piores_ids := [item["id"] for item in piores]:
            coincidem = len(ids_ambiguos & set(piores_ids))
            partes.append(f"Entre as {len(piores_ids)} maiores discordâncias (seção g), "
                          f"**{coincidem}** são falas ambíguas — a outra metade de H3.")
    else:
        partes.append("Nenhuma fala com segunda probabilidade acima do corte "
                      "(ou nenhuma decisão gravada).")
    partes += [
        "",
        "## (f) Latência e custo",
        "",
        _tabela(["interpretador", "chamadas ok", "latência mediana (ms)", "tokens entrada (média)",
                 "tokens saída (média)", "custo reportado"], linhas_custo),
        "",
        "## (g) As 10 maiores discordâncias",
        "",
    ]
    if piores:
        for posicao, item in enumerate(piores, start=1):
            fala = falas.get(item["id"], {})
            par = item["pior"]
            texto = fala.get("texto", "")
            partes += [
                f"### {posicao}. {item['id']} — Jaccard médio {_num(item['jaccard_medio'])} "
                f"em {item['repeticoes']} repetição(ões)",
                "",
                f"> {(texto[:400] + '…') if len(texto) > 400 else texto}",
                "",
                f"Leituras na repetição {par['repeticao']} (a mais discordante):",
                "",
                _tabela(["leitura", "eventos"],
                        [["Jev", _leitura(par["ev_jev"])], ["chat", _leitura(par["ev_chat"])]]
                        + ([["ouro (005)", _leitura(fala.get("eventos_anotados"))]]
                           if fala.get("eventos_anotados") else [])),
                "",
            ]
    else:
        partes.append("Sem pares comparáveis.")
    if erros:
        contagem = {}
        for registro in erros:
            chave = (registro["interpretador"], registro["erro"])
            contagem[chave] = contagem.get(chave, 0) + 1
        partes += ["## Erros", "",
                   _tabela(["interpretador", "erro", "ocorrências"],
                           [[i, e, n] for (i, e), n in sorted(contagem.items())]), ""]
    RELATORIO.write_text("\n".join(partes) + "\n", encoding="utf-8")
    print(f"relatório escrito em {RELATORIO} — {len(pares)} pares, {len(ambiguos)} casos ambíguos")
    return 0


# ───────────────────────────────── CLI ─────────────────────────────────────────

def montar_parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(
        description="Compara Jev (Decisions API) e LLM de chat na etapa ① do pipeline PHB.")
    modo = ap.add_mutually_exclusive_group(required=True)
    modo.add_argument("--extrair", action="store_true",
                      help="offline: lê as transcrições dos testes 003/005 e escreve corpus.jsonl")
    modo.add_argument("--rodar", action="store_true",
                      help="chama os dois interpretadores e grava resultados.jsonl (PAGO)")
    modo.add_argument("--relatorio", action="store_true",
                      help="offline: lê resultados.jsonl e escreve relatorio.md")
    modo.add_argument("--sonda", action="store_true",
                      help="UMA chamada a cada interpretador com a 1ª fala, imprimindo "
                           "a resposta crua — valida chave e contrato antes do lote (PAGO)")
    ap.add_argument("--confirmar", action="store_true",
                    help="autoriza as chamadas pagas de --sonda/--rodar (sem isto, só estima)")
    ap.add_argument("--repeticoes", type=int, default=3, help="chamadas por fala e interpretador")
    ap.add_argument("--limite", type=int, default=0, help="usa só as M primeiras falas do corpus")
    ap.add_argument("--teste", choices=["003", "005"], help="restringe a rodada a um teste")
    ap.add_argument("--refazer-erros", action="store_true",
                    help="em --rodar, tenta de novo as chamadas que ficaram com erro")
    ap.add_argument("--limiar", type=float, default=0.5, help="P(sim) mínimo para o Jev emitir")
    ap.add_argument("--timeout", type=int, default=20,
                    help="timeout HTTP em segundos (o endpoint alpha pendura; 20 é o "
                         "suficiente para uma leitura de <1 s)")
    ap.add_argument("--pausa", type=float, default=0.0, help="pausa entre chamadas, em segundos")
    ap.add_argument("--max-tokens", type=int, default=600, help="max_tokens do chat (igual ao MVP)")
    ap.add_argument("--modelo-jev", default=os.environ.get("JEV_MODEL", JEV_MODELO_DEFAULT),
                    help="modelo do Jev (alias móvel: `~typesafe/jev-latest`, com til)")
    # NÃO herda `PHB_MODEL`: quem roda o app com `PHB_MODEL=claude-sonnet-5`
    # exportado mandaria 258 chamadas com um modelo que o OpenRouter recusa.
    ap.add_argument("--modelo-chat", default=os.environ.get("CHAT_MODEL", CHAT_MODELO_DEFAULT),
                    help="modelo de chat (default z-ai/glm-5.3-flash; só esta flag ou "
                         "CHAT_MODEL mudam — PHB_MODEL do app é ignorado de propósito)")
    ap.add_argument("--jev-url", default=os.environ.get("JEV_URL", JEV_URL_DEFAULT))
    ap.add_argument("--chat-url", default=os.environ.get("CHAT_URL", CHAT_URL_DEFAULT))
    ap.add_argument("--preco-chat-entrada", type=float, default=PRECO_CHAT_ENTRADA_DEFAULT,
                    help="US$ por milhão de tokens de entrada do chat (conferir no OpenRouter)")
    ap.add_argument("--preco-chat-saida", type=float, default=PRECO_CHAT_SAIDA_DEFAULT,
                    help="US$ por milhão de tokens de saída do chat (conferir no OpenRouter)")
    ap.add_argument("--ambiguidade", type=float, default=0.3,
                    help="corte da 2ª maior probabilidade para listar caso ambíguo")
    return ap


def main(argv=None) -> int:
    args = montar_parser().parse_args(argv)
    if args.extrair:
        modo_extrair()
        return 0
    if not 0.0 < args.limiar <= 1.0:
        print("--limiar deve estar em (0, 1].")
        return 2
    if args.sonda:
        return modo_sonda(args)
    if args.rodar:
        return modo_rodar(args)
    return modo_relatorio(args)


if __name__ == "__main__":
    sys.exit(main())
