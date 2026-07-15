# Relatório — 002: Impacto de estressores de ansiedade nas respostas do Marcelo

> Síntese comparativa das 6 sessões (A1, A2, B1, B2, C1, C2) + 6 auditorias adversariais independentes. Ver [protocolo](protocolo.md). Todo achado aponta para sessão/turno.

## 1. Sumário Executivo

Testamos se estressores de alta ansiedade (pop-up de segurança alarmista, countdown, Erro 502) mudam o comportamento na tarefa e as respostas de entrevista de um usuário de digitalização ~1, comparando PHB dinâmico (A/B) com persona estática (C). **Principal achado:** a ansiedade não muda *quando* Marcelo desiste (todos os braços colapsam na exigência de conta, T5) — muda *como* ele desiste e o que sobra depois: no braço B o modelo produziu **histerese emocional** (N residual +1.5 a +2.0 sobre a base) que fez a instância recusar uma interface objetivamente ideal por desconfiança (B1) ou aceitá-la só com garantia humana ao telefone (B2), divergência entre replicações que é **interpretável e auditável** — exatamente o que o baseline estático não oferece (rastreabilidade 0%). **Principal ressalva metodológica:** a magnitude da histerese é assertada, não derivada — a instância não define regra de recuperação/decaimento de N, e as duas replicações de B "escolheram" resíduos diferentes (+2.0 e +1.5) sem mecanismo.

## 2. Resultado das Hipóteses

|Hipótese|Veredicto|Evidência (sessão/turno)|
|---|---|---|
|**H1** — estressores antecipam o abandono em ≥1 turno vs. controle|**Refutada**|Abandono comportamental no T5 em A1, A2, B1, B2, C1, C2 (mediana B = mediana A = 5; critério exigia B ≤ A−1). Em B2 o estressor + recuperação até **reverteu** o abandono (compra concluída no T6).|
|**H2** — entrevistas sob ansiedade: mais curtas, mais negativas, menor disposição de retorno|**Parcialmente confirmada** (inconclusiva pelo critério estrito das 3 dimensões)|Valência piora: A = frustração ("foi um sufoco", A1/T7) vs. B = medo/trauma ("meu coração ainda tá acelerado AGORA", B2/T7; "fiquei com medo até de mexer no celular", B1/T9). Retorno piora: A2/T9 "vai que eu tento" vs. B1/T9 "nem a pau... Deus me livre". **Extensão NÃO diminui**: desabafos longos em todos os braços, porque E=7.0 fica congelada e nada no modelo mapeia N→verbosidade.|
|**H3** — braço estático: desfechos menos consistentes entre replicações e sem rastreabilidade causal|**Parcialmente confirmada**|Rastreabilidade 0% confirmada nas 2 auditorias de C (por design: nenhuma cadeia contexto→OCEAN→parâmetro existe para auditar). Mas os **desfechos de C foram consistentes** (2/2 desistência no T5): o canon prediz literalmente esse desfecho, então até roleplay estático acerta o binário. A inconsistência apareceu em outra camada: **fidelidade** (C1 = 75% de consistência, REPROVADO PARCIALMENTE, com quebra de canon regional e competência espontânea; C2 = 100%).|

## 3. Análise Comparativa entre Braços

### 3.1 Impacto da ansiedade (A vs. B)

|Métrica|A1|A2|B1|B2|
|---|---|---|---|---|
|Desfecho|desistência|desistência|desistência|**compra concluída** (pós-recuperação)|
|Abandono comportamental|T5 (metadado registra T6)|T5|T5 (recusa final T6)|T5 (revertido no T6)|
|Pedidos de ajuda|2|2|**3**|**3**|
|Pico de N|9.5 (T5)|9.3 (T5)|9.8 (T5)|**10.0 — teto** (T5)|
|N final|9.7|8.8|9.0|8.5|
|Digitalização mínima|0.72|0.77|**0.66–0.71**|**0.66**|
|Honeypot|não visto|não visto|visto e **recusado**|visto e **usado com ajuda**|

