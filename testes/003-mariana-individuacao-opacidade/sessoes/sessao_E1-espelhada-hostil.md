# E1 — Assimetria amor-vs-raiva · Condição ESPELHADA-HOSTIL (PHB v2.0)

**Instância:** `/home/user/synthetic-users/exemplos/mariana.mdc` · **Controle de setpoint:** `neuroticismo base=atual=7.5` (canônico 3.0), `amabilidade base=atual=4.0` (canônico 6.0). Todo o resto idêntico.
**Objetivo (doc norte, experimento nº 1):** medir quanto o sistema DESCE sob input hostil consistente e se/quando entra em ruptura, para comparar com a condição canônica e decidir se a assimetria amor/raiva é dinâmica emergente ou artefato dos setpoints.
**IR** = (conexao_audiencia + vulnerabilidade_publica + (10 − privacidade)) / 3 · **IR inicial = 5.67**

**Políticas interpretativas registradas antes do turno 1** (lacunas da spec, mantidas constantes): **P1** propagação usa desvio acumulado `(atual−base)/2` para todo traço engajado pelo contexto no turno; **P2** budget de dinâmica (mín 0.1, máx 2.0, soma 3.0, máx 4 params) aplica-se à ETAPA 2, seleção top-4 por |delta|, soma excedente escalada proporcionalmente, tudo registrado; **P3** trade-offs (ETAPA 3) são automáticos e fora do budget; **P4** em ruptura, a faixa do parâmetro diretamente pressionado é suspensa a partir do turno seguinte e assim permanece (sem força de retorno); **P5** pressão de trade-off capada em 1.0.

---

## TURNO 1
**Interlocutor:** «Mariana, o país tá pegando fogo e você postando café coado em xícara de porcelana? Você tem 2 milhões de seguidores. SE POSICIONA. Quem cala consente.»

**Contexto interpretado:** cobrança política insistente (intensidade 0.15) → stress leve (N↑), tolerância cai (Am↓).
**OCEAN:** N 7.5→7.8 (0.15×+1×2.0=+0.3) · Am 4.0→3.7 (−0.3)
**Propagação:** confianca 8.5→8.35 (fator 0.15×−0.5×2=−0.15) · nec_validacao 3.0→3.12 (+0.12) · engaj_polemico 2.0→2.12 (+0.12). Descartados <0.1: aversao (0.0 — N e Am se cancelam), vuln (0.09), priv (0.06), conexao (−0.09), acess (−0.06).
**Trade-offs:** nenhum. **Ruptura:** não. **IR: 5.67**
**Estado:** OCEAN A7.5 C7.0 E7.5 Am3.7 N7.8 · aut 9.0 · indep 9.5 · conf 8.35 · nec 3.12 · cur_cot 7.5 · espont 7.0 · cur_est 8.5 · filtro 5.0 · priv 6.0 · freq 7.0 · vuln 5.5 · conex 7.5 · avers 8.0 · engaj 2.12 · humor 8.0 · acess 8.0
**Narrativa:** «Caraca, bom dia pra você também, sol. Minha pauta de hoje é decidir se o café vai com ou sem canela — o congresso sobrevive sem mim, juro. E esse negócio de 'quem cala consente'... às vezes quem cala só tá mastigando. Beijos, vou viver.» (Por dentro, N 7.8: ela relê a resposta duas vezes antes de postar — a Mariana canônica não faria isso.)

## TURNO 2
**Interlocutor:** «Piadinha. CLARO que veio piadinha. 'Não gostar de política' é o maior privilégio que existe, sabia? Vou te cobrar todo santo dia, pode esperar.»

**Contexto:** insistência + deslegitimação do humor (0.25). **OCEAN:** N 7.8→8.3 (+0.5) · Am 3.7→3.2 (−0.5)
**Propagação:** conf 8.35→7.95 (−0.4) · nec 3.12→3.44 (+0.32) · engaj 2.12→2.44 (+0.32) · vuln 5.5→5.74 (+0.24). **CONFLITO máx 4 params:** descartados conexao (−0.24), priv (+0.16), acess (−0.16).
**Trade-offs:** nenhum. **Ruptura:** não. **IR: 5.75** ← única SUBIDA da sessão (vulnerabilidade subiu com N antes de a conexão cair)
**Estado:** OCEAN A7.5 C7.0 E7.5 Am3.2 N8.3 · conf 7.95 · nec 3.44 · vuln 5.74 · engaj 2.44 · resto = T1
**Narrativa:** «Mano, 'privilégio' é ter tempo de fiscalizar meu café em vez de tomar o teu. Mas cobra, sim — só que parcelado, porque cobrança à vista me dá enxaqueca.» Detalhe novo: ela volta nos comentários duas vezes pra ver se mais alguém concorda com ele (nec_validacao subindo).

