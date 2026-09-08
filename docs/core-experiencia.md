# Core da experiência

O primeiro objetivo é concluir a jornada **perfil → sessão → interação → histórico → retomada**,
com uma interface própria de produto sobre o motor Python atual. A proposta visual está em
[experiencia-produto-phb.html](experiencia-produto-phb.html); a fundação do novo frontend está em `apps/frontend/`.

O mantenedor confirmou o recorte e a sequência front primeiro/Python preservado na conversa
em 07/09/2026. Depois de perguntar pelos registros do workflow, pediu “entao prossiga”.
Esse pedido originou a fase abaixo. Publicação de issues, branches e PRs está no escopo;
A instrução seguinte autorizou implementar o front e fazer merge quando os testes passarem,
com um agente de QA navegando na aplicação. Produção e chamadas pagas continuam fora do escopo.

## Acompanhar no GitHub

- [Milestone M3 — Core da experiência](https://github.com/marcelusfernandes/synthetic-users/milestone/3).
- [Objetivo / issue-mãe #23](https://github.com/marcelusfernandes/synthetic-users/issues/23).
- Integração: `main`, por PR. Permissões atuais: `publish: yes`, `merge: yes`, com testes/checks aprovados e QA independente.
- Decisor: `@marcelusfernandes`.

| Tarefa | Resultado verificável | Depende de |
|---|---|---|
| [#24 — Contrato e proposta](https://github.com/marcelusfernandes/synthetic-users/issues/24) | Referência visual versionada, contrato HTTP e acordos da stack | — |
| [#25 — Fundação do front](https://github.com/marcelusfernandes/synthetic-users/issues/25) | React/TypeScript/StyleX, componentes, navegação e acesso real à API | #24 |
| [#26 — Perfis](https://github.com/marcelusfernandes/synthetic-users/issues/26) | Criar, consultar e selecionar perfis com os campos atuais | #25 |
| [#27 — Sessões](https://github.com/marcelusfernandes/synthetic-users/issues/27) | Abrir/retomar, conversar e aplicar eventos manuais | #26 |
| [#28 — Histórico](https://github.com/marcelusfernandes/synthetic-users/issues/28) | Consultar turnos e evolução por interlocutor | #27 |
| [#29 — Validação](https://github.com/marcelusfernandes/synthetic-users/issues/29) | Jornada completa, falhas, teclado e layout estreito comprovados | #28 |

As seis tarefas também estão vinculadas como sub-issues nativas da issue-mãe.
As issues contêm critérios de aceitação, validação e limites de arquivos. O `Plan` da issue-mãe
é a lista durável; milestone e esta tabela ajudam a navegar. As dependências sequenciam a
adoção do contrato/stack e as capacidades que reutilizam os componentes anteriores.
O estado não é inferido de uma caixa marcada neste documento.

Para consultar sem invocar um modelo:

```sh
node .agents/skills/autonomous-loop/scripts/github.mts status 23
```

Este é um novo objetivo. O [piloto OpenRouter #14](https://github.com/marcelusfernandes/synthetic-users/issues/14)
continua independente; seus checkpoints de catálogo e gasto não são aprovados ou retomados por esta fase.

## O que entra

A visão geral mostra perfis e sessões existentes e dá um caminho claro para continuar.
O editor de criação aceita nome, bio, voz e os cinco parâmetros OCEAN de 0 a 10.
Nome, bio e voz contextualizam a expressão; OCEAN define a base de personalidade da sessão.
Não haverá edição de um perfil já salvo nesta primeira fase.

A sessão guarda o contexto do perfil e do interlocutor. A pessoa pode escrever uma mensagem
quando o provedor estiver configurado ou escolher eventos do catálogo no modo manual.
Carregamento, envio em andamento, vazio, erros e resultado incerto fazem parte da entrega.
O front só mostra o novo estado após confirmação do servidor e não reenvia automaticamente
um comando cuja resposta se perdeu. Bloquear um botão não garante idempotência entre abas.

O histórico apresenta eventos, texto e narrativa quando presentes, snapshot e log. A trajetória
de relação usa o mesmo interlocutor; OCEAN pertence ao estado compartilhado da sessão.
Um estado anterior ausente não é inventado a partir dos padrões do motor ou dos exemplos visuais.

## Direção visual

A referência mais recente orienta azul-noite `#111321`, marfim `#F1F0EE`, superfícies brancas,
coral `#E98A71`, rosa `#D95691` e pêssego `#F0D4CE`. O gradiente coral/rosa destaca a sessão
principal, com texto escuro. Botões principais usam azul-noite; detalhes têm abertura sob demanda.
Cores estão em `src/ui/tokens.stylex.ts`; composição, tipografia, espaço e estados em `src/ui/styles.ts`.

O HTML funciona offline e seus controles são uma prévia local. Os exemplos não devem virar
fallbacks de dados na aplicação. Os campos da prévia não criam perfis nem alteram o motor.

## Arquitetura da primeira entrega

```text
apps/frontend/               novo frontend React + TypeScript + StyleX
  src/features/              perfis, sessões e histórico
  src/api/                   HTTP, tipos e validação de respostas
  src/ui/                    componentes e tokens
app/                         API e servidor Python existentes
phb/                         motor Python e calibração preservados
contracts/http-atual.md      fronteira HTTP documentada
```

Essa estrutura separa o frontend da API existente.
Não há necessidade de mover o backend para outra pasta ou criar pacotes compartilhados antes
que existam consumidores reais. O novo front tem build; o servidor continua Python stdlib.
Na transição, a interface antiga permanece disponível em `/`; o build é habilitado explicitamente em `/produto/`.

O [contrato HTTP atual](../contracts/http-atual.md) separa o frontend do pipeline do servidor:
interpretar → `engine_v3.step()` → narrar → persistir. No modo manual, o servidor calcula e
persiste sem LLM. Componentes de apresentação não acessam arquivos de sessão nem recalculam eixos.
Dados e segredos ficam no servidor; fontes e estilos são empacotados sem CDN em runtime.

A fronteira HTTP permite uma futura troca de implementação do motor com impacto menor no front.
Isso não torna Python e TypeScript equivalentes por si só: um porte exigirá paridade por turno,
tratamento de arredondamento, compatibilidade de sessões e rollback. Nada disso muda nesta fase.

## Limites preservados

- Não alterar `phb/engine_v3.py` nem `phb/config_v3_ideal.json`.
- Manter o modo manual e a leitura das sessões existentes.
- Sem novas dependências pip ou migração do formato persistido.
- Não inferir identidade customizada completa: a criação de sessão atual usa a identidade padrão do motor.
- Não prometer memória de transcrição ao narrador: ele recebe a mensagem atual, eventos e snapshot.
- Sem públicos compostos, estudos A/B, atributos próprios, arquétipos executáveis, times, cobrança ou SDK público.
- Sem dados reais, chamadas pagas, implantação ou alteração das proteções do GitHub.

## Como comprovar a entrega

O percurso mínimo deve criar um perfil, abrir uma sessão, aplicar um turno manual, consultar o
histórico, recarregar e continuar do estado salvo, usando o servidor real em porta efêmera e dados
temporários. A conversa será verificada com um provedor HTTP local emulado; o relatório identifica
essa emulação e não a chama de inferência real.

A validação cobre erro de formulário, provedor ausente, falha HTTP/rede, estado pendente,
rascunho preservado e ausência de reenvio automático. Build, typecheck e testes do front devem
executar verificações reais no CI, junto de `make test`. O navegador comprova layout estreito,
teclado, foco, rótulos, status e correspondência entre a UI e os dados do servidor.

O HTML propõe uma pesquisa de usabilidade com cinco avaliadores; ela não foi realizada.
A validação técnica não deve ser apresentada como pesquisa humana nem como comprovação de
fidelidade comportamental. Evidências finais e limitações serão registradas pela tarefa #29.

## Base verificada para #24

No checkout `aaa4e18`, a inspeção do código e um smoke HTTP local confirmaram config sem LLM,
catálogo com 13 eventos, criação/listagem/leitura de perfil, rejeição de campo extra, abertura de
sessão vazia, turno manual, retomada com o mesmo turno, resumo de sessões, erro 503 sem provedor
e erro 404 para sessão ausente. Foram usados dados fictícios descartáveis, sem inferência paga.
A proposta visual foi inspecionada em desktop e viewport de 390 px, incluindo navegação por teclado,
OCEAN, alternância de modo, preservação de rascunho e inspeção do histórico.

Os testes e checks do PR são a evidência atual da tarefa #24. Isso não conclui o objetivo #23:
as tarefas de implementação e validação continuam pendentes até suas próprias entregas.

## Executar o novo front

Requer Node 22.22.3+ para as ferramentas de desenvolvimento; o build pronto precisa apenas do servidor Python.

```sh
npm ci --prefix apps/frontend
make test
python3 -m app.server --porta 8000 --dados /tmp/phb-core-demo --frontend apps/frontend/dist
```

Abra `http://127.0.0.1:8000/produto/`. Use um diretório de dados separado para avaliação.
`make test` executa motor, integração Python, typecheck, testes Vitest com servidor HTTP real e build.
Não ignora uma árvore de testes sem executar testes nem instala dependências silenciosamente.

Para desenvolvimento, inicie o Python sem `--frontend` e, em outro terminal:

```sh
npm --prefix apps/frontend run dev
```

O Vite usa base `/produto/` e encaminha `/api` para `http://127.0.0.1:8000`.
`PHB_DEV_API` pode mudar apenas esse destino local no processo do Vite; não contém chave.
Navegação por hash mantém links diretos e histórico do navegador sem fallback genérico do servidor.
`npm --prefix apps/frontend run build` gera JS/CSS locais em `dist/`; StyleX extrai o CSS durante o build.
O servidor recusa um diretório sem `index.html` e não serve arquivos fora dessa raiz, inclusive por symlinks.

Versões verificadas em 07/09/2026 no registro npm e na documentação oficial: React 19.2.8,
TypeScript 7.0.2, Vite 8.2.2 e StyleX 0.19.0. O lockfile fixa a árvore de dependências.
Integração segue a [documentação StyleX para Vite/React](https://stylexjs.com/docs/learn/installation/vite/vite-react),
com o plugin StyleX antes do plugin React.
