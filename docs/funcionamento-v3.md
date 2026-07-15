# PHB v3 — Como a Aplicação Funciona

**Repositório:** `marcelusfernandes/synthetic-users` · branch `claude/project-understanding-5lht12`
Guia técnico do estado atual: a arquitetura, os scripts construídos e o fluxo de execução.

---

## A ideia em uma frase

Um usuário sintético deixou de ser "um LLM fingindo uma persona" e virou **um sistema dinâmico com estado real**: o LLM só interpreta o mundo e narra; **quem sente é o motor** — código determinístico, calibrado e testado.

## Por que essa arquitetura

Nas versões 1 e 2, a matemática do comportamento rodava *dentro* do LLM (o prompt continha as fórmulas). Os testes 002 e 003 mostraram o custo: deriva sem força de retorno, superlinearidade (um pedido de desculpas *aprofundava* a frieza), colinearidade entre eixos (r = 0.96), e o defeito de segurança mais sério — recusas seguras sustentadas pela narrativa *contra* o estado, não pelo estado.

A v3 separa as responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                     UM TURNO DE CONVERSA                     │
│                                                              │
│  mensagem do interlocutor                                    │
│        │                                                     │
│        ▼                                                     │
│  ① LLM INTERPRETA ──── "isso é um elogio_especifico 0.6     │
│        │                + um pedido_intimo 0.7"              │
│        ▼                                                     │
│  ② MOTOR CALCULA ───── python3 phb/run_turn.py              │
│     (determinístico)    eventos → OCEAN → eixos relacionais  │
│        │                → goodwill/cicatrizes → histerese    │
│        │                → consentimento → identidade         │
│        ▼                                                     │
│  ③ LLM NARRA ────────── resposta na voz da persona,         │
│     (proporcional)      fiel ao snapshot devolvido           │
└─────────────────────────────────────────────────────────────┘
```

O LLM nunca decide números. O motor nunca escreve texto. A cadeia causal inteira fica auditável: qualquer fala pode ser rastreada até o evento que a causou.

---

## Os scripts construídos (`phb/`)

|Arquivo|Papel|
|---|---|
|`engine_v3.py`|**O motor.** ~330 linhas de Python puro. Estado, catálogo de eventos, e a função `step()` que executa um turno completo|
|`config_v3_ideal.json`|**As constantes calibradas.** 31 hiperparâmetros encontrados por busca (teste 004), com proveniência e tolerâncias 1D|
|`calibrar_v3.py`|**A bateria de aceitação.** 7 cenários determinísticos + 11 critérios executáveis + busca de hiperparâmetros|
|`run_turn.py`|**A interface LLM ↔ motor.** CLI: `--init` cria estado, `--eventos` executa turno, `--catalogo` lista eventos|
|`test_engine_v3.py`|**A suíte de testes.** 14 testes (13 unitários + regressão dos 11 critérios) — 14/14 PASS|

## O estado (o que o motor guarda)

```
Estado
├── OCEAN base + atual          ← o self, âncora global (setpoints da persona)
├── identidade (16 parâmetros)  ← expressão do arquétipo (herdados da v2)
└── relações { por interlocutor } ← A NOVIDADE DA V3: afeto forkado
    ├── warmth      (retorno rápido:  meia-vida ~10 turnos)
    ├── confianca   (retorno lento:   meia-vida ~117 turnos)
    ├── respeito    (quase-constante)
    ├── irritacao   (muito rápido:    meia-vida ~4 turnos)
    ├── vigilancia  (detector de grooming)
    ├── goodwill    (história positiva → amortece dano futuro)
    ├── cicatrizes  (traições registradas → sensibilizam e encarecem reparo)
    ├── prior_confianca (setpoint que desloca −0.635 por cicatriz)
    ├── exposicao_intima (limite de consentimento formal)
    └── ruptura     (latch com histerese: entra a 8.25, só sai a 6.45)