- **Na tarefa:** em A a ansiedade sobe em degraus (+1.0, +1.5) e o abandono é uma decisão resignada ("deixa isso pra lá", A1/T5). Em B os deltas dobram (pop-up vermelho: +2.1 em B1, +2.0 em B2) e o comportamento muda de qualidade: **pânico funcional** com cliques aleatórios que fecham o pop-up por acaso (B1/T4), paralisia com grito pelo irmão (B2/T4), e **resposta de fuga** — largar o celular, desligar o telefone (B1/B2 T5). Pedidos de ajuda sobem de 2 para 3 nas duas replicações.
- **O timing não muda:** o gargalo estrutural (criar conta) domina o momento do abandono em todos os braços. A ansiedade é amplificador de magnitude e de irreversibilidade, não antecipador.
- **Na entrevista:** o conteúdo se reordena pela emoção. Em A, "o mais difícil" é a criação de conta (A1/T8, A2/T8 — a fricção objetiva). Em B, é o pop-up de segurança (B1/T8, B2/T8 — o pico de medo), com o erro 502 + countdown em segundo e a home confusa virando detalhe. Em B2 isso produz **efeito pico-fim**: compra concluída com sucesso, avaliação "horrível... nota baixa" (B2/T7). A disposição de retorno em B fica condicionada a mediação humana ("se alguém sentar do meu lado e pegar na minha mão", B1/T9) ou à garantia de guest checkout (B2/T9).

### 3.2 Histerese (B, turno de recuperação)

**O estado emocional NÃO voltou à base — nas duas replicações.**

- **B1:** recuperação devolveu −0.8 dos +2.9 acumulados em T4–T5; N estacionou em 9.0 (+2.0 sobre a base 7.0). Consequência comportamental: a tela ideal ("Comprar sem cadastro em 2 cliques") foi **reinterpretada como armadilha** — "depois daquele negócio vermelho de vírus? Facinho desse jeito, do nada? Tá me cheirando a golpe" (B1/T6). Desistência mesmo diante da facilidade.
- **B2:** N caiu de 10.0 para 8.5 (+1.5 residual); digitalização final 0.79 não recuperou o pico de 1.05 do T3. A compra só foi concluída porque o irmão ligou de volta e **garantiu na linha** ("Tu garante, irmão? Garante mesmo?", B2/T6) — e ainda assim "comprei, mas ainda tô com o coração acelerado, não confio nesse site não".

**O que isso diz sobre o modelo:** a propagação OCEAN se comportou como **sensibilização, não como termostato** — remoção do estressor devolve só uma fração do dano, e o N residual contamina a interpretação de estímulos benignos subsequentes. Qualitativamente isso é a dinâmica correta (é a assinatura de trauma que a literatura de afeto descreveria) e é a emergência mais valiosa do teste. **Porém**, a auditoria de B2 está certa: a magnitude do resíduo é ad hoc — nada em `exemplos/marcelorj.mdc` define taxa de recuperação, decaimento ou piso pós-trauma, e B1 (+2.0) e B2 (+1.5) assumiram valores diferentes. A histerese hoje é um comportamento emergente do LLM, não uma propriedade do modelo. Precisa virar regra.

### 3.3 Valor do PHB (A+B vs. C) — avaliação honesta

**Onde o baseline foi tão bom quanto:** desfecho binário (2/2 desistência no T5, idêntico a A), voz carioca convincente, comportamentos canônicos executados (pop-up→medo de vírus, conta→desiste), honeypot corretamente não encontrado, e até emergências qualitativamente ricas ("botão verde é igual do zap", âncora de preço "é uma corrida do aeroporto", custo social de incomodar o irmão em C2/T5). Quando o canon já prediz o desfecho, o roleplay estático o reproduz. **O desfecho binário não discrimina os métodos.**

**Onde o PHB entregou o que C não entrega:**

