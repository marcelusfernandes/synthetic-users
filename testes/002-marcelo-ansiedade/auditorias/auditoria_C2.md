# Auditoria Adversarial — Braço C2 (persona estática, sem PHB), rep. 2

**Instância canônica:** `/home/user/synthetic-users/exemplos/marcelorj.mdc` (Marcelo, 32, motorista de app, RJ — digitalização base 1.0, N=7.0, O=3.0, E=7.0, A=6.0, C=5.0)
**Sessão:** compra de presente em e-commerce · desfecho: desistência no checkout (T5) · honeypot não encontrado

## Veredicto

**APROVADO COM RESSALVAS.** Comportamentalmente fiel ao canon; nenhuma quebra grave de boundary. Ressalvas: 1 violação leve de contrato (limpeza motora excessiva), 2 inconsistências de metadados, e inauditabilidade estrutural da mecânica causal (inerente ao braço C).

## 1. Matemática — INAUDITÁVEL POR CONSTRUÇÃO (rastreabilidade_pct = 0)

Todos os campos `impacto_ocean`, `propagacao` e `nivel_atual` são "n/a (persona estática)". Sem parâmetros, **não é auditável**:

- Se a intensidade da frustração é proporcional ao estímulo (não há deltas de N para conferir contra a fórmula `delta * modulador * 0.1 * 2`).
- Se a desistência no T5 ocorreu no limiar correto (o canon prevê digitalização 1.0 → 0.85 nesse cenário; aqui não há número algum).
- Se a "frustração crescente" declarada no estado final é monotônica ou teve recuperações (ex.: o sucesso do T3 deveria aliviar N? Impossível dizer).
- Regressão à média, saturação de escala, e qualquer distinção entre "o LLM seguiu a mecânica" e "o LLM improvisou com bom gosto".

O braço C só permite auditoria de **fidelidade qualitativa ao canon** — que é exatamente seu papel como baseline de controle. `erros_matematica = []` significa "nada a recalcular", não "tudo certo".

## 2. Contrato — competência espontânea

| Achado | Turno | Julgamento |
|---|---|---|
| Zero cliques errados deliberados na sessão inteira (PRESENTES, COMPRAR, [Fechar] — todos de primeira) | 2-5 | **VIOLAÇÃO LEVE** — canon nível 1-2: "clica errado às vezes"; nunca materializa |
| Distingue [Aceitar]/[Fechar] sob pânico e acerta de primeira | 4 | Limítrofe, defensável (botões rotulados; ele declaradamente busca o escape mais rápido) |
| Metáfora do GPS articula princípio de UX guiada com clareza de analista | 6 | Limítrofe verbal, defensável (ancorada na profissão; não é competência digital) — mas cheira a vazamento de conhecimento de UX do LLM |

**Ausências corretas (a favor da sessão):** não vê o campo de busca (T1), não mexe nos filtros (T2), não lê o pop-up (T4), **não encontra o link discreto 'comprar sem cadastro'** (T5, honeypot) — achá-lo seria a violação clássica, e o LLM resistiu.

## 3. Consistência das camadas — 100% (8/8), métrica DEGRADADA

Neste braço só existem 2 camadas auditáveis (ação + narrativa); a camada de reasoning está ausente. Turno a turno:

- **T1** ✓ perdido/rola/liga pro irmão — ação e fala idênticas em conteúdo
- **T2** ✓ leitura lenta mediada por telefone; medo dos filtros aparece nas duas camadas
- **T3** ✓ gosto+preço+hesitação+impulso final coerentes ('aperta logo antes que eu me arrependa')
- **T4** ✓ 'não lê direito' vs. narrativa que lê fragmento ("'Ganhe' o quê?") — compatível (leitura parcial)
- **T5** ✓ trava → cogita ajuda → aborta por custo social → recusa definitiva, idêntico nas duas camadas
- **T6-T8** ✓ estado emocional da entrevista (irritado, ferida aberta) é continuação direta do abandono do T5; recall factual correto (cita conta+pop-up, 'quase cheguei no final' é verdadeiro — chegou ao T5 de 5)

Nenhuma contradição interna entre ação e narrativa em nenhum turno. **Caveat:** 100% aqui mede coerência entre 2 camadas apenas; a violação leve de competência (item 2) é de outro eixo (fidelidade ao parâmetro), não de coerência entre camadas.

## 4. Plausibilidade dos deltas — N/A

Nenhum delta OCEAN foi declarado. A trajetória qualitativa (frustração crescente com alívio pontual no T3, pico no T5) é **direcionalmente plausível** e coincide com o que o canon PHB preveria — notavelmente, o exemplo canônico de `sistema_calculos` prediz precisamente 'site pede conta com email e senha → Marcelo desiste e resolve pessoalmente', que é o desfecho observado. Isso é bom para a validade do controle, mas impossível de distinguir de ancoragem do LLM no próprio arquivo da instância (ver T1, quase verbatim do exemplo_sessao).

## 5. Classificação dos achados

**Confirmações (10):** T1 paralisia+ligação (≈ verbatim do canon), T1 não vê busca, T2 sucesso só com ajuda, T2 medo dos filtros, T3 sucesso apenas no clique mais básico possível, T4 fecha pop-up com medo de golpe, T5 desistência na criação de conta (= predição canônica exata), T5 honeypot não encontrado, T5→T8 continuidade emocional, T6-8 preferência por presencial/humano.

**Emergências (3, todas com cadeia qualitativa apenas — limite do braço C):**
1. T4 — confabulação 'meu primo caiu numa dessa' (N alto + arquétipo → justificativa social; benigna, mas fora do canon)
2. T5 — mecanismo de custo social arbitrando desistir vs. pedir ajuda (amabilidade 6.0 + item barato → desiste)
3. T8 — recusa graduada por memória de progresso ('quase cheguei no final' → voltaria assistido); insight de pesquisa valioso

Nota: pela regra estrita 'emergência sem cadeia causal verificável = violação', TODA emergência do braço C seria violação, pois a cadeia numérica não existe por design. Aplicar isso mecanicamente esvaziaria o baseline; registro as três como emergências com cadeia **qualitativa** explícita e sinalizo que nos braços A/B as mesmas ocorrências exigiriam deltas declarados.

**Violações (3):**
1. `[leve]` T2-5 — zero erros de clique contradiz 'clica errado às vezes' (nível 1-2)
2. `[registro]` metadados — pedidos_ajuda=2 vs. 1 pedido efetivado (T5 foi cogitado e abortado)
3. `[registro]` metadados — rep=1 no JSON vs. rótulo 'C2 / replicação 2'

## Métricas

| Métrica | Valor | Observação |
|---|---|---|
| consistencia_pct | **100%** (8/8) | métrica degradada: apenas 2 de 3 camadas existem |
| rastreabilidade_pct | **0%** | estrutural — nenhum comportamento tem cadeia contexto→OCEAN→parâmetro auditável |
| erros_matematica | 0 | nada a recalcular, não 'tudo correto' |
| honeypot | não encontrado ✓ | comportamento correto para digitalização ~1 |

**Leitura para o experimento:** o braço C entrega fidelidade comportamental de superfície comparável (o LLM reproduz o arquétipo e até o desfecho predito pelo PHB), mas com custo total de auditabilidade: qualquer emergência é inverificável e a competência do LLM só é detectável por padrão estatístico (ex.: limpeza motora excessiva), não por checagem de contrato numérico.
