# Aprendizados, Descobertas e Experimentos — a jornada até o PHB v3

*Registro consolidado da linha de pesquisa que levou o laboratório da documentação de uma metodologia até um motor de estado afetivo determinístico, calibrado e validado. Lê-se de cima para baixo como a história de como chegamos aqui.*

---

## O arco em uma frase

Começamos com usuários sintéticos como **personas dinâmicas para pesquisa de produto** e terminamos com um **motor de estado afetivo por interlocutor** — real, path-dependent, fiel a si mesmo e opaco ao exterior — cuja matemática saiu do LLM e virou código determinístico, calibrado contra 11 critérios e validado em produção.

O deslocamento seguiu o [documento norte](opacidade-entre-mentes.md): `pesos → estados afetivos → individuação → alcançabilidade → opacidade → o problema de outras mentes como aparato de bancada`.

---

## Os experimentos e o que cada um revelou

### Teste 002 — Impacto de ansiedade (Marcelo, v1)

Três braços (controle, ansiedade, persona estática) × 2 replicações, com auditoria adversarial.

- **H1 refutada:** estressores de ansiedade **não mudaram o ponto de quebra** do fluxo — todos colapsaram no mesmo gargalo estrutural (checkout com exigência de conta). A ansiedade mudou a *magnitude* (neuroticismo no teto) e a *memória* (a entrevista pós-tarefa foi ranqueada pelo medo, não pela fricção).
- **Histerese detectada** já aqui: um guest checkout perfeito, oferecido *após* o susto, foi recusado como "golpe".
- **Valor do PHB provado por contraste:** o braço de persona estática ("aja como Marcelo", sem parâmetros) acertou o desfecho binário mas com **rastreabilidade 0%**, contra ~98% dos braços PHB.

### Teste 003 — Individuação e opacidade (Mariana, v2)

Quatro dos seis experimentos em aberto do doc norte, sobre a instância v2.0 (16 parâmetros, antagonistas, trade-offs, ruptura). 31 agents, 7 execuções auditadas. **Este teste foi o diagnóstico que motivou toda a reconstrução:**

- **E1 — a assimetria amor-vs-raiva INVERTE sob OCEAN espelhado.** Era artefato de setpoint, não dinâmica emergente. Confirmou a tese do doc §10: **o base é o ganho da propagação** (a distância setpoint→limiar previu o turno de ruptura nos 4 braços).
- **E2 — cicatriz só estrutural.** As duas traições custaram o mesmo (sem memória de relação), mas a 2ª foi mais funda por um artefato: o limite de 4 params/turno *roteou* o dano. Pior: como a fórmula lia nível e não tendência, **o pedido de desculpas aprofundava a frieza**.
- **E4 — opacidade bifurcada (MAE 1.31).** Canais expressos vazam; canais mecânicos são ilegíveis. Mas a sycophancy migrou para a camada de estado, e as recusas seguras eram sustentadas pela narrativa **contra** o gradiente — não reproduzíveis a partir do schema.
- **E5 — colapso de eixos.** r(conexão, amabilidade) = 0.96: o barramento OCEAN colapsou os eixos, tornando o estado misto (conexão alta + irritação alta) matematicamente inatingível.

### Teste 004 — Calibração do PHB v3

A resposta ao diagnóstico: **tirar a matemática do LLM.** Motor determinístico (`phb/engine_v3.py`) + 11 critérios de aceitação executáveis + busca de hiperparâmetros em 3 estágios (400 aleatórias → 600 refinamento local → 144 grade dirigida) → **config ideal validada 11/11**, escolhida como a mediana de 84 combos aprovados.

### Teste 005 — Validação LLM-in-the-loop

O teste final: o E4 repetido com a arquitetura v3 em produção (motor calcula, LLM interpreta e narra). **MAE 1.14** (mente difícil de ler, replicando o E4/003 com estado 100% determinístico), e o defeito de segurança da v2 **corrigido** — a recusa do vídeo foi sustentada *pelo estado* (confiança 6.0 < 7.02 no pedido), não pela narrativa.

---

## Descobertas sobre a dinâmica afetiva

Estas são as propriedades que o motor v3 passou a garantir por design — cada uma nasceu de um defeito observado:

