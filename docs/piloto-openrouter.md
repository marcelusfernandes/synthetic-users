# Piloto OpenRouter com Codex

Este documento preserva o estado e as decisões do objetivo
[#14](https://github.com/marcelusfernandes/synthetic-users/issues/14). Ele não retoma o
piloto automaticamente; use [codex.md](codex.md) somente quando o usuário pedir.

## Estado em 2026-09-07

- O transporte OpenRouter [#16](https://github.com/marcelusfernandes/synthetic-users/issues/16)
  foi integrado à `main` pelo PR #22 (`781f969`). O usuário validou manualmente o GLM;
  isso não equivale à matriz dos seis modelos.
- O bootstrap [#15](https://github.com/marcelusfernandes/synthetic-users/issues/15) é a
  entrega de instruções e helpers do PR #21; consulte o estado do PR para evidência de integração.
- O seletor visual [#17](https://github.com/marcelusfernandes/synthetic-users/issues/17) e a
  validação [#18](https://github.com/marcelusfernandes/synthetic-users/issues/18) permanecem
  pendentes. O objetivo #14 continua aberto.

Os checkpoints [#19](https://github.com/marcelusfernandes/synthetic-users/issues/19), sobre
catálogo e variantes, e [#20](https://github.com/marcelusfernandes/synthetic-users/issues/20),
sobre credencial e teto de gasto, continuam pendentes. Propostas não são aprovação.
Chamadas pagas, produção e envio de dados reais exigem resposta explícita; credenciais
nunca vão para issue ou chat. A exceção do PR #22 valeu somente para aquele trabalho.

## Operação e evidência

O estado durável vive nas issues e PRs. Context/Proof/Files e `Blocked by:` permanecem nas
issues do piloto por compatibilidade com CI. Sob `Dependencies`, use uma única linha:
`Blocked by: none` sem dependências ou `Blocked by: #N, #M` com dependências; não misture
formatos e coloque explicações em `Context`.

Os cinco arquivos da skill preservam o snapshot combinado SHA-256
`a82e3983d5ec530c7a0c5100384ab96cd7bfc81e35fbf105213d49cb3c99e658`, calculado sobre
caminho relativo + NUL + conteúdo, em ordem alfabética. A origem é a branch local
`codex/autonomous-loop` do `agentic-setup`, ainda sem release publicada. A baseline atual
é `make test`: 14 testes do motor e 54 da aplicação, 68 no total. O teste manual do GLM é
evidência limitada; não prova outros modelos nem autoriza consumo.

A `main` é agora a `Integration branch` explícita do objetivo #14. Publicação e merge são
permissões separadas: o objetivo mantém `publish: yes`, `merge: no`. O loop pode planejar,
especificar, implementar e publicar, mas para na integração humana enquanto merge não
estiver autorizado. Novos objetivos também usam `main` por padrão, salvo destino explícito.
