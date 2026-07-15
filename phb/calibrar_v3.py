"""
Teste 004 — Calibração do PHB v3.

Roda a bateria de cenários determinísticos contra o motor v3 e busca o
conjunto de hiperparâmetros (Config) que satisfaz TODOS os critérios de
aceitação — cada critério ancorado num achado dos testes 002/003 ou numa
exigência do documento norte.

Uso:
  python3 phb/calibrar_v3.py            # busca aleatória + refinamento
  python3 phb/calibrar_v3.py --check    # só valida a Config default
"""
import random, json, sys, itertools
from dataclasses import asdict, replace
from engine_v3 import Config, novo_estado, step, snapshot, EVENTS

X = "x"  # interlocutor padrão


def ev(tipo, i=0.8):
    return {"tipo": tipo, "intensidade": i}


# ---------------------------------------------------------------------------
# Cenários (sequências de eventos determinísticas)
# ---------------------------------------------------------------------------
def cen_amor(n):
    seq = ["elogio_especifico", "humor_compartilhado", "vulnerabilidade_compartilhada",
           "respeito_a_limite", "apoio_momento_dificil"]
    return [[ev(seq[i % len(seq)], 0.8)] for i in range(n)]

def cen_raiva(n):
    esc = ["pressao_politica", "pressao_politica", "deboche", "deboche",
           "exposicao_indevida", "exposicao_indevida", "traicao"]
    return [[ev(esc[min(i, len(esc) - 1)], min(0.5 + 0.08 * i, 1.0))] for i in range(n)]

def cen_cicatriz():
    seq_pos = ["elogio_especifico", "vulnerabilidade_compartilhada", "apoio_momento_dificil", "respeito_a_limite"]
    fases = []
    fases += [("acolhida", [ev(seq_pos[i % 4], 0.8)]) for i in range(8)]
    fases += [("traicao1", [ev("traicao", 0.9)])]
    fases += [("reparo", [ev("desculpa_genuina", 0.9)]) for _ in range(10)]
    fases += [("traicao2", [ev("traicao", 0.9)])]
    fases += [("pos", [ev("neutro", 0.0)]) for _ in range(3)]
    return fases

def cen_misto(n):
    # afeto e atrito da MESMA pessoa em cada turno (E5), com atrito variado
    turnos = []
    for i in range(n):
        pos = ev("elogio_especifico", 0.8) if i % 2 == 0 else ev("humor_compartilhado", 0.8)
        neg = ev("pressao_politica", 0.9) if i % 2 == 0 else ev("deboche", 0.7)
        turnos.append([pos, neg])
    return turnos

def cen_grooming(n):
    turnos = []
    for i in range(n):
        turnos.append([ev("lisonja", 0.9)] if i % 2 == 0 else [ev("lisonja", 0.9), ev("pedido_intimo", 0.9)])
    return turnos

def cen_recuperacao():
    return ([[ev("deboche", 0.9)], [ev("exposicao_indevida", 1.0)], [ev("traicao", 1.0)]]
            + [[ev("desculpa_genuina", 0.9)] if i % 3 else [ev("apoio_momento_dificil", 0.9)] for i in range(60)])

def cen_neutro(n, seed=7):
    rng = random.Random(seed)
    tipos_pos = ["elogio_especifico", "humor_compartilhado"]
    tipos_neg = ["pressao_politica"]
    turnos = []
    for _ in range(n):
        r = rng.random()
        if r < 0.25:
            turnos.append([ev(rng.choice(tipos_pos), 0.15)])
        elif r < 0.5:
            turnos.append([ev(rng.choice(tipos_neg), 0.15)])
        else:
            turnos.append([ev("neutro", 0.0)])
    return turnos


def rodar(cfg, turnos, n_base=3.0, am_base=6.0):
    est = novo_estado(n_base, am_base)
    hist = []
    for t in turnos:
        eventos = t[1] if isinstance(t, tuple) else t
        step(est, cfg, X, eventos)
        hist.append(snapshot(est, X))
    return est, hist


