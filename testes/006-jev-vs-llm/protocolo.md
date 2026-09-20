# Protocolo — 006: Jev (TypeSafe) × LLM de chat na etapa ① do pipeline

> Pré-registro. As hipóteses abaixo estão declaradas **antes** de qualquer chamada paga.
> A execução (`comparar.py --rodar --confirmar`) é um **checkpoint humano**: o script
> imprime o número de chamadas e o custo estimado e só gasta com `--confirmar`.

## 1. Identificação

- **ID:** 006
- **Data:** 20/09/2026 (protocolo) · execução ao vivo pendente de autorização
- **Responsável:** —
- **Status:** rascunho (corpus extraído, rodada paga não executada)

## 2. Pergunta de Pesquisa

*Trocar o interpretador da etapa ① muda o que o motor recebe?*

O pipeline é `mensagem → ① interpretar em eventos → ② motor calcula → ③ LLM narra`.
A etapa ① hoje é um LLM de chat devolvendo um array JSON (`app/llm.py`); o MVP desta
branch permite trocá-la pelo Jev, que responde perguntas tipadas com probabilidade
calibrada (`app/jev.py`). Se as duas leituras divergirem muito, a escolha do
interpretador é uma decisão de produto, não de infraestrutura — ela muda os deltas que
`engine_v3.step()` aplica e, portanto, o comportamento da persona.

- **Pergunta principal:** quão diferentes são as leituras de Jev e LLM de chat sobre as
  mesmas falas, e qual delas se aproxima mais dos eventos que uma pessoa anotaria?
- **Hipóteses declaradas:**
  - **H1 — concordância alta nos eventos negativos claros.** Em falas de hostilidade
    inequívoca (as sessões hostis do 003: cobrança política, deboche, exposição), os dois
    interpretadores emitem o mesmo conjunto de tipos (Jaccard ≥ 0,7 no subconjunto
    hostil). A divergência se concentra nas falas afetivas mistas (elogio × lisonja,
    humor × deboche, vulnerabilidade × pedido íntimo).
  - **H2 — o Jev é mais estável entre repetições.** Com a mesma fala repetida N vezes,
    o Jev devolve conjuntos de tipos idênticos com mais frequência que o chat, e com
    menor desvio-padrão de intensidade (esperado: fração de conjuntos idênticos do Jev
    ≥ 0,9 contra ≤ 0,7 do chat).
  - **H3 — o Jev revela ambiguidade que o chat esconde.** O chat devolve um conjunto e
    nada diz sobre o que descartou; o Jev dá P(sim) dos 12 tipos. Espera-se um número
    relevante de falas com segunda probabilidade > 0,3 (ambiguidade real, ex.:
    `elogio_especifico 0,52 / lisonja 0,45`) — e que essas falas coincidam com as maiores
    discordâncias entre os dois interpretadores.
  - **H4 — calibração em português é desconhecida.** As instruções e critérios das
    perguntas estão em português e o Jev não tem calibração publicada nesse idioma; o
    limiar default 0,5 pode estar sistematicamente alto ou baixo. Esta hipótese é
    **exploratória**: mede-se, não se prevê o sinal. Sintomas a observar: muitos `neutro`
    (limiar alto demais) ou muitos eventos por fala (baixo demais).
- **O que já sabemos (canon):** `docs/jev-avaliacao.md` (contrato, preço, limitações do
  endpoint alpha), teste 004 (calibração v3 do motor), teste 005 (a única sessão com
  eventos anotados no catálogo v3), `docs/opacidade-entre-mentes.md`.

## 3. Pergunta Metodológica

O que este teste verifica sobre o próprio framework:

1. **A fronteira do invariante 1 se sustenta na troca?** Nenhum dos dois interpretadores
   calcula estado — os dois só classificam. O experimento não chama `engine_v3.step()`
   em momento algum: mede a etapa ① isolada. Se a comparação exigisse o motor, a etapa ①
   não estaria isolada de verdade.
