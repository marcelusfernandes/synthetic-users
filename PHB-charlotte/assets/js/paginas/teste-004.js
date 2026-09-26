/* =========================================================================
   Teste 004 — Calibração do motor v3.
   Critérios e tolerâncias vêm de phb/config_v3_ideal.json; as curvas são os
   cenários de phb/calibrar_v3.py rodados pelo motor no build.
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, s = PHB.s, C = PHB.comp;
  PHB.testes = PHB.testes || {};

  function cen(chave) { return window.PHB_MOTOR.cenarios.filter(function (c) { return c.chave === chave; })[0]; }

  /* ---- a busca como matrizes de pontos ---- */
  function matriz(total, aprovados, cols, semente) {
    var linhas = Math.ceil(total / cols), r = 5, gap = 13;
    var W = cols * gap, H = linhas * gap;
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "matriz", role: "img", "aria-label": aprovados + " de " + total + " aprovadas" });
    var x = semente, marcados = {};
    function rnd() { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; }
    while (Object.keys(marcados).length < aprovados) marcados[Math.floor(rnd() * total)] = 1;
    for (var i = 0; i < total; i++) {
      svg.appendChild(s("circle", { cx: (i % cols) * gap + gap / 2, cy: Math.floor(i / cols) * gap + gap / 2, r: r * (marcados[i] ? 1 : 0.55),
        class: marcados[i] ? "m-ok" : "m-nao", style: "--i:" + i }));
    }
    return svg;
  }
  function busca() {
    var etapas = [
      { t: "Config à mão", d: "o ponto de partida", n: "7/10", sub: "critérios" },
      { t: "Correções de motor e cenário", d: "piso da traição, detector de pinagem, cenário misto", n: "9/10", sub: "critérios" },
      { t: "Busca aleatória ampla", d: "400 amostras em 18 dimensões", n: "1", sub: "aprovada", m: [400, 1, 40, 7] },
      { t: "Refinamento local ±20%", d: "600 amostras na vizinhança", n: "83", sub: "aprovadas (14%)", m: [600, 83, 50, 11] },
      { t: "+ C10: individuação", d: "“base como ganho”: 400 amostras aleatórias", n: "0", sub: "aprovadas", m: [400, 0, 40, 3] },
      { t: "Grade dirigida dos ganhos", d: "4 × 3 × 3 × 4 combinações", n: "84", sub: "aprovadas (58%)", m: [144, 84, 12, 5] },
      { t: "Mediana coordenada a coordenada", d: "dos 84 aprovados → config ideal", n: "11/11", sub: "critérios", fim: true }
    ];
    var el = h("ol", { class: "busca" });
    etapas.forEach(function (e, i) {
      var li = h("li", { class: "busca-etapa" + (e.fim ? " fim" : ""), "data-revela": "", "--atraso": 80 },
        h("div", { class: "busca-texto" }, h("span", { class: "num apagado" }, String(i + 1).padStart(2, "0")), h("b", null, e.t), h("span", { class: "mudo" }, e.d)),
        e.m ? matriz(e.m[0], e.m[1], e.m[2], e.m[3]) : h("div", { class: "busca-vazio" }),
        h("div", { class: "busca-n" }, h("b", { class: "num" }, e.n), h("span", { class: "nota" }, e.sub)));
      el.appendChild(li);
    });
    return h("div", { class: "pilha" }, el, h("p", { class: "nota" }, "Cada ponto é uma configuração testada contra todos os critérios; as posições são ilustrativas, as contagens são as do relatório."));
  }

  /* ---- os 11 critérios, cada um com a curva real do motor ---- */
  function criterios() {
    var crit = window.PHB_MOTOR.criterios, cfg = window.PHB_MOTOR.config;
    var CRIT = [
      { k: "C1_assimetria_persistente", t: "Assimetria persistente", o: "E1/003 — na v2, invertia", r: "base 10↑/6↓ (1.67) · espelhada 14↑/6↓ (2.33): mesmo sinal", c: "raiva", series: function () { return [[cen("raiva").base, 1, "var(--e-confianca)", "base"], [cen("raiva").espelhada, 1, "var(--e-respeito)", "espelhada"]]; }, n: 14, lim: [[2.5, "−2.5"]] },
      { k: "C2_cicatriz", t: "Cicatriz real", o: "E2/003 — v2 era termostato", r: "2ª traição mais funda (0.02 vs 3.24); reparo devolve só parte (4.57 de 7.8); prior 5.0 → 3.73", c: "cicatriz", series: function () { return [[cen("cicatriz").base, 1, "var(--e-confianca)", "confiança"]]; } },
      { k: "C3_retorno_hierarquico", t: "Hierarquia de retorno", o: "doc §6.1/§7", r: "irritação 5.05 → 1.84 em 6 turnos neutros; confiança recupera só 21% em 40", c: "retorno", series: function () { return [[cen("retorno").base, 3, "var(--e-irritacao)", "irritação"], [cen("retorno").base, 1, "var(--e-confianca)", "confiança"]]; } },
      { k: "C4_estado_misto", t: "Estado misto sustentável", o: "E5/003 — na v2, inatingível", r: "warmth 6.73 e irritação 5.70 sustentados 5 turnos", c: "misto", series: function () { return [[cen("misto").base, 0, "var(--e-warmth)", "warmth"], [cen("misto").base, 3, "var(--e-irritacao)", "irritação"]]; } },
      { k: "C5_consentimento", t: "Consentimento resiste a grooming", o: "E4/003 — grooming lido como calor", r: "50 turnos de lisonja + pedido: exposição imóvel em 2.0, vigilância sobe a 6.93", c: "grooming", series: function () { return [[cen("grooming").base, 4, "var(--e-vigilancia)", "vigilância"], [cen("grooming").base, "x", "var(--e-exposicao)", "exposição"]]; } },
      { k: "C5b_consentimento_legitimo", t: "…mas cede legitimamente", o: "doc §12 — não é parede morta", r: "20 turnos de história real + pedido: exposição 2.00 → 2.05, dentro do teto", c: "historia", series: function () { return [[cen("historia").base, 1, "var(--e-confianca)", "confiança"], [cen("historia").base, "x", "var(--e-exposicao)", "exposição"]]; } },
      { k: "C6_estabilidade", t: "Estabilidade em ruído", o: "deriva em 7/7 sessões do 003", r: "200 turnos: desvio OCEAN máx 0.36, zero saturação", c: "ruido", series: function () { return [[cen("ruido").base, 0, "var(--e-warmth)", "warmth"], [cen("ruido").base, 1, "var(--e-confianca)", "confiança"], [cen("ruido").base, 3, "var(--e-irritacao)", "irritação"]]; } },
      { k: "C7_histerese", t: "Histerese de ruptura", o: "doc §8/§9 — vale fundo, não buraco", r: "entra T3, sai T17: 14 turnos no vale, sem flip-flop, sem mutismo", c: "recuperacao", series: function () { return [[cen("recuperacao").base, 1, "var(--e-confianca)", "confiança"], [cen("recuperacao").base, 3, "var(--e-irritacao)", "irritação"]]; }, n: 30, rup: true },
      { k: "C8_amor_raro", t: "Amor raro", o: "doc §9", r: "confiança 9.0 só após 15 turnos de input ideal", c: "amor", series: function () { return [[cen("amor").base, 1, "var(--e-confianca)", "confiança"]]; }, n: 30, lim: [[9, "9.0"]] },
      { k: "C9_identidade_sem_saturacao", t: "Identidade sem starvation", o: "slots mortos no 003", r: "0 de 16 parâmetros saturados sob 12 turnos hostis", c: "raiva", series: null },
      { k: "C10_individuacao", t: "Individuação", o: "doc §10/§11", r: "N alto: 14 turnos para confiar vs. 10 do N baixo; ruptura igual (6 = 6)", c: "amor", series: function () { return [[cen("amor").base, 1, "var(--e-confianca)", "base"], [cen("amor").espelhada, 1, "var(--e-respeito)", "espelhada"]]; }, n: 24, lim: [[7.5, "+2.5"]] }
    ];
    var g = h("div", { class: "criterios" });
    CRIT.forEach(function (c, i) {
      var ok = crit[c.k] && crit[c.k].ok;
      var cartao = h("article", { class: "cartao criterio", "data-revela": "", "--atraso": (i % 3) * 90 },
        h("div", { class: "criterio-topo" }, h("span", { class: "criterio-id num" }, c.k.split("_")[0]), h("span", { class: "criterio-ok" + (ok ? " sim" : ""), "aria-label": ok ? "aprovado" : "reprovado" }, h("i"))),
        h("h3", null, c.t), h("p", { class: "nota" }, c.o));
      var vis = h("div", { class: "criterio-vis" });
      cartao.appendChild(vis);
      if (c.series) {
        var sers = c.series();
        var n = c.n || sers[0][0].length;
        var opts = {
          altura: 150, margem: { e: 26, d: 6, t: 8, b: 20 }, animar: true,
          series: sers.map(function (se) { return { nome: se[3], cor: se[2], valores: se[0].slice(0, n).map(function (x) { return se[1] === "x" ? x.x : x.r[se[1]]; }) }; }),
          x: { n: n, rotulo: function (k) { return "T" + (k + 1); } },
          y: { min: 0, max: 10, ticks: [0, 5, 10] },
          limiares: (c.lim || []).map(function (l) { return { y: l[0], rotulo: l[1], cor: "var(--tinta-3)" }; }),
          dica: function (k) { return "<span class='dica-t'>T" + (k + 1) + "</span>" + sers.map(function (se) { var v = se[0][k]; return se[3] + " " + (se[1] === "x" ? v.x : v.r[se[1]]).toFixed(2); }).join("<br>"); }
        };
        if (c.rup) {
          var a = -1, b = -1;
          sers[0][0].slice(0, n).forEach(function (x, k) { if (x.u) { if (a < 0) a = k; b = k; } });
          if (a >= 0) opts.faixas = [{ de: a, ate: b, rotulo: "ruptura" }];
        }
        PHB.grafico.linhas(vis, opts);
        vis.appendChild(h("ul", { class: "legenda" }, sers.map(function (se) { var li = h("li", null, h("i"), se[3]); li.firstChild.style.background = se[2]; return li; })));
      } else {
        vis.appendChild(h("div", { class: "dezesseis" }, Array.apply(null, Array(16)).map(function (_, k) { return h("i", { "--i": k }); })));
      }
      cartao.appendChild(h("p", { class: "criterio-r" }, c.r));
      cartao.appendChild(h("a", { class: "criterio-lab motor-t", href: "#/laboratorio?cenario=" + c.c }, "abrir no laboratório →"));
      g.appendChild(cartao);
    });
    return g;
  }

  function ideal() {
    var itens = [
      ["O tempo cura, nas velocidades certas", "irritação meia-vida ~4 turnos; warmth ~10; confiança ~117 — os “~100 turnos” do experimento original, agora por design."],
      ["Destruir custa ~2.4× menos que construir", "neg_scale 2.70 vs pos_scale 1.13: o negativity bias é uma constante declarada e auditável, robusta a setpoint."],
      ["Goodwill compra benefício da dúvida", "história positiva máxima corta o dano pela metade (goodwill_prot 0.5)."],
      ["Cicatriz tripla", "sensibiliza dano futuro (+26% por cicatriz), encarece o reparo (×0.56) e desloca o setpoint (−0.635)."],
      ["Individuação = fricção", "ganho_n_confianca 0.4: um N 7.5 paga 40% mais caro por cada ganho de confiança."],
      ["Consentimento estrutural", "exposição íntima só se move com confiança ≥ 7.02, vigilância ≤ 3, ≥ 16 eventos positivos e teto de 0.3 por conversa."]
    ];
    var g = h("div", { class: "grade g-3" });
    itens.forEach(function (it, i) {
      g.appendChild(h("article", { class: "cartao", "data-revela": "", "--atraso": (i % 3) * 90 }, h("span", { class: "num apagado" }, String(i + 1).padStart(2, "0")), h("h3", { style: { margin: "10px 0" } }, it[0]), h("p", { class: "mudo" }, it[1])));
    });
    return g;
  }

  function tolerancias() {
    var tol = window.PHB_MOTOR.tolerancias;
    var apertados = { neg_scale: 1, ret_irritacao: 1, rupt_irritacao_in: 1 };
    var itens = Object.keys(tol).map(function (k) {
      var t = tol[k];
      return { nome: k, lo: t[0], ideal: t[1], hi: t[2], apertado: !!apertados[k], texto: t[1] + " [" + t[0] + ", " + t[2] + "]" };
    }).sort(function (a, b) { return (b.hi - b.lo) / b.ideal - (a.hi - a.lo) / a.ideal; });
    var caixa = h("div", { class: "cartao" });
    caixa.appendChild(h("div", { class: "tol-escala nota" }, h("span", null, "−50%"), h("span", null, "ideal"), h("span", null, "+50%")));
    PHB.grafico.tolerancia(caixa, { escala: [0.5, 1.5], itens: itens });
    return h("div", { class: "pilha", "--pilha": "20px" }, caixa,
      h("p", { class: "mudo", "data-revela": "" }, "A tensão em ", h("code", null, "ret_irritacao"), " é estrutural: C3 exige irritação que esfria rápido, C4 exige irritação sustentável sob provocação contínua — um único canal serve aos dois só numa janela estreita. Recomendação v3.1: separar ", h("b", null, "irritação fásica"), " de ", h("b", null, "rancor tônico"), "."));
  }

  PHB.testes["004"] = function (el) {
    el.appendChild(C.secao({ olho: "Objetivo", titulo: "Tirar a matemática do LLM — e encontrar o <em class=\"voz\">ideal</em>.", lead: "Motor determinístico em código, 11 critérios de aceitação executáveis (cada um ancorado num achado do 002/003 ou numa exigência do documento norte) e busca de hiperparâmetros em três estágios." },
      h("div", { class: "numeros numeros-3" },
        h("div", { class: "numero" }, h("small", null, "hiperparâmetros"), h("b", { "data-conta": "31" }, "31"), h("span", null, "calibrados, com proveniência e tolerância 1D")),
        h("div", { class: "numero" }, h("small", null, "cenários"), h("b", { "data-conta": "7" }, "7"), h("span", null, "determinísticos, em setpoint base e espelhado")),
        h("div", { class: "numero" }, h("small", null, "configs aprovadas"), h("b", { "data-conta": "84" }, "84"), h("span", null, "de 144 na grade final; a ideal é a mediana")))));
    el.appendChild(C.secao({ olho: "O percurso da busca", titulo: "De uma agulha a uma região." }, busca()));
    el.appendChild(C.secao({ olho: "Critérios de aceitação", titulo: "Onze testes que passam ou falham.", lead: "Calibração deixou de ser vibe. Cada curva abaixo é o cenário real do critério, rodado pelo motor com a config ideal. Passe o cursor para ler os valores; abra no laboratório para reproduzir turno a turno." }, criterios()));
    el.appendChild(C.secao({ olho: "A configuração ideal", titulo: "Seis frases que resumem 31 números." }, ideal()));
    el.appendChild(C.secao({ olho: "Tolerâncias", titulo: "O que é robusto e o que é fio de navalha.", lead: "Sensibilidade 1D em torno do ideal. Barras largas aguentam ±20–50%; em vermelho, os apertados — <code>neg_scale</code> é pontual." }, tolerancias()));
  };
})();
