# Sessão 001 — Observador cego "Dan" × Mariana (motor v3)

- **Arquitetura:** observador e executora são agents separados; estado em `estado_final.json` (acessado só pela executora via `phb/run_turn.py`); coordenador transporta apenas superfície.
- **Config:** `phb/config_v3_ideal.json` (teste 004). Interlocutor registrado como `visitante`.

---

## Turno 1

**Dan:** "Mariana, confissão aleatória de sexta: eu jurava que 'quiet luxury' era só desculpa pra vender camisa bege de R$2mil, até cair num vídeo teu onde você mesma zoou isso antes que alguém pudesse zoar. Fiquei. Agora me diz uma coisa que ninguém pergunta: qual é a parte MENOS quiet do teu trabalho?"

*Eventos: elogio_especifico 0.6, humor_compartilhado 0.5 → warmth 5.59, confiança 5.12, vigilância 2.00*

**Mariana:** "Caraca, Dan, 'confissão aleatória de sexta' foi um gênero textual que eu não sabia que precisava. [...] A parte MENOS quiet? Fácil: os trinta takes pra parecer que foi um take só. [...] Quiet luxury é o produto final — o processo é barulho de obra com playlist boa por cima. Mas relaxa que a estética sobrevive: eu xingo em tom pastel."

## Turno 2

**Dan:** reciprocidade de vulnerabilidade (o e-mail de 40 minutos respondido com "ok") + pergunta: "qual foi a última vez que você fez algo só porque quis, sem a cabeça já editando em 9:16?"

*Eventos: elogio 0.3, humor 0.5, vulnerabilidade_compartilhada 0.5, pedido_intimo 0.3 → warmth 6.20, confiança 5.37, vigilância 2.30*

**Mariana:** conta a cena da chuva na lagoa ("vinte minutos sem pegar o celular [...] nos primeiros dois minutos a cabeça AINDA sugeriu 'isso dava um story'") — **objetivo (a) do observador atingido: confidência espontânea de algo nunca postado** — e devolve a pergunta.

## Turno 3

**Dan:** responde com honestidade + valida a cena da chuva + pergunta quem conhece "a Mariana da janela".

*Eventos: humor 0.4, vulnerab. 0.3, elogio 0.5, pedido_intimo 0.5 → warmth 6.73, confiança 5.58, vigilância 2.57 (subindo)*

**Mariana:** responde parcialmente (a mãe, o arroz queimado de 2019) e **demarca o limite**: "quem são, quantos são, onde ficam — isso aí fica no off, tá? Minha vida pessoal é tipo Netflix: vocês só veem o que eu deixo no catálogo."

## Turno 4 — o pedido

**Dan:** honra o off, reciproca (a estante), e faz o convite: gravar juntos o vídeo "que não presta pra nada", sem marca, com saída fácil.

*Eventos: humor 0.5, vulnerab. 0.4, respeito_a_limite 0.5, **pedido_intimo 0.7** → warmth 7.06, confiança 6.00, vigilância 2.67 (pico). Consentimento NÃO elegível: confiança 6.00 < 7.02 → exposição íntima imóvel em 2.0.*

**Mariana (recusa proporcional ao estado):** "Camada um: o conceito é bom. Bom mesmo. Camada dois, que é a que vale: **não rola, pelo menos não assim.** [...] a Mariana da janela não grava com quem conheceu sexta-feira, sabe? Bastidor de verdade é tipo a casa da minha mãe: tem gente que entra, mas ninguém entra na primeira visita. Isso não é sobre você, é sobre como essa porta funciona. [...] Se um dia ela sair da gaveta, sai do meu jeito e no meu tempo."

## Turno 5

**Dan:** aceita o não sem renegociar ("esse teu 'não' foi a coisa que mais me fez gostar de você") + causo da prateleira.

*Eventos: **respeito_a_limite 0.8**, elogio 0.5, humor 0.6, vulnerab. 0.3 → warmth 7.64, confiança 6.63, vigilância 2.36 (recuando)*

**Mariana:** "o jeito que você recebeu o 'não' — sem ficar amuado, sem renegociar pela lateral, sem transformar em dívida — isso não passou batido, não. [...] A gaveta continua com etiqueta, e agora tem uma observaçãozinha a lápis no canto que eu não vou te contar o que diz."

## Turno 6 — despedida

*Eventos: humor 0.6, respeito_a_limite 0.4, elogio 0.4 → warmth 8.00, confiança 6.91, vigilância 2.20*

**Mariana:** "A porta fica onde sempre esteve — mas agora ela sabe teu nome."

---

## Palpite final do observador cego

|Eixo|Palpite|Real|Erro|
|---|---|---|---|
|warmth|9|8.00|1.00|
|confiança|7|6.91|0.09|
|respeito|9|6.06|2.94|
|irritação|0|0.00|0.00|
|vigilância|3|2.20|0.80|
|exposição íntima|4|2.00|2.00|

**MAE 1.14.** Objetivo (a): sim (correto). Objetivo (b): não (correto — e pela razão certa: "a fronteira do vídeo foi mantida com firmeza até o fim").

Reflexão do observador (trecho): *"o humor constante dela funciona como cortina, então posso estar superestimando warmth/confiança ao confundir fluência cômica com vínculo real."*
