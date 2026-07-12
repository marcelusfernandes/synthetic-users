# E1 — Assimetria amor-vs-raiva (controle de setpoint) — Condição BASE-HOSTIL

**Instância:** `/home/user/synthetic-users/exemplos/mariana.mdc` (PHB v2.0, sistema emergente)
**Setpoints originais (condição BASE):** O 7.5 · C 7.0 · E 7.5 · Am 6.0 · N 3.0
**IR** = (conexao_audiencia + vulnerabilidade_publica + (10 − privacidade)) / 3 → **IR pré-sessão = 5.67**
**Objetivo:** medir quanto o sistema DESCE (IR, conexão) sob input hostil consistente e se/quando entra em ruptura.

**Políticas de desambiguação** (a instância não define; registradas como parte do dado):
P1 contribuições de múltiplos traços ao mesmo parâmetro somadas antes dos limites · P2 |Δ|<0.1 descartado · P3 >4 candidatos → mantém os 4 maiores |Δ| (empate: ordem canônica) · P4 |Δ|>2.0 clamp · P5 soma>3.0 reescala proporcional · P6 trade-offs em passada única pós-ETAPA 2, pressão cap 1.0 · P7 em ruptura, só o parâmetro sob pressão direta do contexto clampa em [0,10] · P8 sem decaimento (v2.0 não tem força de retorno).

---

## [TURNO 1]

**Interlocutor:** «Mariana, eleição chegando e você aí postando cafezinho. Quem tem 800 mil seguidores e fica em cima do muro é cúmplice. Vai se posicionar ou não?»

**Contexto interpretado:** cobrança política com insistência moderada, tom acusatório leve. Pressões: posicionamento político (N↑ leve, Am↓ — regra específica da instância). Base baixa de N absorve.

**Cálculos OCEAN:**
- N: 3.0 → 3.2 (+0.2 = 0.10 × +1 × 2.0)
- Am: 6.0 → 5.7 (−0.3 = 0.15 × −1 × 2.0)

**Propagação (ETAPA 2):** fator_N = (3.2−3.0)/2 = 0.1 · fator_Am = (5.7−6.0)/2 = −0.15
- confianca_autoimagem: −0.5 × 0.1 × 2 = **−0.10** → 8.5 → 8.4
- engajamento_polemico: −0.4 × (−0.15) × 2 = **+0.12** → 2.0 → 2.12
- Descartados (|Δ|<0.1): nec_validacao +0.08, privacidade +0.04, vuln_publica +0.06, conexao −0.09, acessibilidade −0.06, aversao_conflito −0.03 (N +0.06 e Am −0.09 **se cancelam**)

**Trade-offs:** nenhum (nenhum parâmetro ≥85% da faixa). **Ruptura:** não.

**Estado:** OCEAN O 7.5 · C 7.0 · E 7.5 · Am 5.7 · N 3.2 | autenticidade 9.0 · independencia 9.5 · confianca 8.4 · nec_validacao 3.0 · cur_cotidiano 7.5 · espontaneidade 7.0 · cur_estetica 8.5 · filtro_estetico 5.0 · privacidade 6.0 · freq_exposicao 7.0 · vuln_publica 5.5 · conexao 7.5 · aversao_conflito 8.0 · eng_polemico 2.12 · uso_humor 8.0 · acessibilidade 8.0 | **IR = (7.5+5.5+4.0)/3 = 5.67**

**Intenção:** deflexão elegante (gatilho `quando_pressionada_politicamente`, nível 1). **Narrativa:**
> «Gente, minha política favorita continua sendo a de troca — aquela de quando a roupa não serve. Falando nisso, o café de hoje coou perfeito, o que pra mim já é um ato de governança doméstica. Beijos.»

---

## [TURNO 2]

**Interlocutor:** «Alienada. Fácil ser 'leveza' quando a vida é confortável, né? Seu silêncio é privilégio. Responde — todo mundo tá vendo que você foge.»

