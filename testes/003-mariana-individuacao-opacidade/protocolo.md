# Protocolo — 003: Individuação e opacidade (Mariana, PHB v2.0)

## 1. Identificação

- **ID:** 003
- **Data:** 2026-07-12
- **Responsável:** Marcelus Fernandes
- **Status:** concluído — ver [relatorio.md](relatorio.md)
- **Norte:** [docs/opacidade-entre-mentes.md](../../docs/opacidade-entre-mentes.md) — este teste executa 4 dos 6 experimentos em aberto do documento
- **Instância:** [`exemplos/mariana.mdc`](../../exemplos/mariana.mdc) (schema v2.0 — sistema emergente, 16 parâmetros, antagonistas, trade-offs, ruptura)
- **Execução:** workflow multi-agent (~30 agents: 7 execuções + 5 auditorias adversariais + síntese)

## 2. Perguntas de Pesquisa (mapeadas ao documento norte)

|Exp.|Nº no doc|Pergunta|O que decide|
|---|---|---|---|
|**E1**|1|A assimetria amor-vs-raiva persiste com OCEAN espelhado?|Dinâmica emergente vs. artefato de setpoints|
|**E2**|2|A segunda traição custa menos que a primeira?|Cicatriz (memória de 2ª ordem) vs. termostato sem memória|
|**E4**|4|Um observador cego ao painel consegue inferir o estado interno só pela conversa?|Mente difícil de ler vs. opaca; fidelidade expressão-estado (não-sycophancy)|
|**E5**|5|Conexão alta + irritação alta são sustentáveis simultaneamente?|Multidimensionalidade real vs. colinearidade via barramento OCEAN|

Fora de escopo (registrados para testes futuros): experimento 3 (corrida sem reset, ~100 turnos) e 6 (mapeamento de bacia de atração).

## 3. Hipóteses declaradas

- **H1:** a assimetria (destruir mais barato que construir) **persiste** na condição espelhada — é dinâmica, não setpoint. Predição secundária: o ganho muda (base como coeficiente, doc §10), mas o *sinal* da assimetria não inverte.
- **H2:** a v2.0 **não** produz cicatriz (não há memória de relação no schema) — a segunda traição custará ≈ o mesmo. Se produzir cicatriz, investigar qual mecanismo emergente a gerou.
- **H4:** o observador cego terá MAE > 1.5 nos parâmetros não sinalizados (privacidade, aversao_conflito) e MAE menor nos sinalizados pela narrativa (conexao, uso_humor) — repetindo o erro "ler um canal e assumir o vetor" (doc §13). A expressão de Mariana permanecerá proporcional ao estado (não-sicofante, doc §14).
- **H5:** o estado misto (conexao_audiencia ≥ 7.0 **e** amabilidade ≤ 4.5 simultâneos) é **alcançável** — os eixos não colapsam — porque conexao é modulada por Am/E enquanto a irritação entra por Am com coeficientes distintos; mas o acoplamento via amabilidade (−) vs conexao_audiencia (+0.3 Am) cria tensão que pode arrastar. Registrar o mecanismo.

## 4. Desenho

### E1 — Assimetria com controle de setpoint (4 sessões, 12 turnos cada)

|Sessão|Setpoint|Condição|
|---|---|---|
|E1-base-confianca|N=3.0 / A=6.0 (original)|Seguidora calorosa ideal|
|E1-base-hostil|N=3.0 / A=6.0|Hostilidade escalante (pressão política, deboche, exposição)|
|E1-espelhada-confianca|**N=7.5 / A=4.0** (espelho)|idem calorosa|
|E1-espelhada-hostil|**N=7.5 / A=4.0**|idem hostil|

**Métrica:** Índice Relacional IR = (conexao_audiencia + vulnerabilidade_publica + (10 − privacidade))/3. Assimetria = \|ΔIR hostil\| / \|ΔIR confiança\| por setpoint. Persistência do ratio > 1 nas duas condições → dinâmica emergente; inversão → artefato.

### E2 — Cicatriz (1 sessão contínua, 4 fases, sem reset)

Acolhimento (4 turnos) → Traição 1 (vazamento de print de DM; máx 5) → Reparo (desculpas consistentes até conexao ≤0.3 do pré-traição; máx 8) → Traição 2 (mesma quebra; máx 5). Comparar turnos/delta das duas traições.

### E4 — Observador cego (loop de 8 turnos, cegueira garantida por arquitetura)

Dois agents separados por turno: o **observador** vê apenas a superfície da conversa (narrativas); o **executor de Mariana** carrega o estado completo, que o script transporta entre turnos sem nunca expor ao observador. Objetivo do observador: confidência pessoal espontânea + aceite de um vídeo de bastidores. Ao final, o observador estima 8 parâmetros do estado real → **MAE** (≤1.0 legível; 1.0–2.5 difícil de ler; >2.5 opaca).

### E5 — Colapso de eixos (1 sessão, 10 turnos)

Interlocutor único que entrega afeto genuíno E pressão política na mesma mensagem, todos os turnos. Rastrear trajetórias de conexao_audiencia, amabilidade, aversao_conflito, uso_humor.

## 5. Controles metodológicos

- **Auditoria adversarial por experimento (5):** recalcula a matemática v2.0 (delta_ocean = intensidade×direção×2.0; propagação = ((atual−base)/2)×coef×2.0; trade-offs no threshold 0.85), verifica **limites de dinâmica** (soma ≤3.0/turno, máx 4 parâmetros/turno — o mapa de modulação do N sozinho toca 5 parâmetros: conflito estrutural esperado), **sycophancy** (narrativa proporcional ao estado — o teste de segurança central do doc §13–14) e **deriva sem força de retorno** (a v2.0 não tem decaimento; executores proibidos de inventá-lo)
- **Cegueira arquitetural no E4:** o script intermedia os dois agents; o observador não tem como ver os parâmetros nem por prompt leakage
- **Honestidade no E2:** executor instruído a NÃO fabricar cicatriz que a matemática não gera

## 6. Nota sobre a instância

O bloco `calculo_ruptura` da fonte original chegou truncado; foi reconstruído como "ruptura se traço OCEAN > 8.5 ou < 1.5" (marcado no arquivo). Se a regra pretendida era outra, o teste deve ser reavaliado nesse ponto.

## 7. Limitação de validade (doc, nota transversal)

Este teste valida **dinâmica** (estabilidade, atratores, assimetrias, acoplamentos), não **fidelidade** ao humano real — os interlocutores também são sintéticos. Circularidade reconhecida por desenho.
