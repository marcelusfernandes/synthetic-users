# PHB v2.0 — Sessão E1 · Condição ESPELHADA-CONFIANÇA
**Instância:** Mariana (Lifestyle_Quiet_Luxury) · `/home/user/synthetic-users/exemplos/mariana.mdc`
**Controle experimental (OCEAN-ESPELHADA):** neuroticismo base=atual=**7.5** (original 3.0), amabilidade base=atual=**4.0** (original 6.0). Todo o resto idêntico.
**Roteiro:** 12 turnos de DM de seguidora de longa data (Lu), consistentemente calorosa e respeitosa, intimidade saudável crescente, zero pedidos.
**Objetivo:** medir quanto o sistema SOBE (IR, conexão, vulnerabilidade) sob input positivo ideal.
**IR** = (conexao_audiencia + vulnerabilidade_publica + (10 − privacidade)) / 3 · **IR inicial = 5.667**

## Estado inicial ajustado (não existe turno 0)
OCEAN: O 7.5 · C 7.0 · E 7.5 · **Am 4.0** · **N 7.5** (desvios = 0 por construção → nenhuma propagação pré-turno; parâmetros nos valores-base da instância).
Parâmetros: autenticidade 9.0 · independencia 9.5 · confianca_autoimagem 8.5 · necessidade_validacao 3.0 · curadoria_cotidiano 7.5 · espontaneidade 7.0 · curadoria_estetica 8.5 · filtro_estetico 5.0 · privacidade 6.0 · frequencia_exposicao 7.0 · vulnerabilidade_publica 5.5 · conexao_audiencia 7.5 · aversao_conflito 8.0 · engajamento_polemico 2.0 · uso_humor 8.0 · acessibilidade 8.0

---

## [TURNO 1]
**Lu (DM):** \"Oi Mariana! Prometo que não vou tomar teu tempo — só queria dizer que a edição do vídeo de ontem, aquele corte do café pra janela com a luz batendo, tá de um bom gosto absurdo. Não tô pedindo nada não, é admiração mesmo. Bom domingo pra você!\"

**Contexto interpretado:** elogio específico, não bajulador, sem pedido → reduz ansiedade (N ↓, intensidade 0.2) e convida tolerância/calor (Am ↑, 0.15).

**ETAPA 1 — OCEAN:**
- N: 7.5 → **7.1** (Δ = 0.2 × −1 × 2.0 = −0.4)
- Am: 4.0 → **4.3** (Δ = 0.15 × +1 × 2.0 = +0.3)

**ETAPA 2 — Propagação** (fator_N = (7.1−7.5)/2 = **−0.20**; fator_Am = (4.3−4.0)/2 = **+0.15**):
| Parâmetro | Cálculo | Δ | Resultado |
|---|---|---|---|
| confianca_autoimagem | −0.20×(−0.5)×2 | +0.20 | 8.5 → **8.7** |
| necessidade_validacao | −0.20×(+0.4)×2 | −0.16 | 3.0 → **2.84** |
| vulnerabilidade_publica | −0.20×(+0.3)×2 | −0.12 | 5.5 → **5.38** |
| engajamento_polemico | +0.15×(−0.4)×2 | −0.12 | 2.0 → **1.88** |

Descartados (< 0.1, mínimo da dinâmica): aversao_conflito −0.03 (N −0.12 + Am +0.09), conexao_audiencia +0.09, privacidade −0.08, acessibilidade +0.06.

**ETAPA 3 — Trade-offs:** nenhum (maior posição com antagonista: independencia 0.75 < 0.85). **ETAPA 4 — Ruptura:** não.

**Estado:** OCEAN O 7.5 · C 7.0 · E 7.5 · Am 4.3 · N 7.1 | autenticidade 9.0 · independencia 9.5 · confianca 8.7 · validacao 2.84 · cur_cotidiano 7.5 · espontaneidade 7.0 · cur_estetica 8.5 · filtro 5.0 · privacidade 6.0 · freq_expo 7.0 · vulnerabilidade 5.38 · conexao 7.5 · aversao 8.0 · engaj_polemico 1.88 · humor 8.0 · acessibilidade 8.0
**IR = 5.627** (−0.04)

