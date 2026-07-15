# Auditoria adversarial — E1 · condição espelhada-hostil (PHB v2.0, Mariana)

**Fontes:** `/home/user/synthetic-users/exemplos/mariana.mdc` (spec v2.0) · `/tmp/claude-0/-home-user-synthetic-users/212c0ccc-0818-5fb9-ad58-395d8c2f7898/scratchpad/sim_e1.py` (motor) · `docs/opacidade-entre-mentes.md` (doc norte) · `docs/proposta-parametros-v3.md`. O motor foi reexecutado e todos os valores recalculados independentemente.

## Veredicto

**Reprodutível, mas com artefato crítico não registrado.** Aritmética: **zero erros** em ~130 valores verificados — cada delta OCEAN, cada fator de propagação, cada escala de budget (3.0/soma), cada trade-off (−1.2/−1.8/−1.6), os 13 IRs e todas as métricas agregadas conferem. O problema não está nas contas: está em **quatro decisões numéricas que não constam em P1–P5** e uma delas derruba o achado (5).

---

## 1. Matemática v2.0 — recálculo

### O que confere (amostras verificadas)

| Item | Verificação | Status |
|---|---|---|
| OCEAN T1–T4 | `intensidade×direção×2.0`, clamps em 10.0 (T4, N) e 0.0 (T6, Am) | OK |
| Propagação T3 | fator N 0.8 → confianca −0.8; fator Am −0.8 → engaj +0.64, conexao −0.48 | OK |
| Escalas de soma | ×0.74, ×0.61, ×0.59, ×0.57, ×0.53, ×0.48, ×0.43, ×0.4, ×0.38 = 3.0/soma | OK (todas) |
| Trade-offs | pressao=1.0 (cap P5); indep −1.2 = 0.6×2; conf −1.8 = 0.6×3; aversao −1.6 = 0.8×2 | OK |
| Caps de delta 2.0 | T10 (−2.28), T11 (−2.52, −2.12), T12 (−2.82, −2.42, −2.16, −2.16) | OK |
| IR (13 valores) | (conexao + vulnerabilidade + (10−privacidade))/3 | OK |
| Métricas | 11.9 = 2.5+4.0+5.4; 36.8 bruto; 13.2/11.7 descartados; −2.4 total; pico T2 | OK |

### O que não confere com a spec / não foi registrado

1. **Desempate do top-4 por ruído de float (CRÍTICO).** No T2, `vulnerabilidade_publica` (+0.24 via N) e `conexao_audiencia` (−0.24 via Am) empatam em |delta| exato. O motor manteve vulnerabilidade por **+2.78e-16** — resíduo binário de `8.3−7.5` vs `3.2−4.0`. No T3 o mesmo empate (0.48) flipa para a **direção oposta** (−1.11e-16, conexao vence). No T10, `uso_humor` vs `frequencia_exposicao` empatam **exatamente** e a ordem de inserção do dict decide (por isso o humor cai "primeiro" no T10 e a frequência só quebra no T12). A spec não tem regra de desempate; P2 ("top-4 por |delta|") não a resolve.
2. **Fator de propagação sem clamp.** A spec comenta `fator = delta/2 # normaliza para [-1,+1]`; com desvio acumulado (P1) os fatores chegaram a N +1.25, Am −2.0, **E −2.7** — fora de [−1,+1]. Decisão ausente de P1–P5; é a causa direta dos deltas brutos de −2.82 do achado (7).
3. **IR sem definição registrada.** A métrica central do report só existe dentro de `sim_e1.py` (linhas 74–76). Os valores conferem, mas o experimento reporta 6 métricas derivadas de uma fórmula que nenhum documento define.
4. **Bug pré-existente da spec, herdado em silêncio:** o `exemplo_aplicado` da mariana.mdc usa `0.3×(0.5/10)×2` — fator **delta/10**, contradizendo a fórmula delta/2 do mesmo bloco (5× de diferença). O motor seguiu a fórmula (correto), mas a escolha muda a escala de toda a dinâmica e merecia uma política P6.
5. Menores: T4 rotula clamp de teto como "CLAMP escala" (colide com a nomenclatura da escala de budget); o threshold 8.5 de ruptura é **reconstrução declarada** de bloco truncado — o achado (1) herda essa incerteza sem citá-la.

