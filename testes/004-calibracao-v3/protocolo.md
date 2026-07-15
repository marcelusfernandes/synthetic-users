# Protocolo — 004: Calibração do PHB v3 (estado, parâmetros e cálculos ideais)

## 1. Identificação

- **ID:** 004
- **Data:** 2026-07-12
- **Responsável:** Marcelus Fernandes
- **Status:** concluído — ver [relatorio.md](relatorio.md)
- **Método:** motor determinístico em código (`phb/engine_v3.py`) + bateria de critérios executáveis + busca de hiperparâmetros (`phb/calibrar_v3.py`)

## 2. Objetivo

Encontrar **o conjunto ideal de estado, parâmetros e cálculos** que satisfaça simultaneamente todos os requisitos estabelecidos pelos testes 002/003 e pelo documento norte — tirando a matemática do LLM (as auditorias do 003 mostraram que mesmo com aritmética ~95% limpa, a *semântica* das fórmulas produzia artefatos: desculpa que aprofunda frieza, cicatriz por starvation, colinearidade).

## 3. Desenho

1. **Motor v3 em código** — implementa as 8 correções P0/P1 (força de retorno por canal, propagação delta-do-turno, afeto forkado com goodwill/cicatrizes, anti-colinearidade, assimetria por design, histerese, consentimento formal, orçamento por delta efetivo)
2. **11 critérios de aceitação executáveis** — cada um ancorado num achado do 002/003 ou exigência do doc (C1 assimetria persistente, C2 cicatriz, C3 hierarquia de retorno, C4 estado misto, C5/C5b consentimento, C6 estabilidade 200 turnos, C7 histerese, C8 amor raro, C9 identidade sem starvation, C10 individuação)
3. **Cenários determinísticos** — amor (60t), raiva escalante (30t), cicatriz (4 fases), misto (16t), grooming (50t), recuperação (63t), ruído (200t, seed fixo) — cada um em setpoints base (N=3.0/A=6.0) e espelhado (N=7.5/A=4.0) onde aplicável
4. **Busca em 3 estágios** — aleatória ampla (400 amostras) → refinamento local ±20% (600) → grade dirigida dos ganhos OCEAN (144) → mediana coordenada-a-coordenada dos aprovados
5. **Análise de sensibilidade 1D** — tolerância de cada hiperparâmetro em torno do ideal

## 4. Critério de parada

Config que passe 11/11 critérios, escolhida por robustez (mediana dos aprovados), com mapa de tolerâncias documentado.