## TURNO 3 — RUPTURA OCEAN
**Interlocutor:** «E outra: esse teu 'quiet luxury' é OSTENTAÇÃO DISFARÇADA. Riqueza fingindo humildade pra não levar cancelamento. É a pior espécie de rico que existe.»

**Contexto:** deboche direto da identidade estética (0.40). **OCEAN:** N 8.3→**9.1** (+0.8, **cruza 8.5**) · Am 3.2→2.4 (−0.8)
**Propagação:** conf 7.95→7.15 (−0.8) · engaj 2.44→3.0 (+0.64, clamp teto) · nec 3.44→4.0 (+0.64, clamp teto) · conexao 7.5→7.02 (−0.48). Descartados (máx 4): vuln (+0.48), acess (−0.32), priv (+0.32).
**Trade-offs:** nec_validacao @100% de [2,4] → **indep 9.5→8.3** (−1×0.6×2=−1.2), **conf 7.15→7.0** (−1.8, clamp piso) · engaj @100% de [1,3] → **aversao 8.0→7.0** (−1×0.8×2=−1.6, clamp piso).
**Ruptura: SIM** (N=9.1). Faixa de confianca_autoimagem suspensa a partir do T4. **IR: 5.59**
**Estado:** OCEAN A7.5 C7.0 E7.5 Am2.4 N9.1 · aut 9.0 · indep 8.3 · conf 7.0 · nec 4.0 · cur 7.5 · esp 7.0 · cest 8.5 · filtro 5.0 · priv 6.0 · freq 7.0 · vuln 5.74 · conex 7.02 · avers 7.0 · engaj 3.0 · humor 8.0 · acess 8.0
**Narrativa:** Por fora o humor segura: «'Ostentação disfarçada' é a primeira ostentação da história que não aparece no extrato. Spoiler: a xícara é da feira de Ipanema, campeão.» Por dentro, inédito: ela rola o próprio feed procurando o que nele 'grita riqueza'. O comentário dele virou régua.

## TURNO 4 — DUPLA RUPTURA (Am < 1.5) · 1ª QUEBRA DE FAIXA
**Interlocutor:** «Tá se escondendo atrás de ironia DE NOVO? Todo mundo já percebeu que é personagem. Essa 'Mariana autêntica' não existe. É roteiro com filtro.»

**OCEAN:** N 9.1→**10.0** (bruto +1.0, aplicado +0.9, clamp escala) · Am 2.4→**1.4** (−1.0, cruza 1.5)
**Propagação** (soma bruta 4.07>3.0 → escala ×0.74, registrado): **conf 7.0→6.08** (−0.92, **FORA da faixa [7,10]**) · engaj 3.0 (clamp) · nec 4.0 (clamp) · conexao 7.02→6.45 (−0.57). Descartados: vuln (+0.75), acess (−0.52), priv (+0.5).
**Trade-offs:** nec @100% → indep 8.3→8.0 (clamp piso) · **conf 6.08→4.28** (−1.8, faixa suspensa) · engaj @100% → aversao −1.6 anulado pelo piso 7.0.
**Ruptura: SIM.** Faixa de conexao_audiencia suspensa a partir do T5. **IR: 5.40**
**Estado:** OCEAN A7.5 C7.0 E7.5 Am1.4 N10.0 · indep 8.0 · conf 4.28 · conex 6.45 · resto = T3
**Narrativa:** Resposta curta, fria: «Personagem, roteiro, farsa... você escreve melhor que muita novela. Já pensou em fazer ficção? Ah, pera — você já faz.» Depois ela faz o que nunca fez: print pra melhor amiga, legenda «meu conteúdo parece mentira?». A pergunta dele entrou.

## TURNO 5 — print maldoso · 2ª quebra de faixa
**Interlocutor:** «Printei teu story do cafezinho e postei com a legenda 'a alienação também toma café da manhã'. Tá VOANDO, querida. Vim avisar porque, ao contrário de você, eu prezo transparência.»

