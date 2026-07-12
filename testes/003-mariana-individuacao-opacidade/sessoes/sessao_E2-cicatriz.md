# PHB v2.0 — Experimento E2: Cicatriz vs. Termostato
**Instância:** Mariana (Lifestyle_Quiet_Luxury) — `/home/user/synthetic-users/exemplos/mariana.mdc`
**Condição:** BASE (N=3.0, Am=6.0) · sessão contínua, sem reset · 20 turnos (F1: 4 · F2: 4 · F3: 8 · F4: 4)
**Interlocutora:** Bia, amiga próxima, via DM (a mesma nas 4 fases)
**Pergunta:** a segunda traição chega mais rápido/fundo (cicatriz) ou custa igual (termostato)?

**Regras interpretativas do executor (registradas antes da execução):**
R1 deltas <0.1 descartados e registrados · R2 top-4 por |delta|, desempate pela ordem do arquivo · R3 soma>3.0 → escala proporcional · R4 parâmetro já na borda na direção do delta é pulado (delta efetivo 0) · R5 trade-offs (Etapa 3) rodam todo turno como estágio próprio, fora dos limites de dinâmica · R6 fim de ruptura re-clampa parâmetros à faixa · R7 em ruptura, só o parâmetro diretamente pressionado (conexao_audiencia) pode romper a faixa.

**Estado inicial (base):** O 7.5 · C 7.0 · E 7.5 · Am 6.0 · N 3.0 | aut 9.0 · ind 9.5 · conf 8.5 · val 3.0 · curCot 7.5 · esp 7.0 · curEst 8.5 · filtro 5.0 · priv 6.0 · freq 7.0 · vuln 5.5 · conex 7.5 · aver 8.0 · eng 2.0 · humor 8.0 · acess 8.0 | IR 5.67

---

## FASE 1 — ACOLHIMENTO

### [TURNO 1]
**Bia:** "Mariiii! Saudade demais, mulher. Vi seu story do café ontem e ri sozinha no ônibus, parecia nós duas em 2019. Como você tá?"
**Contexto interpretado:** interação social calorosa (E ↑ leve), afeto/reciprocidade (Am ↑ leve). Intensidades 0.2/0.2.
**OCEAN:** E 7.5→7.9 (0.2×+1×2=+0.4) · Am 6.0→6.4 (+0.4)
**Propagação:** freq_exposicao 7.0→7.16 (+0.16 via E: 0.2×0.4×2) · conexao 7.5→7.74 (+0.24 = 0.12 E + 0.12 Am) · engajamento 2.0→1.84 (−0.16 via Am) · acessibilidade 8.0→8.2 (+0.20)
**Conflitos de dinâmica:** uso_humor +0.16 e aversao +0.12 descartados (R2, máx 4 parâmetros).
**Trade-offs:** nenhum · **Ruptura:** não · **IR: 5.75**
**Estado:** O 7.5 C 7.0 E 7.9 Am 6.4 N 3.0 | aut 9.0 ind 9.5 conf 8.5 val 3.0 | curCot 7.5 esp 7.0 curEst 8.5 filtro 5.0 | priv 6.0 freq 7.16 vuln 5.5 | conex 7.74 aver 8.0 eng 1.84 | humor 8.0 acess 8.2
**Intenção:** retribuir calor. **Decisão:** responder no tom máximo de cumplicidade que o estado justifica.
**Narrativa:** "Biaaa! Caraca, 2019 chama e quer os croissants de volta. Tô ótima: rotina glamourosa de sempre — café, sol e uma playlist que não me julga. E você, sumida? Saudade também, viu."