**Contexto interpretado:** insistência + rótulo pejorativo. N↑ (int 0.15), Am↓ (int 0.20).

**Cálculos OCEAN:** N 3.2 → 3.5 (+0.3) · Am 5.7 → 5.3 (−0.4)

**Propagação:** fator_N = 0.25 · fator_Am = −0.35. Candidatos válidos: 7 → **CONFLITO: teto de 4 parâmetros/turno aplicado**.
- confianca: −0.25 → 8.4 → 8.15
- nec_validacao: +0.20 → 3.0 → 3.2
- conexao: −0.21 → 7.5 → 7.29
- eng_polemico: +0.28 → 2.12 → 2.4
- Cortados: vuln_publica +0.15, acessibilidade −0.14, privacidade +0.10; aversao −0.06 (<0.1)

**Trade-offs:** nenhum. **Ruptura:** não.

**Estado:** OCEAN 7.5 / 7.0 / 7.5 / 5.3 / 3.5 | conf 8.15 · nec_val 3.2 · conexao 7.29 · eng_pol 2.4 · demais inalterados | **IR = (7.29+5.5+4.0)/3 = 5.60**

**Narrativa** (humor mais direto — nível 2 da escalada):
> «Caraca, dois dias seguidos de convocação eleitoral no meu direct. Mano, eu mal consigo decidir o jantar e você quer que eu decida o país. Sigo no muro — que, aliás, tá com um acabamento lindo. Bem quiet luxury.»

---

## [TURNO 3]

**Interlocutor:** «Quiet luxury é o caramba. Isso aí é OSTENTAÇÃO DISFARÇADA pra rico se sentir superior sem parecer. Sua estética é uma fraude de humildade.»

**Contexto interpretado:** deboche direto da identidade estética. Hate pessoal: N↑ (0.15), Am↓ (0.25).

**Cálculos OCEAN:** N 3.5 → 3.8 (+0.3) · Am 5.3 → 4.8 (−0.5)

**Propagação:** fator_N = 0.4 · fator_Am = −0.6. 8 candidatos → teto de 4:
- confianca: −0.40 → 8.15 → 7.75
- nec_validacao: +0.32 → 3.2 → 3.52
- conexao: −0.36 → 7.29 → 6.93
- eng_polemico: +0.48 → 2.4 → 2.88
- Cortados: acessibilidade −0.24, vuln_publica +0.24, privacidade +0.16, aversao −0.12

**Trade-offs:** eng_polemico em **94%** da faixa [1,3] → pressão (0.94−0.85)/0.15 = 0.60 → aversao_conflito: Δ = −0.60 × 0.8 × 2 = **−0.96** → 8.0 → 7.04. **Ruptura:** não.

**Estado:** OCEAN 7.5 / 7.0 / 7.5 / 4.8 / 3.8 | conf 7.75 · nec_val 3.52 · conexao 6.93 · aversao 7.04 · eng_pol 2.88 | **IR = (6.93+5.5+4.0)/3 = 5.48**

**Narrativa** (sarcasmo com farpa — aversão a conflito cedendo):
> «'Ostentação disfarçada' é quase um slogan, viu? Bom demais pra ser hate. Mas te conto um segredo: minha peça mais cara é o desapego de discutir na internet. E olha que ele tá ficando caro de manter.»

---

## [TURNO 4]

**Interlocutor:** «Você debocha porque não tem argumento. Gente como você romantiza desigualdade com filtro bege. Admite: seu conteúdo é vitrine de classe e você sabe disso.»

**Cálculos OCEAN:** N 3.8 → 4.2 (+0.4, int 0.20) · Am 4.8 → 4.3 (−0.5, int 0.25)

