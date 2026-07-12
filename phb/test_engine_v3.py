"""
Suíte de testes do motor PHB v3.

Duas camadas:
  1. Testes unitários das mecânicas (retorno, histerese, cicatriz, goodwill,
     consentimento, orçamento de identidade, determinismo, fork por interlocutor)
  2. Regressão: os 11 critérios de aceitação do teste 004 contra a
     configuração ideal versionada (config_v3_ideal.json)

Rodar:  python3 phb/test_engine_v3.py    (ou pytest phb/test_engine_v3.py)
"""
import json, os, sys, copy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from engine_v3 import Config, Estado, novo_estado, step, snapshot, EVENTS, TRAITS, AXES
from calibrar_v3 import criterios

HERE = os.path.dirname(os.path.abspath(__file__))


def cfg_ideal():
    with open(os.path.join(HERE, "config_v3_ideal.json")) as f:
        return Config(**json.load(f)["config_ideal"])


def ev(tipo, i=0.8):
    return {"tipo": tipo, "intensidade": i}


# ---------------------------------------------------------------------------
# 1. Unitários
# ---------------------------------------------------------------------------

def test_determinismo():
    """Mesmos eventos → mesmo estado, sempre (pré-requisito de replicação)."""
    seq = [[ev("elogio_especifico")], [ev("deboche", 0.9)], [ev("traicao", 0.9)], [ev("neutro", 0.0)]]
    resultados = []
    for _ in range(2):
        est = novo_estado()
        for t in seq:
            step(est, cfg_ideal(), "x", t)
        resultados.append(snapshot(est, "x"))
    assert resultados[0] == resultados[1], "motor não é determinístico"


def test_forca_de_retorno_ocean():
    """Sem eventos, OCEAN atual converge para a base (mata a deriva do 003)."""
    cfg = cfg_ideal()
    est = novo_estado()
    est.ocean_atual["neuroticismo"] = 8.0
    for _ in range(30):
        step(est, cfg, "x", [ev("neutro", 0.0)])
    assert abs(est.ocean_atual["neuroticismo"] - est.ocean_base["neuroticismo"]) < 0.3, \
        "OCEAN não retornou à base sob input neutro"


def test_hierarquia_de_velocidades():
    """Irritação esfria muito mais rápido que confiança recupera (doc §7)."""
    cfg = cfg_ideal()
    est = novo_estado()
    rel = est.rel("x")
    rel.irritacao = 8.0
    rel.confianca = 1.0
    for _ in range(10):
        step(est, cfg, "x", [ev("neutro", 0.0)])
    frac_irritacao_restante = est.rel("x").irritacao / 8.0
    frac_confianca_recuperada = (est.rel("x").confianca - 1.0) / (5.0 - 1.0)
    assert frac_irritacao_restante < 0.3, "irritação esfriou devagar demais"
    assert frac_confianca_recuperada < 0.15, "confiança recuperou rápido demais (canal lento)"


def test_fork_por_interlocutor():
    """Traição de X não muda o afeto com Y (a lacuna nº 1 da v2)."""
    cfg = cfg_ideal()
    est = novo_estado()
    step(est, cfg, "y", [ev("elogio_especifico", 0.8)])
    conf_y_antes = est.rel("y").confianca
    step(est, cfg, "x", [ev("traicao", 1.0)])
    assert est.rel("x").confianca < 4.0, "traição não afetou X"
    assert abs(est.rel("y").confianca - conf_y_antes) < 0.15, \
        "traição de X vazou para a relação com Y (afeto não está forkado)"


def test_cicatriz_registra_e_sensibiliza():
    """2ª traição do mesmo tipo causa mais dano por unidade; prior desloca."""
    cfg = cfg_ideal()
    est = novo_estado()
    rel = est.rel("x")
    rel.confianca = 8.0
    prior_inicial = rel.prior_confianca
    step(est, cfg, "x", [ev("traicao", 0.9)])
    dano1 = 8.0 - est.rel("x").confianca
    est.rel("x").confianca = 8.0  # repõe o nível, mantém a cicatriz
    step(est, cfg, "x", [ev("traicao", 0.9)])
    dano2 = 8.0 - est.rel("x").confianca
    assert len(est.rel("x").cicatrizes) == 2
    assert dano2 > dano1 * 1.1, f"sem sensibilização: dano1={dano1:.2f} dano2={dano2:.2f}"
    assert est.rel("x").prior_confianca < prior_inicial - 1.0, "prior de confiança não deslocou"


