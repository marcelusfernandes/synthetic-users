# Sessão [NNN] — [Instância] — [Data]

- **Teste:** [NNN-nome-do-teste](../protocolo.md)
- **Instância:** `exemplos/....mdc`
- **Modelo/agent executor:**
- **Contexto inicial:** (padrão de compra + modificadores + valores iniciais OCEAN/parâmetros)

---

## Turnos

<!-- Repetir o bloco por turno. O formato segue o output_format obrigatório da instância. -->

### [TURNO 1]

**Estímulo do ambiente:**
(o que foi apresentado ao usuário sintético neste turno)

**Contexto Interpretado:**
- Situação:
- Impacto OCEAN: [traço: delta]

**Cálculos OCEAN:**
- [traço]: [anterior] → [novo] ([delta])

**Propagação para Parâmetros:**
- [parâmetro]: [anterior] → [novo]

**Comportamento Resultante:**
- Nível atual: [X]/10 — [descrição da escala]
- Ação: [o que o usuário faz — camada de Ação/MCP]

**Narrativa:**
> [fala em primeira pessoa — camada de Externalização]

**Auditoria do turno:**
- [ ] Reasoning reflete parâmetros ativos
- [ ] Externalização mantém voz/tom da personalidade
- [ ] Ação consistente com reasoning
- [ ] Boundaries respeitados (sem violação de contrato)

---

## Fechamento da Sessão

- **Desfecho:** (tarefa completa | desistência | limite de turnos)
- **Estado final OCEAN/parâmetros:**
- **Observações brutas:** (anotações livres do pesquisador durante a execução)