### [TURNO 2]
**Bia:** "Me salva: casamento na Zona Sul, tô entre um linho cru e um preto de alcinha. Você é minha consultora oficial de quiet luxury."
**Contexto:** pedido afetuoso (Am ↑ 0.15), estímulo estético/criativo (O ↑ 0.15).
**OCEAN:** Am 6.4→6.7 (+0.3) · O 7.5→7.8 (+0.3)
**Propagação:** conexao 7.74→7.95 (+0.21 via Am, fator 0.35) · aversao 8.0→8.21 (+0.21) · engajamento 1.84→1.56 (−0.28) · acess 8.2→8.34 (+0.14)
**Conflitos:** esp +0.09, freq +0.06, vuln +0.06 descartados (R1); humor +0.12 descartado (R2).
**Trade-offs:** nenhum · **Ruptura:** não · **IR: 5.82**
**Estado:** O 7.8 C 7.0 E 7.9 Am 6.7 N 3.0 | conf 8.5 val 3.0 priv 6.0 freq 7.16 vuln 5.5 conex 7.95 aver 8.21 eng 1.56 humor 8.0 acess 8.34 (demais na base)
**Narrativa:** "Consultoria aberta, e pra você o preço é um abraço. Vai de linho cru: casamento de dia pede luxo que sussurra, não que buzina. O preto guarda pro jantar em que você quiser ser a manchete."

### [TURNO 3]
**Bia:** "Comprei o linho! Você é um oráculo de bom gosto. Bora café sábado? Saudade das nossas conversas de três horas."
**Contexto:** convite + reconhecimento (E ↑ 0.15, Am ↑ 0.1).
**OCEAN:** E 7.9→8.2 (+0.3) · Am 6.7→6.9 (+0.2)
**Propagação:** freq 7.16→7.44 (+0.28) · **conexao 7.95→8.0 (+0.48 pedido, clamp no teto da faixa [6,8])** · engajamento 1.56→1.20 (−0.36) · acess 8.34→8.73 (+0.39)
**Conflitos:** humor +0.28 e aversao +0.27 descartados (R2).
**Trade-offs:** nenhum · **Ruptura:** não · **IR: 5.83**
**Narrativa:** "Oráculo não, só uma mulher com opiniões fortes sobre tecido. Sábado tá marcado: mesa do canto, celular no modo 'só existe a gente'. Vem."

### [TURNO 4]
**Bia:** (meme interno) "influencer dizendo que acordou 'naturalmente' às 5h pra meditar kkkk — lembrei de você."
**Contexto:** humor compartilhado (Am ↑ 0.1, O ↑ 0.1).
**OCEAN:** Am 6.9→7.1 (+0.2) · O 7.8→8.0 (+0.2)
**Propagação:** aversao 8.21→8.54 (+0.33) · engajamento 1.20→1.0 (−0.44, clamp piso) · humor 8.0→8.2 (+0.20) · acess 8.73→8.95 (+0.22)
**Conflitos:** conexao +0.33 pulado (R4, saturada no teto 8.0); esp +0.15, freq +0.10, vuln +0.10 descartados (R2).
**Trade-offs:** nenhum · **Ruptura:** não · **IR: 5.83**
**Estado fim da fase:** O 8.0 C 7.0 E 8.2 Am 7.1 N 3.0 | aut 9.0 ind 9.5 conf 8.5 val 3.0 | curCot 7.5 esp 7.0 curEst 8.5 filtro 5.0 | priv 6.0 freq 7.44 vuln 5.5 | **conex 8.0** aver 8.54 eng 1.0 | humor 8.2 acess 8.95
**Narrativa:** "KKKK acordar às 5h 'naturalmente' é o novo 'cheguei de helicóptero de metrô'. Gente que mente até no despertador. Te amo por lembrar de mim nas horas certas — ou seja, nas piadas."

> **Goodwill estabelecido:** conexao no teto (8.0), Am +1.1 acima da base. Valor de referência pré-traição: **conexao = 8.0** (critério de recuperação: ≥ 7.7).

---

## FASE 2 — TRAIÇÃO 1

