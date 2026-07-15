"""
Runner de turnos do PHB v3 — a interface entre o LLM e o motor.

O LLM interpreta a mensagem do interlocutor em eventos do catálogo e chama
esta CLI; o motor calcula o novo estado deterministicamente; o LLM narra
proporcionalmente ao snapshot devolvido. O LLM nunca calcula números.

Uso:
  # cria um estado novo (setpoints da Mariana)
  python3 phb/run_turn.py --estado /caminho/estado.json --init

  # executa um turno
  python3 phb/run_turn.py --estado /caminho/estado.json --quem visitante \
      --eventos '[{"tipo": "elogio_especifico", "intensidade": 0.8}]'

  # lista o catálogo de eventos
  python3 phb/run_turn.py --catalogo
"""
import argparse, json, os, sys
from dataclasses import asdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from engine_v3 import Config, Estado, Relacao, novo_estado, step, snapshot, EVENTS

HERE = os.path.dirname(os.path.abspath(__file__))


def cfg_ideal():
    with open(os.path.join(HERE, "config_v3_ideal.json")) as f:
        return Config(**json.load(f)["config_ideal"])


def salvar(estado: Estado, caminho: str):
    d = {"ocean_base": estado.ocean_base, "ocean_atual": estado.ocean_atual,
         "identidade": estado.identidade,
         "relacoes": {k: asdict(r) for k, r in estado.relacoes.items()}}
    with open(caminho, "w") as f:
        json.dump(d, f, indent=2, ensure_ascii=False)


def carregar(caminho: str) -> Estado:
    with open(caminho) as f:
        d = json.load(f)
    est = Estado(ocean_base=d["ocean_base"], ocean_atual=d["ocean_atual"],
                 identidade={k: {"valor": v["valor"], "base": v["base"], "faixa": tuple(v["faixa"])}
                             for k, v in d["identidade"].items()})
    for k, r in d.get("relacoes", {}).items():
        est.relacoes[k] = Relacao(**r)
    return est


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--estado", help="caminho do JSON de estado")
    ap.add_argument("--init", action="store_true", help="cria estado novo")
    ap.add_argument("--quem", help="id do interlocutor")
    ap.add_argument("--eventos", help='JSON: [{"tipo": ..., "intensidade": 0..1}]')
    ap.add_argument("--catalogo", action="store_true", help="lista eventos válidos")
    args = ap.parse_args()

    if args.catalogo:
        for nome, spec in EVENTS.items():
            print(f"{nome}: eixos={spec['axes']} valencia={spec['valencia']}")
        return

    if args.init:
        est = novo_estado()
        salvar(est, args.estado)
        print(json.dumps({"ok": True, "msg": "estado inicial criado"}, ensure_ascii=False))
        return

    est = carregar(args.estado)
    eventos = json.loads(args.eventos)
    for e in eventos:
        if e["tipo"] not in EVENTS:
            print(json.dumps({"erro": f"evento desconhecido: {e['tipo']}",
                              "validos": list(EVENTS)}, ensure_ascii=False))
            sys.exit(2)
    log = step(est, cfg_ideal(), args.quem, eventos)
    salvar(est, args.estado)
    print(json.dumps({"snapshot": snapshot(est, args.quem), "log": log},
                     indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