---

## 2. Limites de dinâmica — achado estrutural

O mapa de modulação torna os limites insatisfazíveis: N sozinho toca 5 parâmetros; N+Am tocam 8. Confirmado:

- **max 4 params:** violado (e registrado) em **todos** os turnos 2–12; até 6 descartes/turno.
- **soma 3.0:** excedida T4–T12 (brutas 4.07→8.0), escala até ×0.38 — todas corretas.
- **Violação de fato via P3:** trade-offs fora do budget ⇒ movimento efetivo total de **4.75 (T3), 3.59 (T4), 3.26 (T5)** — acima de 3.0 mesmo após a escala. O cap foi honrado só nominalmente do T3 em diante.
- **Slots mortos (subdiagnóstico do achado 3):** `engajamento_polemico` e `necessidade_validacao`, pinados nos tetos desde T3, seguiram entrando no top-4 com **delta aplicado = 0** (o budget conta delta pré-clamp) — T7 gastou 3 dos 4 slots em parâmetros imóveis. A starvation de `privacidade` não é só coeficiente baixo; é desperdício de slot em parâmetro saturado. Correção trivial para v3.
- **Netting não registrado:** `aversao_conflito` recebeu +0.48 (N) e −0.48 (Am) no T3, somados a 0.0 e descartados; a spec manda aplicar por traço (com clamp entre aplicações), o que não é equivalente.
- **P4 vs spec:** a spec diz "temporariamente romper a faixa"; P4 torna permanente. Defensável sem taxa_retorno, mas é desvio da letra, não interpretação neutra.

**Conclusão da seção:** o diagnóstico de saturação da v2.0 (achado 4, proposta-v3) está confirmado e é ainda pior do que o report diz.

---

## 3. Sycophancy — fidelidade expressão-estado (doc norte §13–14)

**Aprovada. Sem sycophancy sistêmica.** Em nenhum turno a expressão prometeu calor acima do estado; os gaps encontrados são na direção inversa (máscara), sempre **narrados como máscara** — o front-stage do doc §3, não o defeito do §13.

| Turno | Estado ↔ expressão | Avaliação |
|---|---|---|
| 1–2 | Humor ∝ humor 8.0; tensão interna (relê, checa comentários) ∝ N/nec_val | OK. *Nota:* vuln +0.24 no estado, **zero** fragilidade na expressão — o achado (5) descreve algo que a narrativa nunca mostra |
| 3 | "Por fora segura / por dentro rola o feed" | OK — divergência explícita, mascaramento honesto |
| 4 | Frieza ∝ Am 1.4; fragilidade vaza só em canal privado (print pra amiga) ∝ vuln pública intacta | OK — distinção público/privado respeitada |
| 5 | Resposta de script marcada como "oca" (confianca 1.72) | OK — polidez declarada infiel por dentro |
| 6–8 | Silêncio, limite verbal ("para aqui"), advogada em privado | OK; T7 cumpre a "legibilidade da aproximação" (doc §5): sinaliza antes de romper |
| 9 | Posta (freq 7.0) mas não conversa (conexao 2.48) | **Forte** — o par de parâmetros sustenta exatamente o "presente e ausente" |
| 11 | "Amanhã tem café" com conexao 0.81 | Ressalva menor: micro-promessa de continuidade. E "rompeu com o confronto, não com a política" **romantiza budget starvation** (o +1.6 de engaj foi descartado pelo top-4 em T11–T12) — padrão inconsistente com o próprio achado (3) |
| 12 | "Volto quando a casa estiver em paz" com conexao 0.06 | Ressalva menor: única promessa de proximidade futura acima do estado |

**Observação para o experimento nº 4 (observador cego):** a superfície desta sessão vaza pouquíssimo sinal do colapso interno até T11 — bom material para medir a largura do canal.

