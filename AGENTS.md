# synthetic-users

Laboratório PHB: o LLM interpreta mensagens em eventos e narra; o motor determinístico
calcula o estado. API e motor continuam em Python stdlib. A UI legada usa HTML/CSS/JS
puro, sem build. O core M3 autoriza um novo frontend separado em React/TypeScript/StyleX;
a implementação é acompanhada pelo [objetivo #23](https://github.com/marcelusfernandes/synthetic-users/issues/23).

## Comandos

- `make test`: testes do motor e integração HTTP real da aplicação.
- `python3 -m app.server --porta 0 --dados <diretorio-isolado>`: smoke local sem tocar sessões reais.
- `python3 phb/run_turn.py --catalogo`: catálogo de eventos do motor.
- Node 22.18+ executa os scripts do loop. O novo frontend terá ferramentas Node próprias,
  com versões e comandos registrados quando implementado; Node não é dependência do servidor Python.

## Invariantes

- Não alterar a matemática de `phb/engine_v3.py` nem a calibração `phb/config_v3_ideal.json`.
  Toda mudança de estado passa por `engine_v3.step()`; o LLM não calcula.
- Sem dependências pip nem CDN em runtime. Para o core M3, React/TypeScript/StyleX com build
  é autorizado somente no novo front em `apps/frontend/`. Preservar a UI legada durante
  a transição e manter compatibilidade do modo manual. Ver [plano do core](docs/core-experiencia.md).
- Testes sobem o servidor real em porta efêmera; provedores externos podem ser emulados por
  um servidor HTTP local, como nos testes existentes. Não substituir código de produção por mocks.
- Segredos somente no ambiente do servidor; nunca em UI, logs, arquivos ou respostas HTTP.
  Chamadas pagas e envio de dados reais precisam de autorização específica.
- UI e documentação do projeto em português. A skill distribuída mantém sua versão original.
  Mudanças de comportamento atualizam testes e documentação no mesmo PR.

## Desenvolvimento com Codex

Usar `$autonomous-loop` somente quando o usuário autorizar um objetivo GitHub ou pedir
para retomá-lo. Um prompt comum não retoma automaticamente o objetivo #14. O guia prático
está em [docs/codex.md](docs/codex.md); o histórico do piloto OpenRouter está em
[docs/piloto-openrouter.md](docs/piloto-openrouter.md).

- Uma coordenação e uma implementação por vez, em branch `codex/task-N` e checkout isolado.
- `main` é o destino normal somente quando `Integration branch`/permissões do objetivo assim
  determinarem. Nunca fazer push direto nela nem inferir autorização de merge.
- Decisões materiais, produção, dados e custo exigem checkpoint humano explícito.
- Revisão local independente não equivale a aprovação no GitHub.
- Usar subagentes somente quando solicitado; preferências atuais: Luna para exploração ou
  pesquisa online, Sol para implementação e Astra para revisão. Não criar perfis globais.
- Quando disponível, preferir o grafo de código (indexar se necessário). Usar `rg` quando
  ele estiver indisponível/insuficiente e para strings ou configurações; o MCP não é requisito.
- Não executar em paralelo o orquestrador Claude descrito no `CLAUDE.md`.