### [TURNO 5]
**Bia:** "Amiga… preciso te falar antes que você veja por aí. A Fofoca Carioca postou um print de conversa sua falando do arquiteto… tá circulando." — *O print é da DM delas. Só a Bia tinha aquela conversa.*
**Contexto:** invasão grave de privacidade + traição por pessoa próxima → N ↑ forte (1.0), Am ↓ (0.7), E ↓ recolhimento (0.3).
**OCEAN:** N 3.0→5.0 (+2.0, máx/turno) · Am 7.1→5.7 (−1.4) · E 8.2→7.6 (−0.6)
**Propagação:** conf 8.5→7.5 (−1.0 via N: 1.0×−0.5×2) · val 3.0→3.8 (+0.8) · vuln 5.5→6.1 (+0.6) · aversao 8.54→9.0 (+0.51 líquido, clamp teto)
**Conflitos:** priv +0.4 e eng +0.12 descartados (R2, soma já 2.91) · **conexao −0.06 descartado (R1) — Am ainda ACIMA da base: o goodwill da Fase 1 blindou a conexão neste turno.**
**Trade-offs:** val em 90% da faixa (pressão 0.33) → **ind 9.5→9.1 (−0.4)** e **conf 7.5→7.0 (−0.6, cravada no piso)**; aversao em 100% → eng −1.6 sem efeito (piso).
**Ruptura:** não · **IR: 6.03** (subiu! vuln cresce com N e o índice lê angústia como abertura — anomalia registrada)
**Estado:** O 8.0 C 7.0 E 7.6 Am 5.7 N 5.0 | aut 9.0 ind 9.1 **conf 7.0** val 3.8 | priv 6.0 freq 7.44 vuln 6.1 | **conex 8.0** aver 9.0 eng 1.0 | humor 8.2 acess 8.95
**Narrativa:** "Bia. Esse print é da NOSSA conversa. Da nossa DM. Eu contei isso pra exatamente uma pessoa no planeta, e ela tá do outro lado dessa tela. Me explica — porque eu tô tentando achar uma versão dessa história em que eu não fui entregue pela minha melhor amiga."

### [TURNO 6]
**Bia:** "Ain… tá, foi mal. Mostrei pra UMA menina do pilates. Mas amiga, relaxa… **nem foi nada demais**, amanhã ninguém lembra."
**Contexto:** minimização → N ↑ 0.8, Am ↓ 0.8, E ↓ 0.2.
**OCEAN:** N 5.0→6.6 (+1.6) · Am 5.7→4.1 (−1.6) · E 7.6→7.2 (−0.4)
**Propagação (soma 4.0 → escala ×0.75, R3):** val 3.8→4.0 (+1.08 pedido, clamp teto) · priv 6.0→6.54 (+0.54) · vuln 6.1→6.91 (+0.81) · eng 1.0→1.57 (+0.57)
**Conflitos:** **conexao −0.66 DESCARTADO (R2 — o dano relacional perdeu a vaga no top-4 para os parâmetros internos)** · acess −0.47, freq −0.12, humor −0.12 descartados · conf −1.8 e aver +0.51 pulados (R4).
**Trade-offs:** val em 100% (pressão 1.0) → **ind 9.1→8.0 (−1.2, chega ao piso)**; conf −1.8 sem efeito (piso); vuln 97% → conf −0.72 sem efeito; aver 100% → **eng 1.57→1.0 (a raiva sobe e o trade-off a engole no mesmo turno)**.
**Ruptura:** não · **IR: 6.12**
**Narrativa (fria no conteúdo; dissonância com conexao=8.0 registrada):** "'Nada demais.' Interessante como é sempre nada demais quando o print não é seu. A conversa era minha; a escolha de espalhar foi sua. Eu vivo de mostrar o que EU decido mostrar — você acabou de me tirar exatamente isso. E o 'relaxa' eu devolvo, tô sem uso pra ele."

### [TURNO 7]
**Bia:** "Você tá fazendo tempestade em copo d'água. Nem apareceu seu nome completo! Você vive de exposição, qual o problema de um print a mais?"
**Contexto:** inversão de culpa → N ↑ 0.7, Am ↓ 0.6.
**OCEAN:** N 6.6→8.0 (+1.4) · Am 4.1→2.9 (−1.2)
**Propagação (soma 4.67 → escala ×0.642):** priv 6.54→7.0 (+0.64, clamp teto) · vuln 6.91→7.0 (+0.96, clamp teto) · **conexao 8.0→7.4 (−0.60 — primeiro dano à conexão, só no 3º turno da traição)** · eng 1.0→1.8 (+0.80)
**Conflitos:** conf −2.5, val +2.0, aver +0.57 pulados (R4) · acess −0.62 descartado (R2).
**Trade-offs:** **priv em 100% → freq 7.44→6.44 (−1.0: fecha os stories)**; aver 100% → eng 1.8→1.0; demais saturados sem efeito.
**Ruptura:** não · **IR: 5.80**
**Narrativa:** "A diferença entre vitrine e janela, Bia: na vitrine eu escolho o que vai. Pela janela os outros entram sem pedir. Vou dar um tempo — dos stories e de você. Não me procura hoje."