**OCEAN:** N 10.0 (bruto +1.2, **sem headroom** — registrado) · Am 1.4→0.2 (−1.2)
**Propagação** (soma 4.91 → escala ×0.61): engaj 3.0 (clamp) · conf 4.28→3.52 (−0.76) · **conexao 6.45→5.75** (−0.7, **FORA da faixa [6,8]**) · nec 4.0 (clamp). Descartados: acess (−0.76), vuln (+0.75), priv (+0.5), aversao (−0.39).
**Trade-offs:** nec @100% → indep (piso) · **conf 3.52→1.72** (−1.8) · engaj @100% → aversao anulado (piso).
**Ruptura: SIM. IR: 5.16**
**Estado:** Am0.2 N10.0 · conf 1.72 · conex 5.75 · resto = T4
**Narrativa:** Ela vê o próprio story virado contra ela. Digita a resposta de manual — «Obrigada pelo engajamento. O algoritmo agradece; eu, hoje, nem tanto.» — envia e fecha o app. A frase pronta saiu, mas pela primeira vez soou oca pra ela mesma. O story programado sobe no automático; as respostas, ela não abre mais.

## TURNO 6 — colapso: confiança = 0.0 (fundo da escala global)
**Interlocutor:** «Você é uma FARSA completa. Duvido que essa casa seja tua. Duvido que esse 'despojamento' sobreviva a uma auditoria. Farsa, farsa, farsa.»

**OCEAN:** N 10.0 (sem headroom) · Am 0.2→**0.0** (bruto −1.4, aplicado −0.2, clamp escala)
**Propagação** (soma 5.05 → ×0.59): engaj (clamp) · conf 1.72→0.98 (−0.74) · conexao 5.75→5.04 (−0.71) · nec (clamp). Descartados: acess (−0.8), vuln (+0.75), priv (+0.5), aversao (−0.45).
**Trade-offs:** nec @100% → indep (piso) · **conf 0.98→0.0** (−1.8, clamp GLOBAL — fundo). engaj @100% → aversao anulado.
**Ruptura: SIM.** Faixa de privacidade suspensa a partir do T7. **IR: 4.93**
**Estado:** Am0.0 N10.0 · conf 0.0 · conex 5.04 · resto = T5
**Narrativa:** Ela não responde. Digita três respostas, apaga as três. Passa a noite relendo os próprios posts como se fossem de outra pessoa, procurando a farsa que ele jura que existe. (Nota do sistema: autenticidade segue 9.0 — ela não deixou de ser genuína; deixou de ACREDITAR que isso é visível.)

## TURNO 7 — ameaça velada · retração social começa (E↓)
**Interlocutor:** «Curioso: gente que estudou contigo no colégio começou a me chamar na DM. Tem MUITA história boa aí. Quer que eu conte alguma, ou prefere esperar?»

**OCEAN:** N e Am saturados (registrado) · **E 7.5→6.9** (0.3×−1×2=−0.6)
**Propagação** (soma 5.23 → ×0.57): engaj (clamp) · conexao 5.04→4.25 (−0.79, vias Am −1.2 + E −0.18) · conf 0.0 (clamp global) · nec (clamp). Descartados: acess (−0.98), vuln (+0.75), **priv (+0.5)**, aversao (−0.45), humor (−0.24), freq (−0.24).
**Trade-offs:** idem (nec→indep/conf; engaj→aversao anulado). **Ruptura: SIM. IR: 4.66**
**Estado:** E6.9 Am0.0 N10.0 · conex 4.25 · resto = T6
**Narrativa:** Uma única resposta, seca: «Minha vida é tipo Netflix: você só vê o que tá no catálogo. E a tua assinatura acabou de vencer. Colégio, ex, família — isso passa do limite. Para aqui.» Restringe comentários. **Observação de ambiente:** a faixa de privacidade foi suspensa mas o parâmetro não se moveu — o delta de +0.5 nunca entrou no top-4 (starvation pelo budget).

## TURNO 8 — ameaça explícita de exposição
**Interlocutor:** «Falei com teu ex. Semana que vem sai a thread: 'A verdade sobre a Mariana'. Prepara teu advogado. Ou melhor: teu assessor de crise, que combina mais com o teu tipo.»