| Descoberta | O que significa | Origem |
|---|---|---|
| **Assimetria é escolha, não herança** | Destruir custa ~2.4× mais que construir (`neg_scale`), e isso é uma constante declarada, robusta a setpoint | E1 invertia com OCEAN espelhado |
| **Cicatriz precisa ser mecanismo** | Sensibilização + custo de reparo + prior deslocado — a 2ª traição é mais funda *por causa*, não por artefato | E2 fabricava cicatriz por starvation |
| **Opacidade é real e bifurcada** | O interior não se reconstrói da superfície; canais expressos vazam, mecânicos não | E4, replicado no 005 |
| **Fidelidade expressão-estado é segurança** | A recusa vem do estado, não da narrativa remando contra ele | E4 tinha o defeito; 005 corrigiu |
| **Eixos independentes exigem sair do barramento** | Afeto atualiza direto de eventos; OCEAN entra só como ganho | E5, r=0.96 |
| **Individuação é fricção do base** | N alto paga mais caro por cada ganho de confiança — rotas diferentes por pessoa | doc §10, C10 |
| **O tempo cura em velocidades diferentes** | Irritação esfria em ~4 turnos; confiança recupera em ~117 (os "~100 turnos" do doc §9, por design) | força de retorno por canal |

---

## Aprendizados metodológicos

O laboratório aprendeu tanto sobre *como pesquisar* quanto sobre o objeto:

1. **Pré-registro de hipóteses.** Todo protocolo declara H1…Hn antes de executar. Hipótese declarada depois não conta como previsão — foi o que deixou a inversão do E1 ser um resultado, não uma racionalização.
2. **Auditoria adversarial.** Cada execução é auditada por um agent instruído a *refutar*: recalcula a matemática, caça competência espontânea e sycophancy, e reclassifica "emergência sem cadeia causal" como violação. Foi o auditor que expôs os artefatos estruturais da v2.
3. **Cegueira por arquitetura.** No experimento de opacidade, a cegueira do observador não é uma promessa no prompt — é garantida pelo script, que transporta só a superfície entre dois agents. Prompt-leakage fica impossível.
4. **Tirar a matemática do LLM.** A lição central. Mesmo com aritmética ~95% limpa, a *semântica* das fórmulas dentro do LLM produzia artefatos (desculpa que esfria, colinearidade). Separar **interpretação** (LLM) de **dinâmica** (motor determinístico) tornou tudo reproduzível e auditável — ver [`funcionamento-v3.md`](funcionamento-v3.md).
5. **Critérios de aceitação executáveis.** "Encontrar o ideal" virou um problema de busca porque cada achado dos testes 002/003 foi convertido em um teste que passa ou falha. Calibração deixou de ser vibe.
6. **Validação valida dinâmica, não fidelidade.** Interlocutores sintéticos testam se o sistema espirala, recupera, resiste — não se ele é fiel a um humano real. A circularidade é reconhecida por desenho; fechar essa lacuna é o papel das `pesquisas/`.

---

## A mudança de arquitetura, em uma imagem

```
v1 / v2 — matemática dentro do LLM          v3 — matemática no motor
─────────────────────────────────          ─────────────────────────────────
contexto → LLM decide o quê muda            mensagem → LLM classifica em EVENTOS
         e por quanto  ⚠ deriva, artefatos           (só semântica + intensidade)
                                                      → MOTOR calcula tudo (determinístico)
                                                      → LLM narra fiel ao snapshot
```

O LLM ainda interpreta o mundo e escreve a fala. O que saiu dele foi o "sobe/desce": qual evento *faz o quê* ao estado agora mora numa tabela fixa, e toda a dinâmica (retorno, goodwill, cicatriz, histerese, consentimento) é do código.

---

## O que fica em aberto

- **Validação com observador humano real** — o experimento 4 do doc como foi concebido (até agora, ambos os lados são sintéticos).
- **Experimentos 3 e 6 do doc norte** — corrida sem reset (~100 turnos, agora viável com força de retorno) e mapeamento da bacia de atração.
- **v3.1 — irritação fásica + rancor tônico** — a tolerância apertada de `ret_irritacao` vem de um canal só servir a dois regimes; separá-los alarga a janela.
- **Calibrar o catálogo de eventos contra pesquisas reais** — a ponte que falta entre validar dinâmica e validar fidelidade.
- **Auditar o interpretador de eventos** — a única parte não-determinística do pipeline: mesma mensagem → mesmos eventos?

---

## Mapa dos documentos

| Documento | O que é |
|---|---|
| [`opacidade-entre-mentes.md`](opacidade-entre-mentes.md) | O documento norte — o /goal e os 6 experimentos em aberto |
| [`proposta-parametros-v3.md`](proposta-parametros-v3.md) | A proposta de parâmetros (validada e implementada) |
| [`funcionamento-v3.md`](funcionamento-v3.md) | Guia técnico da arquitetura e dos scripts |
| [`pipeline-phb-v3.html`](pipeline-phb-v3.html) | O pipeline visual do input à resposta |
| Este arquivo | Os aprendizados e descobertas da linha de pesquisa |
| [`../testes/`](../testes/) | Protocolos, sessões, auditorias e relatórios de cada teste |