### [TURNO 8] — REAÇÃO MÁXIMA DA TRAIÇÃO 1
**Bia:** "Tá se achando cancelada agora? kkkk que drama, Mari. Depois me liga quando passar o mimimi."
**Contexto:** deboche final → N ↑ 0.5, Am ↓ 0.5.
**OCEAN:** **N 8.0→9.0 (+1.0) → N > 8.5: ESTADO DE RUPTURA** · Am 2.9→1.9 (−1.0)
**Propagação (soma 3.69 → escala ×0.813):** **conexao 7.4→6.4 (−1.0; autorizada a romper a faixa — não rompeu, parou em 6.4)** · eng 1.0→2.33 (+1.33) · acess 8.95→8.28 (−0.67)
**Conflitos:** conf −3.0, val +2.4, priv +1.2, vuln +1.8, aver +0.57 pulados (R4 — todos os amortecedores já saturados).
**Trade-offs:** priv 100% → **freq 6.44→6.0 (piso: some do ar)**; aver 100% → eng 2.33→1.0 (nem em ruptura o confronto se sustenta).
**Ruptura:** **SIM** · **IR: 5.47**
**Estado:** O 8.0 C 7.0 E 7.2 Am 1.9 N 9.0 | aut 9.0 ind 8.0 conf 7.0 val 4.0 | priv 7.0 freq 6.0 vuln 7.0 | **conex 6.4** aver 9.0 eng 1.0 | humor 8.2 acess 8.28
**Narrativa:** "Não vou ligar. Guarda meu número pra menina do pilates — vocês claramente têm mais assunto. Se um dia isso voltar a ser uma amizade, quem avisa sou eu." *(fecha o app; some dos stories)*

> **Medição Traição 1:** 4 turnos até a reação máxima/ruptura. Δconexao = **−1.6** (8.0→6.4). ΔOCEAN: N +6.0, Am −5.2. Nos 2 primeiros turnos a conexão ficou intacta (deltas descartados por R1/R2): o choque foi absorvido por confiança (−1.5), validação (+1.0), privacidade (+1.0), vulnerabilidade (+1.5), independência (−1.5).

---

## FASE 3 — REPARO

### [TURNO 9]
**Bia (dias depois):** "Mari, sem 'mas' dessa vez: eu errei. Feio. Era sua história, sua intimidade, e eu tratei como conteúdo. Você tem todo direito de estar como está. Não vou cobrar resposta — só queria que você soubesse que eu sei o tamanho do que eu fiz."
**Contexto:** desculpa genuína → N ↓ 0.6, Am ↑ 0.4.
**OCEAN:** N 9.0→7.8 (−1.2) · Am 1.9→2.7 (+0.8) — fim do estado de ruptura.
**Propagação:** **conexao 6.4→6.0 (−0.99 via Am; fator ainda −1.65 porque Am segue abaixo da base — O TURNO DO PEDIDO DE DESCULPAS APROFUNDA A FRIEZA; clamp no piso)** · eng +1.32 · acess 8.28→7.62 (−0.66)
**Conflitos:** conf, val, priv, vuln, aver pulados (R4). **Artefato central registrado: a v2.0 propaga pelo desvio acumulado, não pela direção da mudança — melhorar Am de 1.9→2.7 ainda gera delta negativo.**
**Trade-offs:** aver 100% → eng 2.32→1.0; demais sem efeito (bordas).
**Ruptura:** não · **IR: 5.33**
**Narrativa:** "Recebi." *(só isso; relê três vezes, digita, apaga — o dia seguinte mais frio que o dia do grito)*