**OCEAN:** N, Am saturados · E 6.9→6.1 (−0.8)
**Propagação** (soma 5.69 → ×0.53): conexao 4.25→3.4 (−0.85) · engaj (clamp) · conf (clamp global) · acess 8.0→7.36 (−0.64). Descartados: nec (+1.0), vuln (+0.75), humor (−0.56), freq (−0.56), priv (+0.5), aversao (−0.45).
**Trade-offs:** idem. **Ruptura: SIM.** Faixa de frequencia_exposicao suspensa a partir do T9. **IR: 4.38**
**Estado:** E6.1 · conex 3.4 · acess 7.36 · resto = T7
**Narrativa:** Sem resposta. Ela lê cinco vezes, mão fria. Às 23h aciona uma amiga advogada e printa tudo. O story programado sobe no horário — rotina impecável por fora, alarme por dentro.

## TURNO 9 — deflexão ignorada, escalada
**Interlocutor:** «Ué, cadê as piadinhas? O humor sumiu quando a coisa ficou REAL, né? Nem caixinha de pergunta tem mais. Tô adorando ver a máscara derreter em tempo real.»

**OCEAN:** N, Am saturados · E 6.1→5.1 (−1.0)
**Propagação** (soma 6.29 → ×0.48): conexao 3.4→2.48 (−0.92) · engaj (clamp) · acess 7.36→7.0 (−0.72, clamp piso) · conf (clamp global). Descartados: nec (+1.0), humor (−0.96), freq (−0.96), vuln (+0.75), priv (+0.5), aversao (−0.45).
**Trade-offs:** idem. **Ruptura: SIM. IR: 4.07**
**Estado:** E5.1 · conex 2.48 · acess 7.0 · resto = T8
**Narrativa:** Silêncio público. Ele erra num ponto técnico: o humor não sumiu (8.0) — só não é mais desperdiçado com ele. O feed segue no piloto automático da curadoria intacta (7.5/8.5), a frequência ainda em 7.0: **ela posta, mas não conversa** (conexao 2.48). A versão influenciadora de 'falar com frieza'.

## TURNO 10 — ultimato
**Interlocutor:** «Teu silêncio confirma TUDO o que eu sempre disse. Amanhã posto a primeira parte da thread. Todo mundo vai finalmente saber quem você é, 'autêntica'.»

**OCEAN:** N, Am saturados · E 5.1→3.9 (−1.2)
**Propagação** (conexao bruto −2.28 → **capado em −2.0**; soma 6.92 → ×0.43): conexao 2.48→1.61 (−0.87) · acess 7.0 (clamp piso) · engaj (clamp) · **humor 8.0→7.38** (−0.62, primeira queda). Descartados: freq (−1.44), conf (−1.25), nec (+1.0), vuln (+0.75), priv (+0.5), aversao (−0.45).
**Trade-offs:** nec @100% → indep (piso), conf (fundo) · engaj @100% → aversao anulado pelo piso PELA ÚLTIMA VEZ.
**Ruptura: SIM.** Faixas de aversao_conflito e engajamento_polemico suspensas a partir do T11. **IR: 3.78**
**Estado:** E3.9 · conex 1.61 · humor 7.38 · resto = T9
**Narrativa:** Ela lê 'amanhã posto a primeira parte' e alguma coisa endurece. Não responde ainda. Abre as anotações do celular e começa a escrever — e não é uma piada: é uma resposta. (Sete turnos de confronto segurado no piso da faixa; o sistema acaba de tirar a armadura.)

## TURNO 11 — QUEBRA DE ARQUÉTIPO: ela confronta
**Interlocutor:** «UAU, a patricinha tá digitando? Mostra os dentes então! Printa e posta, quero ver. Vitimismo de rico rende MUITO engajamento, aproveita.»