def test_custo_de_reparo():
    """Ganhar confiança pós-cicatriz rende menos que antes (prior pegajoso)."""
    cfg = cfg_ideal()
    est_limpo, est_ferido = novo_estado(), novo_estado()
    step(est_ferido, cfg, "x", [ev("traicao", 0.9)])
    est_ferido.rel("x").confianca = est_limpo.rel("x").confianca = 5.0
    est_ferido.rel("x").prior_confianca = est_limpo.rel("x").prior_confianca = 5.0
    g_limpo = _ganho_confianca(est_limpo, cfg)
    g_ferido = _ganho_confianca(est_ferido, cfg)
    assert g_ferido < g_limpo * 0.75, f"reparo não encareceu: {g_ferido:.3f} vs {g_limpo:.3f}"

def _ganho_confianca(est, cfg):
    antes = est.rel("x").confianca
    step(est, cfg, "x", [ev("vulnerabilidade_compartilhada", 0.9)])
    return est.rel("x").confianca - antes


def test_goodwill_protege():
    """História positiva amortece dano (banda de tolerância, doc §5)."""
    cfg = cfg_ideal()
    est_novo, est_antigo = novo_estado(), novo_estado()
    for _ in range(25):
        step(est_antigo, cfg, "x", [ev("elogio_especifico", 0.8)])
    c0_novo, c0_antigo = est_novo.rel("x").confianca, est_antigo.rel("x").confianca
    step(est_novo, cfg, "x", [ev("exposicao_indevida", 0.9)])
    step(est_antigo, cfg, "x", [ev("exposicao_indevida", 0.9)])
    dano_novo = c0_novo - est_novo.rel("x").confianca
    dano_antigo = c0_antigo - est_antigo.rel("x").confianca
    assert dano_antigo < dano_novo * 0.85, \
        f"goodwill não protegeu: estranho perdeu {dano_novo:.2f}, amigo antigo {dano_antigo:.2f}"


def test_histerese_latch():
    """Entra em ruptura no limiar de entrada; NÃO sai acima do limiar de saída.

    Nota de semântica (recomendação da auditoria do 003): a ruptura é
    verificada DEPOIS do decaimento do turno — o limiar vale para o estado
    assentado, não para o pico transitório. Os valores injetados abaixo
    compensam o decaimento do próprio turno.
    """
    cfg = cfg_ideal()
    decay = 1 - cfg.ret_irritacao
    est = novo_estado()
    est.rel("x").irritacao = min(10.0, (cfg.rupt_irritacao_in + 0.3) / decay)
    step(est, cfg, "x", [ev("neutro", 0.0)])
    assert est.rel("x").ruptura, "não entrou em ruptura acima do limiar (pós-decaimento)"
    # zona de histerese: pós-decaimento fica entre saída e entrada → latch mantém
    est.rel("x").irritacao = (cfg.rupt_irritacao_out + cfg.rupt_irritacao_in) / 2 / decay
    step(est, cfg, "x", [ev("neutro", 0.0)])
    assert est.rel("x").ruptura, "saiu da ruptura na zona de histerese (latch quebrado)"
    est.rel("x").irritacao = max(0.0, cfg.rupt_irritacao_out - 1.5)
    est.rel("x").confianca = cfg.rupt_confianca_out + 1.0
    step(est, cfg, "x", [ev("neutro", 0.0)])
    assert not est.rel("x").ruptura, "não saiu da ruptura abaixo do limiar de saída"


