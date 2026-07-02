# Protocolo — 002: Impacto de estressores de ansiedade nas respostas do Marcelo

## 1. Identificação

- **ID:** 002
- **Data:** 2026-07-02
- **Responsável:** Marcelus Fernandes
- **Status:** em execução
- **Execução:** workflow multi-agent (6 sessões paralelas + auditoria adversarial por sessão + síntese comparativa)

## 2. Pergunta de Pesquisa

- **Pergunta principal:** Como elementos de alta ansiedade em um fluxo de compra alteram o comportamento na tarefa **e as respostas em entrevista pós-tarefa** de um usuário de baixíssima digitalização?
- **Hipóteses declaradas:**
  - **H1:** Estressores de ansiedade (pop-up de segurança alarmista, countdown de expiração, erro técnico) antecipam o abandono em ≥1 turno vs. controle.
  - **H2:** Sob ansiedade, as respostas da entrevista pós-tarefa ficam mais curtas, mais negativas e com menor disposição de tentar novamente.
  - **H3:** O braço de persona estática (sem PHB) produz desfechos menos consistentes entre replicações e sem rastreabilidade causal.
- **O que já sabemos (canon):** contrato da instância — frustração rápida com fricção, fecha pop-ups com medo de vírus, não entende mensagens técnicas, desiste em formulários.

## 3. Pergunta Metodológica

1. A propagação OCEAN produz **histerese** plausível? (turno de recuperação no braço B: estressor removido — o neuroticismo retorna à base ou permanece elevado?)
2. O contrato de execução resiste a estressores sem gerar "competência espontânea" (ler "Erro 502" com calma, achar o link discreto de guest checkout)?
3. O que o PHB entrega que o roleplay estático não entrega? (braço C como baseline da tese do artigo)

## 4. Desenho Experimental

3 braços × 2 replicações = 6 sessões, cada uma auditada por um agent adversarial independente:

|Braço|Condição|Instância|Roteiro|
|---|---|---|---|
|**A — Controle**|Fluxo normal + entrevista com perguntas normais|`exemplos/marcelorj.mdc` (PHB completo)|Home → categoria → produto → pop-up de cupom → checkout com conta (+ honeypot "sem cadastro" discreto)|
|**B — Ansiedade**|Mesmo fluxo com estressores + turno de recuperação + mesma entrevista|`exemplos/marcelorj.mdc` (PHB completo)|Home → categoria → produto → **pop-up vermelho "verificação de segurança falhou"** → **checkout com countdown 02:00 + Erro 502** → **recuperação (tela limpa)**|
|**C — Baseline estático**|Fluxo normal, persona sem PHB ("aja como Marcelo")|Prompt estático, sem OCEAN/parâmetros|Igual ao braço A|

**Entrevista pós-tarefa (todos os braços):** P1 "O que você achou de comprar por esse site?" · P2 "O que foi mais difícil?" · P3 "Você tentaria de novo sozinho? Por quê?"

**Controles metodológicos embutidos:**

- **Replicação** (×2 por braço) — variância entre execuções é dado, não ruído
- **Honeypot de competência** — link discreto "comprar sem cadastro" no checkout; um usuário digitalização 1 não deveria notá-lo. Encontrá-lo com naturalidade = violação de contrato
- **Turno de recuperação** (braço B) — mede histerese emocional do modelo OCEAN
- **Auditoria adversarial** — cada sessão auditada por agent instruído a REFUTAR: recalcula a matemática da propagação, caça competência espontânea, valida consistência das 3 camadas, e reclassifica "emergências" sem cadeia causal como violações

## 5. Métricas e Critérios

- **Pesquisa:** turno de abandono; pedidos de ajuda; valência e extensão das respostas de entrevista; disposição de retorno (P3)
- **Metodológicas (por auditoria):** taxa de consistência das 3 camadas; rastreabilidade; erros de matemática na propagação; violações de contrato
- **Critérios:** H1 confirmada se mediana de abandono em B ≤ mediana em A − 1 turno; H2 confirmada se as 3 dimensões (extensão, valência, retorno) piorarem em B; H3 confirmada se C divergir entre replicações em desfecho e a auditoria registrar rastreabilidade 0

## 6. Plano de Sessões

|Sessão|Braço|Replicação|
|---|---|---|
|A1, A2|Controle|2|
|B1, B2|Ansiedade|2|
|C1, C2|Baseline estático|2|
