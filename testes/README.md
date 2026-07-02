# Research Tests — Laboratório da Metodologia PHB

Este diretório é o coração do repositório: cada research test é um experimento que usa usuários sintéticos PHB para investigar uma hipótese de produto/UX **e**, ao mesmo tempo, valida a própria metodologia (consistência, rastreabilidade, emergência).

## O que é um Research Test

Um research test coloca uma ou mais instâncias de usuários sintéticos (`exemplos/*.mdc`) diante de um cenário — um fluxo de interface, uma entrevista simulada, um benchmark — e registra o comportamento nas três camadas de observabilidade (Reasoning, Externalização, Ação).

Todo teste responde duas perguntas:

1. **Pergunta de pesquisa** — o que queremos aprender sobre o produto/fluxo? (ex.: "onde usuários de baixa digitalização abandonam o checkout?")
2. **Pergunta metodológica** — a simulação se manteve dentro dos parâmetros? Houve comportamento emergente genuíno ou apenas eco do esperado?

> Princípio do framework: *synthetic users não servem para ouvir o que já sabemos, mas para iluminar o que não sabemos — e então validar com usuários reais.*

## Ciclo de um Teste

```
1. PROTOCOLO   → hipótese, instâncias, cenário, métricas (templates/protocolo.md)
2. EXECUÇÃO    → sessões turno a turno com output obrigatório (templates/sessao.md)
3. AUDITORIA   → validação de consistência entre as 3 camadas
4. RELATÓRIO   → achados, emergências, falhas de simulação (templates/relatorio.md)
5. VALIDAÇÃO   → hipóteses novas marcadas para validação com usuários reais
```

## Estrutura de um Teste

```
testes/
├── templates/                     # Modelos de protocolo, sessão e relatório
└── NNN-nome-do-teste/
    ├── protocolo.md               # Desenho do experimento (antes de executar)
    ├── sessoes/
    │   ├── sessao_001.md          # Log turno a turno de cada instância/execução
    │   └── sessao_002.md
    └── relatorio.md               # Síntese, achados e auditoria (depois de executar)
```

Convenção de nomes: `NNN-slug-descritivo` com numeração sequencial (`001-`, `002-`…).

## Classificação de Achados

|Tipo|Definição|Destino|
|---|---|---|
|**Confirmação**|Comportamento já previsto pelo canon/pesquisas|Registra e segue|
|**Emergência**|Comportamento novo, não previsto, mas rastreável aos parâmetros|Vira hipótese para validação com usuários reais|
|**Violação**|Comportamento que quebra boundaries do arquétipo|Bug da simulação — corrigir instância/prompt, não é insight|

A distinção Emergência × Violação é o teste ácido da metodologia: emergência é rastreável pela cadeia causal (contexto → OCEAN → parâmetros → comportamento); violação não se sustenta na auditoria.

## Métricas Metodológicas

Registradas em todo relatório para acompanhar a evolução da metodologia entre testes:

- **Taxa de consistência** — % de turnos em que as 3 camadas refletem os parâmetros ativos
- **Taxa de emergência** — achados novos / total de achados
- **Taxa de violação** — turnos com quebra de boundary / total de turnos
- **Rastreabilidade** — % de comportamentos explicáveis pela cadeia causal completa