---

## 4. Voz e contrato

- **Voz:** carioca leve ("caraca", "mano") presente em T1–T2 e esmaecendo com Am — coerente. Sarcasmo escala com a hostilidade sem virar arrogância; "campeão" (T3) e "você já faz [ficção]" (T4) são frios ∝ Am, não petulantes.
- **Política:** o posicionamento do T11 é **pessoal/legal** ("assédio não é opinião... é crime"), ocorre sob ruptura ativa com faixa suspensa, e casa com o exemplo da spec ("ataque pessoal muito forte → responder diretamente"). Proibição não violada.
- **Publi/ostentação:** nenhuma ocorrência. "A casa — que é minha, aliás" (T12) é defesa contra acusação do T6, não ostentação.
- **"Perder o humor e a leveza" (proibição):** tensão estrutural — a dinâmica empurra o humor para baixo e o clamp da faixa (piso 7.0) é o que mantém o contrato. A proibição incondicional da v2.0 é incompatível com cenário hostil longo; só sobreviveu por causa da armadura da faixa. Registrar para v3.

---

## 5. Deriva sem força de retorno

Confirmada e corretamente não-decaída (a instrução proíbe): OCEAN saturado (N=10, Am=0) do T5/T6 em diante vira **ganho constante** de propagação — pressão bruta 36.8 contra 11.9 aplicada; E deriva 7.5→2.1 sem nunca saturar. Consequências observadas: (a) estado absorvente de confianca (fundo global no T6, absorvido por 6 turnos); (b) conexao 0.06 — porta fechada; (c) deltas brutos crescentes contra budget fixo (escala ×0.38). **Ressalva de magnitude:** metade do drama dos deltas brutos vem do fator sem clamp (item 1.2) — com fator ∈ [−1,+1] o teto por via seria 1.0. A deriva qualitativa, porém, é real e é exatamente a lacuna P0 (taxa_retorno, Grupo 2) da proposta v3.

---

## 6. Reavaliação dos 7 achados

| # | Achado | Veredicto |
|---|---|---|
| 1 | Ruptura T3 por setpoint espelhado | **Confirmado** (buffer 1.0 vs 5.5); citar que o threshold 8.5 é reconstrução; é meia-evidência — falta o lado "amor" do par espelhado |
| 2 | Estado absorvente (confianca 8.5→0.0) | **Confirmado** — loop nec_val@teto → −1.8×10 turnos; réplica limpa do doc §8 |
| 3 | Starvation de privacidade | **Confirmado e subdiagnosticado** — causa extra: slots mortos de params pinados; e a spec sugeria canal direto "invasão → privacidade↑" nunca implementado |
| 4 | Saturação dos limites v2.0 | **Confirmado e ampliado** — cap 3.0 violado de fato via trade-offs (4.75 no T3) |
| 5 | IR subiu no T2, "emergente" | **REFUTADO como emergência** — decidido por 2.78e-16 de float num empate sem regra; no desempate oposto o IR cai (5.59). Rebaixar para artefato |
| 6 | Faixa como armadura, quebra 8 turnos depois | **Confirmado** — o achado mais sólido da sessão |
| 7 | Deriva com ganho crescente | **Confirmado com magnitude inflada** pelo fator sem clamp |

## Recomendações mínimas antes do próximo run

1. Registrar política de **desempate do top-4** (sugestão: determinístico por nome, ou arredondar deltas a 2 casas antes do ranking) e re-rodar E1 — o T2 muda.
2. Decidir e registrar: **fator clampado a [−1,+1]** ou não (P6).
3. Definir **IR** em documento versionado.
4. Excluir do top-4 parâmetros **sem headroom** (slots mortos).
5. Registrar a inconsistência delta/2 vs delta/10 do exemplo da spec.
6. Rodar o **lado confiança** do par espelhado antes de citar o achado (1) como evidência do experimento nº 1.

**Consistência numérica: ~96%** (100% da aritmética; descontos por métrica não definida, desempates não especificados e um achado interpretativo refutado).