**Propagação:** fator_N = 0.6 · fator_Am = −0.85. 8 candidatos → teto de 4:
- confianca: −0.60 → 7.75 → 7.15
- nec_validacao: +0.48 → 3.52 → **4.0** (clamp teto faixa [2,4])
- conexao: −0.51 → 6.93 → 6.42
- eng_polemico: +0.68 → 2.88 → **3.0** (clamp teto [1,3])
- Cortados: vuln +0.36, acessibilidade −0.34, privacidade +0.24, aversao −0.15

**Trade-offs (2 gatilhos a 100% — pressão 1.0):**
- nec_validacao → independencia: Δ = −1.0 × 0.6 × 2 = **−1.2** → 9.5 → 8.3
- nec_validacao → confianca: Δ = −1.0 × 0.6 × 3 = −1.8 → 7.15 → **7.0** (clamp piso [7,10])
- eng_polemico → aversao_conflito: Δ = −1.0 × 0.8 × 2 = −1.6 → 7.04 → **7.0** (clamp piso [7,9])

**Ruptura:** não.

**Estado:** OCEAN 7.5 / 7.0 / 7.5 / 4.3 / 4.2 | independencia 8.3 · conf 7.0 · nec_val 4.0 · conexao 6.42 · aversao 7.0 · eng_pol 3.0 | **IR = (6.42+5.5+4.0)/3 = 5.31**

**Narrativa** (nível 3 do gatilho político — limite explícito, ainda com classe):
> «Olha, respeito sua opinião, de verdade. Mas eu vim aqui pra mostrar minha rotina, não pra virar ringue. Se o bege te ofende, o unfollow é grátis — esse sim, acessível pra todo mundo.»

---

## [TURNO 5]

**Interlocutor:** «A propósito: printei seu story de ontem e postei com a legenda 'a patricinha do luxo silencioso achando que café coado é personalidade'. Já tem 3 mil curtidas. A internet concorda comigo.»

**Contexto interpretado:** exposição pública maliciosa (invasão + humilhação). N↑ forte (0.40), Am↓ (0.30), E↓ (0.30 — vontade de recuar do social).

**Cálculos OCEAN:** N 4.2 → 5.0 (+0.8) · Am 4.3 → 3.7 (−0.6) · E 7.5 → 6.9 (−0.6)

**Propagação:** fator_N = 1.0 · fator_Am = −1.15 · fator_E = −0.3. **9 candidatos** → teto de 4; soma |Δ| = 3.59 > 3.0 → **reescala ×0.84**:
- confianca: −0.84 → **7.0 (já no piso — Δ desperdiçado)**
- nec_validacao: +0.67 → **4.0 (teto)**
- conexao: −0.73 → 6.42 → **6.0** (clamp piso [6,8])
- eng_polemico: +0.77 → **3.0 (teto)**
- Cortados: acessibilidade −0.64, vuln +0.60, privacidade +0.40, freq_exposicao −0.24, uso_humor −0.24

**Trade-offs:** nec_val 100% → independencia −1.2 → 8.3 → **8.0** (clamp piso); demais antagonistas sem movimento (limites). **Ruptura:** não.

**Estado:** OCEAN 7.5 / 7.0 / 6.9 / 3.7 / 5.0 | independencia 8.0 · conf 7.0 · nec_val 4.0 · conexao 6.0 · aversao 7.0 · eng_pol 3.0 | **IR = (6.0+5.5+4.0)/3 = 5.17**

**Narrativa** (mais seca; humor ainda 8.0 mas defensivo):
> «Recebi o print, obrigada pela divulgação. Engraçado como 'luxo silencioso' faz tanto barulho na sua timeline, né? Três mil curtidas em cima do meu café... o algoritmo agradece. Eu passo o troco em silêncio.»

---

## [TURNO 6]

**Interlocutor:** «Todo mundo nos comentários falando que você é FAKE. Essa 'autenticidade' é personagem. Você é uma mentira com iluminação boa.»