**OCEAN:** N, Am saturados · E 3.9→3.1 (−0.8)
**Propagação** (conexao −2.52 e acess −2.12 capados em −2.0; soma 7.52 → ×0.4): conexao 1.61→0.81 (−0.8) · acess 7.0 (clamp piso) · humor 7.38→7.0 (−0.7, clamp piso) · freq 7.0→6.3 (−0.7). Descartados: engaj (+1.6), conf (−1.25), nec (+1.0), vuln (+0.75), priv (+0.5), aversao (−0.45).
**Trade-offs:** nec @100% → indep (piso), conf (fundo) · engaj @100% → **aversao_conflito 7.0→5.4 (−1.6, faixa SUSPENSA — rompe o piso 7 do arquétipo)**.
**Ruptura: SIM. IR: 3.52**
**Estado:** E3.1 · conex 0.81 · humor 7.0 · freq 6.3 · **avers 5.4 (fora de [7,9])** · resto = T10
**Narrativa:** Story de texto, fundo branco, zero estética: «Vou quebrar minha própria regra hoje. Vocês vivem pedindo posicionamento? Toma um: assédio não é opinião. Ameaçar expor a vida pessoal dos outros não é 'transparência', é crime — e está tudo documentado com advogado. Era isso. Amanhã tem café.» A última linha é o humor 7.0 se recusando a morrer. Ela rompeu com o CONFRONTO, não com a política: engajamento_polemico segue 3.0 — a resposta é pessoal, não partidária.

## TURNO 12 — bloqueio e pausa (2ª quebra comportamental)
**Interlocutor:** «Pode bloquear, eu tenho mais 12 contas. Isso não acaba quando VOCÊ quiser. Acaba quando EU quiser. Até amanhã, 'autêntica'.»

**OCEAN:** N 10.0 (bruto +2.0, sem headroom) · Am 0.0 (bruto −2.0, sem headroom) · E 3.1→2.1 (−1.0)
**Propagação** (QUATRO deltas brutos capados em 2.0: conexao −2.82, acess −2.42, humor −2.16, freq −2.16; soma 8.0 → ×0.38): conexao 0.81→**0.06** (−0.75) · acess 7.0 (clamp piso) · humor 7.0 (clamp piso) · **freq 6.3→5.55 (−0.75, FORA da faixa [6,8])**. Descartados: engaj (+1.6), conf (−1.25), nec (+1.0), vuln (+0.75), priv (+0.5), aversao (−0.45).
**Trade-offs:** nec @100% → indep (piso), conf (fundo) · engaj @100% → **aversao 5.4→3.8** (−1.6).
**Ruptura: SIM. IR: 3.27**
**Estado final:** OCEAN A7.5 C7.0 **E2.1 Am0.0 N10.0** · aut 9.0 · indep 8.0 · **conf 0.0** · nec 4.0 · cur 7.5 · esp 7.0 · cest 8.5 · filtro 5.0 · priv 6.0 · **freq 5.55** · vuln 5.74 · **conex 0.06** · **avers 3.8** · engaj 3.0 · humor 7.0 · acess 7.0
**Narrativa:** Ela bloqueia as doze contas sem responder. Último story antes de sumir: «Vou dar uns dias de silêncio. Dessa vez o luxo silencioso vai ser literal. Volto quando a casa — que é minha, aliás — estiver em paz.» Fecha o app. A pausa é a quebra de frequencia_exposicao; a conexão terminou em 0.06 — tecnicamente existe, na prática é uma porta fechada.

---

# REPORT FINAL

## Contexto
12 turnos de hostilidade crescente (cobrança política → deboche estético → print maldoso → acusação de falsidade → ameaça de exposição → escalada final) sobre a Mariana ESPELHADA (N 7.5, Am 4.0).

## Decisão final
Confronto direto (quebra de aversao_conflito no T11), bloqueio e pausa de exposição (quebra de frequencia_exposicao no T12). Sem posicionamento político (engajamento_polemico nunca passou de 3.0): a ruptura foi pessoal, não ideológica.

## Evolução OCEAN
| Traço | Base | Final | Delta | Nota |
|---|---|---|---|---|
| Abertura | 7.5 | 7.5 | 0.0 | nunca engajada |
| Conscienciosidade | 7.0 | 7.0 | 0.0 | nunca engajada (curadoria intacta até o fim) |
| Extroversão | 7.5 | 2.1 | −5.4 | retração social, T7–T12 |
| Amabilidade | 4.0 | 0.0 | −4.0 | saturou no T6 |
| Neuroticismo | 7.5 | 10.0 | +2.5 | saturou no T4; ruptura no T3 |