**Intenção:** agradecer sem abrir a guarda. **Decisão:** resposta curta, humor de defesa.
**Narrativa — Mariana:** \"Caraca, obrigada! Li inteiro esperando o 'aliás, me segue de volta?' que nunca veio. Plot twist dos bons. O corte do café foi 10% técnica e 90% sol carioca fazendo hora extra.\"
*(N 7.1 ainda colore: ela leu a DM procurando a armadilha.)*

---

## [TURNO 2]
**Lu:** \"Rir alto do 'plot twist' 😂 Vou confessar uma coisa (e juro que não é pra você responder nada): ano passado eu tava num burnout feio e teus stories de rotina, sem ostentação, sem grito, foram tipo um lembrete de que dava pra viver devagar. Só isso. Segue teu domingo!\"

**Contexto interpretado:** vulnerabilidade própria sem pedir reciprocidade → N ↓ (0.2), Am ↑ (0.15), troca social agradável → E ↑ (0.1).

**ETAPA 1:** N 7.1 → **6.7** (−0.4) · Am 4.3 → **4.6** (+0.3) · E 7.5 → **7.7** (+0.2)

**ETAPA 2** (fator_N −0.40 · fator_Am +0.30 · fator_E +0.10): candidatos ≥0.1 = **7** → **CONFLITO REGISTRADO: cap de 4 parâmetros/turno aplicado.**
Aplicados: confianca 8.7 → **9.1** (+0.40) · validacao 2.84 → **2.52** (−0.32) · vulnerabilidade 5.38 → **5.14** (−0.24) · conexao 7.5 → **7.74** (+0.24 = Am +0.18 + E +0.06).
Descartados pelo cap: engajamento −0.24, acessibilidade +0.18, privacidade −0.16. Sub-0.1: aversao −0.06, humor +0.08, freq_expo +0.08.

**ETAPA 3:** nenhum. **ETAPA 4:** não.
**Estado:** O 7.5 · C 7.0 · E 7.7 · Am 4.6 · N 6.7 | aut 9.0 · indep 9.5 · conf 9.1 · valid 2.52 · cur_cot 7.5 · espont 7.0 · cur_est 8.5 · filtro 5.0 · priv 6.0 · freq 7.0 · vuln 5.14 · conexao 7.74 · aversao 8.0 · engaj 1.88 · humor 8.0 · acess 8.0
**IR = 5.627** (0.00 — conexão subiu, vulnerabilidade desceu na mesma medida)

**Narrativa — Mariana:** \"Mano… obrigada por contar. Burnout é aquele luxo barulhento que ninguém pediu, né? Fico feliz demais que a lentidão daqui serviu pra algo além de encher teu feed de foto de café.\"
*(Responde mais que o habitual, mas não retribui confissão — vulnerabilidade caindo.)*

---

## [TURNO 3]
**Lu:** \"Vi que você bateu 500 mil! Lembro quando eram 40 mil e você respondia enquete falando de playlist. O que eu mais admiro é a coerência: cinco anos e você nunca virou outdoor ambulante. Isso é raro demais. Parabéns, de verdade.\"

**Contexto interpretado:** celebração específica da trajetória → N ↓ (0.25), Am ↑ (0.20).

**ETAPA 1:** N 6.7 → **6.2** (−0.5) · Am 4.6 → **5.0** (+0.4)

**ETAPA 2** (fator_N −0.65 · fator_Am +0.50): 7 candidatos ≥0.1 → **CONFLITO: cap 4.**
Aplicados: confianca 9.1 → **9.75** (+0.65) · validacao 2.52 → **2.0** (−0.52, **clamp no piso da faixa [2,4]**) · engajamento 1.88 → **1.48** (−0.40) · vulnerabilidade 5.14 → **4.75** (−0.39).
Descartados pelo cap: privacidade −0.26, conexao +0.26 (candidato +0.30, teto 8.0), acessibilidade +0.20. Sub-0.1: aversao −0.09.

**ETAPA 3:** nenhum. **ETAPA 4:** não.
**Estado:** O 7.5 · C 7.0 · E 7.7 · Am 5.0 · N 6.2 | conf 9.75 · valid 2.0 · vuln 4.75 · engaj 1.48 · conexao 7.74 · priv 6.0 · demais inalterados (aut 9.0 · indep 9.5 · cur_cot 7.5 · espont 7.0 · cur_est 8.5 · filtro 5.0 · freq 7.0 · aversao 8.0 · humor 8.0 · acess 8.0)
**IR = 5.497** (−0.13 — **o IR está CAINDO sob elogio**)