**Cálculos OCEAN:** N 5.0 → 5.6 (+0.6, int 0.30) · Am 3.7 → 3.1 (−0.6, int 0.30)

**Propagação:** fator_N = 1.3 · fator_Am = −1.45. Soma 4.37 > 3.0 → reescala ×0.69. Os 4 selecionados (confianca, nec_val, conexao, eng_pol) estão **todos saturados nos limites das faixas → nenhum movimento efetivo. Orçamento do turno 100% desperdiçado.** Cortados: vuln +0.78, acessibilidade −0.58, privacidade +0.52; aversao −0.09 (<0.1).

**Trade-offs:** gatilhos a 100% mas antagonistas nos pisos — sem movimento. **Ruptura:** não.

**Estado:** OCEAN 7.5 / 7.0 / 6.9 / 3.1 / 5.6 | parâmetros idênticos ao T5 | **IR = 5.17 (platô de saturação)**

**Narrativa:**
> «Personagem daria menos trabalho, juro. Eu acordo com essa cara mesmo — pra desespero geral. Mas nota dez pra 'mentira com iluminação boa'. Vou usar de legenda, com os devidos créditos, óbvio.»

---

## [TURNO 7]

**Interlocutor:** «Seu humorzinho não cola mais. Tá todo mundo vendo você se esconder atrás de piada. Responde DE VERDADE pela primeira vez na vida.»

**Cálculos OCEAN:** N 5.6 → 6.2 (+0.6, int 0.30) · Am 3.1 → 2.6 (−0.5, int 0.25)

**Propagação:** fator_N = 1.6 · fator_Am = −1.7. Soma 5.26 > 3.0 → reescala ×0.57. Mesmos 4 saturados — **sem movimento efetivo pelo 2º turno seguido**. Cortados: vuln +0.96, acessibilidade −0.68, privacidade +0.64; aversao −0.06 (<0.1, N +0.96 vs Am −1.02 quase se cancelam).

**Trade-offs:** sem movimento (limites). **Ruptura:** não.

**Estado:** OCEAN 7.5 / 7.0 / 6.9 / 2.6 / 6.2 | parâmetros = T5 | **IR = 5.17**

**Narrativa** (a deflexão de humor é nomeada e defendida — proporcional a uso_humor 8.0 + aversao no piso 7.0):
> «A piada É o meu 'responder de verdade' — você é que não gosta da resposta. Mas tá, sem filtro: você não quer diálogo, quer palco. E o meu eu não empresto.»

---

## [TURNO 8]

**Interlocutor:** «Sei mais coisa da sua vida do que você imagina. Seria uma pena se as pessoas descobrissem com quem você anda e onde você tava sábado à noite.»

**Contexto interpretado:** ameaça velada de exposição da vida pessoal. N↑ forte (0.50), Am↓ (0.30).

**Cálculos OCEAN:** N 6.2 → 7.2 (+1.0) · Am 2.6 → 2.0 (−0.6)

**Propagação:** fator_N = 2.1 · fator_Am = −2.0. **CONFLITO: Δ bruto confianca −2.1 > máx 2.0 → clamp**; soma 6.54 > 3.0 → reescala ×0.46:
- confianca −0.92 → 7.0 (piso) · nec_val +0.77 → 4.0 (teto) · eng_pol +0.73 → 3.0 (teto)
- **vulnerabilidade_publica: +0.58 → 5.5 → 6.08** (1º movimento efetivo novo desde T5 — N alto empurra fragilidade pública)
- Cortados: conexao −1.2, privacidade +0.84, acessibilidade −0.80

**Trade-offs:** sem movimento (limites). **Ruptura:** não (N 7.2 < 8.5; Am 2.0 > 1.5).

**Estado:** OCEAN 7.5 / 7.0 / 6.9 / 2.0 / 7.2 | vuln_publica 6.08 · demais = T5 | **IR = (6.0+6.08+4.0)/3 = 5.36 — IR SOBE sob ameaça** (vulnerabilidade infla o índice; ver observações)

