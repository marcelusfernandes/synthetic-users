# Validação do core da experiência

Validação técnica da jornada perfil → sessão → interação → histórico → retomada,
realizada em 07/09/2026 (execuções de CI também em 08/09 UTC), no objetivo
[#23](https://github.com/marcelusfernandes/synthetic-users/issues/23) e milestone M3.
A avaliação usa dados fictícios em diretórios temporários. Nenhuma inferência paga
ou envio de dados reais foi realizado.

## Ambiente e reprodução

- Local: macOS, Python 3.9.6, Node 22.22.3, npm 10.9.8. CI: Linux, Python 3.12, Node 22.
- React 19.2.8, TypeScript 7.0.2, Vite 8.2.2, StyleX 0.19.0, Vitest 5.0.0, com lockfile.
- Navegação independente pelo agente `qa_core`, via CUA/Chrome. Desktop 1718×904
  e viewports 390×844 e 320 px de largura. São viewports emulados, não aparelhos físicos.

```sh
npm ci --prefix apps/frontend
make test
npm --prefix apps/frontend run qa
```

O último comando imprime a URL do produto compilado com servidor Python real,
provedor HTTP emulado e proxy local. `success` restaura o provedor; `pass` restaura
o proxy; `sair` encerra o harness e remove seus dados. Os controles completos estão
no [guia do core](core-experiencia.md#validação-e-recuperação-de-criações).

## Verificações automatizadas

| Verificação | Resultado observado | Evidência |
|---|---|---|
| Motor determinístico | 14/14 testes | `phb/test_engine_v3.py` |
| API, LLM e estáticos | 56/56 testes de integração | `app/tests/`, servidor real em porta efêmera |
| Frontend | 22/22 testes em seis arquivos | `apps/frontend/src/api/client.test.ts` e `src/test/*.test.tsx` |
| TypeScript | Sem erros | `npm --prefix apps/frontend run typecheck` |
| Build | JS/CSS locais, StyleX extraído | `npm --prefix apps/frontend run build` |

O frontend é exercitado com React Testing Library/jsdom e fetch real para o Python.
A configuração do Vitest usa o compilador StyleX sem o servidor de HMR. jsdom não
valida layout nem rolagem; esses pontos foram conferidos separadamente no Chrome.
O `make test` descobre testes em runtime, falha se faltam dependências e não aceita suíte vazia.

Os testes verificam criação/consulta/recarga de perfil, OCEAN, abertura e retomada,
eventos múltiplos ordenados, rascunhos entre rotas, conversa e duplo clique.
Sessões com interlocutores intercalados comprovam comparação da mesma relação.
Um snapshot histórico parcial no diretório isolado comprova que ausência não vira zero.

A rodada de recuperação cobre HTTP 400/404/500/502/503, resposta descartada após
processamento, JSON de confirmação incompleto e falha de GET seguida de recuperação.
Os testes conferem contagem de POSTs e registros persistidos. Nenhum cenário repete
POST automaticamente. Erros HTTP induzidos pelo proxy são identificados como emulação;
nos cenários de resposta perdida/incompleta o Python realmente processa o turno.

As regressões de criação retêm a resposta até liberação explícita no teste, permitindo
navegar antes da confirmação sem depender da velocidade da máquina.

## QA independente no navegador

| Jornada/cenário | Observação |
|---|---|
| Fundação | Overview vazio real, navegação, foco no título, Tab/Enter, reload e acesso ao laboratório clássico |
| Perfil | Nome vazio anuncia erro e recebe foco; nome/bio/voz salvos; OCEAN alterado por seta; detalhe/lista/reload preservam valores |
| Sessão manual | Perfil selecionado, interlocutor obrigatório, adicionar/remover eventos, intensidade e ordem preservadas; confirmação e estado real |
| Continuidade | Jornada completa até histórico, recarga e novo turno; rascunho preservado ao navegar sem recarregar |
| Conversa emulada | Pending visível, controles bloqueados, um turno confirmado com mensagem/narrativa do stub |
| Falhas do provedor | Interpretação e narração falham: erro explícito, rascunho preservado entre rotas, contador/estado não avançam |
| Histórico | A1/A2/B3/A4: A4 compara com A2; filtro B contém apenas B3, sem anterior inventado; tabelas, log e narrativa correspondem ao registro |
| Resposta perdida | Após um turno manual, mensagem descartada na resposta vira incerteza; consulta mostra exatamente o segundo turno salvo; só a conferência libera/limpa o formulário |
| Criação com atraso | Navegar enquanto perfil/sessão aguarda resposta mantém acompanhamento; lista contém um registro após confirmação |
| Telas estreitas | Formulários, controles, tabelas e painéis utilizáveis; gráfico revalidado em 390 px e 320 px após correção dos rótulos |

Foram usados rótulos, campos nativos, foco visível, mensagens com `role=status/alert`
e tabelas equivalentes ao gráfico. Não foi realizada auditoria completa com leitor
de tela; o resultado é uma verificação técnica de navegação/acessibilidade, não
certificação de conformidade ou pesquisa de usabilidade com participantes.

## Problemas encontrados e corrigidos

1. **Rótulos do gráfico encolhiam no celular.** Texto SVG passou a ter tamanho
   responsivo e margem maior; excesso de rótulos de turnos é reduzido aos extremos.
   QA revalidou desktop, 390 px e 320 px.
2. **Criação pendente era perdida ao desmontar o formulário.** O estado da criação
   passou ao App, preservando entrada e bloqueio ao navegar. O teste correspondente
   falhou antes da correção e passou depois.
3. **Confirmação duplicava um card já obtido pela listagem.** QA reproduziu em perfil
   e sessão com atraso de três segundos: GET encontrava o registro antes da resposta
   do POST. A confirmação agora atualiza por id. QA e teste reproduzível verificam
   um único card/link e um único registro persistido.

## Rastreabilidade

- [PR #30 — proposta/contrato](https://github.com/marcelusfernandes/synthetic-users/pull/30).
- [PR #31 — fundação](https://github.com/marcelusfernandes/synthetic-users/pull/31).
- [PR #32 — perfis](https://github.com/marcelusfernandes/synthetic-users/pull/32).
- [PR #33 — sessões](https://github.com/marcelusfernandes/synthetic-users/pull/33).
- [PR #34 — histórico](https://github.com/marcelusfernandes/synthetic-users/pull/34).
- [Tarefa #29 — validação e correções finais](https://github.com/marcelusfernandes/synthetic-users/issues/29).

Os PRs registram os SHAs revisados, resultados do QA e checks do servidor.
`test`, `scope` e `negative-control` permanecem obrigatórios. Nos PRs funcionais,
o controle negativo executa a base limpa e depois sobrepõe testes/suportes,
confirmando falha de comportamento onde a funcionalidade/correção ainda não existe.
O mantenedor autorizou merge autônomo após testes e QA; não foram alteradas proteções,
usado bypass administrativo ou simulada aprovação GitHub de outra identidade.

## Limites da conclusão

A entrega comprova o core local e a separação HTTP do frontend. Motor e calibração
foram preservados; não houve migração de persistência. Dados legados foram representados
por fixtures compatíveis e snapshots parciais; não foi executada migração sobre dados reais.

O provedor de QA devolve respostas fixas; isso não comprova qualidade de um modelo real.
Não houve avaliação com cinco pessoas, comprovação de fidelidade comportamental,
porte para TypeScript/Node, autenticação multiusuário ou implantação em produção.

Rascunhos, bloqueios e conferências ficam em memória até recarregar/fechar. O protocolo
JSON atual não tem idempotência ou coordenação de escrita entre abas/processos; consultar
o histórico não cancela requisições ainda processadas. A UI explicita resultado incerto
e não reenvia comandos automaticamente, mas não promete resolver essa limitação do servidor.