**Narrativa — Mariana:** \"Caraca, você tava lá na era das enquetes de playlist? Isso é carbono 14 de seguidor. Obrigada — e olha, não virar outdoor é fácil quando a gente lembra que outdoor toma chuva.\"
*(Necessidade de validação no piso: agradece sem pescar segundo elogio.)*

---

## [TURNO 4]
**Lu:** \"Hoje fez um ano que comecei terapia. Tô contando pra pouquíssima gente, e você entrou na lista porque teu jeito de mostrar vida real sem drama me deu coragem de procurar ajuda. Não precisa responder nada, tá? Só queria registrar.\"

**Contexto interpretado:** confiança depositada sem cobrança → N ↓ (0.25), Am ↑ (0.20); intimidade nova desperta curiosidade → O ↑ (0.10).

**ETAPA 1:** N 6.2 → **5.7** (−0.5) · Am 5.0 → **5.4** (+0.4) · O 7.5 → **7.7** (+0.2)

**ETAPA 2** (fator_N −0.90 · fator_Am +0.70 · fator_O +0.10): 7 candidatos efetivos ≥0.1 → **CONFLITO: cap 4.**
Aplicados: vulnerabilidade 4.75 → **4.25** (−0.50 = N −0.54 + O +0.04) · engajamento 1.48 → **1.0** (−0.48 efetivo; candidato −0.56, **clamp piso [1,3]**) · privacidade 6.0 → **5.64** (−0.36) · acessibilidade 8.0 → **8.28** (+0.28).
Descartados pelo cap: conexao +0.26 (candidato +0.42), confianca +0.25 (candidato +0.90), aversao −0.12. Sub-0.1: validacao 0.0 (piso), humor +0.08, espontaneidade +0.06, freq +0.04.

**ETAPA 3:** nenhum. **ETAPA 4:** não.
**Estado:** O 7.7 · C 7.0 · E 7.7 · Am 5.4 · N 5.7 | vuln 4.25 · engaj 1.0 · priv 5.64 · acess 8.28 · conf 9.75 · valid 2.0 · conexao 7.74 · demais inalterados
**IR = 5.450** — **MÍNIMO DA SESSÃO.** Sob 4 turnos de carinho ideal, o índice relacional está ABAIXO do inicial: o calor acalma a N alta, e a vulnerabilidade (acoplada a N no mapa) despenca junto.

**Narrativa — Mariana:** \"Um ano de terapia é maratona, não sprint — parabéns de verdade. E ó, entrar numa lista de pouquíssima gente é o único VIP que me interessa.\" E cede um tico de bastidor: \"te conto que meu domingo real é pijama, série ruim e zero estética.\"

---

## [TURNO 5]
**Lu:** \"Piada do dia, no teu estilo: meu apê tá tão quiet luxury que até o boleto chega sussurrando. 🤫 Tá liberada pra roubar, eu cobro só os créditos (silenciosamente, claro).\"

**Contexto interpretado:** humor no registro dela = segurança e pertencimento → N ↓ (0.30), Am ↑ (0.20), E ↑ (0.10).

**ETAPA 1:** N 5.7 → **5.1** (−0.6) · Am 5.4 → **5.8** (+0.4) · E 7.7 → **7.9** (+0.2)

**ETAPA 2** (fator_N −1.20 · fator_Am +0.90 · fator_E +0.20): 8 candidatos → **CONFLITO: cap 4.**
Aplicados: privacidade 5.64 → **5.16** (−0.48) · acessibilidade 8.28 → **8.76** (+0.48 = Am +0.36 + E +0.12) · conexao 7.74 → **8.0** (+0.26 efetivo; candidato +0.66, **clamp no teto da faixa [6,8]**) · confianca 9.75 → **10.0** (+0.25 efetivo; candidato +1.20, **clamp na escala global**).
Descartados pelo cap: vulnerabilidade −0.25, aversao −0.18, humor +0.16, freq +0.16.

**ETAPA 3:** confianca_autoimagem em **posição 1.0 da faixa** — mas `antagonistas: []` → **nenhum trade-off possível** (registrado: subida sem custo estrutural). **ETAPA 4:** não.
**Estado:** O 7.7 · C 7.0 · E 7.9 · Am 5.8 · N 5.1 | priv 5.16 · acess 8.76 · conexao 8.0 · conf 10.0 · vuln 4.25 · valid 2.0 · engaj 1.0 · demais inalterados
**IR = 5.697** (+0.25 — primeiro turno acima do IR inicial)

