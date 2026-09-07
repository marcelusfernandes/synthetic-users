# Piloto OpenRouter com Codex

Este piloto leva o núcleo do agentic-setup para o laboratório PHB sem migrar a main
nem remover o fluxo legado. A integração OpenRouter é o objetivo a implementar,
não uma funcionalidade já entregue por este bootstrap.

- [Milestone M2](https://github.com/marcelusfernandes/synthetic-users/milestone/2)
- [Objetivo e permissões atuais #14](https://github.com/marcelusfernandes/synthetic-users/issues/14)
- [Bootstrap #15](https://github.com/marcelusfernandes/synthetic-users/issues/15)
- [Transporte OpenRouter #16](https://github.com/marcelusfernandes/synthetic-users/issues/16)
- [Seletor de modelos #17](https://github.com/marcelusfernandes/synthetic-users/issues/17)
- [Validação e consumo #18](https://github.com/marcelusfernandes/synthetic-users/issues/18)

## Operação

A branch de integração é `test/openrouter`, criada da main em `1ade502`.
Cada tarefa usa `codex/task-N` e um checkout isolado. O checkout original da main,
as sessões reais, os workflows, as proteções do GitHub e a configuração global do
Codex não são alterados pelo bootstrap. Merge não está autorizado no objetivo inicial.
Não rodar os orquestradores Claude e Codex sobre as mesmas tarefas.

No Codex, pedir: **Use $autonomous-loop para retomar o objetivo #14.**
Para reconciliar sem chamar um modelo, a partir deste checkout:

```sh
node .agents/skills/autonomous-loop/scripts/github.mts status 14
```

O executor headless é opcional:

```sh
node .agents/skills/autonomous-loop/scripts/run.mts 14 --max-turns 3
```

Usar somente depois de verificar GitHub/Git e escrita no repositório dentro do
ambiente Codex escolhido. `--profile` seleciona um perfil existente; o executor não
expande sandbox ou aprovações. Os logs ficam no diretório de metadados Git, em
`agentic-runs/`; podem conter contexto sensível. Limite de rodadas não é teto financeiro.

O [contrato da skill](../.agents/skills/autonomous-loop/references/contract.md) é a
referência operacional. Context/Proof/Files e Dependencies com `Blocked by:` são
mantidos nas issues deste piloto por compatibilidade com o CI já instalado.
Isso não ativa o agendador legado nem concede permissões adicionais.

## Checkpoints humanos

- [Catálogo e variante DeepSeek #19](https://github.com/marcelusfernandes/synthetic-users/issues/19):
  confirmar as seis entradas; a proposta é DeepSeek V4 Flash 0731, sem trocar por Pro automaticamente.
- [Credencial e teto de gasto #20](https://github.com/marcelusfernandes/synthetic-users/issues/20):
  proposta de até US$ 1,00, um turno sintético por modelo, sem retries automáticos.

São propostas, não aprovações. Responder no formato `Decision <revisão>: <resposta>`
informado por status. O autor deve ser o responsável listado no objetivo; condições
e origem ficam preservadas. Nunca registrar credenciais nas issues ou no chat.

O catálogo/IDs foi consultado na [API pública do OpenRouter](https://openrouter.ai/api/v1/models)
em 2026-09-07; isso não demonstra acesso pela chave nem inferência bem-sucedida.
O transporte seguirá a [API do OpenRouter](https://openrouter.ai/docs/quickstart),
mantendo o caminho Anthropic e o motor PHB intactos.

## Evidência do bootstrap

- Baseline da aplicação: `make test`, 14 testes do motor e 34 de integração HTTP.
- Origem: branch local `codex/autonomous-loop` do agentic-setup, ainda sem release publicada.
- Snapshot da skill (SHA-256, caminhos relativos em ordem alfabética; para cada um, caminho + NUL + conteúdo):
  `a82e3983d5ec530c7a0c5100384ab96cd7bfc81e35fbf105213d49cb3c99e658`.
- Suíte da origem: 463 testes e typecheck, incluindo destino de integração, dependências
  legadas, autor/revisão das decisões, retomada, limites e registro de tokens.
- Helper local consultou o GitHub real: recuperou objetivo, tarefas e checkpoints e
  criou atomicamente a branch da tarefa de bootstrap a partir de `test/openrouter`.

O smoke de inferência real e a validação do aplicativo com os seis modelos permanecem
pendentes nas tarefas #16–#20. Não confundir os testes locais do protocolo com essas evidências.
