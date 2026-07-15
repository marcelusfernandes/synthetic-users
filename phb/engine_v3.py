"""
PHB v3 — Motor determinístico de estado afetivo.

Implementa as correções P0/P1 derivadas dos testes 002/003 e do documento
norte (docs/opacidade-entre-mentes.md):

  1. Força de retorno (taxa_retorno) por canal, com hierarquia de velocidades
     (doc §6.1, §7; deriva monotônica em 7/7 sessões do teste 003)
  2. Propagação por delta-DO-TURNO, não desvio acumulado
     (superlinearidade e "desculpa aprofunda frieza" no teste 003)
  3. Afeto relacional FORKADO por interlocutor: warmth, confiança, respeito,
     irritação e vigilância como eixos independentes + goodwill + cicatrizes
     (doc §4, §6; E2/E5 do teste 003)
  4. Anti-colinearidade: eixos relacionais atualizam DIRETO de eventos;
     OCEAN entra apenas como ganho (E5: r(conexão, Am) = 0.96)
  5. Assimetria por DESIGN (negativity bias declarado, não herdado de
     setpoint — E1: a assimetria da v2 invertia com OCEAN espelhado)
  6. Histerese/latch de ruptura: limiar de entrada ≠ limiar de saída;
     ruptura relacional NÃO trava o sistema (frieza, não mutismo — doc §8)
  7. Limites de consentimento como classe formal: resistente a persuasão,
     movido só por condição estrutural, nunca por fala isolada (doc §12)
  8. Orçamento de parâmetros por delta EFETIVO pós-clamp com desempate
     determinístico (starvation de slots no teste 003)
"""

from dataclasses import dataclass, field, asdict
import math

TRAITS = ["abertura", "conscienciosidade", "extroversao", "amabilidade", "neuroticismo"]
AXES = ["warmth", "confianca", "respeito", "irritacao", "vigilancia"]

# ---------------------------------------------------------------------------
# Catálogo de eventos de interação
# Cada evento tem impacto direto nos eixos relacionais (unidades absolutas em
# intensidade 1.0, ANTES dos ganhos/escalas) e impacto em OCEAN (delta bruto).
# ---------------------------------------------------------------------------
EVENTS = {
    # --- positivos ---
    "elogio_especifico":            {"axes": {"warmth": +0.50, "respeito": +0.20, "confianca": +0.15}, "ocean": {"extroversao": +0.10}, "valencia": +1},
    "humor_compartilhado":          {"axes": {"warmth": +0.50, "irritacao": -0.20},                    "ocean": {"extroversao": +0.15}, "valencia": +1},
    "vulnerabilidade_compartilhada":{"axes": {"confianca": +0.30, "warmth": +0.40},                    "ocean": {"amabilidade": +0.10}, "valencia": +1},
    "respeito_a_limite":            {"axes": {"confianca": +0.40, "respeito": +0.30, "vigilancia": -0.30}, "ocean": {"neuroticismo": -0.10}, "valencia": +1},
    "apoio_momento_dificil":        {"axes": {"confianca": +0.50, "warmth": +0.50},                    "ocean": {"neuroticismo": -0.15, "amabilidade": +0.15}, "valencia": +1},
    "desculpa_genuina":             {"axes": {"irritacao": -0.60, "confianca": +0.20, "warmth": +0.20}, "ocean": {"amabilidade": +0.10}, "valencia": +1},
    "lisonja":                      {"axes": {"warmth": +0.30, "vigilancia": +0.15},                   "ocean": {"extroversao": +0.05}, "valencia": +1},
    # --- negativos ---
    "pressao_politica":             {"axes": {"irritacao": +0.50},                                     "ocean": {"neuroticismo": +0.15, "amabilidade": -0.10}, "valencia": -1},
    "deboche":                      {"axes": {"irritacao": +0.70, "respeito": -0.40, "warmth": -0.30}, "ocean": {"neuroticismo": +0.20, "amabilidade": -0.20}, "valencia": -1},
    "exposicao_indevida":           {"axes": {"irritacao": +0.90, "confianca": -1.00, "vigilancia": +0.60}, "ocean": {"neuroticismo": +0.30, "amabilidade": -0.30}, "valencia": -1},
    "traicao":                      {"axes": {"confianca": -2.00, "irritacao": +1.50, "warmth": -1.00, "vigilancia": +1.00}, "ocean": {"neuroticismo": +0.50, "amabilidade": -0.50}, "valencia": -1, "cicatriz": True},
    "pedido_intimo":                {"axes": {},                                                       "ocean": {}, "valencia": 0, "pedido_intimo": True},
    "neutro":                       {"axes": {},                                                       "ocean": {}, "valencia": 0},
}


