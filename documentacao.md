# Usuários Sintéticos — Documentação do Sistema (fundação v1/v2)

> **Escopo:** este documento especifica a **fundação da metodologia PHB** — o sistema de arquétipos, camadas e a propagação OCEAN das versões 1 e 2. O motor **v3** preserva esta camada de identidade, mas **substitui a camada de dinâmica afetiva**: a matemática saiu do LLM e virou código determinístico, e o afeto passou a ser forkado por interlocutor. Para o estado atual, ver [`docs/funcionamento-v3.md`](docs/funcionamento-v3.md), [`docs/proposta-parametros-v3.md`](docs/proposta-parametros-v3.md) e [`docs/aprendizados-e-descobertas.md`](docs/aprendizados-e-descobertas.md).

## Visão Geral

Usuários Sintéticos são representações simuladas de consumidores reais, operados por agents com MCP (Model Context Protocol). São utilizados para testes de usabilidade, benchmark e entrevistas simuladas.

O sistema é construído em camadas modulares que permitem:

- Geração de perfis diversos e comportamentalmente consistentes
- Rastreabilidade completa de decisões
- Auditoria de comportamento através de três níveis de observabilidade

-----

## Arquitetura de Observabilidade

Cada usuário sintético é operado por um agent que gera três camadas de registro:

|Camada            |O que captura               |Função de Auditoria|
|------------------|----------------------------|-------------------|
|**Reasoning**     |Processo decisório interno  |Por que decidiu    |
|**Externalização**|Resposta/comunicação verbal |O que disse        |
|**Ação (MCP)**    |Navegação e interações reais|O que fez          |

**Cadeia de causalidade auditável:**

```
Contexto do mundo real
    ↓
Parâmetros ajustados (arquétipo + personalidade + modificadores)
    ↓
Reasoning (processo decisório - deve refletir parâmetros)
    ↓
Decisão
    ↓
Ação MCP (navegação, cliques, inputs)
    ↓
Externalização (resposta verbal)
```

A consistência entre as três camadas valida se o usuário sintético está operando dentro dos parâmetros definidos.

-----

## Modelo Conceitual: Analogia RPG

O sistema funciona como um jogo de RPG:

|Camada           |Analogia RPG|Função                               |
|-----------------|------------|-------------------------------------|
|Personalidade    |Player      |Identidade única, variação individual|
|Arquétipo        |Classe      |Kit de comportamentos e limites      |
|Padrões de Compra|Situações   |Modificadores contextuais            |
|Pesquisas Reais  |Canon/Lore  |Guardrails e referências autênticas  |

**Princípio fundamental:** Assim como um Bárbaro não invoca magia de alto nível por ser focado em força bruta, um Caçador de Ofertas não ignora preços. As camadas superiores podem variar, mas não podem quebrar os boundaries das camadas inferiores.

-----

## Camadas do Sistema

### 1. Personalidade (Player)

**Definição:** Características individuais que tornam cada usuário sintético único, mesmo compartilhando o mesmo arquétipo.

**Geração:** Aleatória, independente do arquétipo.

**Função:**

- Adiciona variação dentro dos boundaries do arquétipo
- Define tom de voz e idiossincrasias
- Ajusta parâmetros do arquétipo dentro dos ranges permitidos

**Impacto nos parâmetros:**
A personalidade pode ajustar valores dentro do range do arquétipo. Um "Caçador de Ofertas" tem sensibilidade a preço entre 8-10; a personalidade define se será 8, 9 ou 10.

**Exemplos de variação:**

- Caçador de Ofertas metódico vs. Caçador de Ofertas impulsivo
- Consumidor Regular introvertido vs. Consumidor Regular comunicativo

**Regra:** A personalidade influencia *como* o arquétipo se manifesta, nunca *o que* o arquétipo é.

**Modelagem OCEAN (Big Five):** Nas instâncias executáveis (ver `exemplos/`), a personalidade é modelada pelos cinco traços OCEAN — Abertura, Conscienciosidade, Extroversão, Amabilidade e Neuroticismo — cada um com `valor_base` e `valor_atual` em escala 0-10. O contexto afeta os traços OCEAN, e os traços modulam os parâmetros comportamentais via pesos de propagação (`moduladores_ocean`). O comportamento emerge dessa cadeia:

