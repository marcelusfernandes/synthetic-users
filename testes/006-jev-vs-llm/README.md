# 006 — Jev × LLM de chat na etapa ①

Compara dois interpretadores da etapa ① do pipeline PHB (`mensagem do interlocutor →
eventos do catálogo {tipo, intensidade}`) sobre as falas das transcrições dos testes
003 e 005:

- **Jev** (`typesafe/jev-1.13`) pela Decisions API alpha do OpenRouter;
- **LLM de chat** (default `z-ai/glm-5.3-flash`) por chat completions do OpenRouter.

Os dois recebem exatamente o que o MVP enviaria: `comparar.py` importa
`app.jev.montar_perguntas/montar_estado/mapear_respostas` e
`app.llm._prompt_interpretar/_parsear_eventos` em vez de copiá-los. O motor não entra:
aqui só se classifica mensagem em evento (CLAUDE.md, invariante 1). Python 3.11+,
stdlib apenas.

O desenho do experimento, as hipóteses e os critérios estão em [`protocolo.md`](protocolo.md).

## Os quatro modos

```bash
cd testes/006-jev-vs-llm

# 1. extrair o corpus das transcrições — OFFLINE, não gasta nada
python3 comparar.py --extrair          # escreve corpus.jsonl (90 falas) e imprime a conferência

# 2. sonda: UMA chamada a cada interpretador, imprimindo a resposta crua — PAGO (~US$ 0,0002)
OPENROUTER_API_KEY=... python3 comparar.py --sonda --confirmar

# 3. rodada — PAGO. Sem --confirmar só imprime chamadas e custo estimado
OPENROUTER_API_KEY=... python3 comparar.py --rodar --repeticoes 3            # estimativa
OPENROUTER_API_KEY=... python3 comparar.py --rodar --repeticoes 3 --confirmar
#    grava resultados.jsonl (uma linha por chamada) e retoma de onde parou se interrompida

# 4. relatório — OFFLINE
python3 comparar.py --relatorio        # escreve relatorio.md
```

`corpus.jsonl` é versionado (vem de dados já públicos no repositório). `resultados.jsonl`
e `relatorio.md` são produzidos pela rodada.

Recortes úteis: `--limite M` (só as M primeiras falas), `--teste 005` (só as falas com
rótulo-ouro), `--repeticoes N`, `--limiar 0.4` (corte de P(sim) do Jev),
`--refazer-erros` (repete as chamadas que falharam), `--pausa 0.5` (espaça as chamadas).

## Variáveis de ambiente

|Variável|Para que serve|
|---|---|
|`OPENROUTER_API_KEY`|**obrigatória** em `--sonda`/`--rodar`. Nunca é impressa, gravada em arquivo nem colocada em mensagem de erro (invariante 6)|
|`JEV_URL`|sobrescreve `https://openrouter.ai/api/alpha/decisions` (usado para apontar a um stub local)|
|`CHAT_URL`|sobrescreve `https://openrouter.ai/api/v1/chat/completions`|
|`JEV_MODEL`|modelo do Jev (default `typesafe/jev-1.13`; o alias móvel é `~typesafe/jev-latest`, **com** o til)|
|`CHAT_MODEL`|modelo de chat (default `z-ai/glm-5.3-flash`). **`PHB_MODEL` do app é ignorado de propósito**: com `PHB_MODEL=claude-sonnet-5` exportado, a rodada inteira iria para um modelo que o OpenRouter recusa|

Tudo também tem flag equivalente (`--jev-url`, `--chat-url`, `--modelo-jev`,
`--modelo-chat`, `--timeout`).

## Custo estimado

|Rodada|Chamadas|Custo|
|---|---|---|
|sonda|2|~US$ 0,0002|
|piloto (`--teste 005`, 3 repetições)|30|~US$ 0,003|
|corpus inteiro (90 falas × 3 repetições × 2 interpretadores)|540|~US$ 0,050|

Jev: ~2.200 tokens de entrada por chamada (24 perguntas tipadas + `state`) a US$ 0,042/M,
saída grátis (`docs/jev-avaliacao.md`). Chat: ~700 tokens de entrada + ~60 de saída, com preço
**a conferir** na página do modelo no OpenRouter — os defaults
`--preco-chat-entrada 0.10` e `--preco-chat-saida 0.40` são placeholders de ordem de
grandeza e só afetam a *estimativa*; o custo real vem de `usage` em `resultados.jsonl`.

A execução paga é um **checkpoint humano**: sem `--confirmar`, nenhuma chamada sai.

## Notas de contrato

O endpoint do Jev é alpha e parte do contrato não está confirmada publicamente (24
perguntas numa única chamada, `state` como objeto JSON). Tudo que é incerto está no bloco
`CONTRATO DAS APIs`, no topo de `comparar.py` — é o único lugar a corrigir. Em `400`, o
script tenta `state` como string e depois dois lotes de 12 perguntas, gravando em
`resultados.jsonl` qual variante funcionou (`variante_requisicao`). `429`/`529` são
retentados com backoff exponencial (respeitando `Retry-After`); timeout (default 20 s) tem
uma retentativa; qualquer outra falha é registrada por fala e não derruba a rodada.

Uma exceção: resposta `200` cujo `answers` não cumpre o contrato tipado **não** dispara
troca de variante (isso só multiplicaria a conta) — vira erro `contrato` e, depois de 3
seguidos, a rodada aborta pedindo uma `--sonda`. O que já foi lido fica gravado e
`--rodar` retoma.