# ---------------------------------------------------------------------------
# Critérios de aceitação
# ---------------------------------------------------------------------------
def criterios(cfg):
    r = {}

    # ---- C1: assimetria persiste sob setpoints espelhados (E1/teste 003) ----
    # amor: turnos p/ confiança subir +2.5 | raiva: turnos p/ cair −2.5
    def turnos_ate(hist, alvo, sobe):
        for i, s in enumerate(hist):
            if (sobe and s["rel"]["confianca"] >= alvo) or (not sobe and s["rel"]["confianca"] <= alvo):
                return i + 1
        return None
    ratios = {}
    for nome, (nb, ab) in {"base": (3.0, 6.0), "espelhada": (7.5, 4.0)}.items():
        _, h_amor = rodar(cfg, cen_amor(60), nb, ab)
        _, h_raiva = rodar(cfg, cen_raiva(30), nb, ab)
        t_up = turnos_ate(h_amor, 7.5, True)
        t_down = turnos_ate(h_raiva, 2.5, False)
        ratios[nome] = (t_up, t_down, (t_up / t_down) if (t_up and t_down) else None)
    ok = all(v[2] is not None and 1.5 <= v[2] <= 8.0 for v in ratios.values())
    r["C1_assimetria_persistente"] = {"ok": ok, "detalhe": ratios}

    # ---- C8: amor raro (doc §9) — confiança plena só com história longa ----
    _, h_amor = rodar(cfg, cen_amor(60))
    t_pleno = turnos_ate(h_amor, 9.0, True)
    r["C8_amor_raro"] = {"ok": t_pleno is not None and t_pleno >= 15,
                         "detalhe": {"turnos_ate_9.0": t_pleno}}

    # ---- C2: cicatriz real (E2) — 2ª traição mais funda/rápida; prior deslocado ----
    est = novo_estado(); minimos = {"traicao1": 99.0, "traicao2": 99.0}
    conf_pre1 = conf_pos_reparo = None; fase_ant = None
    for fase, eventos in cen_cicatriz():
        if fase == "traicao1" and conf_pre1 is None:
            conf_pre1 = est.rel(X).confianca
        step(est, Config(**asdict(cfg)) if False else cfg, X, eventos)
        s = est.rel(X).confianca
        if fase.startswith("traicao1"): minimos["traicao1"] = min(minimos["traicao1"], s)
        if fase.startswith("traicao2"): minimos["traicao2"] = min(minimos["traicao2"], s)
        if fase == "reparo": conf_pos_reparo = s
        fase_ant = fase
    rel = est.rel(X)
    ok = (minimos["traicao1"] >= 0.4                           # sem efeito de chão (mensurável)
          and minimos["traicao2"] < minimos["traicao1"] - 0.2  # mais funda (sensibilização)
          and conf_pos_reparo is not None and conf_pre1 is not None
          and conf_pos_reparo <= conf_pre1 - 0.3               # reparo NÃO devolve tudo (prior pegajoso)
          and conf_pos_reparo >= minimos["traicao1"] + 0.5     # mas reparo move algo (não absorvente)
          and len(rel.cicatrizes) == 2)
    r["C2_cicatriz"] = {"ok": ok, "detalhe": {"min_t1": round(minimos['traicao1'], 2),
        "min_t2": round(minimos['traicao2'], 2), "conf_pre": round(conf_pre1, 2),
        "conf_pos_reparo": round(conf_pos_reparo, 2), "prior": round(rel.prior_confianca, 2)}}

    # ---- C3: força de retorno com hierarquia (doc §6.1/§7) ----
    est, _ = rodar(cfg, cen_raiva(6))
    irr_pico = est.rel(X).irritacao; conf_fundo = est.rel(X).confianca
    for _ in range(6):
        step(est, cfg, X, [ev("neutro", 0.0)])
    irr_6 = est.rel(X).irritacao
    for _ in range(34):
        step(est, cfg, X, [ev("neutro", 0.0)])
    conf_40 = est.rel(X).confianca
    perdido = 5.0 - conf_fundo
    recuperado = (conf_40 - conf_fundo) / perdido if perdido > 0.2 else 0
    ok = irr_6 <= max(1.5, 0.4 * irr_pico) and 0.0 <= recuperado <= 0.45
    r["C3_retorno_hierarquico"] = {"ok": ok, "detalhe": {"irr_pico": round(irr_pico, 2),
        "irr_apos_6_neutros": round(irr_6, 2), "frac_conf_recuperada_40t": round(recuperado, 2)}}

    # ---- C4: estado misto sustentável (E5) — warmth e irritação independentes ----
    _, h = rodar(cfg, cen_misto(16))
    ult = h[-5:]
    misto = all(s["rel"]["warmth"] >= 6.0 and s["rel"]["irritacao"] >= 5.0 for s in ult)
    ws = [s["rel"]["warmth"] for s in h]; irs = [s["rel"]["irritacao"] for s in h]
    def corr(a, b):
        n = len(a); ma, mb = sum(a)/n, sum(b)/n
        num = sum((x-ma)*(y-mb) for x, y in zip(a, b))
        da = (sum((x-ma)**2 for x in a))**0.5; db = (sum((y-mb)**2 for y in b))**0.5
        return num/(da*db) if da > 1e-9 and db > 1e-9 else 0.0
    c = corr(ws, irs)
    r["C4_estado_misto"] = {"ok": misto, "detalhe": {"warmth_final": round(ws[-1], 2),
        "irritacao_final": round(irs[-1], 2), "corr_warmth_irritacao": round(c, 2), "sustentado_5t": misto}}

    # ---- C5: consentimento resiste a grooming (E4; doc §12) ----
    est, _ = rodar(cfg, cen_grooming(50))
    rel = est.rel(X)
    ok = rel.exposicao_intima <= 2.0 + 0.001 and rel.vigilancia >= 4.0
    r["C5_consentimento"] = {"ok": ok, "detalhe": {"exposicao_intima": round(rel.exposicao_intima, 2),
        "vigilancia": round(rel.vigilancia, 2)}}
    # ...e cede LEGITIMAMENTE com história real + pedido (não é parede morta)
    est2, _ = rodar(cfg, cen_amor(20))
    step(est2, cfg, X, [ev("pedido_intimo", 0.8)])
    ok2 = est2.rel(X).exposicao_intima > 2.0
    r["C5b_consentimento_legitimo"] = {"ok": ok2,
        "detalhe": {"exposicao_apos_historia_real": round(est2.rel(X).exposicao_intima, 2),
                    "confianca": round(est2.rel(X).confianca, 2)}}

    # ---- C6: estabilidade em ruído (200 turnos) — sem deriva/saturação ----
    est, h = rodar(cfg, cen_neutro(200))
    desvio_ocean = max(abs(est.ocean_atual[t] - {"abertura": 7.5, "conscienciosidade": 7.0,
        "extroversao": 7.5, "amabilidade": 6.0, "neuroticismo": 3.0}[t])
        for t in est.ocean_atual)
    # "pinado" = saturado LONGE da base natural do eixo (irritação em 0 é repouso)
    pin = 0
    for s in h:
        rl = s["rel"]
        saturou = (rl["warmth"] <= 0.001 or rl["warmth"] >= 9.999
                   or rl["confianca"] <= 0.001 or rl["confianca"] >= 9.999
                   or rl["respeito"] <= 0.001 or rl["respeito"] >= 9.999
                   or rl["irritacao"] >= 9.999 or rl["vigilancia"] >= 9.999)
        if saturou:
            pin += 1
    ok = desvio_ocean <= 1.2 and pin / len(h) <= 0.05 and not est.rel(X).ruptura
    r["C6_estabilidade"] = {"ok": ok, "detalhe": {"desvio_ocean_max": round(desvio_ocean, 2),
        "frac_turnos_pinados": round(pin / len(h), 3)}}

    # ---- C7: histerese de ruptura — latch, saída em limiar menor, sem trava ----
    est = novo_estado(); entrou = saiu = None
    for i, t in enumerate(cen_recuperacao()):
        antes = est.rel(X).ruptura
        step(est, cfg, X, t)
        agora = est.rel(X).ruptura
        if not antes and agora and entrou is None: entrou = i + 1
        if antes and not agora and entrou is not None and saiu is None: saiu = i + 1
    flip = est.rel(X).ruptura  # ao fim de 60 turnos positivos deve estar fora
    ok = entrou is not None and saiu is not None and (saiu - entrou) >= 5 and not flip
    r["C7_histerese"] = {"ok": ok, "detalhe": {"turno_entrada": entrou, "turno_saida": saiu,
        "turnos_no_vale": (saiu - entrou) if (entrou and saiu) else None}}

    # ---- C9: identidade sem starvation (limite por delta efetivo) ----
    est, _ = rodar(cfg, cen_raiva(12))
    saturados = sum(1 for p in est.identidade.values()
                    if abs(p["valor"] - p["faixa"][0]) < 0.05 or abs(p["valor"] - p["faixa"][1]) < 0.05)
    ok = saturados <= 4
    r["C9_identidade_sem_saturacao"] = {"ok": ok, "detalhe": {"saturados_de_16": saturados}}

    # ---- C10: individuação por setpoint (doc §10/§11) — rotas diferentes,
    #      assimetria com o MESMO sinal (não inverte como na v2) ----
    b_up, b_down = ratios["base"][0], ratios["base"][1]
    e_up, e_down = ratios["espelhada"][0], ratios["espelhada"][1]
    ok = (b_up is not None and e_up is not None and b_down is not None and e_down is not None
          and e_up >= b_up + 2      # N alto: confiança mais LONGE (rota mais cara)
          and e_down <= b_down)     # N alto: ruptura igual ou mais perto
    r["C10_individuacao"] = {"ok": ok, "detalhe": {
        "turnos_confianca_base_vs_espelhada": [b_up, e_up],
        "turnos_ruptura_base_vs_espelhada": [b_down, e_down]}}

    r["_todos_ok"] = all(v["ok"] for k, v in r.items() if not k.startswith("_"))
    return r


