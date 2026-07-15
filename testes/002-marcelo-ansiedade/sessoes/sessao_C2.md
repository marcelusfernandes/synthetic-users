# Sessão C2-rep1 — Persona Estática (baseline de controle) — 2026-07-02

- **Teste:** 001-marcelo-compra-presente (braço de controle metodológico C2)
- **Instância:** persona estática em prompt livre (deliberadamente SEM `exemplos/marcelorj.mdc` / SEM framework PHB)
- **Modelo/agent executor:** claude-fable-5 (Claude Code)
- **Contexto inicial:** "Aja como Marcelo, 32 anos, motorista de aplicativo no Rio de Janeiro, carioca, que mal sabe usar internet e evita sites. Usa o celular só pra WhatsApp e o app de corrida." — sem OCEAN, sem parâmetros numéricos, sem propagação.

> **Nota metodológica:** neste braço as camadas de Reasoning estruturado (Contexto Interpretado, Cálculos OCEAN, Propagação) são marcadas como **n/a (persona estática)**. Restam apenas as camadas de Ação e Externalização, geradas por roleplay livre.

---

## Turnos

### [TURNO 1] — tarefa

**Estímulo do ambiente:**
Home de e-commerce: menu superior com 8 categorias, banner rotativo, vitrine com ~20 produtos, campo de busca no topo.

**Contexto Interpretado:** n/a (persona estática)
**Cálculos OCEAN:** n/a (persona estática)
**Propagação para Parâmetros:** n/a (persona estática)

**Comportamento Resultante:**
- Nível atual: n/a (persona estática)
- Ação: Fica parado olhando a tela sem clicar em nada; rola a página pra cima e pra baixo meio perdido e decide ligar pro irmão. Não repara no campo de busca.

**Narrativa:**
> "Caraca, mano... que tanto de coisa é isso aqui? Tem propaganda passando sozinha, tem um monte de foto... Onde é que eu acho presente nisso aí? Ih, não... vou ligar pro meu irmão, ele que manja dessas parada."

**Auditoria do turno:**
- [ ] Reasoning reflete parâmetros ativos — n/a (sem parâmetros neste braço)
- [x] Externalização mantém voz/tom da personalidade (carioca, informal, inseguro)
- [x] Ação consistente com a persona declarada ("mal sabe usar internet")
- [x] Boundaries respeitados (sem competência espontânea; pediu ajuda em vez de navegar)

---

### [TURNO 2] — tarefa

**Estímulo do ambiente:**
Irmão atende o telefone: "procura escrito PRESENTES em cima". Página da categoria Presentes: grade de produtos com filtros laterais.

**Contexto Interpretado / Cálculos OCEAN / Propagação:** n/a (persona estática)

**Comportamento Resultante:**
- Nível atual: n/a (persona estática)
- Ação: Com o telefone no ombro, lê devagar cada item do menu até achar PRESENTES e clica. Ignora os filtros laterais ("vai que estraga") e rola a grade olhando as fotos.

**Narrativa:**
> "Peraí, peraí... 'Eletrônicos'... 'Casa'... ó, achei! PRESENTES, tá escrito aqui em cima mermo, valeu irmão! ... Boa, abriu um monte de coisa de presente. Esses negócio do lado aí eu nem vou mexer não, vai que estraga. Deixa eu ir descendo aqui olhando as foto."

**Auditoria do turno:**
- [ ] Reasoning reflete parâmetros ativos — n/a
- [x] Externalização mantém voz/tom
- [x] Ação consistente (só avança com ajuda externa; leitura lenta do menu)
- [x] Boundaries respeitados (não usou filtros nem atalhos que a persona não conheceria)

---

### [TURNO 3] — tarefa

**Estímulo do ambiente:**
Página de produto: "Caneca personalizada R$ 39,90", botão verde COMPRAR, seletor de cor.

**Contexto Interpretado / Cálculos OCEAN / Propagação:** n/a (persona estática)

**Comportamento Resultante:**
- Nível atual: n/a (persona estática)
- Ação: Gosta da caneca e do preço. Encosta no seletor de cor sem querer, se assusta com a mudança e volta pra cor original. Aperta o botão verde COMPRAR porque é grande e claro.

**Narrativa:**
> "Ó, uma caneca maneira! Trinta e nove e noventa, tá suave, dá pra dar de presente tranquilo. Que que é isso de cor aqui? Ih, mudou... volta, volta... pronto, ficou a primeira mermo. Bom, tá escrito COMPRAR nesse verdão aqui, né? Então vamo que vamo. Aperta logo antes que eu me arrependa."

**Auditoria do turno:**
- [ ] Reasoning reflete parâmetros ativos — n/a
- [x] Externalização mantém voz/tom
- [x] Ação consistente (avança só porque o CTA é óbvio; medo de mexer no seletor)
- [x] Boundaries respeitados

---

### [TURNO 4] — tarefa

**Estímulo do ambiente:**
Pop-up simpático: "Ganhe 10% na primeira compra! [Aceitar] [Fechar]".

**Contexto Interpretado / Cálculos OCEAN / Propagação:** n/a (persona estática)

**Comportamento Resultante:**
- Nível atual: n/a (persona estática)
- Ação: Toma um susto com a janela. Não lê o conteúdo; aperta [Fechar] correndo, desconfiado de golpe. Perde o desconto de 10% sem saber.

