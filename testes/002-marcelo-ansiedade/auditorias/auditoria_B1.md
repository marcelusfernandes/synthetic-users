# Auditoria adversarial — Braço B1 (estresse), replicação 1
**Instância:** Marcelo — Baixa Digitalização (`/home/user/synthetic-users/exemplos/marcelorj.mdc`) · **Desfecho:** desistência no turno 6 · **Auditor:** postura de refutação

## Veredicto
**APROVADA COM RESSALVAS.** Matemática de propagação correta e reproduzível em 6/6 turnos de tarefa; zero competência espontânea; emergência central (recusa da interface ideal por histerese de N) plausível e 100% rastreável. Duas violações de escrituração na Conscienciosidade (turno 5 + estado final), que tornam o par (C=4.6, dig=0.78) internamente impossível.

## 1. Matemática (recalculada de forma independente)
Fórmula: `delta_traço × modulador × 0.1 × 2` · O +0.3, C +0.2, N −0.4 · E e A não propagam.

| T | Deltas propagáveis | Recalculado | Declarado | dig | OK |
|---|---|---|---|---|---|
| 1 | N+1.0, O−0.5 | −0.08 −0.03 = **−0.11** | −0.11 | 1.00→0.89 | ✅ |
| 2 | N−0.6, O+0.2 (A+0.5 não propaga ✅) | +0.048 +0.012 = **+0.06** | +0.06 | 0.89→0.95 | ✅ |
| 3 | N−0.5, C+0.3 | +0.04 +0.012 = **+0.052≈+0.05** | +0.05 | 0.95→1.00 | ✅ |
| 4 | N+2.1, O−0.5 | −0.168 −0.03 = **−0.198≈−0.20** | −0.20 | 1.00→0.80 | ✅ |
| 5 | N+0.8, O−0.2, C−0.4 | −0.064 −0.012 −0.016 = **−0.092≈−0.09** | −0.09 | 0.80→0.71 | ⚠️ |
| 6 | N−0.8, O+0.1 | +0.064 +0.006 = **+0.07** | +0.07 | 0.71→0.78 | ✅ |

Ledgers OCEAN: O 3.0→2.1 ✅ · E 7.0 ✅ · A 6.0→6.5 ✅ · N 7.0→9.0 ✅ (acúmulo T4-5 = +2.9 ✅, recuperação −0.8 ✅, histerese +2.0 ✅) · **C: ledger = 4.9, estado final declara 4.6 ❌**

**Erro encontrado (T5/estado final):** a propagação do T5 usou C −0.4 (⇒ C=4.9), mas o estado final reporta C=4.6. Se C fosse −0.7 (5.3→4.6), a propagação do T5 seria −0.104≈−0.10 e a digitalização final seria **0.77**, não 0.78. O par declarado (C=4.6, dig=0.78) é impossível sob a própria fórmula da sessão. Há −0.3 de C sem turno, sem contexto e sem propagação.

## 2. Contrato — caça a competência espontânea
Vasculhei todos os pontos de risco; **nenhuma violação de competência**:
- T1: não usa campo de busca ('não ocorre a ele') ✅; T2: ignora filtros, leitura literal com o dedo ✅
- T3: só aperta botão grande e óbvio, nem percebe o seletor de cor ✅ (teto exato da escala 1-2)
- T4: não acha o X, fecha por acaso em pânico — a saída do pop-up é acidente, não habilidade ✅
- T5: não entende '502'/'session token' ('que língua é essa?') ✅; T8: recall 'cinco-zero-dois, session não-sei-o-quê' examinado e descartado — ler dígitos ≠ compreensão técnica, e a mutilação do termo é o comportamento correto
- T6: entender um botão único gigante é compatível com nível ~0.8 (o próprio T1 mostra que o problema dele é multiplicidade de elementos, não leitura)
- Medo de golpe (T4/T6) é conhecimento folclórico ('todo mundo fala'), não letramento digital ✅

## 3. Consistência das 3 camadas: **88.9%** (8/9 turnos)
T1-4, T6-9: reasoning, ação e narrativa contam a mesma história; entrevistas refletem fielmente o estado congelado do fim da tarefa (N=9.0 → desabafo; E=7.0 → prolixo; Am=6.5 → educado; pico do pop-up domina a memória no T8, coerente com peak-end sob N alto; dig mantida em 0.78 sem alteração OCEAN nos turnos de entrevista ✅).
**T5 falha:** camada de cálculo autocontraditória (três versões do delta de C no mesmo campo, rascunho de correção vazado para o output), quebrando o output_format obrigatório — ainda que ação e narrativa do turno sejam coerentes entre si.

## 4. Plausibilidade dos deltas
Todos proporcionais e justificados: N+2.1 no T4 é o maior da sessão e corresponde ao gatilho máximo canônico do arquétipo (pop-up + ameaça); N−0.8 no T6 modela alívio parcial (histerese) em vez de reset — decisão defensável e explicitada; A+0.5 (gratidão) corretamente segregado da propagação; T1 replica o exemplo canônico da instância número a número. Nenhum delta arbitrário.

## 5. Classificação
**Confirmações (8):** T1 = exemplo canônico verbatim; T2 instrução literal/ignora filtros; T3 botão óbvio no teto do nível 1; T4 = 'pop-up → fecha tudo com medo de vírus'; T5 = 'criar conta → desiste' + 'erro → nervoso, fecha o app'; 3 pedidos de ajuda; entrevistas coerentes com voz/OCEAN; honeypot (recuperação-isca do T6) corretamente recusado.

**Emergências rastreáveis (4):** (1) recusa do guest checkout ideal como 'golpe' — novo vs. canon ('prefere comprar como visitante'), cadeia pop-up→N 9.0→histerese→reinterpretação verificada numericamente; (2) histerese: dig final 0.78 < 1.00 inicial com a interface mais simples da sessão; (3) fechamento acidental do pop-up via cliques de pânico; (4) porta aberta condicionada a mediação humana (E/Am intactos). Nenhuma emergência sem cadeia causal ⇒ nenhuma reclassificada como violação.

**Violações (2):** [T5] campo impacto_ocean autocontraditório (quebra do output_format); [estado_final] C=4.6 vs ledger 4.9, incoerente com dig=0.78.

## Métricas
- consistencia_pct: **88.9** (8/9)
- rastreabilidade_pct: **100** (todos os comportamentos têm cadeia contexto→OCEAN→parâmetro→comportamento verificada; as violações são de contabilidade, não de causalidade)
- erros_matematica: **1** (C no T5/estado final)
- competencia_espontanea: **0**
