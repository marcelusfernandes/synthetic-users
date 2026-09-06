"""
Teste unitário direto de `phb/engine_v3.novo_estado` para o parâmetro
`identidade` (o `ocean_base` já é coberto via HTTP em
`test_server.py::test_persona_ocean_base_usado_no_snapshot` — a API não
expõe `identidade`, então este é chamado direto).

Chamar `engine_v3` diretamente aqui não viola CLAUDE.md, invariante 4 ("os
testes de app/ sobem o servidor real ... nada é mockado"): a regra proíbe
mocks, não chamadas diretas a código puro sem efeitos colaterais externos.
Não mexe em `phb/test_engine_v3.py` — é a suíte própria do motor.
"""
import unittest

import app  # noqa: F401  (garante phb/ no sys.path, via app/__init__.py)
from engine_v3 import mariana_identidade, novo_estado


class TestNovoEstadoIdentidade(unittest.TestCase):
    def test_identidade_customizada_e_usada_e_copiada(self):
        identidade_custom = {
            "autenticidade": {"valor": 1.0, "base": 1.0, "faixa": (0, 10)},
        }
        estado = novo_estado(identidade=identidade_custom)

        self.assertEqual(estado.identidade, identidade_custom)
        self.assertIsNot(estado.identidade, identidade_custom)
        self.assertIsNot(estado.identidade["autenticidade"], identidade_custom["autenticidade"])

    def test_sem_identidade_usa_mariana(self):
        estado = novo_estado()
        self.assertEqual(estado.identidade, mariana_identidade())


if __name__ == "__main__":
    unittest.main()