2. **O corpus do repositório serve como banco de avaliação?** As transcrições dos testes
   003 e 005 foram escritas para outro fim (v2 e v3, respectivamente). O teste mede
   quanto delas é reaproveitável: 003 não tem rótulo no catálogo v3 (só
   `Contexto interpretado` em prosa), 005 tem 5 falas anotadas, e 4 delas são paráfrases
   — o que já é um achado metodológico sobre o registro das sessões.
3. **Rastreabilidade.** A trilha do Jev (`probabilidade`, `intensidade`, `confianca` por
   tipo) é a cadeia causal que o PHB pede; medir se ela é legível o bastante para uma
   pessoa auditar uma discordância sem reler o código.

## 4. Instâncias

|Instância|Arquétipo|Parâmetros-chave|Por que foi escolhida|
|---|---|---|---|
|`personas/mariana.json`|influenciadora quiet luxury|O 7,5 · C 7,0 · E 7,5 · Am 6,0 · N 3,0|é a persona das duas transcrições do corpus; entra só como `state`/prompt (nome + bio), nunca como estado do motor|

Interlocutores: `visitante` (003, rótulos originais Lu/Interlocutor/Bia/Caio/Observador)
e `dan` (005) — os mesmos identificadores que o front usaria.

## 5. Cenário

- **Ambiente:** `testes/006-jev-vs-llm/comparar.py`, fora do servidor. Os dois
  interpretadores recebem exatamente o que o MVP enviaria: as perguntas, o `state` e o
  mapeamento vêm de `app.jev` (`montar_perguntas`, `montar_estado`, `mapear_respostas`)
  e o prompt e o parse vêm de `app.llm` (`_prompt_interpretar`, `_parsear_eventos`),
  importados — não copiados.
- **Corpus:** 90 falas do interlocutor, `corpus.jsonl` (gerado por `--extrair`, offline):

  |teste|sessão|falas|com rótulo-ouro|verbatim|com contexto em prosa|
  |---|---|---|---|---|---|
  |003|E1-base-confianca|12|0|12|12|
  |003|E1-base-hostil|12|0|12|7|
  |003|E1-espelhada-confianca|12|0|12|12|
  |003|E1-espelhada-hostil|12|0|12|3|
  |003|E2-cicatriz|20|0|20|13|
  |003|E4-opacidade|8|0|8|0|
  |003|E5-eixos|9|0|9|3|
  |005|sessao_001|5|5|1|0|
  |**total**| |**90**|**5**|**86**|**50**|

  Duas limpezas na extração preservam a validade do estímulo: a **nota do narrador**
  colada ao fim de duas falas da E2 (`… — *O print é da DM delas. Só a Bia tinha aquela
  conversa.*`) é cortada, porque entrega ao interpretador a leitura que ele deveria
  produzir; e o `**negrito**` do log sai, porque o MVP nunca manda markdown. A linha que
  *descreve* o interlocutor no cabeçalho da E5 (`**Interlocutor:** Caio — crítico
  cultural…`) não é fala e fica de fora (regra: sem turno, não entra).

  As 4 falas não-verbatim do 005 são paráfrases do coordenador (o que Dan mandou, em
  resumo). Elas carregam rótulo-ouro, então entram na rodada **marcadas** (`verbatim:
  false`): interpretar um resumo não é interpretar a mensagem, e o relatório separa os
  dois casos.
- **Estímulo por chamada:** uma fala isolada, sem histórico da conversa — é o que o
  front faz hoje em `/api/sessoes/{id}/mensagem`.
- **Repetições:** 3 por fala e por interpretador (`--repeticoes`).
- **Condição de parada:** corpus esgotado. Falhas por fala são gravadas e não derrubam a
  rodada; `--rodar` retoma de onde parou.

## 6. Métricas e Critérios

Todas saem de `comparar.py --relatorio` (`relatorio.md`):

|#|Métrica|Como é calculada|
|---|---|---|
|a|Concordância de tipos|Jaccard e igualdade exata do conjunto de tipos, Jev × chat, mesma fala e mesma repetição; por teste e total|
|b|Distância de intensidade|média das diferenças absolutas nos tipos que os dois emitiram|
|c|Acerto contra o ouro|precisão/recall/F1 de tipos (micro) contra os eventos anotados do 005, por interpretador|
|d|Estabilidade|Jaccard médio entre as N repetições, fração de falas com conjunto idêntico, desvio-padrão da intensidade|
|e|Ambiguidade|chamadas do Jev com 2ª maior P(sim) > 0,3, listadas com o texto|
|f|Custo e latência|mediana de latência e soma de `usage.cost` por interpretador|
|g|Discordâncias|as 10 falas de menor Jaccard médio, com texto e as duas leituras lado a lado|

