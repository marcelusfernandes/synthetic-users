# Synthetic Users — PHB Framework

Usuários Sintéticos são representações simuladas de consumidores reais, operados por agents com **MCP (Model Context Protocol)**. São utilizados para testes de usabilidade, benchmark e entrevistas simuladas.

Este repositório implementa o **Parameterized Hierarchical Behavior Framework (PHB)**, apresentado no artigo [Synthetic Users: From static personas to emergent dynamic behavior](https://medium.com/design-bootcamp/synthetic-users-from-static-personas-to-emergent-dynamic-behavior-ae7237a8ae71) (Marcelus Fernandes, Bootcamp, jan/2026).

## Por que PHB?

Métodos tradicionais embedam pesquisa qualitativa em sistemas RAG e pedem ao LLM para "agir como" uma persona. Isso produz saídas consistentes, porém previsíveis — um "teatro" performático que confirma vieses existentes sem revelar *unknown unknowns*, sem causalidade real, rastreabilidade ou descoberta emergente.

O PHB trata humanos como **sistemas dinâmicos influenciados por contexto**, gerando mudanças de comportamento imprevisíveis, porém rastreáveis. O framework enfatiza:

- **Rastreabilidade causal** — cadeias de raciocínio explícitas e camadas de observabilidade
- **Decisões auditáveis** — thresholds parametrizados e guardrails derivados de pesquisa real
- **Comportamentos emergentes** — interações em tempo real que revelam insights novos (ex.: abandono induzido por fricção em fluxos de UX)

> "Synthetic users are not for hearing what we already know, but for illuminating what we don't — to validate with real users. We gain density and scale, without replacing people."

O objetivo não é substituir usuários reais, mas fornecer **densidade** (variação individual rica), **escala** (testes paralelos massivos) e **emergência** (comportamentos inesperados) para gerar hipóteses novas, validadas depois no mundo real.

## Arquitetura em camadas (analogia RPG)

O sistema constrói agentes através de camadas hierárquicas com precedência estrita:

| Camada | Analogia RPG | Função |
|---|---|---|
| Personalidade | Player | Identidade única, variação individual (±1 dentro do range) |
| Arquétipo | Classe | Kit de comportamentos, ranges de parâmetros e limites |
| Padrões de Compra | Situações | Modificadores contextuais cumulativos (com clamp 1–10) |
| Pesquisas Reais | Canon/Lore | Guardrails e referências autênticas |

**Princípio fundamental:** assim como um Bárbaro não invoca magia de alto nível, um Caçador de Ofertas não ignora preços. Camadas superiores variam a expressão, mas nunca quebram os boundaries das camadas inferiores.

## Observabilidade em três camadas

Cada usuário sintético gera três níveis de registro auditáveis:

| Camada | O que captura | Função de auditoria |
|---|---|---|
| **Reasoning** | Processo decisório interno | Por que decidiu |
| **Externalização** | Resposta/comunicação verbal | O que disse |
| **Ação (MCP)** | Navegação e interações reais | O que fez |

A consistência entre as três camadas valida se o agente opera dentro dos parâmetros definidos — espelhando métodos de auditoria de alinhamento para detecção de comportamentos desalinhados.

## Estrutura do repositório

```
├── documentacao.md          # Especificação completa do sistema
├── arquetipos/              # 7 arquétipos com parâmetros e specs de decisão
├── pesquisas/               # Entrevistas reais (canon/guardrails) por arquétipo
├── padroes_compra/          # Reposição, Abastecimento, Ocasião, Indulgência
├── modificadores/           # Sazonais, eventos de vida, contexto social
├── dual_class/              # Gatilhos e regras de transição entre arquétipos
└── exemplos/                # Instâncias executáveis (.mdc) — ex.: Marcelo, baixa digitalização
```

## Instâncias executáveis

Instâncias concretas vivem em [`exemplos/`](exemplos/) no formato `.mdc` (schema PHB v1.0). A personalidade é modelada via **OCEAN (Big Five)** e a mecânica central é:

```
Contexto afeta OCEAN → OCEAN modula parâmetros → Comportamento emerge
```

Cada turno de simulação produz um output estruturado obrigatório (contexto interpretado → cálculos OCEAN → propagação para parâmetros → comportamento → narrativa), preservando a cadeia de causalidade auditável.

## Limitações reconhecidas

Estados "emocionais" emergentes (ansiedade, frustração, felicidade) surgem do feedback de interação e influenciam reasoning e externalização — mas permanecem **simulações**. LLMs não possuem embodiment, experiência vivida ou qualia; emoções servem como proxies úteis para direcionamento comportamental, sem equivaler a afeto humano.

## Referências

1. Park et al. (2023). *Generative Agents: Interactive Simulacra of Human Behavior.* https://arxiv.org/abs/2304.03442
2. Zhang et al. (2025). *Decoding Emotion in the Deep: A Systematic Study of How LLMs Represent, Retain, and Express Emotion.* https://arxiv.org/abs/2510.04064v2
3. Surveys relacionados sobre limitações emocionais de LLMs (ACM/arXiv 2025).
4. Anthropic (2025). *Agentic Misalignment: How LLMs Could Be Insider Threats.* https://www.anthropic.com/research/agentic-misalignment