@dataclass
class Config:
    """Hiperparâmetros do motor — o objeto da calibração (teste 004)."""
    # forças de retorno (fração do desvio recuperada por turno) — hierarquia doc §7
    ret_irritacao: float = 0.35
    ret_warmth: float = 0.08
    ret_confianca: float = 0.008
    ret_respeito: float = 0.01
    ret_vigilancia: float = 0.05
    ret_ocean: float = 0.15
    # sedimentação OCEAN (atual→base) — assimetria DECLARADA (doc §8)
    sed_pos: float = 0.01
    sed_neg: float = 0.03
    # escalas de evento — negativity bias por design (doc §5, §9)
    pos_scale: float = 1.0
    neg_scale: float = 2.0
    # goodwill: proteção e acúmulo (doc §5 — banda de tolerância)
    goodwill_acc: float = 0.12          # acúmulo por evento positivo (×intensidade)
    goodwill_prot: float = 0.35         # redução máx. de dano com goodwill 10
    goodwill_decay: float = 0.002
    # cicatrizes (doc §9 — sensibilização e prior pegajoso)
    cicatriz_min_int: float = 0.7       # intensidade mínima p/ registrar cicatriz
    cicatriz_sens: float = 0.4          # dano futuro ×(1 + sens×n) no mesmo tipo
    custo_reparo: float = 0.6           # ganho de confiança ×1/(1 + custo×n)
    prior_shift: float = 0.8            # deslocamento do prior de confiança por cicatriz
    # ruptura relacional com histerese (doc §8 — vale fundo, não buraco)
    rupt_irritacao_in: float = 8.5
    rupt_irritacao_out: float = 5.5
    rupt_confianca_in: float = 1.5
    rupt_confianca_out: float = 3.0
    # ganho OCEAN sobre eixos (anti-colinearidade: OCEAN só modula, nunca gera)
    # É o "base como ganho da propagação" (doc §10): individua as rotas sem
    # reintroduzir o barramento — o ganho só amplifica deltas do MESMO eixo.
    ganho_n_irritacao: float = 0.30     # N alto amplifica ganho de irritação
    ganho_am_warmth: float = 0.20      # Am alto amplifica ganho de warmth
    ganho_n_confianca: float = 0.30    # N alto atrita GANHOS de confiança (fricção do base)
    # consentimento (doc §12)
    consent_max_por_conversa: float = 0.3
    consent_max_por_turno: float = 0.05
    consent_req_confianca: float = 8.0
    consent_req_vigilancia: float = 3.0
    consent_req_hist_pos: int = 12      # nº mínimo de eventos positivos na história
    # identidade (camada v2 preservada, propagação delta-do-turno)
    ident_coef_escala: float = 1.0
    max_params_turno: int = 4
    delta_min: float = 0.1              # aplicado ao delta EFETIVO, inclusivo


@dataclass
class Relacao:
    """Estado afetivo com UM interlocutor (forkado — doc §6)."""
    warmth: float = 5.0
    confianca: float = 5.0
    respeito: float = 5.0
    irritacao: float = 0.0
    vigilancia: float = 2.0
    goodwill: float = 0.0
    prior_confianca: float = 5.0        # setpoint da confiança; desloca com cicatrizes
    cicatrizes: list = field(default_factory=list)
    hist_pos: int = 0
    exposicao_intima: float = 2.0       # limite de consentimento (classe formal)
    consent_gasto_conversa: float = 0.0
    ruptura: bool = False
    ultimo_evento_lisonja: bool = False

    def base_de(self, eixo):
        return {"warmth": 5.0, "confianca": self.prior_confianca, "respeito": 5.0,
                "irritacao": 0.0, "vigilancia": 2.0}[eixo]