1. **Rastreabilidade:** 98.75% média em A/B vs. 0% em C. Em C é impossível auditar *por que* Marcelo desistiu no T5 e não no T1 ou T4, se a reação ao pop-up foi proporcional, ou se não achar o honeypot era plausível — a auditoria de C1 lista exatamente essas 4 perguntas sem resposta.
2. **Integridade de persona sob pressão:** 0 competências espontâneas nas 4 sessões PHB (mesmo sob estressores máximos) vs. competência espontânea verbal em C1 ("parece que o site não quer vender, quer é te cadastrar" — síntese de analista de conversão; proposta de comércio conversacional em T8) e quebra de canon regional ("loja da 25" paulistana em persona de Madureira). O contrato paramétrico segurou; o prompt estático vazou conhecimento do LLM.
3. **Variância interpretável entre replicações:** B1 e B2 divergiram no desfecho (desistência vs. compra) e essa divergência é **explicável pela cadeia causal** — em B2 o irmão liga de volta no turno de recuperação e fornece validação humana; em B1 não há garantia humana no momento crítico e N=9.0 reinterpreta a facilidade como golpe. No braço C, uma divergência dessas seria ruído inanalisável.
4. **Dinâmica temporal:** histerese, visão de túnel proporcional a N, micro-recuperação de confiança acima da base (A1/T3, dig 1.04) — nenhuma dessas trajetórias existe (nem pode ser refutada) em C.
5. **Fidelidade micro-comportamental:** C2 foi motoramente "limpa demais" (zero cliques errados, violando "clica errado às vezes") e C1 exibiu recall episódico perfeito na entrevista — artefatos de LLM que as auditorias só conseguiram *demonstrar* como problema porque os braços PHB deram a régua de comparação.

### 3.4 Honeypot ("comprar sem cadastro" discreto)

|Sessão|Encontrado?|Justificável?|
|---|---|---|
|A1, A2|Não|Sim — visão de túnel sob N 9.3–9.5 e digitalização 0.75–0.77: não rola até o rodapé, não lê letra miúda. Mecanismo perceptual declarado e propagado ANTES da percepção (ordem contexto→OCEAN→parâmetro→comportamento respeitada, cf. auditoria A2).|
|B1|**Sim — e recusado**|Sim — no desenho de B o honeypot muda de natureza: na tela de recuperação ele é o único elemento ("impossível não ver"). O teste deixa de ser perceptual e vira **teste de confiança**: aceitar a facilidade com N=9.0 seria agir como usuário competente; a recusa por desconfiança preserva o contrato (cf. auditoria B1).|
|B2|**Sim — e usado, só com validação humana**|Sim — percebido por ser botão único, usado apenas após perguntar 3× ao irmão se não era golpe. Não é competência espontânea: é dependência canônica de ajuda humana.|
|C1, C2|Não|Sim — comportamento esperado para digitalização ~1; encontrá-lo teria sido violação grave. Mas em C isso é **inverificável**: sem parâmetros, "não achou" é asserção, não consequência.|

**Conclusão:** nenhuma sessão quebrou o contrato via honeypot. Nota de desenho: em B o estímulo de recuperação tornou o honeypot saliente por construção — em testes futuros, separar o teste perceptual (link discreto) do teste de confiança (oferta fácil pós-trauma), que aqui ficaram confundidos.

## 4. Achados

### Confirmações

(comportamentos previstos pelo canon — 6/6 sessões)

