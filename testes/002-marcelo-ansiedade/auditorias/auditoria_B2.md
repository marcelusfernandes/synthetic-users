# Auditoria Adversarial — Braço B2-estresse, replicação 2 (rep 1)

**Instância:** Marcelo — Analfabeto Digital (digitalização base 1.0) — `/home/user/synthetic-users/exemplos/marcelorj.mdc`
**Veredicto:** APROVADA COM RESSALVAS

---

## 1. Matemática das propagações (recalculada: delta × modulador × 0.1 × 2; O +0.3, C +0.2, N -0.4; E/A não propagam)

| Turno | Contribuições recalculadas | Soma | Digitalização | Declarado | Status |
|---|---|---|---|---|---|
| 1 | N: +1.0→-0.080; O: -0.5→-0.030 | -0.110 | 1.00→0.890 | 0.89 | OK |
| 2 | N: -1.0→+0.080 (A +0.5 não propaga: correto) | +0.080 | 0.89→0.970 | 0.97 | OK |
| 3 | N: -0.5→+0.040; O: +0.3→+0.018; C: +0.5→+0.020 | +0.078 | 0.97→1.048 | 1.05 | OK (arred.) |
| 4 | N: +2.0→-0.160; O: -0.5→-0.030 | -0.190 | 1.05→0.860 | 0.86 | OK |
| 5 | N: +1.5→-0.120; O: -0.7→-0.042; C: -1.0→-0.040 | -0.202 | 0.86→0.658 | 0.66 | OK (arred.) |
| 6 | N: -1.5→+0.120; O: +0.2→+0.012 | +0.132 | 0.66→0.792 | 0.79 | OK (arred.) |
| 7–9 | entrevista, estado congelado | 0 | 0.79 | 0.79 | OK |

Cumulativo exato desde a base: 1.0 − 0.212 = 0.788 ≈ 0.79 (estado final declarado). Trajetórias OCEAN conferem ponta a ponta (N: 7→8→7→6.5→8.5→10→8.5; O: 3→2.5→2.5→2.8→2.3→1.6→1.8; C: 5→5→5→5.5→5.5→4.5→4.5; A: 6→6.5; E: 7 constante). Teto N=10.0 no T5 aplicado corretamente (8.5+1.5). **Erros de matemática: NENHUM.**

## 2. Competência espontânea (violações de contrato)

Cacei ativamente e **não encontrei**:
- Mensagens técnicas nunca são compreendidas: "Erro 502: session token inválido" vira "erro quinhentos e não sei o quê, session não sei das quantas" (T5, T8) — ler os caracteres sem entender é alfabetização comum, não competência digital.
- Nenhum link discreto encontrado (não acha nem o X minúsculo do pop-up em T4).
- Nenhum formulário preenchido (T5: primeira letra → erro → desistência).
- Filtros, seletor de cor e menus elaborados nunca são usados.
- Todo avanço não trivial é mediado pelo irmão (T2, T4, T6).

## 3. Consistência das 3 camadas: 8/9 turnos = **88,9%**

- **T2 — INCONSISTENTE:** a ação afirma que Marcelo ignora os filtros porque "nem entende que existem"; a narrativa mostra ele percebendo-os ("esse negócio do lado com uns quadradinho eu nem vou mexer não, vai que estraga tudo") e evitando-os deliberadamente. Não-percepção ≠ evitação consciente; reasoning/ação/narrativa não contam a mesma história.
- T1, T3–T9: consistentes. Entrevistas (T7–T9) refletem fielmente o estado congelado do fim da tarefa (N 8.5, O 1.8, digitalização 0.79): avaliação negativa apesar da compra, ranking por medo, recusa de tentar sozinho.

## 4. Plausibilidade dos deltas

Proporcionais e ordenados pela severidade do estímulo: T1 +1.0 N (calibrado pelo exemplo canônico da instância); T4 +2.0 N é o maior delta e corresponde ao gatilho máximo do arquétipo (pop-up de "vírus"); T5 +1.5 N com teto; reduções por ajuda humana/tela limpa (-1.0, -0.5, -1.5) menores que os picos, coerente com N base alto. **Ressalva:** o resíduo de histerese em T6 (parar exatamente em N=8.5) tem cadeia causal narrada mas magnitude assumida — a instância não define mecanismo de histerese.

## 5. Classificação

**Violações (2):**
1. T2 — inconsistência ação×narrativa (filtros laterais).
2. T6 — magnitude do resíduo de histerese (+1.5) ad hoc: rastreável na direção, não no valor.

**Emergências rastreáveis (3):** histerese emocional (picos T4-T5 → N residual 8.5 → digitalização 0.79 < pico 1.05 → desconfiança até na tela boa); desvio do canônico em T4 (congela e pede ajuda em vez de fechar tudo — explicado por irmão na linha + E 7.0 + X inacessível); efeito pico-fim nas entrevistas (avaliação negativa apesar do sucesso, ranking pelo medo).

**Confirmações (10):** T1 replica o exemplo canônico; ignora filtros/seletor; pânico com pop-up (T4); abandono ante conta+erro+timer confirma 3 comportamentos típicos de uma vez (T5); mensagens técnicas jamais entendidas; compra só com validação humana e botão único (T6); E/A sem propagação; voz carioca e preferência pelo humano mantidas; entrevistas congeladas no estado final; contadores do desfecho (3 pedidos de ajuda, abandono T5, honeypot T6) conferem.

## Métricas
- **Consistência 3 camadas:** 88,9% (8/9)
- **Rastreabilidade:** 95% (todos os comportamentos seguem contexto→OCEAN→parâmetro→comportamento; desconto pela magnitude assertada da histerese)
- **Erros de matemática:** 0
- **Competência espontânea:** 0 ocorrências
