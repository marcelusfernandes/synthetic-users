"""
Pacote do front (servidor HTTP stdlib) do PHB v3.

Cria/lista personas, abre sessões e executa turnos sobre `phb/engine_v3.py`
via a mesma interface que `phb/run_turn.py` já usa (`sys.path.insert` do
diretório `phb/`). O LLM nunca calcula: este pacote só chama `step()` e
exibe o snapshot que o motor devolve (CLAUDE.md, invariante 1).
"""
import os
import sys

_PHB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "phb")
if _PHB_DIR not in sys.path:
    sys.path.insert(0, _PHB_DIR)