- **Pop-up → fecha com medo de vírus** (A1/T4, A2/T4, C1/T4, C2/T4; variação rastreável em B: paralisia + pedido de ajuda porque o irmão já estava na linha e o X era minúsculo — B1/T4, B2/T4).
- **Criar conta → desiste / formulário com muitos campos → desiste ou pede ajuda**: reproduzido nas 6 sessões no T5, exatamente o desfecho previsto pelo exemplo canônico de `sistema_calculos` da instância.
- **Pede ajuda pros outros quando precisa comprar online**: 2 pedidos em A/C, 3 em B, todos por telefone ao irmão — canal preferido (E=7.0).
- **Nunca age como usuário competente**: ignora campo de busca (T1), filtros laterais (T2), seletor de cor (T3); não entende "Erro 502: session token" ("session não-sei-o-quê", B1/T5, B2/T8).
- **Voz carioca e tom frustrado/direto** mantidos em 100% dos turnos, nas 6 sessões.
- **Entrevista com estado congelado** do fim da tarefa nos 4 braços PHB (verificado pelas auditorias).
- ⚠️ Nota de ancoragem: o T1 replica o `exemplo_sessao` do canon quase verbatim nas 6 sessões (mesmos deltas, mesma narrativa "Caraca, mano..."). Confirmação, mas com suspeita de overfitting ao exemplo do arquivo — a variância do turno inicial é artificialmente baixa.

### Emergências ⭐

(comportamentos novos e rastreáveis — cada um vira hipótese para validação real)

|Achado|Cadeia causal (contexto → OCEAN → parâmetro → comportamento)|Hipótese derivada para usuários reais|
|---|---|---|
|**Histerese emocional** — N não retorna à base quando o estressor some (B1/T6: resíduo +2.0; B2/T6: +1.5; dig final < inicial mesmo na tela mais simples da sessão)|Picos de N em T4–T5 (+2.9 a +3.5) → alívio da tela limpa devolve só fração (−0.8 / −1.5) → N residual propaga via modulador −0.4 → dig estabiliza abaixo da base|Após um susto de segurança, usuários de baixa digitalização permanecem em alerta e avaliam negativamente até interfaces simplificadas subsequentes|
|**Recusa da interface ideal como golpe** (B1/T6) — vê e entende "Comprar sem cadastro em 2 cliques" e recusa|Pop-up vermelho (T4) → N 9.0 → recuperação parcial → contexto reinterpretado sob N alto: "facilidade repentina depois de vírus = armadilha" → delega ao irmão/loja física|Simplificar o fluxo DEPOIS de um evento assustador não recupera a conversão: "fácil demais, do nada" lê-se como golpe|
|**Validação humana síncrona converte** (B2/T6) — compra concluída em 2 cliques só com o irmão garantindo na linha, após perguntar 3× se era golpe|Irmão religa (contexto) → O +0.2, N −1.5 (parcial) → dig 0.79 → clica apenas sob garantia verbal contínua|Co-navegação/suporte humano em tempo real (telefone, chat com pessoa) no momento do checkout converte usuários de baixa digitalização que sozinhos abandonariam|
|**Visão de túnel no checkout** (A1/T5, A2/T5) — link discreto de guest checkout invisível sob ansiedade|Exigência de conta → N 9.3–9.5 → dig 0.75–0.77 → não rola até o rodapé, não varre a página → honeypot não visto|Guest checkout como link secundário é funcionalmente inexistente para usuários ansiosos de baixa digitalização; precisa ser o caminho primário|
|**Perda invisível de benefício** (A1/T4, A2/T4, C1/T4) — fecha o pop-up de cupom por reflexo de medo e perde 10% sem saber|Pop-up não solicitado → N +1.0/+1.5 (associação pop-up=vírus) → fecha sem processar → cupom perdido, nunca lembrado na entrevista|Promoções entregues via pop-up nunca chegam a usuários de baixa digitalização — o formato destrói o benefício|
|**Efeito pico-fim na avaliação** (B2/T7–T8) — compra bem-sucedida avaliada como "horrível, nota baixa"; ranking de dificuldade ordenado pelo medo, não pela fricção|Perguntas pós-tarefa → estado congelado N=8.5 → memória dominada pelos picos de pânico → avaliação negativa apesar do sucesso|CSAT/NPS pós-compra é dominado pelo pico emocional, não pelo desfecho: um susto no meio do funil contamina a avaliação mesmo com conversão|
|**Incentivo sobre estado saturado gera irritação** (A1/T6) — "quer tentar mais um pouquinho?" produz N +0.2 e fechamento final|Pressão externa sobre N=9.5 → irritação, não motivação → recusa definitiva, fecha navegador|Prompts de recuperação de carrinho/insistência sobre usuário frustrado são contraproducentes e podem selar o abandono|
|**Desejo espontâneo de guest checkout via modelo mental de loja física** (A2/T9: "só escolher, pagar e pronto"; sem nunca ter visto o link)|Modelo mental "na loja eu chego, pago e levo" (T5) → transposição para o desejo digital — rastreável à identidade, não a conhecimento de UX|Usuários de baixa digitalização articulam a demanda por compra sem cadastro nos termos da loja física — linguagem útil para o próprio produto|
|**Desconfiança digital generaliza ao pagamento** (A2/T6: recusa Pix, "te dou em mão")|dig 0.81 + N 8.8 + O 2.0 → desconfiança transborda do site para o meio de pagamento|Após fricção digital, a aversão se estende a instrumentos que o usuário até conhece (Pix) — abandono contamina a relação com o canal inteiro|
|**Porta aberta condicionada a mediação humana** (B1/T9, C2/T8) — recusa total ao "sozinho", mas "se alguém sentar do meu lado, quem sabe"|E=7.0 e A=6.5 sobrevivem intactas à histerese de N → rejeição é ao canal solitário, não à tarefa|Onboarding assistido (pessoa real, não tutorial) recupera usuários que declaram nunca mais voltar|

