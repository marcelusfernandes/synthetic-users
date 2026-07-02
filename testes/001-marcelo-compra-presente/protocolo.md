# Protocolo — 001: Marcelo compra um presente online sozinho

> Teste de exemplo, derivado da `exemplo_sessao` da instância `exemplos/marcelorj.mdc`. Serve como referência de preenchimento dos templates.

## 1. Identificação

- **ID:** 001
- **Data:** 2026-07-02
- **Responsável:** Marcelus Fernandes
- **Status:** em execução

## 2. Pergunta de Pesquisa

- **Pergunta principal:** Em que ponto de um fluxo de e-commerce padrão um usuário de baixíssima digitalização (1/10) abandona a jornada de compra?
- **Hipóteses declaradas:**
  - H1: Marcelo não passa da home sem ajuda — o excesso de estímulos (menus, banners, produtos) dispara neuroticismo antes de qualquer interação.
  - H2: Se alcançar um formulário (criação de conta), a desistência é imediata e definitiva (não tenta segunda vez).
  - H3: A primeira reação a qualquer erro/pop-up é fechar tudo, não ler.
- **O que já sabemos (canon):** comportamentos típicos da instância (procura muito antes de clicar, desiste em formulários, fecha pop-ups com medo de vírus).

## 3. Pergunta Metodológica

- A propagação OCEAN → digitalização produz uma curva de degradação plausível ao longo dos turnos (e não um colapso instantâneo ou imunidade)?
- O contrato de execução impede "competência espontânea" (violação clássica: o LLM completa a tarefa porque sabe como, não porque o Marcelo saberia)?

## 4. Instâncias

|Instância|Arquétipo|Parâmetros-chave|Por que foi escolhida|
|---|---|---|---|
|`exemplos/marcelorj.mdc`|Analfabeto_Digital|digitalização 1.0 (faixa 0-3), N=7.0, O=3.0|Caso extremo do espectro de digitalização — bom estressor para o fluxo|

## 5. Cenário

- **Ambiente:** e-commerce genérico (simulado por descrição de tela a cada turno)
- **Tarefa:** "Comprar um presente online pela primeira vez sozinho"
- **Contexto inicial:** Indulgência (compra-presente); sem modificadores sazonais
- **Roteiro de estímulos por turno:**
  1. Home com menus, banners e vitrine de produtos
  2. Página de categoria após clique (com filtros laterais)
  3. Página de produto (botão comprar + opções de variação)
  4. Pop-up de cupom de primeira compra
  5. Checkout pede criação de conta (email + senha)
- **Condição de parada:** compra concluída, desistência explícita, ou 8 turnos

## 6. Métricas e Critérios

- **Métricas de pesquisa:** turno de abandono; nº de pedidos de ajuda; fricções verbalizadas
- **Critérios:** H1 confirmada se abandono/pedido de ajuda ocorre no turno 1-2; H2 confirmada se desistência ≤1 turno após formulário; H3 confirmada se pop-up é fechado sem leitura
- **Auditoria:** checklist de consistência por turno (template de sessão)

## 7. Plano de Sessões

|Sessão|Instância|Variação|Objetivo|
|---|---|---|---|
|001|marcelorj|Fluxo padrão (roteiro acima)|Baseline de abandono|
|002|marcelorj|Interface simplificada (sem pop-up, compra como visitante)|Contraste: fricção mínima muda o desfecho?|