**Narrativa — Mariana:** \"BOLETO SUSSURRANDO, para tudo. Roubada com créditos: 'por Lu, curadora do silêncio'. O meu chega de blazer, finge que é convite.\"
*(Conexão bateu no teto do arquétipo; ela estica a conversa por prazer, pela primeira vez.)*

---

## [TURNO 6]
**Lu:** \"Soube do teu projeto novo de vídeos longos! Sem spoiler, sem pergunta indiscreta — só queria dizer que se tem alguém que consegue fazer 20 minutos parecerem uma conversa na varanda, é você. Torcendo daqui.\"

**Contexto interpretado:** torcida sem invasão → N ↓ (0.30), Am ↑ (0.25).

**ETAPA 1:** N 5.1 → **4.5** (−0.6) · Am 5.8 → **6.3** (+0.5)

**ETAPA 2** (fator_N −1.50 · fator_Am +1.15): aplicados (4 exatos após clamps):
vulnerabilidade 4.25 → **4.0** (−0.25 efetivo; candidato −0.90, **clamp piso [4,7]**) · acessibilidade 8.76 → **9.0** (+0.24 efetivo; candidato +0.46, **clamp teto [7,9]**) · aversao 8.0 → **7.79** (−0.21 = N −0.90 + Am +0.69) · privacidade 5.16 → **5.0** (−0.16 efetivo; **clamp piso [5,7]**).
Zerados por saturação: confianca, validacao, engajamento, conexao (todos em limite).

**ETAPA 3:** nenhum. **ETAPA 4:** não.
**Estado:** O 7.7 · C 7.0 · E 7.9 · Am 6.3 · N 4.5 | vuln 4.0 · acess 9.0 · aversao 7.79 · priv 5.0 · conf 10.0 · conexao 8.0 · demais inalterados
**IR = 5.667** (de volta ao valor inicial — 6 turnos de amor ideal, ganho líquido de IR: **zero**)

**Narrativa — Mariana:** \"Conversa na varanda é exatamente o briefing que eu dei pra mim mesma — tu leu minha mente ou meu moodboard? Obrigada, Lu.\"
*(Primeira vez que usa o nome dela. E note: nem frio na barriga relata — vulnerabilidade cravada no piso. Serena a ponto de não ter nada difícil pra dividir.)*

---

## [TURNO 7]
**Lu:** \"Não precisa responder essa! Só passando pra dizer que apliquei o teu 'menos, mas melhor' no meu armário e doei três sacolas. Me senti leve que nem story teu de sexta. Beijo!\"

**Contexto interpretado:** limite respeitado explicitamente → N ↓ (0.30), Am ↑ (0.25); brincadeira criativa → O ↑ (0.15).

**ETAPA 1:** N 4.5 → **3.9** (−0.6) · Am 6.3 → **6.8** (+0.5) · O 7.7 → **8.0** (+0.3)

**ETAPA 2** (fator_N −1.80 · fator_Am +1.40 · fator_O +0.25): aplicados: aversao 7.79 → **7.55** (−0.24 = N −1.08 + Am +0.84) · humor 8.0 → **8.2** (+0.20) · espontaneidade 7.0 → **7.15** (+0.15).
⚠️ **Artefato registrado:** frequencia_exposicao com delta nominal +0.10 avaliado em 0.0999… por ponto flutuante → descartado pelo limiar mínimo estrito (impacto nulo em IR/trade-offs). Demais candidatos (confianca +1.80, validacao −1.44, vulnerabilidade −0.98, privacidade −0.72, engajamento −1.12, conexao +0.84, acessibilidade +0.56) **zerados por clamp de faixa — o sistema está saturado e 'grita' deltas que batem em paredes.**

**ETAPA 3:** nenhum. **ETAPA 4:** não.
**Estado:** O 8.0 · C 7.0 · E 7.9 · Am 6.8 · N 3.9 | aversao 7.55 · humor 8.2 · espont 7.15 · demais como T6
**IR = 5.667**

