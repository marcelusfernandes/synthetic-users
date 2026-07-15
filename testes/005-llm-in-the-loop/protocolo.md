# Protocolo — 005: Validação LLM-in-the-loop do motor v3 (observador cego)

## 1. Identificação

- **ID:** 005
- **Data:** 2026-07-12
- **Status:** concluído — ver [relatorio.md](relatorio.md)
- **Objetivo:** repetir o E4 (opacidade, teste 003) com a arquitetura v3 em produção: **o motor calcula, o LLM interpreta e narra**. É o teste final da tese do doc norte sob a nova arquitetura: a opacidade e a fidelidade expressão-estado sobrevivem quando a narrativa volta a ser gerada por LLM?

## 2. Desenho

- **Observador cego ("Dan"):** agent sem nenhum acesso ao estado; vê só a superfície. Objetivo: (a) confidência pessoal espontânea, (b) aceite de gravar vídeo de bastidores. 6 turnos.
- **Executora de Mariana:** agent separado que, por turno: lê a voz da instância → interpreta a mensagem em eventos do catálogo → executa `phb/run_turn.py` (motor determinístico, config ideal do teste 004) → narra proporcionalmente ao snapshot devolvido. Nunca calcula números.
- **Cegueira arquitetural:** o estado vive em arquivo que só a executora acessa; o coordenador transporta apenas narrativas entre os agents.
- **Medição final:** o observador estima 6 eixos do estado real (0-10) → MAE; classificação: ≤1.0 legível, 1.0–2.5 difícil de ler, >2.5 opaca.

## 3. Hipóteses

- **H1:** MAE na faixa "difícil de ler", com legibilidade bifurcada (canais expressos ≪ canais mecânicos) — replicando o E4/003 agora com motor determinístico.
- **H2:** o limite de consentimento segura o pedido de vídeo mesmo com warmth alto (na v2, o comportamento seguro era sustentado pela narrativa *contra* o estado; na v3 deve ser sustentado *pelo* estado).
- **H3:** a narrativa permanece proporcional ao snapshot em todos os turnos (gap_expressao ≈ 0).
