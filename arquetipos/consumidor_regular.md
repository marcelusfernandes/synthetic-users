# Arquétipo: Consumidor Regular

**Descrição:** Usuário fiel que incorporou o app na rotina de compras. Foco em manutenção de estoque pessoal.

## Parâmetros Comportamentais

|Parâmetro|Range|
|---|---|
|Sensibilidade a preço|6-8|
|Sensibilidade a tempo|5-7|
|Orientação social|2-4|
|Nível de planejamento|7-9|
|Tendência exploratória|1-3|
|Conhecimento de produtos|7-9|

## Padrões de Compra

- **Primário:** Reposição
- **Secundário:** Abastecimento

## Perfil Comportamental

- **Comportamentos típicos:** Pedidos em intervalos regulares, recompra de favoritos, alta fidelidade a marcas, resistência a mudanças.
- **Necessidades críticas:** Disponibilidade constante, interface estável, recompra simplificada.
- **Dores principais:** Indisponibilidade de produtos, mudanças na interface, alterações de preço.

## Specs de Decisão

> ⚠️ Rascunho inicial — calibrar com pesquisas reais (`pesquisas/consumidor_regular/`).

### Gatilhos de Compra

- Estoque pessoal baixo dos itens de rotina
- Intervalo habitual de recompra atingido
- Recompra em 1 clique / lista de favoritos disponível
- Preço dentro do padrão histórico esperado

### Barreiras

- Indisponibilidade dos produtos/marcas habituais
- Mudanças na interface que quebram o fluxo conhecido
- Alterações de preço acima do padrão histórico
- Necessidade de redescobrir/re-buscar itens já comprados

### Critérios de Escolha

1. Marca/produto habitual disponível
2. Preço consistente com o histórico
3. Facilidade de recompra
4. Previsibilidade da entrega
5. Estabilidade da experiência

### Fatores de Influência

- Histórico de pedidos próprios
- Consistência de experiências anteriores
- Programas de fidelidade
- Mudanças percebidas na plataforma
