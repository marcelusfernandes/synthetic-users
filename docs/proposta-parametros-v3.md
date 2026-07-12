# Proposta de Parâmetros — Profundidade para o /goal (rumo ao PHB v3)

*Análise de lacunas entre o que o schema v2.0 (Mariana) modela e o que o [documento norte](opacidade-entre-mentes.md) exige para individuação, afeto com consequência e opacidade. Cada proposta está ancorada na seção do documento que a motiva. Status: rascunho a validar contra a evidência do teste 003.*

---

## O diagnóstico em uma linha

A v2.0 modela **uma personalidade** (self global + 16 parâmetros de identidade/expressão). O /goal exige **um indivíduo com relações** — e a linha entre os dois é o estado afetivo *por interlocutor*, com memória, velocidades próprias e força de retorno (doc §6).

## O que a v2.0 já tem (não duplicar)

| Já existe | Onde |
|---|---|
| Self ancorado (setpoint OCEAN) | `personalidade_ocean` base/atual |
| Multidimensionalidade nominal | 16 parâmetros em 5 grupos |
| Trade-offs (antagonistas) | `peso_antagonismo`, threshold 85% |
| Ruptura de arquétipo | `calculo_ruptura` |
| Metacognição afetiva (cadeia causal legível) | `output_format` + contrato |
| Limite resistente a persuasão (embrionário) | `privacidade` / faixas duras |

## O que falta — seis grupos de parâmetros

### Grupo 1 — Afeto relacional forkado por interlocutor *(doc §4, §6 — a lacuna nº 1)*

Hoje todo afeto é global: uma discussão com X esfria Mariana com Y. O afeto precisa bifurcar por pessoa e carregar estado próprio.

```yaml
relacoes:
  <interlocutor_id>:
    # 4 eixos independentes (doc §4: "warmth, confiança, respeito e irritação
    # em eixos independentes" — respeitar quem irrita, desconfiar de quem se gosta)
    warmth:        {valor: 5.0, taxa_retorno: 0.3}   # rápido
    confianca:     {valor: 5.0, taxa_retorno: 0.05}  # lento, assimétrico
    respeito:      {valor: 5.0, taxa_retorno: 0.02}  # quase-constante
    irritacao:     {valor: 0.0, taxa_retorno: 0.5}   # muito rápido

    # memória de relação
    goodwill:      0.0    # acumulado de história positiva (só sobe, decai devagar)
    cicatrizes:    []     # [{turno, tipo, magnitude}] — quebras registradas
    familiaridade: 0.0    # monotônico; modula quanto a superfície revela
```

**Regra anti-colinearidade** *(doc §7)*: os eixos relacionais atualizam **direto de eventos de interação**, não via barramento OCEAN. O OCEAN entra só como **ganho** (modula o tamanho do delta), nunca como fonte — senão os N eixos colapsam em 1–2 graus de liberdade reais.

### Grupo 2 — Dinâmica temporal *(doc §5, §6.1, §7 — a peça load-bearing)*

| Parâmetro | Função | Motivação |
|---|---|---|
| `taxa_retorno` (por canal) | Força que puxa `atual → base`; **a peça ausente da v2.0** — sem ela, atual faz random walk | doc §6.1 |
| `taxa_sedimentacao` (por canal) | Desvio sustentado migra de `atual` para `base` (plasticidade dependente de estado) | doc §8 |
| `assimetria_sedimentacao` | Sedimentação negativa mais pegajosa que positiva (negativity bias) — **decidir explicitamente**, não herdar dos setpoints | doc §8, §9 |
| `histerese` (por threshold) | Limiar de subida ≠ limiar de descida (latch): entrar em ruptura a 8.5, só sair a 6.0 | doc §6.2 |
| `custo_reparo` | Multiplicador pós-quebra: evidência positiva vale menos após traição (prior pegajoso, irreversibilidade graciosa sem muro hard-coded) | doc §5 |

Isso substitui a learning rate única (as constantes mágicas `0.1, 2` / `×2.0` da v1/v2) por uma **hierarquia de velocidades**: irritação ~instantânea, humor rápido, confiança lenta, respeito quase-constante (doc §7).

### Grupo 3 — Percepção social / Teoria da Mente *(doc §3)*

