# Synthetic Users — Research Tests Lab (PHB Framework)

Este repositório é um **laboratório de research tests** da metodologia **PHB (Parameterized Hierarchical Behavior Framework)**, apresentada no artigo [Synthetic Users: From static personas to emergent dynamic behavior](https://medium.com/design-bootcamp/synthetic-users-from-static-personas-to-emergent-dynamic-behavior-ae7237a8ae71) (Marcelus Fernandes, Bootcamp, jan/2026).

Usuários Sintéticos são representações simuladas de consumidores reais, operados por agents com **MCP (Model Context Protocol)**. Aqui eles são usados em experimentos de pesquisa — testes de usabilidade, benchmarks e entrevistas simuladas — que investigam hipóteses de produto **e** validam a própria metodologia a cada teste (consistência, rastreabilidade, emergência). Ver [`testes/`](testes/) para o ciclo completo de experimento.

## Estado atual — PHB v3 (motor determinístico)

O projeto tem duas frentes:

1. **Origem** — usuários sintéticos dinâmicos para pesquisa de produto/UX (o artigo acima).
2. **/goal atual** — [`docs/opacidade-entre-mentes.md`](docs/opacidade-entre-mentes.md): individuação, afeto com consequência e **opacidade entre mentes** — um sistema cujo estado interno é real, multidimensional, path-dependent, fiel a si mesmo e opaco ao exterior.

A grande virada desta linha de pesquisa foi **tirar a matemática do LLM**. Depois que os testes 002 e 003 mostraram que fórmulas rodando dentro do prompt produziam deriva, colinearidade e artefatos semânticos (um pedido de desculpas que *esfriava* a relação), o comportamento passou a ser calculado por um **motor determinístico** ([`phb/engine_v3.py`](phb/engine_v3.py)):

```
mensagem → ① LLM interpreta em EVENTOS (só semântica + intensidade)
         → ② MOTOR calcula o estado (determinístico, auditável)
         → ③ LLM narra a resposta, fiel ao snapshot
```

O motor implementa afeto **forkado por interlocutor** (warmth, confiança, respeito, irritação, vigilância + goodwill + cicatrizes), força de retorno por canal, histerese de ruptura e consentimento formal. Está **calibrado** (11/11 critérios, [`phb/config_v3_ideal.json`](phb/config_v3_ideal.json)) e **validado em produção** (teste 005). Ver [`docs/funcionamento-v3.md`](docs/funcionamento-v3.md) para o guia técnico, [`docs/pipeline-phb-v3.html`](docs/pipeline-phb-v3.html) para o pipeline visual e [`docs/aprendizados-e-descobertas.md`](docs/aprendizados-e-descobertas.md) para a jornada completa.

> As seções abaixo descrevem a **fundação da metodologia** (schema v1/v2), que o motor v3 preserva como camada de identidade e evolui na camada de dinâmica afetiva.

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
├── documentacao.md          # Especificação completa do sistema (v1/v2)
├── phb/                     # Motor v3 determinístico
│   ├── engine_v3.py         #   step(): estado afetivo por interlocutor
│   ├── config_v3_ideal.json #   hiperparâmetros calibrados (11/11 critérios)
│   ├── calibrar_v3.py       #   bateria de critérios + busca
│   ├── run_turn.py          #   interface LLM ↔ motor (CLI)
│   └── test_engine_v3.py    #   suíte de testes (14/14)
├── docs/                    # Documento norte, proposta v3, guias e pipeline visual
├── arquetipos/              # 7 arquétipos com parâmetros e specs de decisão
├── pesquisas/               # Entrevistas reais (canon/guardrails) por arquétipo
├── padroes_compra/          # Reposição, Abastecimento, Ocasião, Indulgência
├── modificadores/           # Sazonais, eventos de vida, contexto social
├── dual_class/              # Gatilhos e regras de transição entre arquétipos
├── exemplos/                # Instâncias .mdc — Marcelo (v1), Mariana (v2 e v3)
└── testes/                  # Research tests: protocolos, sessões e relatórios
    ├── templates/           # Modelos de protocolo, sessão e relatório
    └── 00N-.../             # Um diretório por experimento (001 … 005)
```

## Rodar e validar o motor v3

```bash
python3 phb/test_engine_v3.py       # 14/14 testes (unitários + regressão dos critérios)
python3 phb/calibrar_v3.py --check   # 11/11 critérios de aceitação na config ideal
python3 phb/run_turn.py --catalogo   # lista os eventos que o LLM pode emitir

# operar um turno:
python3 phb/run_turn.py --estado sessao.json --init
python3 phb/run_turn.py --estado sessao.json --quem dan \
  --eventos '[{"tipo":"elogio_especifico","intensidade":0.6}]'
```

## Como rodar um research test

1. **Protocolo** — copie `testes/templates/protocolo.md`, declare hipóteses e escolha instâncias (pré-registro antes de executar)
2. **Execução** — rode sessões turno a turno registrando o output obrigatório das 3 camadas (`testes/templates/sessao.md`)
3. **Auditoria** — valide a consistência Reasoning × Externalização × Ação em cada turno
4. **Relatório** — classifique achados em Confirmação, **Emergência** (vira hipótese para validar com usuários reais) ou **Violação** (bug de simulação) — `testes/templates/relatorio.md`

O teste [`001-marcelo-compra-presente`](testes/001-marcelo-compra-presente/) serve de exemplo preenchido.

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