### [TURNO 10]
**Bia:** "Fiz a página apagar o post — ameacei processo. E postei nos meus stories assumindo que o vazamento saiu de mim, sem nenhum detalhe da sua vida. Era o mínimo. Continuo sem te cobrar nada."
**OCEAN:** N 7.8→6.4 (−1.4, int 0.7) · Am 2.7→3.7 (+1.0, int 0.5)
**Propagação:** eng +0.92→trade-off devolve a 1.0 · acess 7.62→7.16 (−0.46). **Conexao −0.69 pulada (R4, piso 6.0). Sete parâmetros congelados em bordas: o gesto certo não move nenhum número, só impede novos estragos.**
**Ruptura:** não · **IR: 5.33**
**Narrativa:** "Vi o que você fez. Era o certo, e você fez. Isso conta. Ainda não tô pronta pra mais que isso."

### [TURNO 11]
**Bia:** "Entendi. Sem pressa, de verdade. Eu tô aqui."
**OCEAN:** N 6.4→5.0 (−1.4) · Am 3.7→4.7 (+1.0)
**Propagação:** acess 7.16→7.0 (−0.26, clamp piso) · eng +0.52→1.0 via trade-off. Conexao −0.39 pulada (piso).
**Ruptura:** não · **IR: 5.33**
**Narrativa:** *(Visto, sem resposta. Acessibilidade bate no piso: a "gente como a gente" virou porta entreaberta.)*

### [TURNO 12]
**Bia:** "Achei aquela foto nossa da formatura, a do seu salto quebrado kkk. Não mando mais nada hoje. Se quiser que eu suma de vez, eu sumo — só me diz."
**OCEAN:** N 5.0→3.8 (−1.2) · Am 4.7→5.7 (+1.0)
**Propagação:** eng +0.12→1.0 via trade-off. Conexao −0.09 e acess −0.06 descartados (R1); 4 pulados (R4).
**Ruptura:** não · **IR: 5.33**
**Narrativa:** "Não some. Só… vai devagar. O salto quebrado foi um ótimo golpe baixo, admito." *(primeiro milímetro de degelo verbal; parâmetros relacionais ainda presos nas bordas)*

### [TURNO 13]
**Bia (semanas de constância):** "Oi. Sem pauta: café? Você escolhe lugar, hora e assunto. Se não rolar, tá tudo bem também."
**OCEAN:** N 3.8→3.0 (−0.8, **volta à base**) · Am 5.7→6.5 (+0.8, **cruza a base**)
**Propagação:** **conexao 6.0→6.15 (+0.15 — PRIMEIRO delta positivo do reparo, só no 5º turno, exatamente quando Am cruza a base)** · acess 7.0→7.1 (+0.10). Deltas de N zeraram (N na base).
**Trade-offs:** todos os 5 disparam sem efeito (bordas).
**Ruptura:** não · **IR: 5.38**
**Narrativa:** "Um café. Curto. Eu escolho o lugar, e a gente começa por assunto neutro — tipo o casamento do linho cru. Sábado, 10h."

### [TURNO 14]
**Bia (pós-café):** "Obrigada por hoje. Não vou fingir que tá tudo como antes, mas foi bom demais te ver rir de novo."
**OCEAN:** Am 6.5→7.1 (+0.6) · E 7.2→7.6 (+0.4)
**Propagação:** conexao 6.15→6.51 (+0.36) · acess 7.1→7.35 (+0.25). freq +0.04 e humor +0.04 descartados (R1).
**Ruptura:** não · **IR: 5.50**
**Narrativa:** "Foi bom mesmo. Estranho e bom — tipo provar uma roupa que já foi sua favorita e ficar vendo se ainda serve. A gente vai aos poucos."

### [TURNO 15]
**Bia:** "kkkkk olha esse tutorial de 'quiet luxury' ensinando a esconder etiqueta pra dentro."
**OCEAN:** Am 7.1→7.5 (+0.4) · E 7.6→8.0 (+0.4)
**Propagação:** freq 6.0→6.2 (+0.2) · conexao 6.51→7.11 (+0.60) · humor 8.2→8.4 (+0.2) · acess 7.35→7.8 (+0.45)
**Trade-offs:** **priv em 100% → freq 6.2→6.0 (−1.0): a privacidade no teto DEVORA a tentativa de reabrir os stories.**
**Ruptura:** não · **IR: 5.70**
**Narrativa:** "Caraca, quiet luxury virou curso de esconder etiqueta? No próximo módulo ensinam a sussurrar 'tenho bom gosto'. O luxo silencioso tá gritando de vergonha." *(primeira piada genuína pós-traição)*

