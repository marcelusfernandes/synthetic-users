# synthetic-users

Laboratório de research tests da metodologia PHB. O motor determinístico vive em `phb/`;
o LLM interpreta mensagens em eventos e narra — nunca calcula. Este repositório roda o
agent loop do plugin `agentic-setup` (issues → worktrees → PRs revisados → merge por CI).

## Comandos

- `make test` — a única porta de entrada dos testes (`phb/test_engine_v3.py`, 14 testes,
  e o que `app/` adicionar). CI (`.github/workflows/test.yml`) e o `negative-control` do
  loop rodam exatamente isto.
- `python3 phb/run_turn.py --catalogo` — lista os eventos que o LLM pode emitir.
- Variáveis de ambiente do front (`app/`): `PHB_LLM_PROVIDER=anthropic|openrouter`,
  `ANTHROPIC_API_KEY`/`OPENROUTER_API_KEY` (somente a chave selecionada liga o turno),
  `PHB_MODEL` (default `claude-sonnet-5` somente no Anthropic) e `PHB_LLM_URL`
  (default: endpoint oficial do provedor).

## Mapa

- `phb/` — `engine_v3.py` (estado + `step()`), `config_v3_ideal.json` (calibração),
  `run_turn.py` (CLI LLM ↔ motor), `calibrar_v3.py`, `test_engine_v3.py`.
- `app/` — o front: `server.py` (CLI + `ThreadingHTTPServer`), `handler.py` (rotas de
  personas, sessões, turnos e mensagem), `llm.py` (turno com LLM opcional — interpreta
  em eventos, narra), `estatico.py` (serve `app/static/` com segurança), `store.py`
  (persistência em JSON), `validacao.py` (valida payloads HTTP), `static/` (a página),
  `tests/` (testes de integração, servidor real). `personas/` guarda as personas em
  JSON; `sessoes/` (ignorado pelo git) guarda o estado de cada sessão.
- `exemplos/`, `arquetipos/`, `padroes_compra/`, `modificadores/`, `dual_class/`,
  `pesquisas/` — a fundação da metodologia (v1/v2) em Markdown/`.mdc`.
- `docs/` — documento norte, guia técnico v3, aprendizados. `testes/` — os experimentos.

## Invariantes (o reviewer cobra cada PR por estas)

1. **O LLM nunca calcula; o motor nunca escreve texto.** Toda mudança de estado passa por
   `engine_v3.step()`; nenhum código em `app/` (Python ou JS) recalcula eixos, OCEAN,
   goodwill ou ruptura — só exibe o snapshot que o motor devolve.
2. **A matemática de `phb/engine_v3.py` não muda.** Só se admite parâmetro novo com valor
   default nos construtores (`novo_estado`, `Estado`); `config_v3_ideal.json` não muda e
   `python3 phb/test_engine_v3.py` continua 14/14.
3. **Python 3.12 stdlib apenas** em `app/` e `phb/`; nenhuma dependência `pip`. O front é
   HTML/CSS/JS puro servido pelo próprio servidor, sem build, sem framework, sem CDN.
4. **Os testes de `app/` sobem o servidor real** numa porta efêmera e falam HTTP; nada é
   mockado. `make test` é a única porta de entrada.
5. **Português** nos textos de UI, docs e mensagens; identificadores seguem o código
   existente (`persona`, `sessao`, `quem`, `eventos`, `snapshot`).
6. **Segredos só por ambiente.** `ANTHROPIC_API_KEY` e `OPENROUTER_API_KEY` (opcionais)
   nunca aparece em arquivo, log ou resposta HTTP; sem a variável o front funciona com
   eventos escolhidos à mão.
7. **Docs iguais ao código.** Mudança de comando, rota ou formato de arquivo atualiza
   `README.md`/`docs/` no mesmo PR.

## Workflow

Quando a rota Claude for escolhida, seguir o fluxo legado: uma issue por unidade de
trabalho, uma worktree por agente, branch `<type>/<n>-<slug>`, `test(red):` primeiro e PR
com `Closes #N`. Para Codex, seguir `AGENTS.md`, `docs/codex.md` e a skill local; não rodar
os dois orquestradores sobre as mesmas tarefas. Em qualquer rota, nunca fazer push direto
na `main`, confundir revisão local com aprovação GitHub ou inferir permissão de merge.