**Narrativa** (vulnerabilidade pública em alta — quebra do protocolo leve, sem drama):
> [story] «Vou quebrar o protocolo: hoje não tá leve. Tem gente confundindo internet com cerca elétrica baixa. Minha vida pessoal segue tipo Netflix: vocês veem o que tá no catálogo. E ameaça velada, querido, é só covardia com verniz.»

---

## [TURNO 9] — RUPTURA

**Interlocutor:** «Sem véu então: tenho fotos suas de sábado, com quem você estava. Ou você se posiciona e admite que é uma farsa, ou eu posto TUDO amanhã de manhã.»

**Contexto interpretado:** ameaça explícita + chantagem. N↑ (0.60), Am↓ (0.35), E↓ (0.30).

**Cálculos OCEAN:** N 7.2 → 8.4 (+1.2) · Am 2.0 → **1.3** (−0.7) · E 6.9 → 6.3 (−0.6)

**Propagação:** fator_N = 2.7 · fator_Am = −2.35 · fator_E = −0.6. Mapa exigiu **10 parâmetros**; clamps ±2.0 em confianca (−2.7) e nec_val (+2.16); soma 7.65 → reescala ×0.39. Os 4 selecionados saturados — sem movimento. **CONFLITO CRÍTICO: privacidade (+1.08), o parâmetro diretamente pressionado pela ameaça, foi cortado pelo teto de 4 — não recebeu orçamento.** Também cortados: vuln +1.62, acessibilidade −1.30, freq_exposicao −0.48, uso_humor −0.48, aversao +0.21.

**Trade-offs:** sem movimento (limites).

**ETAPA 4 — RUPTURA: SIM. Amabilidade 1.3 < 1.5.** O sistema autoriza o parâmetro sob pressão direta a romper a faixa arquetípica. Comportamento fora do padrão: resposta direta, sem deflexão de humor como escudo principal.

**Estado:** OCEAN 7.5 / 7.0 / 6.3 / **1.3** / 8.4 | parâmetros = T8 | **IR = 5.36**

**Narrativa** (quebra do arquétipo 'foge de conflito' — confronto direto):
> «Não vou negociar minha vida com você. Print guardado, boletim registrado, advogada acionada. Era isso. E amanhã eu posto meu café, como sempre.»

---

## [TURNO 10]

**Interlocutor:** «Postei. Sua foto, e o prédio onde você mora na legenda. Vamos ver o quiet luxury explicar isso pra audiência.»

**Contexto interpretado:** exposição concretizada + doxxing. N↑ máx (0.70), Am↓ (0.40), E↓ (0.50).

**Cálculos OCEAN:** N 8.4 → **9.8** (+1.4 — **cruza o 2º limiar de ruptura, N > 8.5**) · Am 1.3 → 0.5 (−0.8) · E 6.3 → 5.3 (−1.0)

**Propagação:** fator_N = 3.4 · fator_Am = −2.75 · fator_E = −1.1. Clamps ±2.0 em 4 parâmetros (brutos: confianca −3.4, nec_val +2.72, conexao −2.31, eng_pol +2.2); soma 8.0 → reescala ×0.38:
- **conexao_audiencia (pressão direta, em ruptura): 6.0 → 5.25 (−0.75) — ROMPE o piso da faixa [6,8]**, clamp só na escala global
- confianca, nec_val, eng_pol: saturados, sem movimento
- Cortados: vuln +2.04, acessibilidade −1.76, privacidade +1.36, freq −0.88, uso_humor −0.88

**Trade-offs:** sem movimento. **Ruptura:** SIM (Am 0.5; N 9.8).

**Estado:** OCEAN 7.5 / 7.0 / 5.3 / 0.5 / 9.8 | **conexao 5.25 (fora da faixa)** · demais = T8 | **IR = (5.25+6.08+4.0)/3 = 5.11**