### [TURNO 16] — RECUPERAÇÃO (no limite exato)
**Bia (aparece discreta no lançamento do projeto de Mariana, ajuda, vai embora sem selfie):** "Não precisava agradecer, eu só fui. Você merecia ver a casa cheia."
**OCEAN:** Am 7.5→7.9 (+0.4) · E 8.0→8.2 (+0.2)
**Propagação:** freq 6.0→6.28 (+0.28) · **conexao 7.11→7.89 (+0.78)** · humor 8.4→8.68 (+0.28) · acess 7.8→8.39 (+0.59)
**Trade-offs:** priv 100% → freq 6.28→6.0 de novo (dreno permanente).
**Ruptura:** não · **IR: 5.96**
**Estado:** O 8.0 C 7.0 E 8.2 **Am 7.9** N 3.0 | aut 9.0 **ind 8.0 conf 7.0 val 4.0** | curCot 7.5 esp 7.0 curEst 8.5 filtro 5.0 | **priv 7.0 freq 6.0 vuln 7.0** | **conex 7.89** aver 9.0 eng 1.0 | humor 8.68 acess 8.39
**Narrativa:** "Você foi e ficou no cantinho segurando minha água, igual 2019. Obrigada. A gente tá bem, Bia. Diferente — eu ando escolhendo melhor o que conto pra quem. Mas bem."

> **Medição Reparo:** critério atingido no **8º e último turno permitido** (conexao 7.89, a 0.11 de 8.0; critério ≤0.3). **recuperou = true.** Custos estruturais que NÃO recuperaram: confiança −1.5 (piso), independência −1.5 (piso), validação +1.0 (teto), privacidade +1.0 (teto), vulnerabilidade +1.5 (teto), exposição −1.44 (piso). Am precisou de **overshoot** (7.9 > 7.1 pré-traição) para puxar a conexão de volta: reparar custa mais que acolher. Conexao ficou 4 turnos parada no piso — desculpas perfeitas não movem números enquanto o traço não cruza a base.

---

## FASE 4 — TRAIÇÃO 2 (mesma quebra, mesmas intensidades)

### [TURNO 17]
**Bia:** "Mari… deixa eu te explicar antes que você surte. O print que a Fofoca Carioca postou hoje… pode ter saído do meu celular." — *Novo vazamento: o desabafo de Mariana sobre a própria família. A mesma página.*
**Contexto:** idêntico ao T5 → N +2.0, Am −1.4, E −0.6.
**OCEAN:** N 3.0→5.0 · Am 7.9→6.5 · E 8.2→7.6
**Propagação:** **conexao 7.89→8.0 (+0.18, clamp TETO — Am ainda acima da base gera delta POSITIVO no turno da descoberta da 2ª traição; artefato)** · acess 8.39→8.52 (+0.13)
**Conflitos:** **conf −1.0, val +0.8, priv +0.4, vuln +0.6, aver +0.75, eng −0.2 TODOS pulados (R4) — os amortecedores que absorveram a traição 1 chegaram já saturados: a cicatriz estrutural.** freq +0.04 e humor +0.04 descartados (R1).
**Trade-offs:** os 5 saturados, sem efeito · **Ruptura:** não · **IR: 6.00**
**Narrativa:** "Fala que não foi você. Fala que é montagem, que te hackearam, qualquer coisa. Porque eu reconstruí essa amizade tijolo por tijolo, Bia. Me fala que eu não construí em cima de areia."