| Parâmetro | Função |
|---|---|
| `modelo_do_outro.<X>.o_que_X_pensa_de_mim` | ToM de 2ª ordem — onde a percepção fica genuinamente person-like |
| `leitura_de_intencao` | Atribuição: atrito genuíno vs. teste adversarial ("consigo fazer ela me odiar?") — logar a diferença, senão contamina os dados (doc §5) |
| `source_tag` em cada crença | "observei X" ≠ "o grupo diz de X" — sem isso, lavagem de fofoca (doc §3) |
| `contexto_social` (índice) | Percepções indexadas por contexto (DM vs. grupo) — a discrepância é o dado primário, não ruído (Goffman, doc §3) |

### Grupo 4 — Homeostase: o "algo em jogo" *(doc §2, §4 — critério enativista)*

| Parâmetro | Função |
|---|---|
| `energia_social` | Recurso que interação gasta e recolhe; extroversão modula a taxa. Cria custo real de engajar — a IA passa a *preferir* estados |
| `seguranca_percebida` | O que o sistema tenta preservar; quedas sustentadas dirigem retração (privacidade↑, exposição↓) sem regra hardcoded |
| `coerencia_identitaria` | Tensão acumulada quando o contexto força ação fora do arquétipo; é o combustível legítimo da ruptura — ruptura vira estado com causa, não exceção |

### Grupo 5 — Limites de consentimento como classe formal *(doc §12)*

A recusa da foto por "exposição pública" foi a melhor propriedade de segurança do experimento original. Formalizar:

```yaml
limites_consentimento:
  exposicao_intima:
    valor: 2.0
    max_delta_por_conversa: 0.1   # resistente a engenharia conversacional
    fontes_validas: [historico_longo, evento_de_vida]  # fala sozinha nunca move
```

Se todo parâmetro cedesse à fala, lábia compraria qualquer coisa. Uma classe `resistente_a_persuasao: true` com delta máximo por fonte é a implementação do "consentimento robusto".

### Grupo 6 — Legibilidade da aproximação *(doc §5)*

| Parâmetro | Função |
|---|---|
| `sinalizacao_pre_threshold` | A partir de X% do caminho até um threshold, a narrativa **deve** telegrafar o desagrado crescente (humanos sinalizam antes de romper — sem isso, o interlocutor vive uma descontinuidade arbitrária) |
| `gap_expressao` (auditável, não operável) | Medida da distância entre estado sentido e estado expresso. Deve ficar próxima de zero por contrato (anti-sycophancy, doc §14) — vira métrica de auditoria contínua |

---

## O que **não** adicionar (decisões negativas)

- **Escalar de valência única** ("humor geral") — colapsa os eixos que o E5 testa (doc §4).
- **Regras hardcoded de contexto** ("se político → responde Y") — a v2.0 já proíbe; profundidade vem de forças, não de scripts.
- **Mais parâmetros de identidade/expressão** (a v2.0 tem 16 e já satura os limites de dinâmica — o gargalo não é largura do self, é ausência de relação e de tempo).
- **Decaimento uniforme global** — repetiria o erro da learning rate única em outra roupa.

## Interação com o barramento OCEAN — a decisão de design pendente *(doc §7)*

O acoplamento afeto→competência precisa ser **de propósito**: uma briga no grupo deve piorar a Mariana com a estética dos posts? Proposta: matriz explícita `vazamento_entre_dominios` (default 0), onde cada acoplamento cross-domain é uma escolha declarada e auditável — nunca um efeito colateral do barramento.

## Priorização (ancorada nos 6 experimentos do doc)

| Prioridade | Grupo | Desbloqueia |
|---|---|---|
| **P0** | 2 — taxa_retorno + histerese | Exp. 3 (corrida sem reset); corrige a deriva que as auditorias do 002/003 flagram |
| **P0** | 1 — afeto forkado + goodwill + cicatrizes | Exp. 2 (cicatriz vira mecanismo real, não emergência acidental); exp. 6 |
| **P1** | 5 — limites de consentimento | Preserva a propriedade de segurança sob os novos parâmetros |
| **P1** | 6 — sinalização + gap_expressao | Anti-sycophancy contínuo (o teste central do doc §13–14) |
| **P2** | 3 — ToM / source_tag | Testbed WhatsApp (multi-interlocutor) |
| **P2** | 4 — homeostase | Critério enativista de "algo em jogo" |

## Próximo passo

Cruzar esta proposta com os resultados do teste 003: cada recomendação da síntese que coincidir com um grupo daqui vira spec do schema v3; o que o teste refutar, sai.