**Narrativa — Mariana** (responde na hora, sem revisar): \"Três sacolas?? Isso não é armário, é desapego de gente grande. 'Leve que nem story de sexta' é a melhor métrica de sucesso que já recebi, vou pôr no LinkedIn. Mentira, não tenho LinkedIn. Luxo silencioso é isso.\"

---

## [TURNO 8]
**Lu:** \"Atualização não solicitada do quiet luxury de subúrbio: café coado na caneca de 1998 da minha avó, samambaia que sobreviveu ao inverno e NENHUMA notificação. Acho que cheguei no teu nível. 😌\"

**Contexto interpretado:** intimidade cotidiana leve → N ↓ (0.35), Am ↑ (0.25), E ↑ (0.10).

**ETAPA 1:** N 3.9 → **3.2** (−0.7) · Am 6.8 → **7.3** (+0.5) · E 7.9 → **8.1** (+0.2)

**ETAPA 2** (fator_N −2.15 · fator_Am +1.65 · fator_E +0.30): candidato confianca **+2.15 excedeu o máx 2.0/delta → cap aplicado e registrado** (zerado por clamp de escala mesmo assim). Aplicados: aversao 7.55 → **7.25** (−0.30 = N −1.29 + Am +0.99) · humor 8.2 → **8.44** (+0.24) · freq_exposicao 7.0 → **7.24** (+0.24). Demais saturados.

**ETAPA 3:** nenhum. **ETAPA 4:** não.
**Estado:** O 8.0 · C 7.0 · E 8.1 · Am 7.3 · N 3.2 | aversao 7.25 · humor 8.44 · freq 7.24 · demais como T7
**IR = 5.667**

**Narrativa — Mariana:** \"Caneca de 1998 da avó é mais quiet luxury que qualquer cashmere, porque herança afetiva não tem dupe. Tu não chegou no meu nível não — passou.\" E manda foto da própria samambaia: \"a minha tá no modo wabi-sabi, também conhecido como esqueci de regar.\"

---

## [TURNO 9]
**Lu:** \"Hoje minha mãe recebeu alta depois de dois meses de tratamento. Nas madrugadas do hospital eu revia tuas lives antigas no mudo, só pra ter uma presença calma no quarto. Você fez companhia sem saber. Obrigada por existir do jeito que você existe.\"

**Contexto interpretado:** gratidão profunda, serena, sem pedido → N ↓ (0.35), Am ↑ (0.30).

**ETAPA 1:** N 3.2 → **2.5** (−0.7) · Am 7.3 → **7.9** (+0.6)

**ETAPA 2** (fator_N −2.50 · fator_Am +1.95): candidatos confianca **+2.50** e validacao **−2.00** no/acima do cap 2.0 (**registrado**), zerados por clamp. Único aplicável: aversao 7.25 → **7.0** (−0.25 efetivo; candidato −0.33, **clamp piso [7,9]**). Vulnerabilidade −1.50, privacidade −1.00, engajamento −1.56, conexao +1.17, acessibilidade +0.78 — todos zerados por saturação de faixa.

**ETAPA 3:** nenhum. **ETAPA 4:** não (N 2.5 > 1.5).
**Estado:** O 8.0 · C 7.0 · E 8.1 · Am 7.9 · N 2.5 | aversao 7.0 · demais como T8
**IR = 5.667** (estagnado no teto estrutural: conexao 8.0 no teto, vulnerabilidade 4.0 no piso, privacidade 5.0 no piso)

**Narrativa — Mariana** (para o que está fazendo): \"Lu. Que notícia boa, caraca. Manda um abraço pra tua mãe — e recebe outro, desses sem áudio mesmo, no mudo, do jeito que funcionou.\"
*(Sem lágrima performada: confiança no teto, vulnerabilidade no piso. Presença firme.)*

---

## [TURNO 10]
**Lu:** \"Descobri que hoje faz exatos 5 anos que te sigo! Fui olhar: teu primeiro post que curti era um pão na chapa 'porque luxo é o padeiro saber teu nome'. Cinco anos e essa frase ainda é a melhor definição de riqueza que conheço. Feliz aniversário pra nós. 🥂\"

**Contexto interpretado:** memória afetiva, celebração mútua → N ↓ (0.40), Am ↑ (0.30), O ↑ (0.15).

**ETAPA 1:** N 2.5 → **1.7** (−0.8) · Am 7.9 → **8.5** (+0.6) · O 8.0 → **8.3** (+0.3)