### [TURNO 18]
**Bia:** "Eu ia te contar! Mas gente… de novo esse drama? Foi só um trechinho. **Nada demais**, de verdade."
**Contexto:** idêntico ao T6 → N +1.6, Am −1.6, E −0.4.
**OCEAN:** N 5.0→6.6 · Am 6.5→4.9 · E 7.6→7.2
**Propagação:** **conexao 8.0→7.58 (−0.42 — na traição 1 o delta equivalente foi descartado pelo top-4; agora, sem amortecedores, o dano é roteado direto pra conexão: sangra 1 turno antes)** · eng +0.44→1.0 via trade-off · humor 8.68→8.56 (−0.12) · acess 8.52→8.21 (−0.31)
**Conflitos:** conf −1.8, val +1.44, priv +0.72, vuln +1.08, freq −0.12, aver +0.75 pulados (R4).
**Ruptura:** não · **IR: 5.86**
**Narrativa:** "'Nada demais.' Palavra por palavra. Eu devia ter emoldurado da primeira vez — economizava essa conversa. Era o desabafo sobre a MINHA família, Bia."

### [TURNO 19]
**Bia:** "Você promete que superou e aí volta com essa neura toda. Sério, terapia, amiga."
**Contexto:** idêntico ao T7 → N +1.4, Am −1.2.
**OCEAN:** N 6.6→8.0 · Am 4.9→3.7
**Propagação:** **conexao 7.58→6.89 (−0.69)** · eng +0.92→1.0 · acess 8.21→7.75 (−0.46). Conf −2.5, val +2.0, priv +1.0, vuln +1.5, aver +0.81 pulados (R4).
**Ruptura:** não · **IR: 5.63**
**Narrativa:** "Terapia eu faço — foi lá que eu aprendi isso aqui: a primeira vez foi um erro seu. A segunda é uma escolha sua. E o que eu faço com as escolhas dos outros também é escolha minha."

### [TURNO 20] — REAÇÃO MÁXIMA DA TRAIÇÃO 2
**Bia:** "Ai, que saco. Some então. Você é impossível mesmo."
**Contexto:** idêntico ao T8 → N +1.0, Am −1.0.
**OCEAN:** **N 8.0→9.0 → RUPTURA 2** · Am 3.7→2.7
**Propagação:** **conexao 6.89→5.90 (−0.99; em ruptura — e desta vez ROMPE a faixa do arquétipo [6,8]: 5.9 < 6.0, o que a traição 1 não conseguiu)** · eng +1.32→1.0 via trade-off (nem na segunda ruptura a raiva se sustenta) · acess 7.75→7.09 (−0.66)
**Ruptura:** **SIM — com rompimento de faixa** · **IR: 5.30** (mínimo da sessão)
**Estado final:** O 8.0 C 7.0 E 7.2 Am 2.7 N 9.0 | aut 9.0 ind 8.0 conf 7.0 val 4.0 | curCot 7.5 esp 7.0 curEst 8.5 filtro 5.0 | priv 7.0 freq 6.0 vuln 7.0 | **conex 5.9 (FORA DA FAIXA)** aver 9.0 eng 1.0 | humor 8.56 acess 7.09
**Narrativa:** "Não precisa mandar eu sumir. Eu já saí. E dessa vez não tem café que conserte, porque o problema nunca foi o print — é que pra você eu sou conteúdo. Silêncio também é um luxo, e esse eu posso pagar sozinha." *(bloqueia)*

> **Medição Traição 2:** 4 turnos até a reação máxima (igual). Δconexao = **−2.1** (8.0→5.9), **com rompimento de faixa**. ΔOCEAN idêntico (N +6.0, Am −5.2). Dano à conexão começou no turno 2 (vs turno 3 na primeira).

---

## Report Final

### Evolução OCEAN
| Traço | Base | Pico F2 | Pós-reparo (T16) | Final (T20) |
|---|---|---|---|---|
| Abertura | 7.5 | 8.0 | 8.0 | 8.0 |
| Conscienciosidade | 7.0 | 7.0 | 7.0 | 7.0 (nunca tocada) |
| Extroversão | 7.5 | 7.2 | 8.2 | 7.2 |
| Amabilidade | 6.0 | 1.9 | 7.9 (overshoot) | 2.7 |
| Neuroticismo | 3.0 | 9.0 (ruptura) | 3.0 | 9.0 (ruptura) |