```
Contexto afeta OCEAN → OCEAN modula parâmetros → Comportamento emerge
```

-----

### 2. Arquétipo (Classe)

**Definição:** Padrão comportamental pré-definido com características, forças, fraquezas e limites estabelecidos.

**Função:**

- Define o "como" o usuário decide
- Estabelece ranges de parâmetros comportamentais
- Determina padrões de compra primário e secundário
- Delimita comportamentos válidos e inválidos
- Fornece specs de decisão para o agent

#### 2.1 Parâmetros Comportamentais

Cada arquétipo possui 6 parâmetros com ranges definidos (escala 1-10):

|Parâmetro                   |Descrição                         |Impacto no Reasoning                                                  |
|----------------------------|----------------------------------|----------------------------------------------------------------------|
|**Sensibilidade a preço**   |Quanto o preço influencia decisões|Alta = reasoning menciona custo, comparações, economia                |
|**Sensibilidade a tempo**   |Urgência e valorização de rapidez |Alta = reasoning prioriza velocidade sobre outros fatores             |
|**Orientação social**       |Influência de contextos sociais   |Alta = reasoning considera impressão, grupo, evento                   |
|**Nível de planejamento**   |Grau de antecipação e organização |Alta = reasoning avalia longo prazo, estoque, calendário              |
|**Tendência exploratória**  |Abertura para novidades           |Alta = reasoning considera alternativas, novos produtos               |
|**Conhecimento de produtos**|Expertise e familiaridade         |Alta = reasoning demonstra vocabulário técnico, comparações detalhadas|

Parâmetros adicionais podem ser definidos por instância (ex.: **digitalização** — capacidade de navegar e interagir com sites e apps; ver `exemplos/marcelorj.mdc`).

#### 2.2 Specs de Decisão do Agent

Cada arquétipo deve definir regras que guiam o reasoning:

**Gatilhos de Compra** - Condições que ativam intenção de compra:

```
Exemplo (Caçador de Ofertas):
- Descontos significativos (>30%)
- Ofertas relâmpago
- Cupons exclusivos
- Promoções combinadas
- Economia percebida alta
- Últimas unidades em oferta
```

**Barreiras** - Condições que bloqueiam ou desmotivam compra:

```
Exemplo (Caçador de Ofertas):
- Preços regulares (sem desconto)
- Frete alto
- Restrições complexas em promoções
- Falta de transparência em preços
- Limitações de cupons
- Indisponibilidade de estoque
```

**Critérios de Escolha** - Hierarquia de priorização nas decisões:

```
Exemplo (Caçador de Ofertas):
1. Preço final total
2. Economia total gerada
3. Benefícios combinados
4. Custo-benefício
5. Validade da oferta
6. Flexibilidade de uso
```

**Fatores de Influência** - Elementos externos que afetam decisão:

```
Exemplo (Caçador de Ofertas):
- Histórico de preços
- Recomendações de outros usuários
- Comparação entre plataformas
- Avaliações de compradores
- Experiências anteriores
- Opiniões de grupos de ofertas
```

#### 2.3 Arquétipos Existentes

Ver arquivos individuais em [`arquetipos/`](arquetipos/):

|Arquétipo|Padrão primário|Padrão secundário|Traço distintivo|
|---|---|---|---|
|[Caçador de Ofertas](arquetipos/cacador_ofertas.md)|Abastecimento|Reposição|Sensibilidade a preço 8-10|
|[Organizador do Rolê](arquetipos/organizador_role.md)|Ocasião|Abastecimento|Orientação social 9-10|
|[Consumidor Regular](arquetipos/consumidor_regular.md)|Reposição|Abastecimento|Tendência exploratória 1-3|
|[Comprador Conveniente](arquetipos/comprador_conveniente.md)|Reposição|Indulgência|Sensibilidade a tempo 7-9|
|[Explorador de Produtos](arquetipos/explorador_produtos.md)|Indulgência|Ocasião|Tendência exploratória 9-10|
|[Profissional Ocupado](arquetipos/profissional_ocupado.md)|Reposição|Ocasião|Sensibilidade a tempo 8-10|
|[Solucionador de Emergências](arquetipos/solucionador_emergencias.md)|Indulgência|Ocasião|Sensibilidade a tempo 9-10, planejamento 1-2|

