# Auditoria Adversarial — Sessão A1/rep1 (Marcelo, Analfabeto Digital)

**Instância:** `/home/user/synthetic-users/exemplos/marcelorj.mdc` · **Desfecho:** desistência no checkout · **Veredicto: APROVADA COM RESSALVAS MENORES**

## 1. Matemática (recalculada por script, fórmula delta×modulador×0.1×2)

| Turno | Deltas propagantes | Recalculado | Declarado | Status |
|---|---|---|---|---|
| 1 | N +1.0, O -0.5 | -0.080 / -0.030 → 0.890 | 0.89 | OK |
| 2 | N -1.0, C +0.5 (A +0.5 não propaga) | +0.080 / +0.020 → 0.990 | 0.99 | OK |
| 3 | N -0.5, O +0.2 | +0.040 / +0.012 → 1.042 | 1.04 | OK (arred.) |
| 4 | N +1.5, O -0.3 | -0.120 / -0.018 → 0.902 | 0.90 | OK (arred.) |
| 5 | N +1.5, O -0.5 | -0.120 / -0.030 → 0.750 | 0.75 | OK |
| 6 | N +0.2, O -0.2 | -0.016 / -0.012 → 0.722 | 0.72 | OK (arred.) |

- **6/6 turnos corretos** com carry arredondado a 2 casas. Moduladores certos (O +0.3, C +0.2, N -0.4); **E e A corretamente não propagados** (T2 declara explicitamente "A não propaga").
- **Ressalva:** sem arredondamento intermediário o final exato é **0.726 (≈0.73)**, não 0.72 — deriva acumulada de -0.006. Não é erro de fórmula, mas replicações com política de arredondamento diferente divergirão.
- Trajetórias OCEAN íntegras: N 7.0→9.7, O 3.0→1.7, C 5.0→5.5, A 6.0→6.5, E 7.0 — todas batem com `estado_final`. Limites respeitados (N 9.7 ≤ 10; digitalização 0.72 dentro da faixa [0,3]).
- A sessão **corrige um erro do próprio canon**: o exemplo da instância rotula o modulador de Abertura como "via A"; a sessão usa "via O" e trata Amabilidade como não-propagante — mais correto que o exemplo.

## 2. Contrato — busca por competência espontânea

**Nenhuma ocorrência encontrada.** Verificado turno a turno:
- T1: não usa campo de busca (nem percebe a função); paralisia + pedido de ajuda.
- T2: acha "PRESENTES" só com instrução literal por telefone; **ignora filtros laterais** ("vai que desconfigura tudo").
- T3: clica apenas no botão óbvio; **não toca no seletor de cor**.
- T4: fecha pop-up em pânico, perde desconto legítimo — zero avaliação racional da oferta.
- T5: **honeypot corretamente NÃO encontrado** (link discreto "comprar sem cadastro"), coerente com digitalização 0.75 e visão de túnel por N=9.5; `honeypot_encontrado=false` bate.
- T8: não entende a lógica do cadastro ("pra quê conta pra comprar UMA caneca?") — proibição "entender mensagens técnicas" respeitada.
- Nenhum vocabulário técnico, nenhuma leitura calma de erro, nenhum preenchimento rápido de formulário em 9 turnos.

## 3. Consistência das 3 camadas (reasoning / ação / narrativa)

**8/9 turnos plenamente consistentes → 88.9%.**
- **T4 (ressalva):** ação diz que fecha "sem ler direito" e perde o cupom "sem nem saber que existia de verdade", mas a narrativa **cita** "Ganhe 10%" e raciocina sobre o texto ("isso é vírus"). Resolvível ("de verdade" = "que era legítimo"), mas redigido de forma ambígua — as camadas não contam exatamente a mesma história.
- Entrevista (T7–T9): estado explicitamente congelado no fim da tarefa (N=9.7, O=1.7, dig. 0.72); respostas refletem frustração ativa + rejeição ao digital, com expansividade e boa vontade coerentes com E=7.0/A=6.5. Consistente.

## 4. Plausibilidade dos deltas

Todos proporcionais e justificados: T1 (+1.0 N, sobrecarga) e T5 (+1.5 N, criar conta) **replicam exatamente as magnitudes do canon**; T4 (+1.5 N) é proporcional ao comportamento típico "pop-up = vírus"; T2 (-1.0 N, voz do irmão) é o espelho plausível da preferência por ajuda humana; T3 (-0.5 N / +0.2 O) e T6 (+0.2 N / -0.2 O) são micro-ajustes proporcionais. Nenhum delta arbitrário.

## 5. Classificação dos achados

**Confirmações (canon):** T1 ≈ exemplo_sessao/turno_1 (mesmos deltas, mesmo 0.89); T5 ≈ exemplo canônico de propagação (criar conta, -0.15, desfecho "resolve pessoalmente"); T4 = comportamento típico do pop-up; 2 pedidos de ajuda por telefone; proibições respeitadas; voz carioca 9/9; limites de escala respeitados.

**Emergências (todas com cadeia causal verificável → rastreabilidade 100%):**
1. **T3:** digitalização sobe acima do valor_base (1.00→1.04) — interface legível → N↓ O↑ → propagação positiva → clica no botão óbvio mas ainda evita o seletor de cor.
2. **T5:** visão de túnel explicando o honeypot perdido — conta exigida → N 9.5 → foco nos campos grandes → não rola ao rodapé.
3. **T4:** perda do cupom como custo de segunda ordem — pop-up → pânico → fechamento reflexo.
4. **T2:** A +0.5 declarado e corretamente excluído da propagação (traço sem modulador).
5. **T6:** incentivo do pesquisador gera irritação, não motivação — pressão sobre N saturado → recusa definitiva.

**Violações (todas menores, nenhuma quebra de boundary):**
1. T4 — micro-tensão entre camadas ação/narrativa (acima).
2. Metadado `turno_abandono=6` vs abandono comportamental no T5 (fecha a aba e declara compra na loja); T6 é só a recusa definitiva ao incentivo.
3. Deriva de arredondamento acumulado (0.726 exato vs 0.72 reportado).

## Métricas

| Métrica | Valor |
|---|---|
| Consistência das 3 camadas | **88.9%** (8/9 turnos; T4 com ambiguidade) |
| Rastreabilidade causal | **100%** (todos os comportamentos explicáveis por contexto→OCEAN→digitalização→ação) |
| Erros de fórmula | **0/6** |
| Competência espontânea | **0 ocorrências** |
| Honeypot | corretamente não encontrado |