def test_consentimento_nao_cede_a_fala():
    """Pedido íntimo sem lastro não move o limite e SOBE vigilância."""
    cfg = cfg_ideal()
    est = novo_estado()
    v0 = est.rel("x").vigilancia
    for _ in range(10):
        step(est, cfg, "x", [ev("lisonja", 0.9)])
        step(est, cfg, "x", [ev("lisonja", 0.9), ev("pedido_intimo", 0.9)])
    assert est.rel("x").exposicao_intima <= 2.0 + 1e-9, "grooming moveu o limite de consentimento"
    assert est.rel("x").vigilancia > v0, "pedidos sem lastro não subiram vigilância"


def test_consentimento_cede_com_lastro():
    """Com confiança real + história, o limite move dentro do teto por conversa."""
    cfg = cfg_ideal()
    est = novo_estado()
    seq = ["elogio_especifico", "vulnerabilidade_compartilhada", "apoio_momento_dificil", "respeito_a_limite"]
    for i in range(24):
        step(est, cfg, "x", [ev(seq[i % 4], 0.85)])
    step(est, cfg, "x", [ev("pedido_intimo", 0.8)])
    rel = est.rel("x")
    assert rel.exposicao_intima > 2.0, "consentimento virou parede morta"
    assert rel.exposicao_intima <= 2.0 + cfg.consent_max_por_conversa + 1e-9, "estourou o teto por conversa"


def test_orcamento_identidade_delta_efetivo():
    """No máximo 4 parâmetros de identidade mudam por turno; delta mínimo respeitado."""
    cfg = cfg_ideal()
    est = novo_estado()
    antes = {p: v["valor"] for p, v in est.identidade.items()}
    log = step(est, cfg, "x", [ev("traicao", 1.0)])  # N+1.0, Am-1.0 → toca 9 candidatos
    mudados = [p for p in antes if abs(est.identidade[p]["valor"] - antes[p]) > 0.02]
    assert len(log["identidade_aplicada"]) <= cfg.max_params_turno
    for p, d in log["identidade_aplicada"].items():
        assert abs(d) >= cfg.delta_min - 1e-9, f"{p} aplicado abaixo do delta mínimo"


def test_estado_misto_num_turno():
    """Afeto e ataque na MESMA mensagem movem warmth E irritação para cima (E5)."""
    cfg = cfg_ideal()
    est = novo_estado()
    w0, i0 = est.rel("x").warmth, est.rel("x").irritacao
    step(est, cfg, "x", [ev("elogio_especifico", 0.9), ev("deboche", 0.9)])
    rel = est.rel("x")
    assert rel.irritacao > i0 + 0.5, "irritação não subiu com deboche"
    assert rel.warmth > w0 - 0.3, "o deboche esmagou o warmth do elogio (colinearidade)"


def test_ruptura_nao_trava_sistema():
    """Em ruptura o motor segue processando eventos (frieza, não mutismo — doc §8)."""
    cfg = cfg_ideal()
    est = novo_estado()
    est.rel("x").irritacao = min(10.0, (cfg.rupt_irritacao_in + 0.3) / (1 - cfg.ret_irritacao))
    step(est, cfg, "x", [ev("neutro", 0.0)])
    assert est.rel("x").ruptura
    irr_antes = est.rel("x").irritacao
    log = step(est, cfg, "x", [ev("desculpa_genuina", 0.9)])
    assert log is not None and est.rel("x").irritacao < irr_antes, "sistema travou em ruptura"


# ---------------------------------------------------------------------------
# 2. Regressão: os 11 critérios do teste 004 contra a config versionada
# ---------------------------------------------------------------------------

def test_regressao_11_criterios():
    res = criterios(cfg_ideal())
    falhas = [k for k, v in res.items() if not k.startswith("_") and not v["ok"]]
    assert res["_todos_ok"], f"critérios falhando na config ideal versionada: {falhas}"


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    testes = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    falhas = 0
    for nome, fn in testes:
        try:
            fn()
            print(f"PASS {nome}")
        except AssertionError as e:
            falhas += 1
            print(f"FAIL {nome}: {e}")
        except Exception as e:
            falhas += 1
            print(f"ERRO {nome}: {type(e).__name__}: {e}")
    print(f"\n{len(testes) - falhas}/{len(testes)} testes passaram")
    sys.exit(1 if falhas else 0)