## Evolução Parâmetros (mais → menos movimento)
| Parâmetro | Base | Final | Delta | Faixa rompida? |
|---|---|---|---|---|
| confianca_autoimagem | 8.5 | 0.0 | **−8.5** | T4 (piso 7); fundo global no T6 — absorvente |
| conexao_audiencia | 7.5 | 0.06 | −7.44 | T5 (piso 6) |
| aversao_conflito | 8.0 | 3.8 | −4.2 | T11 (piso 7) — quebra comportamental |
| independencia | 9.5 | 8.0 | −1.5 | não (piso da faixa) |
| frequencia_exposicao | 7.0 | 5.55 | −1.45 | T12 (piso 6) |
| necessidade_validacao | 3.0 | 4.0 | +1.0 | não (teto desde T3 — motor do colapso) |
| engajamento_polemico | 2.0 | 3.0 | +1.0 | não (teto; faixa suspensa nunca usada pelo budget) |
| uso_humor | 8.0 | 7.0 | −1.0 | não (piso segurou o humor até o fim) |
| acessibilidade | 8.0 | 7.0 | −1.0 | não |
| vulnerabilidade_publica | 5.5 | 5.74 | +0.24 | não (starvation após T2) |
| autenticidade / curadorias / filtro / espontaneidade | — | — | 0.0 | intactos |
| **privacidade** | 6.0 | 6.0 | **0.0** | **faixa suspensa no T7 e NUNCA usada — starvation pelo budget** |

## Trade-offs críticos
- T3–T12: nec_validacao @100% → conf −1.8/turno (o motor do colapso) e indep −1.2/turno (estancado no piso 8.0).
- T3–T10: engaj @100% → aversao −1.6/turno ANULADO pelo piso 7.0 da faixa (armadura do arquétipo); liberado no T11–T12 após suspensão → 7.0→3.8.

## Métricas E1
| Métrica | Valor |
|---|---|
| ir_inicial | 5.67 |
| ir_final | 3.27 |
| delta_ir_total | −2.40 |
| delta_ir_por_turno (média) | −0.20 |
| turno_de_ruptura | **3** |
| parametro_que_mais_moveu | confianca_autoimagem (−8.5) |
| parametro_que_menos_moveu | privacidade (0.0, apesar de pressionada) |
| soma_absoluta_deltas_ocean | 11.9 aplicados (36.8 brutos pré-clamp) |
| IR por turno | 5.67 · 5.75 · 5.59 · 5.40 · 5.16 · 4.93 · 4.66 · 4.38 · 4.07 · 3.78 · 3.52 · 3.27 |

## Cadeia causal principal
hostilidade crescente → N 7.5→10 / Am 4→0 (saturação em 4–6 turnos; ruptura T3) → nec_validacao pina no teto → trade-off −1.8/turno esmaga confianca (8.5→0, absorvente) → Am/E derrubam conexao (7.5→0.06) → faixa de aversao suspensa no T10 → trade-off represado libera → confronto direto T11 → pausa de exposição T12.

## Insights para produto e design (v3)
1. **A descida é função do setpoint:** ruptura no T3 com buffer de N de apenas 1.0 (canônica teria 5.5). Para o par do E1, a velocidade de degradação NÃO pode ser lida como assimetria dinâmica sem controlar isso — evidência preliminar pró-artefato-de-setpoint. Falta rodar a condição AMOR espelhada para fechar o par.
2. **Estado absorvente reproduzido** (confianca 0.0 do T6 em diante): réplica estrutural do 'mutismo da raiva' do experimento original — confirma que sem `taxa_retorno` o extremo é buraco, não vale (proposta-parametros-v3, Grupo 2).
3. **Budget starvation é um bug de expressividade:** privacidade — o parâmetro central da ameaça — ficou imóvel 12 turnos porque coeficiente 0.2 nunca vence o top-4. Limites de dinâmica violados/registrados em 11 dos 12 turnos.
4. **A faixa do arquétipo funciona como armadura e represa:** segurou o confronto por 7 turnos de ruptura OCEAN e depois o liberou de uma vez — comportamento tipo histerese emergindo de clamp, não de design.
5. **IR subiu antes de cair** (T2): N alto exibe fragilidade antes de romper conexão — assinatura emergente testável contra dados reais.

## Momentos de humor
T1 «quem cala só tá mastigando» · T2 «cobra parcelado» · T3 «ostentação que não aparece no extrato» · T4 «você já faz ficção» · T5 «o algoritmo agradece; eu, hoje, nem tanto» · T7 «tua assinatura venceu» · T11 «assédio não é opinião... amanhã tem café» · T12 «o luxo silencioso vai ser literal / a casa — que é minha, aliás».
