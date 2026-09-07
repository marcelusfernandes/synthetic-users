# Desenvolver com Codex

O bootstrap do loop está neste repositório. Não é necessário manter um checkout do
`agentic-setup`, instalar plugin, copiar fontes ou instalar `node_modules`.

## Pré-requisitos

- Node.js 22.18 ou superior;
- Git e GitHub CLI (`gh`) autenticado para operações no GitHub;
- Codex CLI ou aplicativo Codex. O executor headless é opcional.

Abra o Codex na raiz de `synthetic-users`. A skill em
`.agents/skills/autonomous-loop/` é descoberta da raiz do repositório até o diretório
atual. Invoque-a explicitamente com `$autonomous-loop`. Se ela não aparecer depois do
bootstrap, abra uma nova sessão/reinicie o Codex. Isso segue a documentação oficial de
[skills](https://learn.chatgpt.com/docs/build-skills) e de
[`AGENTS.md`](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

## Novo objetivo

Use um prompt explícito, por exemplo:

> Use `$autonomous-loop` para criar e executar um novo objetivo GitHub para `<resultado>`.
> Publique branches e PRs, mas não faça merge sem minha autorização explícita.

O objetivo registra resultado, critérios, limites, decisores e permissões. No exemplo acima,
registre `publish: yes`, `merge: no`. A `main` é o destino normal sem outra `Integration branch`
autorizada. Cada tarefa usa `codex/task-N` em checkout isolado; nunca há push direto para
`main`. Em specs compatíveis com o CI atual, use uma única linha `Blocked by: none` ou
`Blocked by: #N, #M` sob `Dependencies`, conforme existam dependências; coloque qualquer
explicação em `Context` e não misture formatos.

## Retomar um objetivo

Para retomar o piloto somente quando desejado:

> Use `$autonomous-loop` para retomar o objetivo #14.

Para outro objetivo, substitua o número. Um prompt comum não retoma o #14 nem qualquer
loop anterior. Antes de agir, consulte o snapshot sem chamar um modelo:

```sh
node .agents/skills/autonomous-loop/scripts/github.mts status 14
```

O executor headless é opcional e executa no máximo três transições:

```sh
node .agents/skills/autonomous-loop/scripts/run.mts 14 --max-turns 3
```

`--max-turns` limita rodadas, não tokens nem custo. O runner não amplia sandbox,
aprovações ou permissões. Seus logs ficam nos metadados Git em `agentic-runs/` e podem
conter contexto sensível; trate-os como dados locais sensíveis.

## Autoridade e gates

- Checkpoints são obrigatórios para decisões materiais de produto/escopo, custo, produção,
  dados e compromissos difíceis de reverter. Silêncio e recomendação não são aprovação.
- `publish` autoriza publicação de branch/PR; `merge` é permissão separada por objetivo.
- Revisão independente local ajuda a qualidade, mas não cria `APPROVED` no GitHub.
- Na proteção atual da `main`, os checks `test`, `scope` e `negative-control` são exigidos.
  A regra do servidor declara zero approvals obrigatórios e não descarta approvals antigos,
  mas o helper `land` é mais estrito: requer ao menos uma aprovação atual, descarte de
  aprovação obsoleta e checks verdes. Ele recusa política incompatível; não contorne com
  merge direto.
- Um coordenador e uma implementação operam por vez. Use subagentes somente quando o usuário
  pedir e não rode o orquestrador Claude nas mesmas tarefas.

O contrato completo está em
[`.agents/skills/autonomous-loop/references/contract.md`](../.agents/skills/autonomous-loop/references/contract.md).