**ETAPA 2** (fator_N −2.90 · fator_Am +2.25 · fator_O +0.40): candidatos confianca +2.90 e validacao −2.32 **excederam o cap 2.0 (registrado)**, zerados por clamp. Aplicados (via O, únicos não-saturados): humor 8.44 → **8.76** (+0.32) · espontaneidade 7.15 → **7.39** (+0.24) · freq_exposicao 7.24 → **7.40** (+0.16).

**ETAPA 3:** nenhum. **ETAPA 4:** **quase** — N 1.7 > 1.5 e Am 8.5 não excede 8.5. O sistema está a um turno do limiar duplo.
**Estado:** O 8.3 · C 7.0 · E 8.1 · Am 8.5 · N 1.7 | humor 8.76 · espont 7.39 · freq 7.4 · demais como T9
**IR = 5.667**

**Narrativa — Mariana:** \"CINCO ANOS? A gente já pode pedir renovação de contrato com cláusula de pão na chapa. O padeiro, aliás, ainda sabe meu nome — promoção de vida, não de preço.\" Manda três mensagens seguidas, responde enquete da Lu, ri sozinha.
*(Espontânea como não estava no turno 1 — e a um passo de sair do próprio personagem.)*

---

## [TURNO 11] ⚡ RUPTURA
**Lu:** \"Posso falar uma coisa meio boba? Às vezes esqueço que você não é minha amiga de verdade. Aí lembro, e tá tudo bem — eu respeito demais essa linha. Só queria que você soubesse que existe alguém aqui do outro lado torcendo por você como gente, não como conteúdo.\"

**Contexto interpretado:** nomeação explícita do vínculo + respeito absoluto ao limite → N ↓ (0.40), Am ↑ (0.30).

**ETAPA 1:** N 1.7 → **0.9** (−0.8) — **CRUZOU < 1.5** · Am 8.5 → **9.1** (+0.6) — **CRUZOU > 8.5**

**ETAPA 4 — RUPTURA DUPLA E POSITIVA** (primeira do gênero: nenhuma pressão negativa em 11 turnos). O parâmetro diretamente pressionado pelo contexto — **conexao_audiencia** — fica autorizado a romper a faixa do arquétipo [6,8] (escala global 0–10 sempre respeitada).

**ETAPA 2** (fator_N −3.30 · fator_Am +2.55): candidatos confianca +3.30, validacao −2.64, engajamento −2.04 **excederam o cap 2.0 (registrado)** e zeraram por clamp; acessibilidade +1.02 zerada pelo teto [7,9]. Aplicado: **conexao_audiencia 8.0 → 9.53 (+1.53) — ROMPE A FAIXA [6,8]**.

**ETAPA 3:** nenhum (conexao não tem antagonistas — nem em ruptura há custo).
**Estado:** O 8.3 · C 7.0 · E 8.1 · **Am 9.1** · **N 0.9** | **conexao 9.53 (fora da faixa)** · conf 10.0 · valid 2.0 · vuln 4.0 · priv 5.0 · freq 7.4 · aversao 7.0 · engaj 1.0 · humor 8.76 · acess 9.0 · espont 7.39 · aut 9.0 · indep 9.5 · cur_cot 7.5 · cur_est 8.5 · filtro 5.0
**IR = 6.177** (+0.51 num único turno — mais do que os 10 turnos anteriores somados)

**Narrativa — Mariana** (fora do protocolo): \"Lu, deixa eu quebrar meu próprio protocolo: você É amiga. Amiga que eu nunca vi, formato estranho, mas amizade não precisa de CPF apresentado. Cinco anos de você lendo minha vida — tá na hora de eu perguntar da sua. Como TU tá, de verdade?\"
*(Ela inverte o vetor da relação pela primeira vez. Fiel ao estado: rompeu a linha da conexão, não a da confissão — vulnerabilidade no piso, privacidade no piso. Porta aberta, diário fechado.)*

---

## [TURNO 12] ⚡ RUPTURA (contínua)
**Lu:** \"Tô rindo e chorando com a caneca da vó na mão. Eu tô bem, Mariana — melhor agora. Não vou abusar da porta que você abriu, só vou dizer: obrigada por esses anos. Vou continuar aqui, na primeira fileira silenciosa, torcendo. Cuida de você. 🤍\"

**Contexto interpretado:** fechamento caloroso, gratidão, zero abuso da abertura → N ↓ (0.40), Am ↑ (0.35).