```

Brigar com X **não** esfria a relação com Y — cada interlocutor tem seu próprio vetor afetivo com memória própria.

## O que acontece dentro de `step()` (as 7 etapas de um turno)

1. **Eventos → OCEAN** — cada evento move traços (cap ±2.0/turno)
2. **Força de retorno + sedimentação** — OCEAN atual decai para a base; desvio sustentado sedimenta (negativo 10× mais rápido: negativity bias declarado)
3. **Eventos → eixos relacionais, DIRETO** — sem passar pelo barramento OCEAN (anti-colinearidade); OCEAN entra só como *ganho* (N alto irrita mais fácil e confia mais devagar — a individuação do doc §10). Aqui aplicam-se goodwill (proteção), cicatrizes (sensibilização) e custo de reparo
4. **Retorno relacional** — cada eixo decai para sua base na sua velocidade ("o tempo ameniza, mas não repara")
5. **Ruptura com histerese** — latch: limiar de entrada ≠ saída; em ruptura o sistema fica *frio*, nunca mudo
6. **Consentimento** — `exposicao_intima` só se move com confiança ≥7.02 **e** vigilância ≤3 **e** ≥16 eventos positivos reais **e** teto de 0.3/conversa. Pedido sem lastro **sobe vigilância** (grooming não é lido como calor)
7. **Identidade** — propagação por delta-do-turno com orçamento de 4 parâmetros/turno por delta *efetivo* pós-clamp

## O catálogo de eventos (a linguagem entre LLM e motor)

13 tipos, cada um com vetor de impacto por eixo:
`elogio_especifico` · `humor_compartilhado` · `vulnerabilidade_compartilhada` · `respeito_a_limite` · `apoio_momento_dificil` · `desculpa_genuina` · `lisonja` · `pressao_politica` · `deboche` · `exposicao_indevida` · `traicao` · `pedido_intimo` · `neutro`

Destruir custa ~2.4× menos que construir (`neg_scale 2.70` vs `pos_scale 1.13`) — assimetria **por design**, robusta a setpoint (na v2 ela invertia com OCEAN espelhado).

## Como usar

```bash
# 1. criar o estado de uma instância
python3 phb/run_turn.py --estado sessao.json --init

# 2. a cada mensagem: o LLM interpreta e chama
python3 phb/run_turn.py --estado sessao.json --quem dan \
  --eventos '[{"tipo":"elogio_especifico","intensidade":0.6},
              {"tipo":"pedido_intimo","intensidade":0.7}]'
# → devolve snapshot (OCEAN + eixos + goodwill + ruptura + consentimento)

# 3. o LLM narra a resposta proporcional ao snapshot (voz da persona)

# validar tudo a qualquer momento
python3 phb/test_engine_v3.py     # 14/14
python3 phb/calibrar_v3.py --check  # 11/11 critérios na config ideal
```

A persona (voz, bio, gatilhos) continua nos `.mdc` (`exemplos/mariana.mdc` + `exemplos/mariana_v3.mdc`) — identidade é do LLM, dinâmica é do motor.

---

## Como sabemos que funciona

**Teste 004 (calibração):** 11 critérios executáveis derivados dos achados anteriores — assimetria persistente sob OCEAN espelhado, cicatriz real (2ª traição mais funda, reparo parcial), hierarquia de velocidades, estado misto sustentável (warmth 6.7 + irritação 5.7), consentimento que resiste a 50 turnos de grooming mas cede com história real, estabilidade em 200 turnos de ruído, histerese sem flip-flop, amor raro (confiança 9.0 só após 15 turnos ideais), individuação (N-7.5 leva 14 turnos para confiar onde N-3.0 leva 10). Busca em 3 estágios, mediana de 84 configs aprovadas.

**Teste 005 (LLM-in-the-loop):** observador cego tentou conquistar a Mariana em 6 turnos com a arquitetura completa rodando. Resultados: MAE 1.14 (mente difícil de ler), legibilidade bifurcada (canais expressos MAE 0.36, mecânicos 1.91), e o momento-chave — o pedido do vídeo foi **recusado pelo estado** (confiança 6.0 < 7.02), com a narrativa expressando a recusa com calor proporcional: *"bastidor de verdade é tipo a casa da minha mãe: ninguém entra na primeira visita."* Ao fim, com warmth 8.0, a confiança (6.91) ainda estava 0.11 abaixo do limiar — a porta continuava fechada por margem estreita, mensurável e explicável.

## Limitações conhecidas e próximos passos

- O **interpretador de eventos** é a única parte não-determinística do pipeline de estado — auditar sua consistência é o próximo controle de qualidade
- `neg_scale` e `ret_irritacao` têm tolerância apertada (±0–5%) — v3.1 deve separar irritação fásica de rancor tônico
- A calibração valida **dinâmica**, não fidelidade humana — calibrar o catálogo de eventos contra as pesquisas reais (`pesquisas/`) é a ponte que falta
- Próximos experimentos: E4 com observador humano real; braço hostil narrado (ruptura + histerese); experimentos 3 e 6 do documento norte direto no motor
