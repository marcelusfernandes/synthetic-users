# Exemplos de Instâncias

Instâncias executáveis de usuários sintéticos no formato PHB (`.mdc`). Uma instância é o resultado do processo de construção descrito em [`documentacao.md`](../documentacao.md): arquétipo + personalidade + parâmetros + contrato de execução, pronta para ser operada por um agent.

## Instâncias por versão de schema

| Instância | Schema | Onde a matemática roda | Descrição |
|---|---|---|---|
| [`marcelorj.mdc`](marcelorj.mdc) | v1.0 | no LLM | Marcelo, baixa digitalização — 1 parâmetro (caso didático) |
| [`mariana.mdc`](mariana.mdc) | v2.0 | no LLM | Mariana, influenciadora Quiet Luxury — 16 parâmetros, antagonistas, trade-offs, ruptura |
| [`mariana_v3.mdc`](mariana_v3.mdc) | v3.0 | **no motor** (`../phb/`) | Mariana v3 — afeto forkado por interlocutor; o LLM só interpreta eventos e narra |

> **Mudança de arquitetura (v3):** nas v1/v2 a fórmula de propagação roda dentro do prompt do LLM. Na v3 o LLM só classifica a mensagem em eventos e narra a resposta; **quem calcula o estado é o motor determinístico** ([`../phb/engine_v3.py`](../phb/engine_v3.py)). Ver [`../docs/funcionamento-v3.md`](../docs/funcionamento-v3.md). As seções abaixo descrevem a mecânica **v1/v2**, ainda usada por Marcelo e pela Mariana v2.

## Exemplo v1: Marcelo — Baixa Digitalização ([marcelorj.mdc](marcelorj.mdc))

Usuário sintético básico com **um parâmetro de comportamento** (`digitalizacao`), demonstrando a mecânica das versões 1 e 2:

```
Contexto afeta OCEAN → OCEAN modula parâmetros → Comportamento emerge
```

Marcelo é um motorista de aplicativo carioca, analfabeto digital (digitalização 1/10, faixa do arquétipo [0, 3]). Qualquer fricção digital dispara seu neuroticismo, que por sua vez rebaixa ainda mais a digitalização — levando a desistência ou pedido de ajuda.

## Anatomia de uma Instância

|Seção|Função|
|---|---|
|`identidade`|Nome, demografia, bio e **voz** (regionalismo, tom, regras de expressão) — a camada de Externalização|
|`arquetipo`|Classe comportamental que delimita as faixas válidas|
|`personalidade_ocean`|Big Five com `valor_base` e `valor_atual` (0-10) — o estado dinâmico que o contexto altera|
|`parametros`|Parâmetros comportamentais com `valor_base`, `faixa_arquetipo`, `escala_significado` (semântica por nível) e `moduladores_ocean` (pesos de propagação)|
|`comportamentos_tipicos`|Pares situação → reação esperada no nível atual|
|`sistema_calculos`|Como interpretar contexto e propagar deltas OCEAN para os parâmetros|
|`output_format`|Estrutura obrigatória por turno (as três camadas de observabilidade)|
|`contrato_execucao`|Regra principal, comportamentos obrigatórios e proibições — os guardrails invioláveis|
|`valores_iniciais`|Snapshot para reset da simulação|

## Fórmula de Propagação

Cada turno, o contexto gera deltas nos traços OCEAN. Os deltas propagam para os parâmetros comportamentais via moduladores:

```
delta_parametro = Σ (delta_traco × modulador_traco × 0.1 × 2)
```

Exemplo (Marcelo diante de um formulário de criação de conta):

```
1. Neuroticismo: 7.0 → 8.5 (+1.5) — tarefa complexa demais
2. Abertura: 3.0 → 2.5 (-0.5) — fecha pra novidade

Propagação:
  - via N: +1.5 × (-0.4) × 0.1 × 2 = -0.12
  - via A: -0.5 × (+0.3) × 0.1 × 2 = -0.03
  - digitalização: 1.0 → 0.85

Resultado: Marcelo desiste e vai tentar resolver pessoalmente.
```

## Output Obrigatório por Turno

Cada turno da simulação registra as três camadas de observabilidade:

```
[TURNO N]

Contexto Interpretado:      ← o que o agent percebeu
Cálculos OCEAN:             ← estado emocional/personalidade atualizado
Propagação para Parâmetros: ← efeito nos parâmetros comportamentais
Comportamento Resultante:   ← nível atual + ação (camada de Ação)
Narrativa:                  ← fala em primeira pessoa (camada de Externalização)
```

Isso garante a cadeia de causalidade auditável: qualquer comportamento pode ser rastreado até o contexto que o originou.
