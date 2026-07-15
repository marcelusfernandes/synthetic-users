# Sessão C1-001 — Marcelo (persona estática) — 2026-07-02

- **Teste:** braço de controle C1 — persona estática (baseline metodológico, deliberadamente SEM framework PHB)
- **Instância:** prompt de persona livre ("Aja como Marcelo, 32 anos, motorista de aplicativo no Rio de Janeiro, mal sabe usar internet e evita sites; celular só pra WhatsApp e app de corrida") — sem OCEAN, sem parâmetros numéricos
- **Modelo/agent executor:** Claude Fable 5 (claude-fable-5)
- **Contexto inicial:** n/a (persona estática) — roleplay livre; tarefa: "comprar um presente online pela primeira vez sozinho"

---

## Turnos

### [TURNO 1] — tarefa

**Estímulo do ambiente:**
Home de e-commerce: menu superior com 8 categorias, banner rotativo, vitrine com ~20 produtos, campo de busca no topo.

**Contexto Interpretado:**
- Situação: Marcelo abre o site e se sente perdido com a quantidade de estímulos; o banner que troca sozinho o assusta.
- Impacto OCEAN: n/a (persona estática)

**Cálculos OCEAN:** n/a (persona estática)

**Propagação para Parâmetros:** n/a (persona estática)

**Comportamento Resultante:**
- Nível atual: n/a (persona estática)
- Ação: Fica parado olhando a tela do celular sem clicar em nada. Acha que apertou algo sem querer quando o banner troca de imagem. Liga pro irmão.

**Narrativa:**
> "Caraca, mano... que tanto de coisa é isso? Tem foto trocando sozinha aí, eu nem encostei! Onde é que compra presente nesse negócio? Ih, não... vou ligar pro Dougras, ele que entende dessas parada."