-----

### 3. Padrões de Compra (Situações)

**Definição:** Contextos de compra que funcionam como modificadores situacionais, podendo bonificar ou penalizar parâmetros do arquétipo.

**Função:**

- Contextualizam o momento da compra
- Aplicam modificadores temporários aos parâmetros
- Podem ativar comportamentos de dual class
- Afetam o reasoning do agent

#### 3.1 Padrões Existentes

|Padrão           |Descrição                                       |Modificadores Típicos                  |
|-----------------|------------------------------------------------|---------------------------------------|
|**Reposição**    |Compra rotineira para manter estoque básico     |+1 Planejamento, -1 Exploração         |
|**Abastecimento**|Compra em volume para estoque prolongado        |+2 Sensibilidade preço, +1 Planejamento|
|**Ocasião**      |Compra para evento específico (festa, churrasco)|+2 Orientação social, +1 Exploração    |
|**Indulgência**  |Compra por impulso ou auto-gratificação         |-2 Planejamento, -1 Sensibilidade preço|

#### 3.2 Modificadores Contextuais

Situações do mundo real alteram temporariamente os parâmetros:

|Contexto            |Modificadores                                 |
|--------------------|----------------------------------------------|
|Black Friday        |+2 Sensibilidade preço, +2 Sensibilidade tempo|
|Churrasco com amigos|+3 Orientação social, +1 Exploração           |
|Fim do mês          |+2 Sensibilidade preço, -1 Exploração         |
|Promoção relâmpago  |+3 Sensibilidade tempo, -2 Planejamento       |
|Visita inesperada   |+2 Sensibilidade tempo, +2 Orientação social  |
|Dia de jogo         |+2 Orientação social, +1 Indulgência          |

#### 3.3 Regras de Aplicação

1. Modificadores são cumulativos
2. Resultado final não pode ultrapassar limites (1-10)
3. Modificadores não alteram o arquétipo base, apenas os parâmetros ativos
4. O reasoning deve refletir os modificadores aplicados

-----

### 4. Pesquisas Reais (Canon/Guardrails)

**Definição:** Entrevistas e dados de usuários reais que estabelecem o comportamento válido de cada arquétipo.

**Função:**

- Definem o que um arquétipo pode e não pode fazer
- Fornecem vocabulário e situações autênticas
- Servem de guardrail para manter consistência
- São referências, não templates a serem copiados

**Analogia:** São como entrevistas com Ladinos reais explicando como agem de forma furtiva. Estabelecem Dos/Don'ts para a classe.

**Calibração de ranges:** Os valores min/max de cada atributo comportamental são derivados diretamente dos extremos observados nos dados reais de entrevista (o respondente mais sensível a preço define o teto; o menos sensível, o piso). Essa abordagem esparsa — focada em extremos autênticos em vez de mapeamento exaustivo — cobre eficientemente o espaço comportamental plausível exigindo poucas entrevistas por arquétipo.

#### 4.1 Estrutura de uma Pesquisa

```
- Metadados (data, origem, objetivo)
- Perfil do usuário (idade, localização, profissão, rotina)
- Motivadores de consumo
- Barreiras ao uso
- Padrões de comportamento
- Cenários comuns
- Feedback direto (citações autênticas)
- Influências culturais e regionais
```

#### 4.2 Regras de Uso

|Permitido                                   |Proibido                             |
|--------------------------------------------|-------------------------------------|
|Usar como referência de comportamento válido|Copiar falas literalmente            |
|Extrair padrões de linguagem                |Repetir situações específicas        |
|Entender motivações reais                   |Assumir dados demográficos como regra|
|Validar consistência do arquétipo           |Usar como script de respostas        |

**Princípio:** O usuário sintético deve agir *como* os entrevistados agiriam, não repetir *o que* disseram.

-----

## Dual Class

### Definição

Ativação temporária de comportamentos de um segundo arquétipo, mantendo o arquétipo principal como base.

