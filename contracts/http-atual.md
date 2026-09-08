# Contrato HTTP atual do core

Inventário da API existente em `aaa4e18`, conferido em 07/09/2026. Este documento descreve
comportamento observado; não adiciona rotas, versão de API ou garantias de persistência.
[Plano do core](../docs/core-experiencia.md) · [Tarefa #24](https://github.com/marcelusfernandes/synthetic-users/issues/24).

## Regras de integração

O servidor usa HTTP/JSON em `/api`, com respostas `application/json; charset=utf-8`.
As requisições POST do novo cliente devem enviar `Content-Type: application/json`.
A API não tem prefixo de versão, paginação, autenticação de workspace ou chave de idempotência.
O servidor atual escuta em `127.0.0.1`; não existe uma configuração CORS para o novo front.
Desenvolvimento em outra porta usará proxy de `/api`; a entrega pode compartilhar a origem Python.

Todos os campos abaixo são nomes do contrato. A UI pode apresentar “perfil” e “interlocutor”,
mas deve enviar `persona_id` e `quem`. IDs gerados são opacos para o cliente; o servidor aceita
somente letras minúsculas, dígitos e hífens ao resolver um ID. Datas são strings ISO geradas no servidor.
Não extrair nomes ou datas de um ID.

## Rotas

| Método e rota | Entrada | Sucesso |
|---|---|---|
| `GET /api/config` | — | 200: `{llm, modelo}` |
| `GET /api/catalogo` | — | 200: `{eventos: [{tipo, eixos, valencia}]}` |
| `GET /api/personas` | — | 200: `{personas: Persona[]}` |
| `POST /api/personas` | `CriarPersona` | 201: `Persona` |
| `GET /api/personas/{id}` | — | 200: `Persona` |
| `GET /api/sessoes` | — | 200: `{sessoes: ResumoSessao[]}` |
| `POST /api/sessoes` | `{persona_id}` | 201: `{id, persona_id, criada_em, turnos: []}` |
| `GET /api/sessoes/{id}` | — | 200: `{id, persona_id, persona, relacoes, turnos}` |
| `POST /api/sessoes/{id}/turno` | `{quem, eventos}` | 200: `TurnoManual` |
| `POST /api/sessoes/{id}/mensagem` | `{quem, texto}` | 200: `TurnoMensagem` |

`GET /` e `GET /static/<arquivo>` servem a interface legada. A tarefa #25 definirá como
acrescentar os artefatos do novo front sem quebrar esse acesso. Não existem rotas de editar/excluir
perfil, renomear sessão, executar estudo, exportar relatório ou selecionar modelo por turno no core atual.

## Configuração e catálogo

`llm` é booleano. `modelo` é string quando configurado e `null` quando desabilitado.
Essa verificação indica configuração do servidor; não comprova que o provedor remoto está saudável.
Nenhuma chave é retornada. A seleção de provedor/modelo continua no ambiente do servidor.

Cada evento do catálogo tem `tipo` string, `eixos` como mapa de nomes de eixo para pesos numéricos
e `valencia` numérica. A lista atual tem 13 tipos. A UI deve obtê-la do servidor, sem substituir
os identificadores por rótulos ao enviar um turno. A lista não é um catálogo geral de jornadas comerciais.

## Perfil

Exemplo de criação válido; todos os dados são fictícios:

```json
{
  "nome": "Perfil de contrato",
  "bio": "Dados fictícios para verificação local.",
  "voz": "Direta",
  "ocean_base": {
    "abertura": 5,
    "conscienciosidade": 5,
    "extroversao": 5,
    "amabilidade": 5,
    "neuroticismo": 5
  }
}
```

`nome` é obrigatório e não pode ficar vazio após remover espaços nas bordas. Bio e voz
podem ser omitidas; o servidor as normaliza como texto vazio. O cliente deve enviar strings,
embora o servidor atual também normalize alguns valores não textuais com `str()`.

`ocean_base` é obrigatório e exige exatamente as cinco chaves acima. Cada valor deve ser um
número entre 0 e 10, inclusive; booleanos não são aceitos como números. Chaves desconhecidas,
tanto no perfil quanto em OCEAN, retornam 400. O cliente não deve enviar `id`, `criada_em`,
identidade ou arquétipo na criação.

`Persona` é o objeto normalizado de criação, acrescido de `id` e `criada_em`.
A listagem retorna os objetos completos armazenados, sem envelope por item. A ordem é por nome
de arquivo no armazenamento, não por atividade recente. O frontend deve ordenar explicitamente
pelo critério que apresenta e validar os campos que consome.

## Sessão

`POST /api/sessoes` exige um objeto com `persona_id` não vazio. Perfil ausente retorna 404.
A criação inicializa o motor com `ocean_base`, usando a identidade padrão atual (Mariana).
Não envia bio, voz ou uma identidade customizada ao inicializador.

`ResumoSessao` contém `id`, `persona_id`, `persona_nome` (string ou `null` se o perfil não for
encontrado), `turnos` (quantidade inteira) e `criada_em`. Não contém `atualizada_em` ou nome de sessão.
A ordenação do servidor também é por nome de arquivo; “última interação” não pode ser deduzida
da data de criação. Uma preferência local de última sessão aberta deve ser identificada como tal.

No detalhe, `persona` pode ser `null`. `turnos` é uma lista de objetos de turno na ordem registrada;
`relacoes` é um mapa de identificador de interlocutor para snapshot atual. Uma sessão recém-criada
tem `turnos: []` e `relacoes: {}`. O GET de detalhe **não** retorna `criada_em` nem o `estado`
persistido completo. A resposta de criação também não é um detalhe completo: o cliente deve
tratar os formatos separadamente ou consultar a sessão após criá-la.

Reabrir uma sessão recupera o estado salvo. `quem` seleciona a relação nessa sessão; as relações
são separadas por interlocutor, mas OCEAN pertence ao estado compartilhado. Trocar `quem` não equivale
a criar uma sessão totalmente independente.

## Turnos

Exemplo manual:

```json
{
  "quem": "avaliador-demo",
  "eventos": [{"tipo": "elogio_especifico", "intensidade": 0.6}]
}
```

`quem` precisa ser não vazio. `eventos` deve ser uma lista não vazia de objetos, cada um com
tipo presente no catálogo e intensidade numérica em 0..1; booleanos são rejeitados. A validação
normaliza os eventos para `{tipo, intensidade}`. Preserve a ordem da lista: ela faz parte da entrada
do motor. A API atual não exige a mesma política de rejeição de campos extras em todas as rotas;
o novo cliente deve enviar apenas os campos documentados, sem presumir validação uniforme no servidor.

`TurnoManual` contém `turno` (número sequencial começando em 1), `quem`, `eventos`, `snapshot` e `log`.
Não tem `texto`, `narrativa` ou timestamp próprio. A resposta é o turno adicionado, não a sessão completa.

A mensagem usa `{quem, texto}`, ambos não vazios, na rota `/mensagem`.
`TurnoMensagem` contém os campos do turno manual mais `texto` e `narrativa` (strings).
O servidor interpreta, calcula, narra e só então salva. Falha do interpretador ou do narrador retorna
502 e não persiste aquele turno nem seu estado calculado. Sem configuração, retorna 503 antes de
validar o corpo e procurar a sessão; o front não deve presumir outra precedência dos erros.

O modo manual funciona sem LLM. O narrador atual recebe mensagem, eventos, persona e snapshot;
não recebe a transcrição inteira anterior. O estado acumula a trajetória, o que é diferente de
memória textual completa da conversa.

## Snapshot e log

Exemplo retornado em um turno manual real, com os cinco valores iniciais de OCEAN em 5:

```json
{
  "ocean": {"abertura": 5, "conscienciosidade": 5, "extroversao": 5.088, "amabilidade": 5, "neuroticismo": 5},
  "rel": {"warmth": 5.316, "confianca": 5.101, "respeito": 5.134, "irritacao": 0, "vigilancia": 2},
  "goodwill": 0.116,
  "cicatrizes": 0,
  "prior_confianca": 5,
  "exposicao_intima": 2,
  "ruptura": false
}
```

O snapshot arredonda campos numéricos a três casas. `cicatrizes` é uma contagem, não uma lista;
`ruptura` é booleano. Identidade e outros detalhes internos não estão no snapshot. Ausência de um
campo não deve virar zero. A lista de turnos é a fonte de observações históricas; o mapa `relacoes`
mostra a projeção atual. Não inventar o estado anterior ao primeiro snapshot retornado.

O log atual traz `eventos` como pares `[tipo, intensidade]`, `deltas_rel`, `ruptura` e
`identidade_aplicada`. O painel deve preservar o conteúdo retornado, tolerar campos adicionais
e validar apenas o que interpreta. `deltas_rel`
registra uma etapa do cálculo; não equivale necessariamente a `snapshot final − snapshot anterior`,
pois o motor também aplica outras atualizações. A UI deve distinguir log técnico e comparação de snapshots.

Essas escalas descrevem o motor. Não são probabilidades de satisfação humana nem validação
empírica de representatividade dos perfis.

## Erros e resultado incerto

Erros conhecidos usam `{ "erro": "mensagem em português" }`.

| Status | Situação | Tratamento esperado no front |
|---|---|---|
| 400 | Entrada inválida ou JSON inválido nos caminhos validados | Exibir mensagem, manter entrada e permitir correção |
| 404 | Rota, ID, perfil ou sessão ausente/inválida | Explicar ausência e permitir voltar/recarregar |
| 502 | Falha no interpretador/narrador | Manter mensagem, informar falha; servidor não salvou o turno |
| 503 | LLM não configurado | Oferecer modo manual; não solicitar segredo na UI |
| 500 | Falha interna | Mensagem genérica, sem exibir detalhes internos |
| Sem resposta ou JSON inesperado | Falha de conexão, resposta perdida ou contrato incompatível | Estado explícito de erro/incerteza; não exibir sucesso nem reenviar POST automaticamente |

A persistência atual usa arquivos JSON e não oferece transação entre requisições, lock de sessão,
ETag ou idempotência. O servidor é concorrente (`ThreadingHTTPServer`). Bloquear o envio na UI ajuda
na mesma tela, mas não impede duas abas ou clientes de executar sobre o mesmo estado. A perda de
resposta pode ocorrer depois de um turno ter sido gravado. Atualizar o histórico não constitui,
sozinho, prova de que uma requisição anterior terminou; não automatizar a repetição.

## Preparar a troca futura de motor

O cliente HTTP do front deve centralizar serialização, validação dos campos consumidos, erros e
IDs de sessão. Componentes recebem objetos da aplicação e não importam regras de cálculo ou o
formato JSON interno de persistência. Futuras extensões devem preservar os campos atuais ou
introduzir uma migração explícita do contrato. Acrescentar um campo à UI não o conecta ao motor.

Um futuro backend TypeScript/Node precisará manter este comportamento observável, inclusive
status, campos ausentes e ordem dos eventos, ou oferecer uma adaptação versionada. Também deverá
comprovar a equivalência do estado completo e a migração/retomada dos arquivos Python. Esse trabalho
fica fora do M3; o documento não certifica uma troca transparente já implementada.

## Evidências locais

- [Handler e rotas](../app/handler.py).
- [Validação de entrada](../app/validacao.py).
- [Persistência e listagem](../app/store.py).
- [Servidor](../app/server.py) e [estáticos](../app/estatico.py).
- [Motor e snapshot](../phb/engine_v3.py).
- [Interpretação e narração](../app/llm.py).

O smoke de #24 subiu o servidor real com `--porta 0 --dados <diretório-temporário>`, com variáveis
PHB/Anthropic/OpenRouter removidas do processo, criou um perfil fictício e verificou o exemplo
manual acima. Também verificou retomada, rejeição de campo extra, 404 e 503 sem alterar o número
de turnos. O processo e os dados foram descartados ao terminar. A cobertura completa de provedores
é da suíte existente e da futura validação do core, não deste smoke manual.