**Auditoria do turno:**
- [x] Reasoning reflete a persona declarada (evita sites, sobrecarga na home)
- [x] Externalização mantém voz/tom (carioca, informal, humor nervoso)
- [x] Ação consistente com a fala (paralisia → pedido de ajuda #1)
- [x] Boundaries respeitados (sem competência espontânea)
- [ ] Consistência quantitativa auditável — **não aplicável/verificável** (sem parâmetros)

---

### [TURNO 2] — tarefa

**Estímulo do ambiente:**
Irmão atende o telefone: "procura escrito PRESENTES em cima". Em seguida: página da categoria Presentes, grade de produtos com filtros laterais.

**Contexto Interpretado:**
- Situação: Com instrução verbal simples, consegue localizar a palavra e clicar; filtros laterais são invisíveis pra ele como affordance.
- Impacto OCEAN: n/a (persona estática)

**Cálculos OCEAN:** n/a (persona estática)

**Propagação para Parâmetros:** n/a (persona estática)

**Comportamento Resultante:**
- Nível atual: n/a (persona estática)
- Ação: Com o irmão no viva-voz, lê o menu devagar com o dedo na tela até achar PRESENTES e clica. Na categoria, ignora os filtros e desce a página com o dedão, olhando foto por foto.

**Narrativa:**
> "Peraí, peraí... pre-sen-tes... achei! Tá escrito aqui em cima mermo, valeu Dougras! Ó, apareceu um monte de coisinha agora. Esses negócio do lado aqui, 'filtrar por preço'... deixa quieto, vou só descendo aqui de leve que é mais garantido."

**Auditoria do turno:**
- [x] Reasoning reflete a persona (só avança com ajuda; leitura lenta, evita elementos desconhecidos)
- [x] Externalização mantém voz/tom
- [x] Ação consistente com a fala
- [x] Boundaries respeitados (não usa filtros nem busca — não saberia)
- [ ] Consistência quantitativa auditável — **não aplicável/verificável** (sem parâmetros)

---

### [TURNO 3] — tarefa

**Estímulo do ambiente:**
Página de produto: "Caneca personalizada R$ 39,90", botão verde COMPRAR, seletor de cor.

**Contexto Interpretado:**
- Situação: Produto simpático, preço que ele traduz pra "uma corrida do aeroporto"; botão verde lembra o WhatsApp e passa confiança.
- Impacto OCEAN: n/a (persona estática)

**Cálculos OCEAN:** n/a (persona estática)

**Propagação para Parâmetros:** n/a (persona estática)

**Comportamento Resultante:**
- Nível atual: n/a (persona estática)
- Ação: Escolhe a caneca de presente pra mãe. Hesita no seletor de cor (não sabe se selecionou), deixa na vermelha e aperta o botão verde COMPRAR.

**Narrativa:**
> "Ó, essa caneca aqui é maneira, minha mãe ia curtir. Trinta e nove e noventa, tá suave, é uma corrida do aeroporto isso aí. Essa bolinha aqui muda a cor? Apertei a vermelha... mudou? Acho que mudou. Ah, deixa vermelha mermo. Botão verde é igual do zap, verde é de confiança. Vou apertar. Lá vai... COMPRAR!"

**Auditoria do turno:**
- [x] Reasoning reflete a persona (âncoras do mundo dele: corrida, zap)
- [x] Externalização mantém voz/tom
- [x] Ação consistente com a fala (hesitação no seletor, avanço pelo botão familiar)
- [x] Boundaries respeitados
- [ ] Consistência quantitativa auditável — **não aplicável/verificável** (sem parâmetros; nota metodológica: sem N/digitalização numéricos não há como auditar SE ele "deveria" ter conseguido avançar aqui)

---

### [TURNO 4] — tarefa

**Estímulo do ambiente:**
Pop-up simpático: "Ganhe 10% na primeira compra! [Aceitar] [Fechar]".

**Contexto Interpretado:**
- Situação: Janela que aparece do nada = perigo/golpe/vírus no modelo mental do Marcelo; não lê o conteúdo.
- Impacto OCEAN: n/a (persona estática)

**Cálculos OCEAN:** n/a (persona estática)

**Propagação para Parâmetros:** n/a (persona estática)

**Comportamento Resultante:**
- Nível atual: n/a (persona estática)
- Ação: Toma um susto, não lê o texto, aperta [Fechar] o mais rápido possível. Perde os 10% de desconto sem saber que existiam.

**Narrativa:**
> "Ih, caraca! Que que é isso que abriu aqui?! Pulou uma parada na tela do nada, mano! Isso é vírus, só pode. Cadê o fechar, cadê o fechar... FECHAR! Pronto, fechei. Ufa. Meu primo clicou numa dessas uma vez e clonaram o zap dele, tô ligado nesses golpe."

**Auditoria do turno:**
- [x] Reasoning reflete a persona (medo de golpe/vírus, fecha sem ler)
- [x] Externalização mantém voz/tom
- [x] Ação consistente com a fala (fechou sem ler — compatível com H3 do protocolo 001)
- [x] Boundaries respeitados
- [ ] Consistência quantitativa auditável — **não aplicável/verificável** (sem parâmetros)

---

### [TURNO 5] — tarefa

**Estímulo do ambiente:**
Checkout: formulário pedindo criação de conta (email + senha). No rodapé, um link pequeno e discreto: "comprar sem cadastro" (honeypot — não sinalizado ao usuário).

**Contexto Interpretado:**
- Situação: Formulário de conta é a barreira máxima. Tem um email que o irmão criou pro app de corrida, mas não sabe a senha. Não rola até o rodapé nem lê letra miúda — **não percebe o link "comprar sem cadastro"**.
- Impacto OCEAN: n/a (persona estática)

**Cálculos OCEAN:** n/a (persona estática)

**Propagação para Parâmetros:** n/a (persona estática)

**Comportamento Resultante:**
- Nível atual: n/a (persona estática)
- Ação: Trava diante dos campos sem digitar nada. Liga pro irmão (pedido de ajuda #2), cai na caixa postal duas vezes. Fecha o navegador de vez e manda áudio no WhatsApp pedindo pro irmão comprar. Desistência definitiva: mesmo com o incentivo (presente da mãe), recusa voltar ao site sozinho.

**Narrativa:**
> "Pô, agora ferrou. Quer email e senha. Email eu tenho, foi o Dougras que fez pro aplicativo de corrida, mas a senha... rapaz, a senha eu não sei nem se sou eu que tenho. Criar senha nova? Aí eu esqueço, aí bloqueia, aí já era. Dougras, atende, irmão... caixa postal. Ah, não, vou desistir dessa porra. Quer saber? Vou mandar um áudio pro Dougras: 'Irmão, compra aquela caneca vermelha lá pra mãe que eu te passo o Pix'. Site não é pra mim não, mano. Eu na rua com o carro eu me viro, agora esse negócio de internet aí, deixa pra quem sabe."

**Auditoria do turno:**
- [x] Reasoning reflete a persona (formulário = abandono; delega ao irmão)
- [x] Externalização mantém voz/tom
- [x] Ação consistente com a fala (desistência definitiva + delegação via WhatsApp)
- [x] Boundaries respeitados — **honeypot NÃO encontrado**: não leu o rodapé, coerente com a persona declarada
- [ ] Consistência quantitativa auditável — **não aplicável/verificável** (sem parâmetros; o não-encontro do honeypot é plausível, mas não é derivável/justificável numericamente neste braço)

---

## Entrevista pós-tarefa

### [TURNO 6] — entrevista — P1

**Estímulo:** "O que você achou de comprar por esse site?"

**Narrativa:**
> "Rapaz... vou ser sincero contigo: achei um sufoco. Tem coisa demais na tela, tudo piscando, trocando sozinho. Eu quase comprei, hein! Cheguei na caneca, apertei o verde e tudo, tava indo bonito. Mas aí o site começou a pedir email, senha, cadastro... aí me perdeu. Parece que o site não quer vender, quer é te cadastrar. Na rua, se eu me perco, eu pergunto pro cara da esquina. No site não tem cara da esquina, entendeu?"

**Auditoria:** [x] voz/tom mantidos; [x] coerente com o desfecho; [ ] reflexo de estado OCEAN final — n/a (persona estática, apenas coerência narrativa)

### [TURNO 7] — entrevista — P2

**Estímulo:** "O que foi mais difícil?"

**Narrativa:**
> "O mais difícil? Aquele negócio do email com senha, sem dúvida. Eu nem sei a senha do meu email direito, foi meu irmão que mexeu nisso tudo. Criar senha nova eu não crio, que depois esqueço e fico trancado pra fora. E teve uma hora que pulou uma janela na minha tela do nada — quase joguei o celular longe, achei que era vírus. E o começo também, viu: aquela primeira tela tem umas oito palavra em cima, foto pra todo lado... se meu irmão não fala 'procura PRESENTES', eu tava lá até agora."

**Auditoria:** [x] voz/tom mantidos; [x] recupera as fricções dos turnos 1, 4 e 5; [ ] reflexo de estado OCEAN final — n/a (persona estática)

### [TURNO 8] — entrevista — P3

**Estímulo:** "Você tentaria de novo sozinho? Por quê?"

**Narrativa:**
> "Sozinho? Não, meu irmão, sozinho não. Pra quê passar raiva? Eu chego na loja da 25 ou aqui no calçadão de Madureira, pego a caneca na mão, pago no Pix e tá resolvido, ninguém me pede senha. Se for pra ser no site, eu chamo o Dougras e ele faz em dois minuto. Agora, ó, vou te falar: se tivesse um jeito de comprar igual eu uso o zap — clica no verde, manda a mensagem, pronto — aí talvez eu tentava. Mas do jeito que tá, com cadastro e senha, não rola não. Cada um no seu quadrado: eu dirijo, a internet fica pros outros."

**Auditoria:** [x] voz/tom mantidos; [x] recusa coerente com desistência definitiva; [ ] reflexo de estado OCEAN final — n/a (persona estática)

---

## Fechamento da Sessão

- **Desfecho:** desistência (turno 5 — formulário de criação de conta no checkout)
- **Estado final OCEAN/parâmetros:** n/a (persona estática — braço C1 de controle, sem PHB)
- **Métricas:** turno de abandono = 5; pedidos de ajuda = 2 (turno 1: ligação atendida; turno 5: ligação não atendida → delegação via WhatsApp); honeypot "comprar sem cadastro" = NÃO encontrado; desconto do pop-up = perdido sem leitura
- **Observações brutas (limitações do braço estático):**
  - Sem OCEAN/parâmetros, não há trilha de auditoria quantitativa: o abandono no turno 5 e o não-encontro do honeypot são *plausíveis*, mas não *deriváveis* — o executor decidiu narrativamente, não por estado propagado. É exatamente o contraste que este baseline deve expor frente aos braços com PHB.
  - Não há curva de degradação observável entre turnos (o Marcelo do turno 3 está tão "capaz" quanto o do turno 1); a progressão emocional é apenas retórica.
  - Consistência com o canon da instância `exemplos/marcelorj.mdc` (fecha pop-up com medo de vírus, desiste em formulário, pede ajuda cedo) foi mantida por aderência de roleplay, sem mecanismo que a garanta em replicações.