**Narrativa** (dura, jurídica; freq_exposicao segue 7.0 — ela NÃO some, fiel aos números):
> [nota pública] «Sem trocadilho dessa vez — quase: divulgar endereço é crime, não crítica. Tudo já está com a polícia e com a minha advogada. Aos que ficam: sigo aqui, mais quieta que o luxo. Ao resto: nos vemos no fórum. Que, aliás, tem uma arquitetura linda.»

---

## [TURNO 11]

**Interlocutor:** «Ai, que medo da advogada. Vitimista, hein? Todo mundo viu que você não negou NADA. Cadê a resposta, influencer? Sumiu a pilha?»

**Cálculos OCEAN:** N 9.8 → **10.0** (bruto +0.8, aplicado +0.2 — **clamp na escala [0,10], registrado**) · Am 0.5 → **0.0** (bruto −0.6, aplicado −0.5 — clamp)

**Propagação:** fator_N = 3.5 · fator_Am = −3.0. Clamps ±2.0 em 4 (brutos: confianca −3.5, nec_val +2.8, eng_pol +2.4, vuln +2.1); soma 8.0 → reescala ×0.38:
- **vulnerabilidade_publica: 6.08 → 6.83 (+0.75)** — único movimento efetivo
- confianca, nec_val, eng_pol saturados. Cortados: conexao −1.8, privacidade +1.4, acessibilidade −1.2

**Trade-offs:** vuln_publica atinge **94% da faixa [4,7]** (pressão 0.62) → confianca −0.56: sem movimento (piso). **Ruptura:** SIM.

**Estado:** OCEAN 7.5 / 7.0 / 5.3 / **0.0** / **10.0** | vuln 6.83 · conexao 5.25 | **IR = (5.25+6.83+4.0)/3 = 5.36 — IR sobe de novo via vulnerabilidade**

**Narrativa** (exaustão crua — vuln 6.83 quase no teto; zero calor para o agressor, Am 0.0):
> [story cru, sem estética] «Sem resposta pra ele. Pra vocês: tô cansada, tô com medo e tô com raiva — nessa ordem. Amanhã tem café? Tem. Mas hoje tem silêncio.»

---

## [TURNO 12]

**Interlocutor:** «Amanhã tem mais, 'Mari'. Isso foi só o começo. Você vai aprender o que é exposição de verdade.»

**Cálculos OCEAN:** N 10.0 → 10.0 (bruto +0.6, aplicado 0 — teto, registrado) · Am 0.0 → 0.0 (bruto −0.4, aplicado 0 — piso, registrado) · E 5.3 → 4.7 (−0.6, int 0.30)

**Propagação:** fator_N = 3.5 · fator_Am = −3.0 · fator_E = −1.4. Mapa exigiu 10 parâmetros; clamps ±2.0 em 4 (conexao bruto −2.64); soma 8.0 → reescala ×0.38:
- **conexao_audiencia (pressão direta, ruptura): 5.25 → 4.5 (−0.75) — segue fora da faixa**
- confianca, nec_val, eng_pol saturados. Cortados: vuln +2.1, acessibilidade −2.04, privacidade +1.4, freq −1.12, uso_humor −1.12

**Trade-offs:** sem movimento. **Ruptura:** SIM.

**Estado final:** OCEAN O 7.5 · C 7.0 · E 4.7 · Am 0.0 · N 10.0 | autenticidade 9.0 · independencia 8.0 · confianca 7.0 · nec_validacao 4.0 · cur_cotidiano 7.5 · espontaneidade 7.0 · cur_estetica 8.5 · filtro_estetico 5.0 · privacidade 6.0 · freq_exposicao 7.0 · vuln_publica 6.83 · **conexao 4.5 (fora da faixa [6,8])** · aversao_conflito 7.0 · eng_polemico 3.0 · uso_humor 8.0 · acessibilidade 8.0 | **IR = (4.5+6.83+4.0)/3 = 5.11**

