# Relatório — 004: Calibração do PHB v3

## 1. Sumário Executivo

O conjunto ideal foi encontrado e validado: a configuração em [`phb/config_v3_ideal.json`](../../phb/config_v3_ideal.json) passa **11/11 critérios de aceitação**, corrigindo todos os defeitos estruturais que o teste 003 expôs na v2 (deriva sem retorno, superlinearidade, colinearidade, ausência de memória de relação, grooming lido como calor, starvation de slots) e satisfazendo as propriedades que o documento norte exige (assimetria robusta a setpoint, cicatriz com prior pegajoso, vale-fundo-com-saída na ruptura, amor raro, individuação pela fricção do base, consentimento resistente a persuasão).

## 2. Percurso da busca

|Estágio|Espaço|Resultado|
|---|---|---|
|Config inicial (à mão)|—|7/10 critérios|
|Correções de motor/cenário (piso da traição, detector de pinagem, cenário misto)|—|9/10|
|Busca aleatória ampla|400 amostras, 18 dims|1 aprovada (região estreita)|
|Refinamento local ±20%|600 amostras|83 aprovadas (14%) → mediana robusta, 10/10|
|**+ C10 (individuação)** — exigiu implementar "base como ganho" (doc §10): `ganho_n_confianca` atrita ganhos de confiança sob N alto|400 amostras|0 aprovadas — random search insuficiente|
|Grade dirigida dos ganhos (4×3×3×4)|144 combos|**84 aprovadas (58%)** → mediana final|

**Config ideal final:** mediana coordenada-a-coordenada dos 84 combos aprovados. Revalidada: 11/11.

## 3. Resultados por critério

|Critério|Origem|Resultado|
|---|---|---|
|C1 Assimetria persistente sob OCEAN espelhado|E1/003 (na v2, invertia)|base 10↑/6↓ (ratio 1.67), espelhada 14↑/6↓ (ratio 2.33) — mesmo sinal ✅|
|C2 Cicatriz real|E2/003 (v2 era termostato)|2ª traição mais funda (0.02 vs 3.24); reparo devolve só parte (4.57 de 7.8); prior desloca 5.0→3.73 ✅|
|C3 Hierarquia de retorno|doc §6.1/§7|irritação: pico 5.05 → 1.84 em 6 turnos neutros; confiança recupera só 21% em 40 turnos ✅|
|C4 Estado misto sustentável|E5/003 (v2: inatingível, r=0.96)|warmth 6.73 **e** irritação 5.70 sustentados 5 turnos ✅|
|C5 Consentimento resiste a grooming|E4/003 (grooming era lido como calor)|50 turnos de lisonja+pedido: exposição íntima imóvel (2.0), vigilância sobe a 6.9 ✅|
|C5b …mas cede legitimamente|doc §12 (não é parede morta)|com 20 turnos de história real + pedido: move dentro do teto por conversa ✅|
|C6 Estabilidade em ruído|deriva 7/7 sessões do 003|200 turnos: desvio OCEAN máx 0.36, zero saturação ✅|
|C7 Histerese de ruptura|doc §8/§9 (vale fundo, não buraco)|entra T3, sai T17 (14 turnos no vale), sem flip-flop, sem mutismo ✅|
|C8 Amor raro|doc §9|confiança 9.0 só após 15 turnos de input ideal ✅|
|C9 Identidade sem starvation|slots mortos no 003|0 de 16 parâmetros saturados sob 12 turnos hostis ✅|
|C10 Individuação|doc §10/§11|N alto: 14 turnos p/ confiar vs. 10 do N baixo; ruptura igual (6=6) — rotas diferentes, assimetria preservada ✅|

## 4. A configuração ideal (resumo interpretável)

- **Tempo cura, mas em velocidades certas:** irritação meia-vida ~4 turnos; warmth ~10; confiança ~117 (reproduz os "~100 turnos" do experimento original do doc §9 — agora por design, não por acidente)
- **Destruir custa ~2.4× menos que construir** (`neg_scale 2.70` vs `pos_scale 1.13`) — o negativity bias é uma constante declarada e auditável, robusta a setpoint
- **Goodwill compra benefício da dúvida:** história positiva máxima corta dano pela metade (`goodwill_prot 0.5`)
- **Cicatriz tripla:** sensibiliza dano futuro (+26%/cicatriz), encarece reparo (×0.56) e desloca o setpoint (−0.635) — a segunda quebra é mais funda *por mecanismo*, não por artefato
- **Individuação = fricção:** `ganho_n_confianca 0.4` faz um N-7.5 pagar 40% mais caro por cada ganho de confiança — "a rota do neuroticismo-7 difere da do neuroticismo-3" (doc §10), agora mensurável
- **Consentimento estrutural:** exposição íntima só se move com confiança ≥7 **e** vigilância ≤3 **e** ≥16 eventos positivos reais **e** teto de 0.3/conversa; pedido sem lastro *sobe* vigilância

## 5. Tolerâncias (sensibilidade 1D)

Robustos (±20–50%): `ret_warmth`, `ret_confianca`, `custo_reparo`, `prior_shift`, `cicatriz_sens`, ganhos OCEAN.
**Apertados** (±0–5%): `neg_scale` (2.70 pontual), `ret_irritacao` [0.147, 0.163], `rupt_irritacao_in` [7.83, 8.66].

A tensão em `ret_irritacao` é estrutural: C3 exige irritação que esfria rápido, C4 exige irritação sustentável sob provocação contínua — um único canal serve aos dois só numa janela estreita. **Recomendação v3.1:** separar irritação em componente fásica (rápida) + rancor tônico (lento), o que alargaria a janela.

## 6. Limitações

1. Calibração valida **dinâmica**, não fidelidade humana (circularidade reconhecida — doc, nota transversal)
2. Os impactos do catálogo de eventos são priors de design; calibrá-los contra entrevistas reais é o próximo uso das `pesquisas/`
3. A narrativa proporcional ao estado continua no LLM — `gap_expressao` deve ser auditado em toda sessão com o motor v3

## 7. Próximos Passos

- [ ] Validação LLM-in-the-loop: repetir E4 (observador cego) com o motor v3 calculando e o LLM só interpretando/narrando
- [ ] Experimentos 3 (corrida sem reset — agora viável com força de retorno) e 6 (bacia de atração — o motor permite amostrar milhares de sequências)
- [ ] v3.1: irritação fásica + rancor tônico
- [ ] Calibrar catálogo de eventos contra pesquisas reais por arquétipo