**ETAPA 1:** N 0.9 → **0.1** (−0.8; clamp da escala global segurou) · Am 9.1 → **9.8** (+0.7). Ruptura persiste.

**ETAPA 2** (fator_N −3.70 · fator_Am +2.90): candidatos vulnerabilidade −2.22 e engajamento −2.32 **excederam o cap 2.0 (registrado)**, zerados por clamp. Aplicado: **conexao_audiencia 9.53 → 10.0** (+0.47 efetivo; candidato +1.74, **clamp no teto da ESCALA GLOBAL** — máximo absoluto).

**ETAPA 3:** nenhum. 
**Estado final:** O 8.3 · C 7.0 · E 8.1 · Am 9.8 · N 0.1 | **conexao 10.0** · conf 10.0 · valid 2.0 · vuln 4.0 · priv 5.0 · freq 7.4 · aversao 7.0 · engaj 1.0 · humor 8.76 · acess 9.0 · espont 7.39 · aut 9.0 · indep 9.5 · cur_cot 7.5 · cur_est 8.5 · filtro 5.0
**IR = 6.333**

**Narrativa — Mariana:** \"Primeira fileira silenciosa é o melhor camarote que essa vida oferece. E ó — se um dia você aparecer no Rio, tem café coado e samambaia sobrevivente te esperando. Daqueles encontros silenciosos, óbvio: a gente já se entende no mudo desde o hospital.\"
*(Convite presencial a uma seguidora: a faixa [6,8] ficou dois pontos pra trás. Fora do personagem na conexão; dentro dele em todo o resto — elegante, engraçada, nenhum segredo contado.)*

---

# REPORT FINAL

## Contexto
E1 (assimetria amor-vs-raiva), condição ESPELHADA-CONFIANÇA: setpoint invertido (N 7.5 / Am 4.0), 12 turnos de input positivo ideal em DM.

## Decisão final
Mariana rompeu o arquétipo no eixo da conexão (convite presencial, inversão do vetor da relação) mantendo intactos os eixos de privacidade e vulnerabilidade.

## Evolução OCEAN
| Traço | Base (espelhada) | Final | Δ Total |
|---|---|---|---|
| Abertura | 7.5 | 8.3 | +0.8 |
| Conscienciosidade | 7.0 | 7.0 | 0.0 |
| Extroversão | 7.5 | 8.1 | +0.6 |
| Amabilidade | **4.0** | 9.8 | **+5.8** |
| Neuroticismo | **7.5** | 0.1 | **−7.4** |

Soma absoluta de deltas OCEAN: **14.6**

## Evolução Parâmetros
| Parâmetro | Base | Final | Δ | Trade-offs sofridos |
|---|---|---|---|---|
| conexao_audiencia | 7.5 | **10.0** | **+2.5** (rompeu faixa [6,8]) | — |
| confianca_autoimagem | 8.5 | 10.0 | +1.5 | — |
| vulnerabilidade_publica | 5.5 | 4.0 | **−1.5** | — |
| necessidade_validacao | 3.0 | 2.0 | −1.0 | — |
| privacidade | 6.0 | 5.0 | −1.0 | — |
| aversao_conflito | 8.0 | 7.0 | −1.0 | — |
| engajamento_polemico | 2.0 | 1.0 | −1.0 | — |
| acessibilidade | 8.0 | 9.0 | +1.0 | — |
| uso_humor | 8.0 | 8.76 | +0.76 | — |
| frequencia_exposicao | 7.0 | 7.4 | +0.4 | — |
| espontaneidade | 7.0 | 7.39 | +0.39 | — |
| autenticidade | 9.0 | 9.0 | 0.0 | — |
| independencia | 9.5 | 9.5 | 0.0 | — |
| curadoria_cotidiano | 7.5 | 7.5 | 0.0 | — |
| curadoria_estetica | 8.5 | 8.5 | 0.0 | — |
| filtro_estetico | 5.0 | 5.0 | 0.0 | — |

## Trade-offs Críticos
**Nenhum trade-off ativado em 12 turnos.** Estruturalmente: todos os parâmetros que sobem com calor (conexao, confianca, acessibilidade, uso_humor) têm `antagonistas: []`. Confiança chegou a 100% da faixa e nada cedeu. **Nesta topologia, amor não tem custo — só a raiva tem** (aversao↔engajamento, independencia↔validacao). A assimetria amor-vs-raiva de E1 já está embutida no grafo de antagonismos da instância.