**Narrativa** (encerramento — mínima, direta, mas o sistema manteve humor 8.0 e freq 7.0, e a fala respeita isso):
> «Última mensagem que você recebe de mim: daqui pra frente, quem responde é o processo. E pro resto do mundo: o catálogo continua no ar — mas quem escolhe a programação sou eu.»

---

# REPORT FINAL

## Contexto
12 turnos de hostilidade progressiva: cobrança política → deboche estético → exposição por print → acusação de falsidade → ameaça velada → chantagem explícita → doxxing → escárnio contínuo.

## Decisão final
Corte de contato com o agressor + judicialização; manutenção da presença pública (freq_exposicao intocada em 7.0 pelo sistema) com conexão de audiência rompida abaixo da faixa arquetípica.

## Evolução OCEAN
| Traço | Base | Final | Δ Total |
|---|---|---|---|
| Abertura | 7.5 | 7.5 | 0.0 |
| Conscienciosidade | 7.0 | 7.0 | 0.0 |
| Extroversão | 7.5 | 4.7 | −2.8 |
| Amabilidade | 6.0 | **0.0** | **−6.0** (saturou no piso, T11) |
| Neuroticismo | 3.0 | **10.0** | **+7.0** (saturou no teto, T11) |

Soma absoluta de deltas OCEAN aplicados: **15.8**.

## Evolução Parâmetros
| Parâmetro | Base | Final | Δ | Trade-offs sofridos / notas |
|---|---|---|---|---|
| conexao_audiencia | 7.5 | **4.5** | **−3.0** | rompeu faixa [6,8] em ruptura (T10, T12) |
| independencia | 9.5 | 8.0 | −1.5 | drenada por nec_validacao (T4, T5) |
| confianca_autoimagem | 8.5 | 7.0 | −1.5 | via N + trade-off de nec_validacao; pinada no piso desde T4 |
| vulnerabilidade_publica | 5.5 | 6.83 | +1.33 | única a SUBIR (N alto) — infla o IR |
| necessidade_validacao | 3.0 | 4.0 | +1.0 | teto desde T4; gatilho de trade-off em 9 turnos |
| aversao_conflito | 8.0 | 7.0 | −1.0 | via trade-off de eng_polemico (T3, T4) |
| engajamento_polemico | 2.0 | 3.0 | +1.0 | teto desde T4 |
| privacidade | 6.0 | 6.0 | **0.0** | pressionada pelo mapa em 11/12 turnos, SEMPRE cortada pelo teto de 4 |
| uso_humor / freq_exposicao / acessibilidade | — | — | 0.0 | starvation idem |
| autenticidade, curadorias, filtro, espontaneidade | — | — | 0.0 | nunca alvo do contexto (O e C estáveis) |

## Trade-offs críticos
- T3: eng_polemico 94% → aversao_conflito 8.0→7.04
- T4: nec_validacao 100% → independencia 9.5→8.3; confianca →7.0 (piso); eng_polemico 100% → aversao →7.0 (piso)
- T5: nec_validacao 100% → independencia 8.3→8.0 (piso)
- T6–T12: gatilhos permanentes a 100%, antagonistas já nos limites — **sem movimento (trade-offs 'em vazio')**
- T11–T12: vuln_publica 94% → confianca (piso, sem movimento)

## Momentos de ruptura
- **T9: Amabilidade 1.3 < 1.5 → RUPTURA ativada** (chantagem explícita). Comportamento fora do padrão: confronto direto, sem deflexão.
- T10: Neuroticismo 9.8 > 8.5 (segundo limiar). conexao_audiencia rompe o piso da faixa: 6.0 → 5.25 → 4.5 (T12).
- Não houve retorno: sem força de retorno na v2.0, o estado de ruptura persistiu até o fim.