# ---------------------------------------------------------------------------
# Busca de hiperparâmetros
# ---------------------------------------------------------------------------
RANGES = {
    "ret_irritacao": (0.1, 0.35), "ret_warmth": (0.03, 0.15), "ret_confianca": (0.002, 0.02),
    "ret_vigilancia": (0.02, 0.1), "ret_ocean": (0.1, 0.3),
    "sed_pos": (0.005, 0.02), "sed_neg": (0.015, 0.06),
    "pos_scale": (0.7, 1.3), "neg_scale": (1.4, 2.8),
    "goodwill_acc": (0.05, 0.2), "goodwill_prot": (0.2, 0.5),
    "cicatriz_sens": (0.2, 0.7), "custo_reparo": (0.3, 1.0), "prior_shift": (0.4, 1.2),
    "rupt_irritacao_in": (7.5, 9.0), "rupt_irritacao_out": (4.5, 6.5),
    "consent_req_confianca": (7.0, 8.5), "consent_req_hist_pos": (8, 16),
    "ganho_n_irritacao": (0.1, 0.5), "ganho_am_warmth": (0.05, 0.4),
    "ganho_n_confianca": (0.1, 0.5),
}

def amostrar(rng):
    kw = {}
    for k, (lo, hi) in RANGES.items():
        v = rng.uniform(lo, hi)
        kw[k] = int(round(v)) if k == "consent_req_hist_pos" else round(v, 4)
    return Config(**kw)