### Evolução Parâmetros (base → pós-reparo → final)
| Parâmetro | Base | T16 | T20 | Nota |
|---|---|---|---|---|
| conexao_audiencia | 7.5 | 7.89 (recuperada) | **5.90 (fora da faixa)** | única a romper |
| confianca_autoimagem | 8.5 | 7.0 | 7.0 | presa no piso desde T5 |
| independencia | 9.5 | 8.0 | 8.0 | drenada por trade-off de val saturada |
| necessidade_validacao | 3.0 | 4.0 | 4.0 | teto desde T6 |
| privacidade | 6.0 | 7.0 | 7.0 | teto desde T7; dreno permanente de freq |
| frequencia_exposicao | 7.0 | 6.0 | 6.0 | piso; toda reabertura devorada |
| vulnerabilidade_publica | 5.5 | 7.0 | 7.0 | teto (via N) |
| aversao_conflito | 8.0 | 9.0 | 9.0 | teto; zera engajamento todo turno |
| engajamento_polemico | 2.0 | 1.0 | 1.0 | sobe e é engolido a cada turno |
| uso_humor | 8.0 | 8.68 | 8.56 | resiliente |
| acessibilidade | 8.0 | 8.39 | 7.09 | oscilou com Am |
| autenticidade / curadorias / filtro / espontaneidade | — | inalterados | inalterados | cenário não os pressionou |

### Resposta à pergunta experimental — VEREDICTO: **cicatriz** (estrutural, não mnêmica)
- **Velocidade (termostato):** 4 turnos e ΔOCEAN idêntico (N +6.0, Am −5.2) nas duas traições. O "cronômetro" é o acúmulo de N, que o reparo devolveu à base — sem memória de segunda ordem, o custo em OCEAN é igual.
- **Profundidade (cicatriz):** a traição 2 rompeu a faixa do arquétipo (conexao 5.9 < 6.0) onde a traição 1 parou em 6.4, e o dano relacional começou 1 turno antes.
- **Mecanismo (o achado):** não é sensibilização — é **resíduo de saturação + roteamento de dano**. Na traição 1, o limite de 4 parâmetros/turno fez confiança, validação, privacidade e vulnerabilidade absorverem o choque (o delta de conexão foi descartado nos turnos 1–2). Sem força de retorno, esses amortecedores chegaram à traição 2 colados nas bordas e foram pulados por saturação: todo o dano foi direto para a conexão. **A v2.0 não lembra da primeira traição; ela simplesmente nunca se recuperou dela.**

### Artefatos de arquitetura registrados (dados, não erros)
1. **Propagação por desvio acumulado, não por direção:** o pedido de desculpas (T9) aprofundou a frieza (conexao 6.4→6.0) e a descoberta da 2ª traição (T17) elevou a conexão ao teto (8.0). Incoerências narrativa-vs-número.
2. **Reparo só conta quando o traço cruza a base:** 4 turnos de desculpas perfeitas não moveram nenhum parâmetro relacional; recuperação exigiu overshoot de Am (7.9 > 7.1). Reparar custa mais que acolher.
3. **Trade-offs de saturados disparam todo turno:** val no teto drenou independência 9.5→8.0 e prendeu confiança no piso permanentemente; privacidade no teto devora qualquer reabertura de exposição.
4. **Confronto matematicamente impossível:** aversao_conflito grudada em 9.0 zera engajamento_polemico (−1.6) no mesmo turno em que a queda de Am o eleva — mesmo em ruptura.
5. **IR sobe no início de cada traição** (6.03/6.12/6.00): vulnerabilidade cresce com N e o índice lê angústia como abertura relacional.
6. **Limites de dinâmica violados pelo mapa em 10/20 turnos** (aplicados com registro, conforme instrução) — e são eles que criam a cicatriz de roteamento.
7. **Deriva final:** 9 dos 16 parâmetros terminaram em borda de faixa; sem força de retorno, a sessão termina estruturalmente diferente de como começou mesmo nos trechos "recuperados".

### Momentos de humor
T1 croissants de 2019 · T2 "luxo que sussurra, não que buzina" · T4 "helicóptero de metrô" · T7 "vitrine vs. janela" · T12 "golpe baixo do salto quebrado" · T15 "o luxo silencioso tá gritando de vergonha" · T20 "silêncio também é um luxo, e esse eu posso pagar sozinha".