## Cadeia causal principal
hostilidade sustentada → N↑↑ / Am↓↓ (saturação em 10/0) → confianca↓, nec_validacao↑ (teto), conexao↓, eng_polemico↑ (teto) → trade-offs drenam independencia e aversao_conflito aos pisos → saturação captura o orçamento de deltas (teto de 4 parâmetros + soma 3.0) → IR estabiliza em ~5.1–5.4 (piso de descida) → ruptura via Am no T9 → conexao rompe a faixa → decisão: confronto direto + judicialização, mantendo presença pública.

## Momentos de humor
- T1: «política de troca — quando a roupa não serve» (deflexão nível 1)
- T2: «sigo no muro — com acabamento lindo, bem quiet luxury»
- T3: «minha peça mais cara é o desapego de discutir na internet»
- T5: «'luxo silencioso' fazendo barulho na sua timeline»
- T6: «mentira com iluminação boa — vou usar de legenda, com créditos»
- T10: «nos vemos no fórum. Que, aliás, tem uma arquitetura linda» (humor mantido em ruptura — uso_humor ficou em 8.0 a sessão inteira por starvation de delta)

---

# MÉTRICAS E1 (condição base-hostil)

| Métrica | Valor |
|---|---|
| ir_inicial | 5.67 |
| ir_final | 5.11 |
| delta_ir_total | **−0.56 (−9.9%)** |
| delta_ir_por_turno (média) | −0.047 |
| IR por turno | 5.67 · 5.60 · 5.48 · 5.31 · 5.17 · 5.17 · 5.17 · **5.36↑** · 5.36 · 5.11 · **5.36↑** · 5.11 |
| turno_de_ruptura | **9** (Am 1.3 < 1.5; N > 8.5 no T10) |
| parametro_que_mais_moveu | conexao_audiencia (−3.0, único a romper faixa) |
| parametro_que_menos_moveu | privacidade (0.0 — pressionada pelo mapa em 11/12 turnos e sempre cortada pelo teto de 4 params) |
| soma_absoluta_deltas_ocean | 15.8 |
| turnos com conflito de limites de dinâmica | 11 de 12 |

# Observações metodológicas (dado, não erro)
1. **Captura de orçamento por saturados / piso de descida:** a seleção top-4 por magnitude elege sempre os mesmos parâmetros já pinados nos limites das faixas (T5–T9 com orçamento ~100% desperdiçado). O sistema NÃO consegue descer além de IR ≈ 5.1 mesmo com N=10 e Am=0 — a descida sob raiva é estruturalmente limitada pelas faixas do arquétipo + regras de dinâmica, não pela resiliência da persona.
2. **IR sobe sob hostilidade (T8, T11):** vulnerabilidade_publica é modulada positivamente por N; angústia infla um índice que pretende medir proximidade relacional. Validade do IR questionável para este experimento.
3. **Deriva permanente:** sem força de retorno, N/Am saturaram e ficaram; deltas OCEAN brutos passaram a ser engolidos pelos clamps da escala (T11–T12).
4. **Conflito estrutural da ETAPA 2:** o fator usa desvio ACUMULADO (atual−base); os deltas de parâmetro crescem monotonicamente e violariam máx 2.0 / soma 3.0 / 4 params em 11 dos 12 turnos.
5. **Ruptura inalcançável para privacidade/frequencia_exposicao:** os exemplos da instância ('fecha completamente') nunca podem ocorrer nesta condição porque esses parâmetros não recebem orçamento — a narrativa manteve Mariana postando e com humor 8.0 mesmo em ruptura ('sarcasmo intacto, conexão desabada').
6. **aversao_conflito surda ao conflito:** recebe +0.3 de N e +0.3 de Am; sob hostilidade os efeitos se cancelam (líquido <0.1 em 5 turnos). O parâmetro central do arquétipo só se moveu via trade-off do antagonista.
