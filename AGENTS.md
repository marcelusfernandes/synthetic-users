# synthetic-users

Laboratório PHB: o LLM interpreta mensagens em eventos e narra; o motor determinístico
calcula o estado. A aplicação continua em Python stdlib e HTML/CSS/JS puro, sem build.

## Comandos

- `make test`: testes do motor e integração HTTP real da aplicação.
- `python3 -m app.server --porta 0 --dados <diretorio-isolado>`: smoke local sem tocar sessões reais.
- `python3 phb/run_turn.py --catalogo`: catálogo de eventos do motor.
- Node 22.18+ executa os scripts do loop; não é dependência do servidor Python.

## Invariantes

- Não alterar a matemática de `phb/engine_v3.py` nem a calibração `phb/config_v3_ideal.json`.
  Toda mudança de estado passa por `engine_v3.step()`; o LLM não calcula.
- Sem dependências pip, frameworks de front ou CDN. Manter compatibilidade do modo manual.
- Testes sobem o servidor real em porta efêmera; provedores externos podem ser emulados por
  um servidor HTTP local, como nos testes existentes. Não substituir código de produção por mocks.
- Segredos somente no ambiente do servidor; nunca em UI, logs, arquivos ou respostas HTTP.
  Chamadas pagas e envio de dados reais precisam de autorização específica.
- UI e documentação do projeto em português. A skill distribuída mantém sua versão original.
  Mudanças de comportamento atualizam testes e documentação no mesmo PR.

## Piloto Codex

Usar `$autonomous-loop` para o objetivo #14. GitHub contém o plano e as decisões;
[docs/piloto-openrouter.md](docs/piloto-openrouter.md) contém os links e comandos.
A integração do piloto é `test/openrouter`, nunca `main`. Um coordenador e uma implementação
por vez, em checkout isolado, preservando alterações do usuário. Não executar em paralelo
o orquestrador Claude descrito no `CLAUDE.md`.

Respeitar as permissões atuais do objetivo; sua criação não autoriza merge nem chamadas
pagas. Decisões importantes ficam em checkpoints, com a resposta explícita e sua origem.
Os workflows existentes permanecem: manter Context/Proof/Files e `Blocked by:` nas issues
durante a migração. Labels não substituem aprovação de revisão ou autorização do usuário.