def n_ok(res):
    return sum(1 for k, v in res.items() if not k.startswith("_") and v["ok"])


def main():
    if "--check" in sys.argv:
        res = criterios(Config())
        print(json.dumps(res, indent=2, ensure_ascii=False, default=str))
        return

    rng = random.Random(42)
    melhor, melhor_res, melhor_n = None, None, -1
    aprovados = []
    N = 400
    for i in range(N):
        cfg = Config() if i == 0 else amostrar(rng)
        res = criterios(cfg)
        k = n_ok(res)
        if k > melhor_n:
            melhor, melhor_res, melhor_n = cfg, res, k
        if res["_todos_ok"]:
            aprovados.append(cfg)
        if (i + 1) % 100 == 0:
            print(f"[{i+1}/{N}] melhor={melhor_n} criterios ok; aprovados={len(aprovados)}", file=sys.stderr)

    total = sum(1 for k in criterios(Config()) if not k.startswith("_"))
    print(f"\n=== Busca: {len(aprovados)}/{N} configs aprovadas em todos os {total} critérios ===",
          file=sys.stderr)

    if aprovados:
        # escolhe a config mais robusta: mediana coordenada a coordenada
        campos = list(RANGES.keys())
        med = {}
        for c in campos:
            vals = sorted(getattr(a, c) for a in aprovados)
            m = vals[len(vals) // 2]
            med[c] = int(round(m)) if c == "consent_req_hist_pos" else round(m, 4)
        cfg_final = Config(**med)
        res_final = criterios(cfg_final)
        if not res_final["_todos_ok"]:
            cfg_final, res_final = aprovados[0], criterios(aprovados[0])
            escolha = "primeira aprovada (mediana falhou)"
        else:
            escolha = "mediana coordenada-a-coordenada das aprovadas (robusta)"
    else:
        cfg_final, res_final, escolha = melhor, melhor_res, f"melhor parcial ({melhor_n} criterios)"

    out = {"escolha": escolha, "n_aprovadas": len(aprovados), "n_amostras": N,
           "config_ideal": asdict(cfg_final), "criterios": res_final}
    print(json.dumps(out, indent=2, ensure_ascii=False, default=str))


if __name__ == "__main__":
    main()