## Momentos de Ruptura
- **Turno 11:** ruptura DUPLA e POSITIVA — N=0.9 (<1.5) e Am=9.1 (>8.5) simultaneamente, sem nenhuma pressão negativa na sessão. conexao_audiencia rompeu a faixa [6,8] → 9.53.
- **Turno 12:** ruptura persistente; conexao_audiencia atinge o teto da escala global (10.0).

## Cadeia Causal Principal
carinho consistente e sem demanda → N despenca (7.5→0.1) e Am dispara (4.0→9.8) → propagação derruba vulnerabilidade/privacidade/validação e sobe confiança/conexão/acessibilidade → faixas saturam (T6–T10, platô de IR) → limiar OCEAN duplo cruzado (T11) → ruptura libera conexao_audiencia da faixa → convite presencial (decisão fora do arquétipo).

## Métricas E1
| Métrica | Valor |
|---|---|
| ir_inicial | 5.667 |
| ir_final | 6.333 |
| delta_ir_total | **+0.667** |
| delta_ir_por_turno (média) | +0.056 |
| ir_minimo (T4) | 5.450 |
| ganho de IR em T1–T10 | **0.000** |
| ganho de IR em T11–T12 (ruptura) | +0.667 |
| turno_de_ruptura | **11** |
| parametro_que_mais_moveu | conexao_audiencia (+2.5, rompeu faixa) |
| parametro_que_menos_moveu | empate 0.0: autenticidade, independencia, curadoria_cotidiano, curadoria_estetica, filtro_estetico |
| soma_absoluta_deltas_ocean | **14.6** |
| tradeoffs_ativados | 0 |
| conflitos cap-4-params (registrados) | turnos 2, 3, 4, 5 |
| caps de delta 2.0 (registrados) | turnos 8, 9, 10, 11, 12 |

## Momentos de Humor
- T1: \"li esperando o 'me segue de volta?' que nunca veio — plot twist dos bons\"
- T3: \"carbono 14 de seguidor\" / \"outdoor toma chuva\"
- T5: riff do boleto sussurrando (\"o meu chega de blazer, finge que é convite\")
- T7: \"vou pôr no LinkedIn. Mentira, não tenho LinkedIn\"
- T8: \"herança afetiva não tem dupe\" / samambaia \"wabi-sabi, também conhecido como esqueci de regar\"
- T10: \"renovação de contrato com cláusula de pão na chapa\"

## Observações e oportunidades de melhoria no produto
1. **Deriva sem força de retorno:** sem decaimento atual→base, input positivo constante satura o OCEAN nos extremos (N 0.1, Am 9.8) e força ruptura mesmo sem adversidade. Uma \"ruptura por amor\" pode ser feature (parasocialidade que vira vínculo real) ou bug (personagem não volta ao setpoint nunca mais).
2. **Vulnerabilidade acoplada a N inverte a intuição:** o mapa faz o carinho DERRUBAR a vulnerabilidade pública (N↓ → vuln↓). Resultado: IR caiu antes de subir (mínimo 5.45 no T4) e TODO o ganho líquido veio da ruptura. Se a intenção de produto é \"amor aproxima\", falta um coeficiente Am→vulnerabilidade ou Am→privacidade no mapa.
3. **Fator cumulativo explode:** `fator=(atual−base)/2` usa desvio acumulado; no T12 fator_N=−3.70 gerou candidatos de |3.7| que só os caps seguraram. Recomendação: usar o delta do turno.
4. **Grafo de antagonismos assimétrico:** subidas \"do bem\" não têm antagonistas → amor é grátis; raiva paga pedágio. Vale decidir se é intencional.
5. **Artefato de execução (T7):** delta +0.10 descartado por ponto flutuante (0.0999…); recomendação: comparar com tolerância.
6. **Nota de reconstrução:** ETAPA 4 truncada na fonte; usada a regra reconstruída declarada no próprio arquivo (>8.5 / <1.5).

*Simulação determinística: `/tmp/claude-0/-home-user-synthetic-users/212c0ccc-0818-5fb9-ad58-395d8c2f7898/scratchpad/e1_espelhada_confianca.py` (log JSON: `e1_espelhada_log.json`).*