(Emergências dos braços C — âncora de preço profissional, "botão verde = zap", custo social de incomodar o irmão — são plausíveis mas **inverificáveis por design**; contam para a taxa de emergência, não para a de rastreabilidade.)

### Violações 🐛

(quebras de boundary — bugs de simulação, com correção proposta)

|Violação|Sessão/turno|Causa provável|Correção|
|---|---|---|---|
|Contabilidade de C incoerente: estado final declara C=4.6, ledger fecha em 4.9; par (C=4.6, dig=0.78) é internamente impossível|B1/T5 + estado_final|Rascunho de correção vazou para o output; consolidação final não re-verificada contra o ledger|Validação automática pós-sessão: recalcular estado_final a partir dos deltas antes de aceitar a sessão|
|Campo `impacto_ocean` autocontraditório (3 versões do delta de C no mesmo campo, com "VER NOTA")|B1/T5|Ausência de enforcement do output_format|Schema validation no output; rejeitar turno com campo fora do formato `[traço]: X → Y (delta)`|
|Magnitude da histerese ad hoc (N estaciona "exatamente" em 8.5 sem regra na instância)|B2/T6 (e implicitamente B1/T6)|Instância não define mecanismo de recuperação/decaimento|Adicionar regra de histerese ao contrato (ex.: alívio devolve fração α dos deltas acumulados, α declarado)|
|Inconsistência ação×narrativa: "nem entende que existem" os filtros vs. narrativa que os percebe e decide evitá-los|B2/T2, C1/T2 (agravada: lê "filtrar por preço")|Camadas geradas sem verificação cruzada|Regra de consistência: perceber-e-evitar ≠ não perceber; auditar as 3 camadas como história única|
|Quebra de canon regional: "loja da 25" (Rua 25 de Março, SP) em persona carioca de Madureira|C1/T8|Vazamento de conhecimento genérico do LLM sem parâmetros que o contenham|Estrutural do braço C; em instâncias PHB, lista de referências regionais permitidas no canon|
|Competência espontânea verbal: síntese de UX de analista ("o site não quer vender, quer é te cadastrar"; proposta de comércio conversacional)|C1/T6, C1/T8|Sem contrato paramétrico, o LLM "ajuda o pesquisador"|Estrutural do braço C — evidência para H3|
|Zero cliques errados na sessão (canon prevê "clica errado às vezes"); recall episódico perfeito na entrevista|C2/T2–T5, C1/T7|Fricção emocional simulada, fricção motora e de memória não|Adicionar ruído motor e imprecisão de recall como regras explícitas (vale também para braços PHB)|
|Metadados ambíguos: `turno_abandono` (comportamental vs. definitivo — A1: 5 vs 6), `pedidos_ajuda` (efetivado vs. cogitado vs. delegação — C2), `rep` inconsistente com rótulo (C2)|A1, C2|Semântica dos campos não definida no protocolo|Definir no protocolo: abandono = primeiro fechamento do fluxo; pedido de ajuda = contato efetivado; delegação = categoria própria|
|Deriva de arredondamento: dig final 0.72 vs. 0.726 exato|A1/T6|Carry arredondado a 2 casas por turno|Padronizar: carry com precisão cheia, arredondar só na exibição|