**Critérios por hipótese**

- **H1 confirmada** se, no subconjunto hostil do 003 (sessões `*-hostil`), o Jaccard médio
  ≥ 0,7; **refutada** se < 0,5.
- **H2 confirmada** se a fração de conjuntos idênticos entre repetições do Jev for ≥ 0,9
  **e** maior que a do chat por ≥ 0,2; **refutada** se o chat empatar ou superar.
- **H3 confirmada** se ≥ 15 % das *falas* (não das chamadas) tiverem 2ª probabilidade > 0,3 **e** essas falas
  estiverem super-representadas entre as 10 maiores discordâncias; **refutada** se a
  ambiguidade for rara ou não tiver relação com a discordância.
- **H4** não tem critério de confirmação: o resultado é a curva observada. Sinal de
  alarme: > 40 % das falas caindo em `neutro`, ou > 5 tipos por fala em média — os dois
  indicam limiar mal posto, e a resposta é medir de novo com `--limiar` variado.

**Classificação dos achados** (convenção de `testes/README.md`)

- **Confirmação:** o resultado bate com o que `docs/jev-avaliacao.md` previu (type-safety
  elimina o parse defensivo; custo e latência caem; estabilidade maior).
- **Emergência:** padrão novo e rastreável — ex.: o Jev separar `lisonja` de
  `elogio_especifico` onde o chat funde os dois; ou a ambiguidade do Jev coincidir com as
  falas que a auditoria do 003 marcou como mistas. Vira hipótese para o design da UI
  (modo manual assistido) ou para o roteamento por confiança.
- **Violação:** leitura que contradiz o catálogo ou o registro da sessão — ex.: `traicao`
  numa fala de elogio, `neutro` numa fala de deboche explícito, ou intensidade que não
  responde à força do texto. Violação é bug do interpretador (ou do limiar), não insight.

**Anti-critério (o que este teste NÃO decide):** ele não autoriza trocar o default do
`PHB_INTERPRETADOR`. Mesmo com o Jev ganhando em tudo, a decisão depende de rodar o
pipeline inteiro (② e ③) e de ver a narrativa resultante — aqui só se mede a etapa ①.

## 7. Plano de Sessões

|Rodada|Comando|Chamadas|Custo estimado|Objetivo|
|---|---|---|---|---|
|0 — extração|`--extrair`|0|US$ 0|corpus.jsonl (offline, já executado)|
|1 — sonda|`--sonda --confirmar`|2|~US$ 0,0002|validar chave, contrato do endpoint alpha (24 perguntas numa chamada? `state` objeto?) e idioma antes do lote|
|2 — piloto|`--rodar --teste 005 --confirmar`|30|~US$ 0,003|as 5 falas com rótulo-ouro, 3 repetições: mede o acerto antes de pagar o corpus inteiro|
|3 — corpus|`--rodar --confirmar`|540|~US$ 0,050|90 falas × 3 repetições × 2 interpretadores|
|4 — relatório|`--relatorio`|0|US$ 0|relatorio.md|

Custo da rodada 3 (mesma fórmula que o script imprime): Jev 270 chamadas × ~2.200 tokens
de entrada × US$ 0,042/M ≈ **US$ 0,025** (o payload são 24 perguntas tipadas + `state`,
~7,7 mil caracteres — não os ~900 tokens da mensagem sozinha); chat 270 × (~700 entrada +
~60 saída) com preço a conferir no OpenRouter (placeholder US$ 0,10/M entrada + US$ 0,40/M
saída) ≈ **US$ 0,025**. Total ≈ **US$ 0,050** — o risco não é o dinheiro, é rodar contra
um endpoint alpha sem antes conferir o contrato, por isso a sonda vem primeiro: ela
imprime modelo, URL e a resposta crua dos dois lados antes de qualquer lote.