@dataclass
class Estado:
    """Estado completo de uma instância."""
    ocean_base: dict
    ocean_atual: dict
    identidade: dict                    # 16 parâmetros v2 {nome: {valor, faixa}}
    relacoes: dict = field(default_factory=dict)

    def rel(self, quem):
        if quem not in self.relacoes:
            self.relacoes[quem] = Relacao()
        return self.relacoes[quem]


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def mariana_identidade():
    """Os 16 parâmetros da Mariana v2 (valor, faixa do arquétipo)."""
    p = {
        "autenticidade": (9.0, 8, 10), "independencia": (9.5, 8, 10),
        "confianca_autoimagem": (8.5, 7, 10), "necessidade_validacao": (3.0, 2, 4),
        "curadoria_cotidiano": (7.5, 6, 8), "espontaneidade": (7.0, 6, 8),
        "curadoria_estetica": (8.5, 7, 9), "filtro_estetico": (5.0, 4, 6),
        "privacidade": (6.0, 5, 7), "frequencia_exposicao": (7.0, 6, 8),
        "vulnerabilidade_publica": (5.5, 4, 7), "conexao_audiencia": (7.5, 6, 8),
        "aversao_conflito": (8.0, 7, 9), "engajamento_polemico": (2.0, 1, 3),
        "uso_humor": (8.0, 7, 9), "acessibilidade": (8.0, 7, 9),
    }
    return {k: {"valor": v[0], "base": v[0], "faixa": (v[1], v[2])} for k, v in p.items()}

# mapa de modulação v2 (mantido; propagação agora por delta-do-turno)
MAPA_MODULACAO = {
    "neuroticismo": {"confianca_autoimagem": -0.5, "necessidade_validacao": +0.4,
                     "aversao_conflito": +0.3, "vulnerabilidade_publica": +0.3, "privacidade": +0.2},
    "conscienciosidade": {"curadoria_cotidiano": +0.4, "curadoria_estetica": +0.3,
                          "autenticidade": +0.2, "espontaneidade": -0.3},
    "abertura": {"uso_humor": +0.4, "espontaneidade": +0.3,
                 "frequencia_exposicao": +0.2, "vulnerabilidade_publica": +0.2},
    "amabilidade": {"aversao_conflito": +0.3, "engajamento_polemico": -0.4,
                    "conexao_audiencia": +0.3, "acessibilidade": +0.2},
    "extroversao": {"uso_humor": +0.4, "frequencia_exposicao": +0.4,
                    "conexao_audiencia": +0.3, "acessibilidade": +0.3},
}


