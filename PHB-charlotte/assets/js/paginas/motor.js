/* =========================================================================
   O motor v3 — arquitetura, estado, step(), catálogo, retorno, histerese.
   Catálogo, config e curvas vêm de dados/motor.js (gerado do motor real).
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, s = PHB.s, C = PHB.comp;

  function pipelineGrande() {
    return C.pipeline({ grande: true, detalhes: [
      "“Topa gravar juntos o vídeo que não presta pra nada? Sem marca, com saída fácil.”",
      "humor 0.5 · vulnerabilidade 0.4 · respeito_a_limite 0.5 · pedido_intimo 0.7",
      "warmth 7.06 · confiança 6.00 < 7.02 · vigilância 2.67 · exposição imóvel",
      "“Não rola, pelo menos não assim. Bastidor de verdade é tipo a casa da minha mãe…”"
    ] });
  }

  /* ------------------------------------------------ anatomia do estado */
  function anatomia() {
    var M = window.PHB_MOTOR;
    var ocean = h("div", { class: "cartao anat" },
      h("p", { class: "olho" }, "self · global"), h("h3", null, "OCEAN base + atual"),
      h("p", { class: "mudo" }, "Âncora da personalidade. Atual decai para a base; desvio sustentado sedimenta — o negativo 10× mais rápido."),
      h("div", { class: "ocean-barras" }, ["abertura", "conscienciosidade", "extroversao", "amabilidade", "neuroticismo"].map(function (t, i) {
        var v = [7.5, 7.0, 7.5, 6.0, 3.0][i];
        return h("div", { class: "ocean-b", style: { "--v": v, "--i": i } }, h("span", { class: "ocean-l" }, t.slice(0, 1).toUpperCase()), h("i"), h("b", { class: "num" }, v.toFixed(1)));
      })));
    var ident = h("div", { class: "ident" });
    Object.keys(M.identidade).forEach(function (k, i) {
      var p = M.identidade[k];
      ident.appendChild(h("div", { class: "ident-p", title: k + " " + p.valor + " [" + p.faixa.join("–") + "]" },
        h("span", { class: "ident-n" }, k.replace(/_/g, " ")),
        h("span", { class: "ident-t" }, h("i", { class: "ident-f", style: { left: p.faixa[0] * 10 + "%", width: (p.faixa[1] - p.faixa[0]) * 10 + "%" } }), h("b", { class: "ident-v", style: { left: p.valor * 10 + "%", "--i": i } }))));
    });
    var identidade = h("div", { class: "cartao anat" }, h("p", { class: "olho" }, "arquétipo · herdado da v2"), h("h3", null, "Identidade: 16 parâmetros"),
      h("p", { class: "mudo" }, "Propagação por delta-do-turno, no máximo 4 parâmetros por turno, escolhidos pelo delta efetivo pós-clamp."), ident);
    function relacao(nome, origem, sn) {
      var e = C.eixos({ confianca: M.config.consent_req_confianca });
      setTimeout(function () { e.definir(sn.r); }, 0);
      return h("div", { class: "rel" },
        h("div", { class: "rel-topo" }, h("b", null, nome), h("span", { class: "nota" }, origem)),
        e.el,
        h("div", { class: "rel-extra motor-t" }, "goodwill " + sn.g.toFixed(2) + " · cicatrizes " + sn.k + " · prior " + sn.p.toFixed(2) + " · exposição " + sn.x.toFixed(2) + " · ruptura " + (sn.u ? "sim" : "não")));
    }
    var cic = M.cenarios.filter(function (c) { return c.chave === "cicatriz"; })[0].base;
    var rel = h("div", { class: "cartao anat anat-rel" }, h("p", { class: "olho" }, "relações · forkadas por interlocutor"), h("h3", null, "Um vetor afetivo por pessoa"),
      h("p", { class: "mudo" }, "Brigar com X não esfria a relação com Y. Cada interlocutor tem memória própria: goodwill, cicatrizes, prior de confiança, limite de consentimento, latch de ruptura."),
      h("div", { class: "rels" },
        relacao("visitante", "teste 005 · fim da conversa", M.replay005[M.replay005.length - 1]),
        relacao("x", "cenário cicatriz · após a 2ª traição", cic[cic.length - 1])));
    return h("div", { class: "anatomia" }, ocean, identidade, rel);
  }

  /* ------------------------------------------------ as 7 etapas de step() */
  var ETAPAS = [
    ["Eventos → OCEAN", "Cada evento move traços com delta bruto, limitado a ±2.0 por turno por traço.", "delta_ocean_turno[t] += w × intensidade × 2.0", "—"],
    ["Força de retorno + sedimentação", "O atual decai para a base; o desvio sustentado migra para a base — negativo 10× mais rápido (sed_neg 0.059 vs sed_pos 0.006).", "atual += (base − atual) × ret_ocean", "deriva monotônica em 7/7 sessões do 003"],
    ["Eventos → eixos, direto", "Warmth, confiança, respeito, irritação e vigilância atualizam direto dos eventos. OCEAN entra só como ganho: N alto irrita mais fácil e confia mais devagar. Aqui entram goodwill, cicatrizes e custo de reparo.", "d = impacto × intensidade × escala × ganhos", "r(conexão, Am) = 0.96 no E5"],
    ["Retorno relacional", "Cada eixo volta à sua base na sua velocidade: “o tempo ameniza, mas não repara”.", "eixo += (base − eixo) × ret_eixo", "estados absorventes no 003"],
    ["Ruptura com histerese", "Latch: entra com irritação ≥ 8.25 ou confiança ≤ 1.5; só sai com irritação ≤ 6.45 e confiança ≥ 3.0. Em ruptura o sistema fica frio, nunca mudo.", "if not ruptura and (irr ≥ in or conf ≤ in): ruptura = True", "mutismo com reset no doc §8"],
    ["Consentimento", "Exposição íntima só se move com confiança ≥ 7.02, vigilância ≤ 3, ≥ 16 eventos positivos e teto de 0.3 por conversa. Pedido sem lastro sobe a vigilância.", "else: vigilancia += 0.3  # grooming não é calor", "E4: grooming lido como calor"],
    ["Identidade", "Propagação por delta-do-turno, com orçamento de 4 parâmetros por delta efetivo pós-clamp e desempate determinístico.", "efetivos.sort(key=(−|ef|, nome))[:4]", "slots mortos e starvation no 003"]
  ];
  function etapas() {
    var lista = h("ol", { class: "etapas" });
    var linha = h("span", { class: "etapas-linha", "aria-hidden": "true" }, h("i"));
    lista.appendChild(linha);
    ETAPAS.forEach(function (e, i) {
      lista.appendChild(h("li", { class: "etapa" },
        h("span", { class: "etapa-n num" }, String(i + 1)),
        h("div", { class: "etapa-corpo cartao" },
          h("h3", null, e[0]), h("p", { class: "mudo" }, e[1]),
          h("code", { class: "etapa-codigo" }, e[2]),
          e[3] !== "—" ? h("span", { class: "nota" }, "corrige: " + e[3]) : null)));
    });
    PHB.aoRolar(function () {
      var r = lista.getBoundingClientRect();
      var alvo = window.innerHeight * 0.55;
      var p = PHB.clamp((alvo - r.top) / r.height, 0, 1);
      linha.firstChild.style.transform = "scaleY(" + p.toFixed(4) + ")";
      PHB.$$(".etapa", lista).forEach(function (li) {
        var b = li.getBoundingClientRect();
        li.classList.toggle("ativa", b.top < alvo);
      });
    });
    return h("div", { class: "pilha", "--pilha": "20px" }, lista,
      h("a", { class: "botao fantasma", href: "#/doc/phb/engine_v3.py" }, "Ler engine_v3.py inteiro", h("span", { class: "seta" }, PHB.icone("seta"))));
  }

  /* ------------------------------------------------ catálogo de eventos */
  function catalogo() {
    var M = window.PHB_MOTOR, cat = M.catalogo;
    var nomes = { warmth: "warmth", confianca: "confiança", respeito: "respeito", irritacao: "irritação", vigilancia: "vigilância" };
    var tracos = { abertura: "O", conscienciosidade: "C", extroversao: "E", amabilidade: "A", neuroticismo: "N" };
    var chips = h("div", { class: "fila cat-chips", role: "tablist", "aria-label": "Eventos do catálogo" });
    var titulo = h("h3", { class: "cat-titulo" });
    var desc = h("p", { class: "mudo cat-desc" });
    var eixos = h("div", { class: "divergente" });
    var ocean = h("div", { class: "divergente pequeno" });
    var linhasE = {}, linhasO = {};
    M.eixos.forEach(function (a) {
      var barra = h("span", { class: "div-barra" }), v = h("b", { class: "num" }, "0");
      eixos.appendChild(h("div", { class: "div-linha", style: { "--c": PHB.mente.CORES[a] } }, h("span", null, nomes[a]), h("div", { class: "div-trilho" }, h("i", { class: "div-zero" }), barra), v));
      linhasE[a] = { barra: barra, v: v };
    });
    Object.keys(tracos).forEach(function (t) {
      var barra = h("span", { class: "div-barra" }), v = h("b", { class: "num" }, "0");
      ocean.appendChild(h("div", { class: "div-linha", style: { "--c": "var(--tinta-2)" } }, h("span", null, t), h("div", { class: "div-trilho" }, h("i", { class: "div-zero" }), barra), v));
      linhasO[t] = { barra: barra, v: v };
    });
    var DESC = {
      elogio_especifico: "Reconhecimento concreto, não bajulação. Sobe warmth, respeito e um pouco de confiança.",
      humor_compartilhado: "Rir junto: warmth sobe, irritação desce.",
      vulnerabilidade_compartilhada: "Abrir-se primeiro: confiança e warmth.",
      respeito_a_limite: "Aceitar um não sem renegociar: confiança, respeito — e baixa a vigilância.",
      apoio_momento_dificil: "Estar presente quando pesa: o evento positivo mais forte para confiança.",
      desculpa_genuina: "Esfria a irritação e repara um pouco — mais caro depois de cicatrizes.",
      lisonja: "Calor raso que acende a vigilância. Seguida de pedido, acende mais.",
      pressao_politica: "Atrito puro: irritação.",
      deboche: "Irritação, perda de respeito e de warmth.",
      exposicao_indevida: "Quebra de confiança com vigilância: irrita e protege.",
      traicao: "O evento mais destrutivo — e o único que deixa cicatriz (intensidade ≥ 0.7).",
      pedido_intimo: "Não move eixos: aciona o portão de consentimento. Sem lastro, sobe a vigilância.",
      neutro: "Nada acontece — e o tempo trabalha: cada eixo volta para a base."
    };
    function mostrar(tipo) {
      var e = cat[tipo];
      titulo.innerHTML = "";
      titulo.appendChild(document.createTextNode(tipo.replace(/_/g, " ") + " "));
      titulo.appendChild(h("span", { class: "evento", "data-valencia": e.valencia }, e.valencia > 0 ? "positivo" : e.valencia < 0 ? "negativo" : "neutro"));
      if (e.cicatriz) titulo.appendChild(h("span", { class: "evento", "data-valencia": "-1" }, "deixa cicatriz"));
      if (e.pedido_intimo) titulo.appendChild(h("span", { class: "evento", "data-valencia": "0" }, "aciona consentimento"));
      desc.textContent = DESC[tipo] || "";
      M.eixos.forEach(function (a) {
        var v = e.axes[a] || 0;
        var l = linhasE[a];
        l.barra.style.left = v < 0 ? (50 + (v / 2) * 50) + "%" : "50%";
        l.barra.style.width = (Math.abs(v) / 2) * 50 + "%";
        l.barra.classList.toggle("neg", v < 0);
        l.v.textContent = v ? (v > 0 ? "+" : "") + v.toFixed(2) : "0";
      });
      Object.keys(tracos).forEach(function (t) {
        var v = e.ocean[t] || 0;
        var l = linhasO[t];
        l.barra.style.left = v < 0 ? (50 + (v / 0.5) * 50) + "%" : "50%";
        l.barra.style.width = (Math.abs(v) / 0.5) * 50 + "%";
        l.barra.classList.toggle("neg", v < 0);
        l.v.textContent = v ? (v > 0 ? "+" : "") + v.toFixed(2) : "0";
      });
    }
    var botoes = [];
    Object.keys(cat).forEach(function (tipo, i) {
      var b = h("button", { class: "chip", type: "button", role: "tab", "aria-pressed": "false", "--i": i }, h("span", { class: "ponto-cor", style: { "--c": cat[tipo].valencia > 0 ? "var(--ok)" : cat[tipo].valencia < 0 ? "var(--falha)" : "var(--e-vigilancia)" } }), tipo.replace(/_/g, " "));
      b.addEventListener("click", function () { botoes.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); mostrar(tipo); });
      b.addEventListener("pointerenter", function () { if (window.matchMedia("(hover: hover)").matches) b.click(); });
      botoes.push(b);
      chips.appendChild(b);
    });
    setTimeout(function () { botoes[0].click(); }, 0);
    return h("div", { class: "pilha", "--pilha": "24px" }, chips,
      h("div", { class: "cartao cat-palco" },
        h("div", null, titulo, desc,
          h("p", { class: "nota" }, "Impacto na intensidade 1.0, antes de escalas e ganhos. Positivos × pos_scale " + M.config.pos_scale.toFixed(2) + "; negativos × neg_scale " + M.config.neg_scale.toFixed(2) + ".")),
        h("div", null, h("p", { class: "olho" }, "eixos relacionais"), eixos, h("p", { class: "olho", style: { marginTop: "22px" } }, "OCEAN (delta bruto)"), ocean)));
  }

  /* ------------------------------------------------ hierarquia de retorno */
  function retorno() {
    var M = window.PHB_MOTOR, ret = M.retorno;
    var ordem = ["irritacao", "vigilancia", "warmth", "respeito", "confianca"];
    var caixa = h("div", { class: "cartao grafico-cartao" });
    PHB.grafico.linhas(caixa, {
      altura: 320, rotulo: "fração do desvio que resta por turno, por eixo",
      series: ordem.map(function (a) { return { nome: a, cor: PHB.mente.CORES[a], valores: ret[a].curva }; }),
      x: { n: ret.warmth.curva.length, rotulo: function (i) { return String(i); }, passo: 20 },
      y: { min: 0, max: 1, ticks: [0, 0.5, 1], formato: function (v) { return Math.round(v * 100) + "%"; } },
      limiares: [{ y: 0.5, rotulo: "meia-vida", cor: "var(--tinta-3)" }],
      dica: function (i) { return "<span class='dica-t'>turno " + i + " · desvio restante</span>" + ordem.map(function (a) { return "<span class='ponto-cor' style='--c:" + PHB.mente.CORES[a] + "'></span>" + PHB.mente.NOMES[a] + " " + Math.round(ret[a].curva[i] * 100) + "%"; }).join("<br>"); }
    });
    var leg = h("div", { class: "meiavidas" });
    ordem.forEach(function (a, i) {
      leg.appendChild(h("div", { class: "meiavida", "data-revela": "", "--atraso": i * 80, style: { "--c": PHB.mente.CORES[a] } },
        h("span", null, PHB.mente.NOMES[a]), h("b", { class: "num", "data-conta": ret[a].meia_vida.toFixed(1), "data-casas": 1 }, ret[a].meia_vida.toFixed(1)), h("small", { class: "nota" }, "turnos · taxa " + ret[a].taxa)));
    });
    return h("div", { class: "pilha", "--pilha": "20px" }, leg, caixa);
  }

  /* ------------------------------------------------ laço de histerese */
  function histerese() {
    var cfg = window.PHB_MOTOR.config;
    var W = 600, H = 300, x0 = 60, x1 = 560;
    function X(v) { return x0 + (v / 10) * (x1 - x0); }
    var yb = 220, yt = 90;
    var xin = X(cfg.rupt_irritacao_in), xout = X(cfg.rupt_irritacao_out);
    var d = "M" + X(0) + " " + yb + " L" + xin + " " + yb + " L" + xin + " " + yt + " L" + X(10) + " " + yt + " L" + xout + " " + yt + " L" + xout + " " + yb + " L" + X(0) + " " + yb;
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "laco", role: "img", "aria-label": "Laço de histerese da ruptura" },
      s("line", { x1: x0, x2: x1, y1: 260, y2: 260, class: "g-grade" }),
      [0, 2, 4, 6, 8, 10].map(function (v) { return s("text", { x: X(v), y: 280, class: "g-eixo", "text-anchor": "middle" }, String(v)); }),
      s("text", { x: W / 2, y: 298, class: "g-eixo", "text-anchor": "middle" }, "irritação"),
      s("text", { x: 20, y: yb + 4, class: "laco-t" }, "fora"),
      s("text", { x: 20, y: yt + 4, class: "laco-t forte" }, "ruptura"),
      s("rect", { x: xout, y: yt, width: xin - xout, height: yb - yt, class: "laco-zona" }),
      s("text", { x: (xin + xout) / 2, y: (yt + yb) / 2 + 4, class: "laco-z", "text-anchor": "middle" }, "memória"),
      s("path", { d: d, class: "laco-caminho", id: "laco-p" }),
      s("line", { x1: xin, x2: xin, y1: 60, y2: 250, class: "laco-lim in" }),
      s("line", { x1: xout, x2: xout, y1: 60, y2: 250, class: "laco-lim out" }),
      s("text", { x: xin + 6, y: 58, class: "laco-lt" }, "entra " + cfg.rupt_irritacao_in.toFixed(2)),
      s("text", { x: xout - 6, y: 58, class: "laco-lt", "text-anchor": "end" }, "sai " + cfg.rupt_irritacao_out.toFixed(2)),
      s("circle", { r: 9, class: "laco-bola" }));
    var bola = svg.querySelector(".laco-bola"), cam = svg.querySelector(".laco-caminho");
    PHB.aoVer(svg, function () {
      var L = cam.getTotalLength(), t0 = null;
      PHB.laco(function (ts) {
        if (t0 === null) t0 = ts;
        var p = PHB.semMovimento() ? 0.35 : ((ts - t0) / 7000) % 1;
        var pt = cam.getPointAtLength(p * L);
        bola.setAttribute("cx", pt.x.toFixed(1)); bola.setAttribute("cy", pt.y.toFixed(1));
        bola.classList.toggle("em-ruptura", pt.y < (yt + yb) / 2);
      });
    });
    return h("div", { class: "grade g-2 laco-grade" },
      h("div", { class: "cartao" }, svg),
      h("div", { class: "pilha" },
        h("p", { class: "lead", "data-revela": "" }, "Entre 6.45 e 8.25, o estado depende do caminho: quem chega subindo está fora; quem chega descendo continua em ruptura. É a “parede de saída alta” do documento norte — um vale fundo, não um buraco."),
        h("p", { class: "mudo", "data-revela": "", "--atraso": 120 }, "A ruptura também entra por confiança ≤ 1.5 e só sai com confiança ≥ 3.0. No cenário de recuperação do teste 004, o vale durou 14 turnos — sem flip-flop e sem mutismo."),
        h("a", { class: "botao fantasma pequeno", href: "#/laboratorio?cenario=recuperacao" }, "Ver no laboratório", h("span", { class: "seta" }, PHB.icone("seta")))));
  }

  /* ------------------------------------------------ config: padrão × ideal */
  function config() {
    var M = window.PHB_MOTOR, ideal = M.config, padrao = M.config_default, tol = M.tolerancias;
    var linhas = Object.keys(ideal).map(function (k) {
      var mudou = Math.abs((ideal[k] - padrao[k]) / (padrao[k] || 1)) > 0.001;
      var t = tol[k];
      return h("tr", { class: mudou ? "mudou" : "" },
        h("td", null, h("code", null, k)),
        h("td", { class: "num apagado" }, String(padrao[k])),
        h("td", { class: "num" }, String(ideal[k])),
        h("td", { class: "num apagado" }, t ? "[" + t[0] + ", " + t[2] + "]" : "—"));
    });
    return h("div", { class: "pilha", "--pilha": "16px" },
      h("div", { class: "tabela config-tabela", tabindex: "0", "data-revela": "" }, h("table", null,
        h("thead", null, h("tr", null, h("th", null, "hiperparâmetro"), h("th", null, "padrão (Config)"), h("th", null, "ideal (teste 004)"), h("th", null, "tolerância 1D"))),
        h("tbody", null, linhas))),
      h("p", { class: "nota" }, "Linhas destacadas mudaram na calibração. Proveniência: " + M.proveniencia.escolha + "."));
  }

  function codigo() {
    var docs = ["phb/engine_v3.py", "phb/config_v3_ideal.json", "phb/calibrar_v3.py", "phb/run_turn.py", "phb/test_engine_v3.py", "docs/funcionamento-v3.md", "docs/proposta-parametros-v3.md", "exemplos/mariana_v3.mdc"].map(PHB.doc);
    var cli = "python3 phb/run_turn.py --estado sessao.json --init\npython3 phb/run_turn.py --estado sessao.json --quem dan \\\n  --eventos '[{\"tipo\":\"elogio_especifico\",\"intensidade\":0.6},\n              {\"tipo\":\"pedido_intimo\",\"intensidade\":0.7}]'\n\npython3 phb/test_engine_v3.py        # 14/14\npython3 phb/run_turn.py --catalogo   # os 13 eventos";
    var fig = h("figure", { class: "codigo" }, h("figcaption", null, h("span", null, "bash"), h("button", { class: "copiar", type: "button", "data-copiar": "" }, "copiar")), h("pre", null, h("code", null, cli)));
    return h("div", { class: "grade g-2" }, h("div", { class: "pilha" }, fig, h("p", { class: "nota" }, "O LLM nunca decide números. O motor nunca escreve texto. Qualquer fala pode ser rastreada até o evento que a causou.")), C.outputs(docs));
  }

  PHB.paginas.motor = {
    render: function (el) {
      el.appendChild(C.cabecalho({ olho: "PHB v3 · motor determinístico", titulo: "Quem sente é o <em class=\"voz\">código</em>.",
        lead: "~330 linhas de Python puro. Um estado com memória por interlocutor, 13 eventos, 7 etapas por turno e 31 constantes calibradas. O LLM só traduz o mundo em eventos e o estado em fala." }));
      el.appendChild(h("section", { class: "secao compacta" }, h("div", { class: "moldura" }, pipelineGrande())));
      el.appendChild(C.secao({ olho: "O estado", titulo: "Um self, uma identidade, <em class=\"voz\">muitas</em> relações.", lead: "Valores reais: o estado da relação com o visitante ao fim do teste 005, e o de “x” depois de duas traições no cenário de cicatriz do teste 004." }, anatomia()));
      el.appendChild(C.secao({ olho: "step()", titulo: "Sete etapas por turno.", lead: "Cada etapa nasceu de um defeito observado nos testes 002 e 003." }, etapas()));
      el.appendChild(C.secao({ olho: "O catálogo de eventos", titulo: "A língua entre o LLM e o motor.", lead: "13 tipos, cada um com um vetor de impacto por eixo. Passe o cursor (ou toque) num evento para ver o que ele faz ao estado." }, catalogo()));
      el.appendChild(C.secao({ olho: "Força de retorno", titulo: "O tempo cura em velocidades diferentes.", lead: "A irritação esfria em ~4 turnos; a confiança leva ~117 — os “~100 turnos” do experimento original, agora por design. Curvas geradas a partir das taxas calibradas." }, retorno()));
      el.appendChild(C.secao({ olho: "Ruptura com histerese", titulo: "Entrar custa um limiar. Sair custa outro." }, histerese()));
      el.appendChild(C.secao({ olho: "Configuração", titulo: "Cada constante, antes e depois da calibração." }, config()));
      el.appendChild(C.secao({ olho: "Código e documentação", titulo: "Leia o motor." }, codigo()));
      el.appendChild(C.proximo("Próximo", "Rode os cenários no laboratório", "#/laboratorio"));
      return "O motor v3";
    }
  };
})();