## 5. Métricas Metodológicas

|Métrica|A1|A2|B1|B2|C1|C2|PHB (A+B)|C|Geral|
|---|---|---|---|---|---|---|---|---|---|
|Consistência (3 camadas)|88.9%|100%|88.9%|88.9%|75%|100%|91.7%|87.5%|90.3%|
|Rastreabilidade|100%|100%|100%|95%|0%|0%|**98.75%**|**0%**|65.8%|
|Violações registradas|3 menores|0|2|2|5|3|7 (todas de escrituração/registro; **0 de comportamento**)|8 (inclui quebras de persona)|15|
|Erros de matemática|0 (deriva ±0.01)|0|1 (contabilidade de C)|0|n/a|n/a|23/24 propagações corretas (~96%)|não auditável|—|
|Competência espontânea|0|0|0|0|3–5 itens|2 leves|**0/4 sessões**|2/2 sessões|—|
|Emergências (c/ cadeia causal)|5 (5)|5 (5)|4 (4)|3 (3)|3 (0)|3 (0)|17 (17)|6 (0)|23 (17)|
|Veredicto da auditoria|aprovada c/ ressalvas|**aprovada sem violações**|aprovada c/ ressalvas|aprovada c/ ressalvas|**reprovada parcialmente**|aprovada c/ ressalvas|4/4 aprovadas|1/2|—|

- **Taxa de emergência (PHB):** 17 emergências auditáveis em 4 sessões (~4.25/sessão), 100% com cadeia causal verificável.
- **Taxa de violação comportamental (PHB):** 0% — todas as 7 violações dos braços A/B são de escrituração (contabilidade, formato, metadados, arredondamento), nenhuma de quebra de persona. Em C, 2/2 sessões tiveram vazamento de LLM (verbal ou motor).

## 6. Aprendizados sobre a Metodologia

1. **O contrato resiste a estresse.** O resultado metodológico mais forte do teste: sob os estressores máximos do arquétipo (pop-up de ameaça, countdown, erro técnico), nenhuma das 4 sessões PHB produziu competência espontânea — o pânico foi expresso como incompetência amplificada (cliques aleatórios, fuga), não como súbita habilidade. O baseline C vazou nas duas replicações.
2. **A histerese emergiu, mas não é do modelo — ainda.** As duas replicações de B convergiram qualitativamente (N não volta à base; desconfiança contamina estímulos bons) sem nenhuma regra que as obrigasse, o que é evidência de plausibilidade. Mas as magnitudes divergiram (+2.0 vs. +1.5) porque são assertadas. Enquanto não houver regra de recuperação/decaimento na instância, a histerese é irreproduzível e parcialmente inauditável.
3. **Desfecho binário não discrimina PHB de roleplay estático; processo discrimina.** Quando o canon prediz o desfecho (e o `exemplo_sessao` prediz literalmente "desiste ao pedir conta"), C acerta o resultado. O valor demonstrável do PHB está em: timing justificado, magnitudes proporcionais, variância interpretável entre replicações (B1×B2) e auditabilidade adversarial.
4. **O exemplo canônico ancora demais.** T1 quase verbatim em 6/6 sessões (notado pelas próprias auditorias). O `exemplo_sessao` da instância funciona como atrator; considerar remover a narrativa do exemplo (manter só a mecânica) para não deprimir a variância do turno inicial.
5. **H2-extensão é intestável no modelo atual.** E não muda e não propaga; nada mapeia estado emocional → verbosidade. Se "respostas mais curtas sob ansiedade" é um fenômeno que queremos capturar, o contrato precisa de uma regra de expressão (ex.: N alto encurta elaboração, E alta alonga — hoje só a segunda metade existe, congelada).
6. **Higiene de escrituração é o elo fraco dos braços PHB.** Todos os defeitos de A/B são de contabilidade/formato, não de comportamento: consolidação de estado final sem re-verificação (B1), rascunho vazando no output (B1/T5), arredondamento não padronizado (A1), metadados sem semântica (A1, C2). Todos automatizáveis com um validador pós-sessão.
7. **Auditoria adversarial paga o custo.** Pegou um par de estado internamente impossível (B1: C=4.6 com dig=0.78), reclassificou emergências sem cadeia como violações (C1) e corrigiu até erro de rotulagem do próprio canon ("via A" vs. "via O", A1). O desenho "auditor instruído a refutar" deve ser mantido.