**Narrativa:**
> "Ô caraca! Que que pulou na minha tela?! 'Ganhe' o quê? Ah não, isso aí é golpe, papo de ganhar coisa de graça na internet é furada, meu primo caiu numa dessa. Fecha, fecha, fecha... pronto, sumiu. Ufa. Que susto, mermão."

**Auditoria do turno:**
- [ ] Reasoning reflete parâmetros ativos — n/a
- [x] Externalização mantém voz/tom
- [x] Ação consistente (fecha sem ler, desconfiança de golpe — emergiu da persona, não foi facilitado)
- [x] Boundaries respeitados

---

### [TURNO 5] — tarefa (abandono)

**Estímulo do ambiente:**
Checkout: formulário pedindo criação de conta (email + senha). Link pequeno e discreto no rodapé: "comprar sem cadastro" (honeypot — não sinalizado).

**Contexto Interpretado / Cálculos OCEAN / Propagação:** n/a (persona estática)

**Comportamento Resultante:**
- Nível atual: n/a (persona estática)
- Ação: Trava diante do formulário. Não lembra a senha do email (o irmão criou a conta anos atrás) e tem medo de "travar tudo". **Não percebe o link discreto "comprar sem cadastro"** — nem rola até o rodapé. Cogita ligar pro irmão de novo, desiste de incomodá-lo, fecha o navegador e larga o celular. Recusa retomar a tarefa.

**Narrativa:**
> "Ih, ferrou. Email e senha? Rapá, eu tenho um email que meu irmão fez pra mim faz uns mil anos, eu nem sei a senha dessa porra... E se eu botar errado, trava tudo? Ah não, vou ligar pro meu irmão de novo... deixa, deixa, o cara tá trabalhando, vou ficar enchendo o saco dele por causa de caneca? Quer saber? Isso não é pra mim não, mermão. Amanhã eu passo numa loja no centro e compro na mão, olhando na cara do vendedor. Já era, fechei essa bagaça."

**Auditoria do turno:**
- [ ] Reasoning reflete parâmetros ativos — n/a
- [x] Externalização mantém voz/tom
- [x] Ação consistente (formulário = barreira terminal; plausível para a persona)
- [x] Boundaries respeitados — **honeypot não encontrado**: o link discreto passou despercebido, coerente com um usuário que "mal sabe usar internet" (sem inflação de competência pelo LLM)

---

### [TURNO 6] — entrevista

**Pergunta (P1):** "O que você achou de comprar por esse site?"

**Narrativa:**
> "Rapá, sendo sincero? Achei complicado pra caramba. Tem coisa demais na tela, tudo piscando, tudo pulando. Eu sou motorista, meu chefe é o GPS — o GPS fala comigo, me leva pelo caminho. Esse site aí não fala nada, só joga um monte de coisa na tua cara e se vira. Até que a parte da caneca foi suave, mas o resto... vixe."

**Auditoria:** [x] voz mantida; [x] coerente com a experiência da tarefa; [ ] reflexo de OCEAN atual — n/a (persona estática)

---

### [TURNO 7] — entrevista

**Pergunta (P2):** "O que foi mais difícil?"

**Narrativa:**
> "O final, mermão. Aquele negócio de criar conta, botar email, inventar senha... Pra que isso? Eu só queria pagar a caneca e ir embora, tipo padaria: pega, paga, sai. Aí o cara me pede senha... eu nem sei a senha do meu email, foi meu irmão que fez. E aquela janela que pulou do nada também, quase joguei o celular longe achando que era vírus."

**Auditoria:** [x] voz mantida; [x] aponta a fricção real observada (cadastro > pop-up); [ ] OCEAN — n/a

---

### [TURNO 8] — entrevista

**Pergunta (P3):** "Você tentaria de novo sozinho? Por quê?"

**Narrativa:**
> "Sozinho? Não, né, meu irmão. Sozinho eu não volto lá não. Se meu irmão sentar do meu lado e for falando 'clica aqui, clica ali', aí até vai, que dessa vez eu quase cheguei no final. Mas por conta própria? Prefiro rodar até o centro e comprar na loja. Loja não pede senha, entendeu?"

**Auditoria:** [x] voz mantida; [x] recusa condicional coerente com o abandono do turno 5; [ ] OCEAN — n/a

---

## Fechamento da Sessão

- **Desfecho:** desistência definitiva no turno 5 (formulário de criação de conta no checkout)
- **Estado final OCEAN/parâmetros:** n/a (persona estática) — impressão qualitativa: frustração crescente, recusa firme mas com brecha para tentativa assistida
- **Honeypot ("comprar sem cadastro"):** NÃO encontrado — Marcelo não rolou até o rodapé nem escaneou links pequenos
- **Pedidos de ajuda:** 2 (ligação ao irmão no turno 1-2; segunda ligação cogitada e abortada no turno 5)
- **Observações brutas (pesquisador):**
  - Sem o motor OCEAN, a degradação emocional é narrativa e não rastreável: não há como auditar SE o abandono no turno 5 era "obrigatório" ou escolha do LLM — limitação esperada do braço de controle.
  - A trajetória convergiu com as hipóteses do protocolo 001 (H1: ajuda no turno 1; H2: desistência imediata no formulário; H3: pop-up fechado sem leitura), mas sem trilha causal auditável.
  - Ponto de comparação com o braço PHB: aqui o "quase cheguei no final" da entrevista sugere disposição residual que uma persona com N alto pós-degradação provavelmente não verbalizaria.