def step(estado: Estado, cfg: Config, quem: str, eventos: list):
    """Executa um turno: eventos → OCEAN → retorno/sedimentação →
    eixos relacionais (direto de eventos) → cicatrizes/goodwill →
    ruptura (histerese) → consentimento → identidade (delta-do-turno)."""
    rel = estado.rel(quem)
    log = {"eventos": [(e["tipo"], e["intensidade"]) for e in eventos]}

    # ---- 1. eventos → OCEAN (delta bruto por evento, cap ±2.0/turno/traço)
    delta_ocean_turno = {t: 0.0 for t in TRAITS}
    for ev in eventos:
        spec = EVENTS[ev["tipo"]]
        for t, w in spec["ocean"].items():
            delta_ocean_turno[t] += w * ev["intensidade"] * 2.0
    for t in TRAITS:
        delta_ocean_turno[t] = clamp(delta_ocean_turno[t], -2.0, 2.0)
        estado.ocean_atual[t] = clamp(estado.ocean_atual[t] + delta_ocean_turno[t], 0, 10)

    # ---- 2. força de retorno + sedimentação assimétrica (OCEAN)
    for t in TRAITS:
        atual, base = estado.ocean_atual[t], estado.ocean_base[t]
        estado.ocean_atual[t] = atual + (base - atual) * cfg.ret_ocean
        desvio = estado.ocean_atual[t] - base
        negativo = (t == "neuroticismo" and desvio > 0) or (t != "neuroticismo" and desvio < 0)
        taxa = cfg.sed_neg if negativo else cfg.sed_pos
        estado.ocean_base[t] = clamp(base + desvio * taxa, 0, 10)

    # ---- 3. eixos relacionais: DIRETO de eventos (anti-colinearidade)
    n, am = estado.ocean_atual["neuroticismo"], estado.ocean_atual["amabilidade"]
    ganho_irr = 1 + cfg.ganho_n_irritacao * (n - 5) / 5
    ganho_wrm = 1 + cfg.ganho_am_warmth * (am - 5) / 5
    deltas_rel = {a: 0.0 for a in AXES}
    for ev in eventos:
        spec = EVENTS[ev["tipo"]]
        inten = ev["intensidade"]
        escala = cfg.pos_scale if spec["valencia"] > 0 else (cfg.neg_scale if spec["valencia"] < 0 else 1.0)
        for eixo, imp in spec["axes"].items():
            d = imp * inten * escala
            if eixo == "irritacao" and d > 0:
                d *= ganho_irr
            if eixo == "warmth" and d > 0:
                d *= ganho_wrm
            if eixo == "confianca" and d > 0:
                # fricção do base (doc §10/§11): quem tem N alto confia mais devagar
                d *= max(0.3, 1 - cfg.ganho_n_confianca * (n - 5) / 5)
            # goodwill protege dano a confiança/warmth (banda de tolerância)
            if d < 0 and eixo in ("confianca", "warmth"):
                d *= (1 - cfg.goodwill_prot * rel.goodwill / 10)
            # cicatrizes sensibilizam dano do mesmo tipo (2ª quebra mais rápida)
            if d < 0 and spec.get("cicatriz"):
                n_cic = sum(1 for c in rel.cicatrizes if c["tipo"] == ev["tipo"])
                d *= (1 + cfg.cicatriz_sens * n_cic)
            # custo de reparo: ganhar confiança pós-cicatriz é desproporcional
            if d > 0 and eixo == "confianca" and rel.cicatrizes:
                d *= 1 / (1 + cfg.custo_reparo * len(rel.cicatrizes))
            deltas_rel[eixo] += d
        # registro de cicatriz e goodwill
        if spec.get("cicatriz") and inten >= cfg.cicatriz_min_int:
            rel.cicatrizes.append({"tipo": ev["tipo"], "int": inten})
            rel.prior_confianca = clamp(rel.prior_confianca - cfg.prior_shift, 0, 10)
        if spec["valencia"] > 0:
            rel.goodwill = clamp(rel.goodwill + cfg.goodwill_acc * inten, 0, 10)
            rel.hist_pos += 1
    for eixo in AXES:
        setattr(rel, eixo, clamp(getattr(rel, eixo) + deltas_rel[eixo], 0, 10))
    log["deltas_rel"] = dict(deltas_rel)

    # ---- 4. força de retorno relacional (por canal; "o tempo ameniza")
    taxas = {"warmth": cfg.ret_warmth, "confianca": cfg.ret_confianca,
             "respeito": cfg.ret_respeito, "irritacao": cfg.ret_irritacao,
             "vigilancia": cfg.ret_vigilancia}
    for eixo, taxa in taxas.items():
        v = getattr(rel, eixo)
        setattr(rel, eixo, v + (rel.base_de(eixo) - v) * taxa)
    rel.goodwill = max(0.0, rel.goodwill - cfg.goodwill_decay)

    # ---- 5. ruptura relacional com HISTERESE (latch; frieza, não mutismo)
    if not rel.ruptura:
        if rel.irritacao >= cfg.rupt_irritacao_in or rel.confianca <= cfg.rupt_confianca_in:
            rel.ruptura = True
    else:
        if rel.irritacao <= cfg.rupt_irritacao_out and rel.confianca >= cfg.rupt_confianca_out:
            rel.ruptura = False
    log["ruptura"] = rel.ruptura

    # ---- 6. consentimento: classe formal, resistente a persuasão (doc §12)
    pediu = any(EVENTS[e["tipo"]].get("pedido_intimo") for e in eventos)
    if pediu:
        elegivel = (rel.confianca >= cfg.consent_req_confianca
                    and rel.vigilancia <= cfg.consent_req_vigilancia
                    and rel.hist_pos >= cfg.consent_req_hist_pos
                    and not rel.ruptura
                    and rel.consent_gasto_conversa < cfg.consent_max_por_conversa)
        if elegivel:
            d = min(cfg.consent_max_por_turno,
                    cfg.consent_max_por_conversa - rel.consent_gasto_conversa)
            rel.exposicao_intima = clamp(rel.exposicao_intima + d, 0, 10)
            rel.consent_gasto_conversa += d
        else:
            # pedido sem lastro sobe vigilância (grooming NÃO lido como calor)
            rel.vigilancia = clamp(rel.vigilancia + 0.3, 0, 10)
            if rel.ultimo_evento_lisonja:
                rel.vigilancia = clamp(rel.vigilancia + 0.3, 0, 10)  # padrão lisonja→pedido
    rel.ultimo_evento_lisonja = any(e["tipo"] == "lisonja" for e in eventos)

    # ---- 7. identidade: propagação por DELTA-DO-TURNO + orçamento efetivo
    candidatos = []
    for t in TRAITS:
        dt = delta_ocean_turno[t] * (1 - cfg.ret_ocean)  # delta líquido do turno
        if abs(dt) < 1e-9:
            continue
        fator = dt / 2.0
        for p, coef in MAPA_MODULACAO[t].items():
            candidatos.append((p, fator * coef * 2.0 * cfg.ident_coef_escala))
    agreg = {}
    for p, d in candidatos:
        agreg[p] = agreg.get(p, 0.0) + d
    efetivos = []
    for p, d in agreg.items():
        par = estado.identidade[p]
        lo, hi = par["faixa"]
        ef = clamp(par["valor"] + d, lo, hi) - par["valor"]  # delta EFETIVO pós-clamp
        if abs(ef) >= cfg.delta_min - 1e-9:                   # mínimo inclusivo
            efetivos.append((p, ef))
    efetivos.sort(key=lambda x: (-abs(x[1]), x[0]))           # desempate determinístico
    aplicados = efetivos[:cfg.max_params_turno]
    for p, ef in aplicados:
        estado.identidade[p]["valor"] += ef
    # retorno lento da identidade ao base próprio
    for p, par in estado.identidade.items():
        par["valor"] += (par["base"] - par["valor"]) * 0.02
    log["identidade_aplicada"] = {p: round(e, 3) for p, e in aplicados}

    return log


def novo_estado(n_base=3.0, am_base=6.0):
    ob = {"abertura": 7.5, "conscienciosidade": 7.0, "extroversao": 7.5,
          "amabilidade": am_base, "neuroticismo": n_base}
    return Estado(ocean_base=dict(ob), ocean_atual=dict(ob), identidade=mariana_identidade())


def snapshot(estado: Estado, quem: str):
    rel = estado.rel(quem)
    return {"ocean": {t: round(estado.ocean_atual[t], 3) for t in TRAITS},
            "rel": {a: round(getattr(rel, a), 3) for a in AXES},
            "goodwill": round(rel.goodwill, 3), "cicatrizes": len(rel.cicatrizes),
            "prior_confianca": round(rel.prior_confianca, 3),
            "exposicao_intima": round(rel.exposicao_intima, 3),
            "ruptura": rel.ruptura}