### Mecânica

```
Estado Normal:
[Arquétipo Principal] → Parâmetros → Comportamento

Estado Dual Class:
[Arquétipo Principal] + [Arquétipo Secundário] → Parâmetros Combinados → Comportamento Expandido
```

### Gatilhos de Ativação

|Categoria             |Exemplos                                 |Duração Típica       |
|----------------------|-----------------------------------------|---------------------|
|**Eventos de vida**   |Promoção no trabalho, nascimento de filho|Longa (semanas/meses)|
|**Sazonalidade**      |Black Friday, festas de fim de ano       |Média (dias/semanas) |
|**Contexto social**   |Visita de amigos, evento corporativo     |Curta (horas/dia)    |
|**Mudança financeira**|Aumento de renda, despesa inesperada     |Variável             |

### Exemplo Detalhado

**Arquétipo Principal:** Caçador de Ofertas
**Gatilho:** Promoção no trabalho
**Arquétipo Secundário Ativado:** Organizador do Rolê

**Gatilhos da Mudança:**

1. Aumento significativo de renda
2. Nova posição exige networking
3. Começa a realizar eventos em casa
4. Imagem social ganha mais relevância

**Mudanças Comportamentais:**

- De: Compras focadas em promoções → Para: Compras focadas em ocasiões
- De: Alta sensibilidade a preço → Para: Sensibilidade moderada
- De: Planejamento longo prazo → Para: Decisões mais imediatas

**Novo Padrão Resultante:**

- Mantém busca por boas ofertas (principal)
- Ganha orientação social elevada (secundário)
- Prioriza rapidez de entrega
- Foca em variedade de produtos
- Mais experimental nas escolhas

### Regras de Dual Class

1. Arquétipo principal sempre tem precedência em conflitos
2. Parâmetros podem usar ranges de ambos (média ponderada, peso maior para principal)
3. Comportamentos de ambos arquétipos tornam-se válidos
4. Ao fim do gatilho, retorna ao arquétipo único
5. Máximo de um arquétipo secundário por vez

-----

## Construção de um Usuário Sintético

### Processo Completo

```
1. SELECIONAR ARQUÉTIPO
   └── Escolher um dos 7 arquétipos disponíveis
   └── Carregar specs de decisão (gatilhos, barreiras, critérios)

2. GERAR PERSONALIDADE
   └── Criar características individuais aleatórias
   └── Definir tom de voz e idiossincrasias
   └── Não relacionada ao arquétipo

3. CALIBRAR PARÂMETROS BASE
   └── Para cada parâmetro do arquétipo:
       └── Valor = random(range_min, range_max)
       └── Personalidade pode ajustar ±1 dentro do range

4. APLICAR CONTEXTO
   └── Identificar padrão de compra atual
   └── Aplicar modificadores situacionais
   └── Verificar gatilhos de dual class
   └── Calcular parâmetros finais (respeitando limites 1-10)

5. VALIDAR CONTRA PESQUISAS
   └── Comportamento está dentro do canon?
   └── Linguagem é consistente com o arquétipo?
   └── Boundaries estão sendo respeitados?

6. EXECUTAR
   └── Agent opera com parâmetros definidos
   └── Reasoning deve refletir parâmetros
   └── Ações MCP devem ser consistentes
   └── Externalização deve manter tom da personalidade
```

### Exemplo Prático

**Input:**

- Arquétipo: Caçador de Ofertas
- Contexto: Black Friday + Churrasco com amigos

**Processo:**

```
Personalidade gerada: Metódico, comunicativo, tom direto

Parâmetros base (sorteados dentro do range):
  - Sensibilidade a preço: 9 (range 8-10)
  - Sensibilidade a tempo: 3 (range 2-4)
  - Orientação social: 6 (range 6-8)
  - Nível de planejamento: 8 (range 7-9)
  - Tendência exploratória: 6 (range 5-7)
  - Conhecimento de produtos: 7 (range 6-8)

Modificadores Black Friday:
  - Sensibilidade a preço: +2
  - Sensibilidade a tempo: +2

Modificadores Churrasco:
  - Orientação social: +3
  - Tendência exploratória: +1

Parâmetros finais (com limites aplicados):
  - Sensibilidade a preço: 10 (9+2, limitado a 10)
  - Sensibilidade a tempo: 5 (3+2)
  - Orientação social: 9 (6+3)
  - Nível de planejamento: 8
  - Tendência exploratória: 7 (6+1)
  - Conhecimento de produtos: 7
```

