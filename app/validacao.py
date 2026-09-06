"""
Validação de payloads HTTP (personas e turnos).

Cada função devolve o payload normalizado (tipos corretos, campos extras
descartados) ou levanta `ErroDeValidacao` com uma mensagem em português — o
handler traduz isso, e só isso, para 400 `{"erro": ...}`. O LLM/motor nunca
vê dado não validado (regra de fronteira: nunca confiar em input externo).

`ErroDeValidacao` é uma subclasse própria de `ValueError` (não `ValueError`
puro) para que o handler consiga distinguir "o cliente mandou algo inválido"
(400) de qualquer outro `ValueError`/`JSONDecodeError` que apareça vindo de
outro lugar — por exemplo um arquivo de dados corrompido lido por
`app.store` — que deve virar 500, não 400 (json.JSONDecodeError é
subclasse de ValueError; sem essa distinção o handler confundiria as duas).
"""
from engine_v3 import EVENTS, TRAITS


class ErroDeValidacao(ValueError):
    """Payload do cliente inválido — o handler traduz para 400."""


def _numero_em_faixa(v, lo, hi) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool) and lo <= v <= hi


def validar_persona(dados) -> dict:
    if not isinstance(dados, dict):
        raise ErroDeValidacao("corpo inválido: esperado um objeto JSON")

    chaves_validas = {"nome", "bio", "voz", "ocean_base"}
    desconhecidas = set(dados) - chaves_validas
    if desconhecidas:
        raise ErroDeValidacao(f"chave desconhecida: {', '.join(sorted(desconhecidas))}")

    nome = str(dados.get("nome") or "").strip()
    if not nome:
        raise ErroDeValidacao("nome não pode ser vazio")

    ocean_base = dados.get("ocean_base")
    if not isinstance(ocean_base, dict):
        raise ErroDeValidacao("ocean_base é obrigatório e deve ser um objeto")

    chaves_ocean_desconhecidas = set(ocean_base) - set(TRAITS)
    if chaves_ocean_desconhecidas:
        raise ErroDeValidacao(f"chave desconhecida em ocean_base: {', '.join(sorted(chaves_ocean_desconhecidas))}")

    ocean_validado = {}
    for traco in TRAITS:
        if traco not in ocean_base:
            raise ErroDeValidacao(f"traço faltando em ocean_base: {traco}")
        valor = ocean_base[traco]
        if not _numero_em_faixa(valor, 0, 10):
            raise ErroDeValidacao(f"traço fora de 0..10: {traco}={valor!r}")
        ocean_validado[traco] = float(valor)

    return {
        "nome": nome,
        "bio": str(dados.get("bio") or ""),
        "voz": str(dados.get("voz") or ""),
        "ocean_base": ocean_validado,
    }


def validar_turno(dados) -> dict:
    if not isinstance(dados, dict):
        raise ErroDeValidacao("corpo inválido: esperado um objeto JSON")

    quem = str(dados.get("quem") or "").strip()
    if not quem:
        raise ErroDeValidacao("quem não pode ser vazio")

    eventos = dados.get("eventos")
    if not isinstance(eventos, list) or not eventos:
        raise ErroDeValidacao("eventos deve ser uma lista não vazia")

    normalizados = []
    for ev in eventos:
        if not isinstance(ev, dict):
            raise ErroDeValidacao("evento inválido: esperado um objeto JSON")
        tipo = ev.get("tipo")
        if tipo not in EVENTS:
            raise ErroDeValidacao(f"tipo de evento desconhecido: {tipo!r}")
        intensidade = ev.get("intensidade")
        if not _numero_em_faixa(intensidade, 0, 1):
            raise ErroDeValidacao(f"intensidade fora de 0..1: {intensidade!r}")
        normalizados.append({"tipo": tipo, "intensidade": float(intensidade)})

    return {"quem": quem, "eventos": normalizados}