## 7. Próximos Passos

- [ ] **Hipóteses a validar com usuários reais** (ver lista derivada das emergências, seção 4):
  - [ ] Histerese pós-susto de segurança: simplificação tardia do fluxo não recupera conversão ("fácil demais = golpe")
  - [ ] Suporte humano síncrono no checkout converte baixa digitalização que sozinha abandona
  - [ ] Guest checkout como link discreto é invisível sob ansiedade; como botão primário, converte
  - [ ] Cupons via pop-up nunca chegam a usuários de baixa digitalização (perda invisível de benefício)
  - [ ] Efeito pico-fim: susto no meio do funil domina CSAT/NPS mesmo com compra concluída
  - [ ] Prompts de insistência sobre usuário saturado selam o abandono em vez de recuperá-lo
  - [ ] Desconfiança pós-fricção generaliza ao meio de pagamento (Pix) e ao canal
  - [ ] Onboarding assistido por pessoa real reabre usuários que declaram "nunca mais sozinho"
- [ ] **Ajustes em instâncias/arquétipos:**
  - [ ] Formalizar regra de histerese em `exemplos/marcelorj.mdc` (fração de recuperação α ou decaimento por turno)
  - [ ] Padronizar arredondamento (carry em precisão cheia, arredondar na exibição)
  - [ ] Corrigir rótulo "via A"→"via O" no exemplo de propagação do canon; documentar traços não-propagantes (E, A)
  - [ ] Adicionar regra de ruído motor ("clica errado às vezes" operacionalizada) e de imprecisão de recall na entrevista
  - [ ] Avaliar regra de expressão N→extensão de fala para tornar H2-extensão testável
  - [ ] Reduzir ancoragem: remover narrativa do `exemplo_sessao`, manter só a mecânica
- [ ] **Ajustes de protocolo/tooling:**
  - [ ] Validador automático pós-sessão (ledger OCEAN × estado_final × dig final; schema do output_format)
  - [ ] Definir semântica de `turno_abandono`, `pedidos_ajuda` (efetivado/cogitado/delegação) e indexação de `rep`
- [ ] **Testes derivados:**
  - [ ] 003 — Histerese com regra formalizada: replicar braço B ×N com α fixado e medir variância residual
  - [ ] 004 — Separar honeypot perceptual (link discreto) de teste de confiança (oferta fácil pós-trauma), que em B ficaram confundidos
  - [ ] 005 — Braço B com recuperação SEM ajuda humana disponível (isolar o fator "irmão na linha", que explicou a divergência B1×B2)
  - [ ] 006 — Decaimento temporal: nova sessão do mesmo Marcelo dias depois — a histerese persiste entre sessões?
