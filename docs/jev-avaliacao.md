# Jev (TypeSafe) no PHB v3 — avaliação e MVP

**Estado:** exploração/MVP na branch `claude/ajev-type-safe-synthetic-users-7t60ro`,
19/09/2026. Nada aqui autoriza chamada paga, produção ou envio de dados reais — a
validação ao vivo (seção "Experimento de validação") é um checkpoint humano.

## O que é o Jev

O [Jev](https://openrouter.ai/typesafe) é o primeiro modelo "System One" da TypeSafe AI
(saiu do stealth em 15/09/2026; [beta no OpenRouter](https://x.com/OpenRouter/status/2100744709589316009)
em 18/09). Ele **não gera texto**: recebe um `state` (string, objeto ou lista) mais um
mapa de perguntas tipadas e devolve, em uma única passagem, respostas tipadas com
probabilidades calibradas. Três tipos de pergunta:

| Tipo | Pergunta | Resposta |
|---|---|---|
| `noul` | proposição sim/não (critérios `true`/`false` opcionais) | `noul` = P(sim) ∈ [0, 1] |
| `choice` | uma entre até 255 opções (`criteria`: mapa opção → descrição) | `choice`, `probabilities` por opção, `confidence` |
| `score` | posição numa rubrica ordenada de 2 a 10 níveis (`criteria`: lista) | `score` (média ponderada, pode ser fracionário), `legend`, `probabilities`, `confidence` |

`confidence` é 1 menos a entropia normalizada da distribuição. Preço em 19/09:
US$ 0,042 por milhão de tokens de entrada, saída grátis; contexto de 32 k tokens;
latência reportada de 70 a 500 ms.

### Contrato no OpenRouter (Decisions API, alpha)

```
POST https://openrouter.ai/api/alpha/decisions
Authorization: Bearer $OPENROUTER_API_KEY
Content-Type: application/json

{"model": "typesafe/jev-1.13", "state": ..., "questions": {"<id>": {"type": ..., "instructions": ..., "criteria": ...}}}
```

Resposta: `{"model", "answers": {"<id>": {...}}, "usage": {"input_tokens", "output_tokens", "cost"}, "id", "provider"}`.
O corpo é o mesmo do `/v1/systemone` da TypeSafe; o OpenRouter acrescenta `usage.cost`,
`id` e `provider`. O alias `~typesafe/jev-latest` aponta para a versão mais recente.
SDKs de chat completions **não funcionam** com este endpoint. Fontes consultadas:
[exemplo stdlib da comunidade](https://github.com/vinaychawla-ops/jev-openrouter-example),
[issue pydantic-ai #8552](https://github.com/pydantic/pydantic-ai/issues/8552),
[PR determinate #16](https://github.com/cahaseler/determinate/pull/16). A página de
documentação oficial da TypeSafe não era acessível deste ambiente; o contrato acima
foi cruzado entre três implementações independentes e é o que o stub dos testes emula.

## Onde ele gera valor no pipeline

```
mensagem → ① LLM interpreta em EVENTOS → ② MOTOR calcula → ③ LLM narra
```

A etapa ① é uma **classificação num catálogo fechado** (13 tipos de evento) mais uma
intensidade em 0..1. É literalmente o caso de uso do Jev. Hoje ela é feita por um LLM de
chat que devolve um array JSON, e `app/llm.py` precisa de parse defensivo: tirar cercas
markdown, descartar tipo fora do catálogo, clampar intensidade, cair em `neutro` quando o
JSON quebra. Com o Jev:

1. **Type-safe por construção.** Cada evento do catálogo vira uma pergunta tipada; a
   resposta só pode ser uma probabilidade e uma posição na rubrica. Não existe "tipo
   inventado", "JSON malformado" ou "intensidade 5". O parse defensivo vira uma
   verificação de contrato: ou o formato veio, ou 502.
2. **Rastreabilidade causal — o núcleo do PHB.** A trilha `interpretacao` grava, por
   tipo, `probabilidade` (P(sim)), `intensidade` lida da rubrica, `confianca` e se foi
   emitido. A cadeia auditável passa a ser *mensagem → P(deboche)=0,91 → evento → deltas
   do motor → narrativa*. Um LLM de chat não dá a probabilidade dos eventos que **não**
   emitiu; o Jev dá as 12 de uma vez, o que revela ambiguidade ("lisonja 0,45 / elogio
   0,52") em vez de escondê-la.
3. **Custo e latência da etapa ① caem uma ou duas ordens de grandeza.** Um turno gasta
   ~900 tokens de entrada (≈ US$ 0,00004) e volta em menos de um segundo, contra uma
   chamada de chat com prompt de catálogo e geração. Isso torna barato o que hoje é
   caro: reinterpretar transcrições inteiras dos `testes/`, rodar dezenas de sessões em
   paralelo (densidade e escala), e o **modo manual assistido** — o Jev sugere os eventos
   com probabilidade, a pessoa confere e aplica em `/turno`.
4. **Consistência.** Sem prompt de sistema longo nem geração, a variação entre chamadas
   idênticas tende a ser menor — hipótese a medir (ver experimento).
5. **Isola o narrador.** A escolha do LLM de chat passa a ser só sobre voz e qualidade
   da narrativa; o interpretador deixa de depender de o modelo "obedecer o formato".

### O que o Jev não faz

- **Não narra.** A etapa ③ continua no LLM de chat (`app/llm.py`). Sem narrador
  configurado, `/mensagem` responde 503; só `/interpretar` funciona.
- **Não substitui o motor.** Probabilidade não é estado. O Jev classifica; `engine_v3.step()`
  continua sendo o único lugar onde eixos, OCEAN, goodwill e ruptura mudam (invariante 1).
- **Endpoint alpha.** A comunidade relatou ~15 % de chamadas que penduram até o timeout;
  o módulo faz uma retentativa com backoff curto. O contrato pode mudar.
- **Português não validado.** As instruções e critérios estão em português; a calibração
  do Jev nesse idioma precisa ser medida antes de confiar no limiar default.
- **Contexto de 32 k tokens** e sem histórico: o `state` leva persona, interlocutor e
  a mensagem — o mesmo que o prompt atual, nada do estado interno do motor.

## O MVP nesta branch

| Peça | O que faz |
|---|---|
| `app/jev.py` | Monta 2 perguntas por evento do catálogo (`<tipo>` noul + `intensidade_<tipo>` score de 4 níveis), chama a Decisions API com `urllib`, mapeia `answers` em `eventos` + trilha `interpretacao`. Stdlib, sem pip. |
| `PHB_INTERPRETADOR=jev` | Liga o Jev na etapa ①. Default `llm` — comportamento anterior intacto. |
| `POST /api/sessoes/{id}/interpretar` | Só a etapa ①, sem `step()` e sem persistir: `{quem, texto, eventos, interpretacao}`. Funciona com Jev **ou** LLM (o interpretador ativo) — é a porta da comparação e do modo assistido. |
| `turno.interpretacao` | Trilha gravada no turno de `/mensagem` (com Jev: modelo, limiar, decisões por tipo, uso/custo; com LLM: interpretador e modelo). |
| `GET /api/config` | Ganha `interpretador` (`llm`/`jev`) e `modelo_interpretador`. `llm` continua significando "a conversa funciona" (narrador **e** interpretador configurados). |
| `python3 -m app.jev` | Sonda de exploração: `--perguntas` imprime o payload sem chamar; com texto e chave, faz UMA chamada paga e imprime a leitura. |
| `app/tests/test_jev.py` | 19 testes de integração com servidor real + stub local da Decisions API (`PHB_JEV_URL`): mapeamento, limiar, trilha, `/interpretar`, falhas de contrato → 502, retentativa em timeout, chaves nunca vazam. |

### Mapeamento tipado → catálogo

- **Presença:** `noul ≥ PHB_JEV_LIMIAR` (default 0,5). Nenhum tipo acima do limiar →
  `[{"tipo": "neutro", "intensidade": 0.0}]`, como hoje.
- **Intensidade:** rubrica ordenada `leve, moderada, forte, extrema`; o `score` volta como
  média ponderada (ex.: 1,6) e vira `(score + 1) / 4` ∈ [0,25, 1,0], clampado em 0..1.
  É uma leitura de rubrica, não um cálculo de estado.
- **Ordem:** eventos saem na ordem do catálogo (a ordem faz parte da entrada do motor).
- **Vários eventos por mensagem** saem naturalmente — cada tipo é uma pergunta
  independente, então "afeto + ataque" não exige instrução especial.

Variáveis: `OPENROUTER_API_KEY` (mesma do provedor `openrouter`; com narrador Anthropic,
cada chave vai só para o seu destino), `PHB_JEV_MODEL` (default `typesafe/jev-1.13`),
`PHB_JEV_URL` (default do OpenRouter; stub nos testes), `PHB_JEV_LIMIAR` (0 < x ≤ 1),
`PHB_LLM_TIMEOUT` (compartilhado).

```bash
# Jev interpreta, GLM narra (ambos pelo OpenRouter, uma chave)
PHB_INTERPRETADOR=jev PHB_LLM_PROVIDER=openrouter OPENROUTER_API_KEY=... \
  PHB_MODEL=z-ai/glm-5.3-flash make run

# Jev interpreta, Claude narra (duas chaves, cada uma só no seu destino)
PHB_INTERPRETADOR=jev OPENROUTER_API_KEY=... ANTHROPIC_API_KEY=... make run

# Só olhar o payload, sem chamada
python3 -m app.jev --perguntas --quem dan "vc é ridícula com esse papo de quiet luxury"
```

## Experimento de validação (próximo passo, exige autorização de custo)

Antes de trocar o default, medir com o corpus que já existe:

1. **Concordância Jev × LLM.** Passar as mensagens das sessões dos testes 003 e 005 por
   `/interpretar` nos dois modos e comparar tipo emitido, intensidade e eventos
   múltiplos. Métrica: concordância por tipo e distribuição das discordâncias.
2. **Calibração em português.** Para 30–50 mensagens rotuladas à mão (o protocolo de
   `testes/templates/`), checar se P(sim) é calibrada (bins de probabilidade × frequência
   observada) e escolher `PHB_JEV_LIMIAR` por curva; medir se `confidence` baixa coincide
   com ambiguidade real.
3. **Estabilidade.** Repetir a mesma mensagem N vezes e medir variância de `noul` e
   `score` (hipótese: menor que a do LLM com o mesmo prompt).
4. **Custo e latência reais** a partir de `interpretacao.uso` gravado nos turnos.

Custo estimado: ~US$ 0,00004 por mensagem no Jev — o narrador domina a conta.

## Além do MVP (ideias, não compromisso)

- **Observador cego barato.** O teste 005 validou o motor com um observador humano
  cego. Com `score`, o Jev pode ler cada narrativa ("quão fria soa esta resposta?")
  e a série pode ser correlacionada com o snapshot — validação de fidelidade narrativa
  em escala, sem tocar o motor.
- **Guardrail de narrativa.** `noul` "a resposta cita números ou nomes de eixo?" antes
  de persistir, para pegar vazamento de termos técnicos do narrador.
- **Modo manual assistido na UI** (`apps/frontend/`): botão "sugerir eventos" chamando
  `/interpretar` e preenchendo o formulário do modo manual — a pessoa decide, o motor
  calcula.
- **Roteamento de custo:** com `confidence` baixa, escalar a interpretação para o LLM
  de chat; com alta, ficar no Jev.

Fontes: [TypeSafe — Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev),
[OpenRouter — Jev 1.13](https://openrouter.ai/typesafe/jev-1.13),
[DataCamp — Jev](https://www.datacamp.com/blog/system-one-models-jev),
[The Register — TypeSafe AI debuts model for machines](https://www.theregister.com/ai-and-ml/2026/09/16/typesafe-ai-debuts-model-for-machines-that-plays-doom/5296711).
