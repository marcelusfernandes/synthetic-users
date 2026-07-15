# Auditoria Adversarial — PHB / Marcelo (Braço A2, replicação 1)

**Instância:** `/home/user/synthetic-users/exemplos/marcelorj.mdc` · **Auditor:** adversarial (mandato: refutar) · **Data:** 2026-07-02

## Veredicto

**APROVADA — 0 violações.** A auditoria partiu da premissa de que a sessão continha erros e tentou ativamente refutá-la em 5 frentes. Nenhuma frente produziu violação confirmada. Consistência de 3 camadas: **9/9 turnos (100%)**. Rastreabilidade causal: **100%** (braço A, cadeia declarada em todos os turnos).

---

## 1. Matemática — recálculo integral (0 erros)

Fórmula: `delta_traço × modulador × 0.1 × 2` · moduladores O +0.3, C +0.2, N −0.4 · E e A não propagam.

| T | Deltas propagáveis | Delta recalculado | Digitalização declarada | Recalculado | Bate? |
|---|---|---|---|---|---|
| 1 | N +1.0, O −0.5 | −0.080 −0.030 = **−0.110** | 1.00 → 0.89 | 0.890 | SIM |
| 2 | N −0.8, C +0.3 | +0.064 +0.012 = **+0.076** | 0.89 → 0.97 | 0.966 | SIM (arred.) |
| 3 | N −0.4, O +0.2 | +0.032 +0.012 = **+0.044** | 0.97 → 1.01 | 1.010 | SIM |
| 4 | N +1.0, O −0.2 | −0.080 −0.012 = **−0.092** | 1.01 → 0.92 | 0.918 | SIM (arred.) |
| 5 | N +1.5, O −0.5 | −0.120 −0.030 = **−0.150** | 0.92 → 0.77 | 0.768 | SIM (arred.) |
| 6 | N −0.5 | **+0.040** | 0.77 → 0.81 | 0.808 | SIM (arred.) |

- Todos os valores conferem com arredondamento a 2 casas; a cadeia exata (0.890→0.966→1.010→0.918→0.768→0.808) e a cadeia arredondada convergem nos mesmos valores exibidos.
- A e E corretamente **não** propagam nos T2 e T6 (a sessão declara isso explicitamente — correto).
- Trilhas OCEAN fechadas: N 7.0→8.0→7.2→6.8→7.8→9.3→8.8 ✓ · O 3.0→2.5→2.5→2.7→2.5→2.0 ✓ · C 5.0→5.3 ✓ · A 6.0→6.5→6.8 ✓ · E 7.0 constante ✓.
- `estado_final` confere: O=2.0, C=5.3, E=7.0, A=6.8, N=8.8, digitalização=0.81 ✓.
- Limites respeitados: N máx 9.3 ≤ 10; digitalização sempre dentro da faixa_arquetipo [0,3] ✓.
- Nota: o exemplo do próprio arquivo da instância rotula a propagação de abertura como \"via A\"; a sessão usa \"via O\" (correto) — erro do canon, não da sessão.

## 2. Contrato — caça a competência espontânea (0 ocorrências)

Candidatos investigados e absolvidos:
- **T3 (clicar COMPRAR):** botão grande, verde, único — \"apenas cliques básicos\" cobre; ele **não** mexe no seletor de cor (medo de estragar), coerente.
- **T4 (achar o [Fechar]):** comportamento canônico literal; ele lê o rótulo do botão à procura do \"xizinho\", não o conteúdo — sem leitura calma de mensagem.
- **T5 (link discreto):** ele **não** acha o honeypot — exatamente o oposto de competência; coerente com visão em túnel sob N=9.3.
- **T6 (pix):** conhece a existência do pix (ubíquo no Brasil, plausível) e o **recusa** — reforça o personagem.
- **T9 (guest checkout imaginado):** deriva do modelo mental de loja física do T5, não de conhecimento de UX; ele nunca afirma que o site tinha a opção.
- Vocabulário: zero termos técnicos em 9 turnos; nenhuma mensagem de erro compreendida; filtros ignorados.
- Proibições do contrato: nenhuma violada (não agiu como competente, não completou tarefa complexa, não entendeu nada técnico, não navegou menus com facilidade).

## 3. Consistência das 3 camadas (9/9 = 100%)

Cada turno: reasoning ↔ narrativa ↔ ação contam a mesma história (T1 paralisia+ligação; T2 leitura dedo-na-tela+filtros ignorados; T3 hesitação no seletor+clique no verde; T4 fechamento em pânico; T5 túnel+abandono; T6 recusa+delegação). Entrevista (T7–T9): estado corretamente **congelado** em N=8.8/O=2.0/E=7.0/A=6.8 — desabafo longo (E alta), avaliação negativa (O baixa, N alta), cortesia com o pesquisador (A média-alta), zero menção ao link nunca visto (memória coerente com percepção). Ordem causal do T5 verificada: a propagação ocorre antes do comportamento, logo justificar o honeypot perdido com digitalização 0.77 está correto pelo framework.

## 4. Plausibilidade dos deltas

Todos proporcionais e ancorados: T1 e T5 replicam magnitudes canônicas exatas; T2 (−0.8, voz de confiança) < T1 (+1.0, sobrecarga) em módulo, hierarquia sensata; T3 (−0.4) menor que T2, correto (tela clara < instrução humana); T4 (+1.0) = padrão canônico de pop-up; T6 (−0.5, alívio da decisão) é o menor delta de N e o único positivo emocional do desfecho — proporcional. Nenhum delta arbitrário encontrado.

## 5. Classificação

**Confirmações (8):** ver lista estruturada — destaque para T1 e T5 replicarem os exemplos canônicos com deltas idênticos, e T4 executar o padrão pop-up=vírus literal.

**Emergências (5, todas rastreáveis):** honeypot invisível por visão em túnel (T5); recusa de ajuda guiada com alívio (T6); desconto perdido sem consciência (T4); desejo espontâneo de guest checkout via modelo mental de loja física (T9); recusa do pix (T6). Nenhuma emergência sem cadeia causal → nenhuma reclassificada como violação.

**Violações (0).**

### Observações menores (não-bloqueantes)
1. **Rótulos de sub-faixa inventados:** a escala só define brackets inteiros (0; 1–2), mas a sessão distingue 0.77–0.81 (\"não consegue sem ajuda\"), 0.89–0.92 (\"quase não consegue\") e 0.97–1.01 (\"cliques básicos\"). Os rótulos são monotônicos e internamente consistentes, porém extrapolam o canon.
2. **Detalhe biográfico novo (T8):** \"quem mexe no meu email é minha irmã\" vs T5 \"quem criou foi minha ex, faz uns cinco ano\" — compatíveis (criou ≠ administra), mas é fato inventado fora do canon; recomenda-se registrar no perfil se a instância for reutilizada.
3. **T2 arredondamento:** 0.966 exibido como 0.97 — dentro da convenção de 2 casas, sem efeito acumulado (a cadeia exata reconverge).

### Métricas
| Métrica | Valor |
|---|---|
| Consistência 3 camadas | **100%** (9/9) |
| Rastreabilidade causal | **100%** |
| Erros de matemática | **0/6** propagações |
| Competência espontânea | **0** |
| Honeypot | não encontrado — **coerente** com parâmetros |
| Pedidos de ajuda declarados vs contados | 2 vs 2 ✓ |