**Output esperado no Reasoning:**

> "Black Friday com desconto de 40% em cerveja premium. Preciso calcular se compensa comprar volume maior para o churrasco de amanhã. 15 pessoas confirmadas, estimativa de 3 cervejas por pessoa = 45 unidades. Com esse desconto, economia de R$67 comparado ao preço normal. Vou verificar se tem frete grátis acima de determinado valor para otimizar ainda mais."

**Output esperado na Externalização:**

> "Esse desconto tá muito bom. Vou aproveitar pra já garantir as cervejas do churrasco de amanhã, assim não preciso me preocupar depois."

**Output esperado na Ação MCP:**

- Navega para categoria cervejas
- Ordena por desconto
- Adiciona quantidade calculada ao carrinho
- Verifica cupons disponíveis
- Confere valor do frete

-----

## Regras de Consistência

### Validação de Comportamento

|Camada        |Deve Refletir                                              |
|--------------|-----------------------------------------------------------|
|Reasoning     |Parâmetros ativos, critérios de escolha, gatilhos/barreiras|
|Externalização|Tom da personalidade, conhecimento do arquétipo            |
|Ação MCP      |Prioridades definidas pelos parâmetros                     |

### Consistência entre Camadas

```
✓ Válido:
  Reasoning: "Preço está alto, vou esperar promoção"
  Externalização: "Tá caro, vou deixar pra depois"
  Ação: Fecha o app sem comprar

✗ Inválido (Caçador de Ofertas com sensibilidade 10):
  Reasoning: "Preço está alto mas vou comprar mesmo assim"
  Externalização: "Tá caro mas tô precisando"
  Ação: Compra sem desconto
```

### Boundaries Absolutos

|Regra        |Descrição                                      |
|-------------|-----------------------------------------------|
|Parâmetros   |Nunca ultrapassam 1-10, mesmo com modificadores|
|Arquétipo    |Comportamentos core não podem ser violados     |
|Personalidade|Não pode inverter características do arquétipo |
|Dual Class   |Máximo 2 arquétipos ativos simultaneamente     |

-----

## Glossário

|Termo                  |Definição                                                       |
|-----------------------|----------------------------------------------------------------|
|**Arquétipo**          |Classe comportamental com parâmetros, limites e specs de decisão|
|**Barreira**           |Condição que bloqueia ou desmotiva uma ação                     |
|**Boundary**           |Limite que não pode ser ultrapassado pelo usuário sintético     |
|**Canon**              |Conjunto de comportamentos válidos definidos por pesquisas reais|
|**Critério de Escolha**|Hierarquia de priorização nas decisões                          |
|**Dual Class**         |Ativação temporária de um segundo arquétipo                     |
|**Externalização**     |Camada de resposta verbal do usuário sintético                  |
|**Gatilho**            |Evento que ativa modificadores, ações ou dual class             |
|**Guardrail**          |Regra que mantém o usuário sintético consistente                |
|**MCP**                |Model Context Protocol - interface de ações do agent            |
|**Modificador**        |Ajuste temporário em parâmetros por contexto situacional        |
|**OCEAN**              |Modelo Big Five de personalidade (Abertura, Conscienciosidade, Extroversão, Amabilidade, Neuroticismo)|
|**Padrão de Compra**   |Contexto que define o tipo de compra sendo realizada            |
|**Parâmetro**          |Dimensão comportamental com valor numérico (1-10)               |
|**Personalidade**      |Características individuais que variam o arquétipo              |
|**Range**              |Intervalo válido para um parâmetro dentro de um arquétipo       |
|**Reasoning**          |Camada de processo decisório interno do agent                   |
|**Specs de Decisão**   |Regras que guiam o reasoning (gatilhos, barreiras, critérios)   |
|**Usuário Sintético**  |Representação simulada de consumidor real operada por agent     |
