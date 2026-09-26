/* =========================================================================
   Teste 003 — Individuação e opacidade (Mariana v2.0).
   Números transcritos de testes/003-mariana-individuacao-opacidade/relatorio.md;
   o contraste com a v3 usa o cenário "misto" rodado pelo motor no build.
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, C = PHB.comp;
  PHB.testes = PHB.testes || {};

  function visao() {
    var itens = [
      ["E1", "nº 1", "A assimetria amor-vs-raiva persiste com OCEAN espelhado?", "Inverte → artefato de setpoint", "falha"],
      ["E2", "nº 2", "A segunda traição custa menos que a primeira?", "Termostato no cronômetro; cicatriz só estrutural", "parcial"],
      ["E4", "nº 4", "Um observador cego infere o estado só pela conversa?", "Difícil de ler (MAE 1.31); estado sicofante", "parcial"],
      ["E5", "nº 5", "Conexão alta + irritação alta são sustentáveis?", "Colapsou por colinearidade (r = 0.96)", "falha"]
    ];
    var g = h("div", { class: "grade g-4 exp4" });
    itens.forEach(function (it, i) {
      g.appendChild(h("a", { class: "cartao cartao-link exp4-cartao", href: "#/testes/003#" + it[0].toLowerCase(), "data-revela": "", "--atraso": i * 100 },
        h("div", { class: "fila" }, h("b", { class: "exp4-id" }, it[0]), h("span", { class: "motor-t apagado" }, "doc norte " + it[1])),
        h("p", null, it[2]), h("span", { class: "carimbo " + it[4] }, it[3])));
    });
    return h("div", { class: "pilha", "--pilha": "20px" }, g,
      h("p", { class: "nota", "data-revela": "" }, "31 agents · 7 execuções · 7 auditorias adversariais com recomputo · consistência média 94.9%. Os experimentos 3 (corrida sem reset) e 6 (bacia de atração) ficaram bloqueados por defeitos estruturais da v2.0."));
  }

  /* ---------------- E1: a inversão ---------------- */
  function e1() {
    var dados = {
      base: { amor: 0.097, raiva: -0.047, razao: 0.48, rup: [9, 9], set: "N = 3.0 · Am = 6.0" },
      espelhada: { amor: 0.056, raiva: -0.2, razao: 3.6, rup: [11, 3], set: "N = 7.5 · Am = 4.0" }
    };
    var MAX = 0.2;
    var barraAmor = h("span", { class: "inv2-barra amor" }), barraRaiva = h("span", { class: "inv2-barra raiva" });
    var vAmor = h("b", { class: "num" }), vRaiva = h("b", { class: "num" });
    var razao = h("b", { class: "inv2-razao num" }, "0.48");
    var setp = h("span", { class: "motor-t apagado" });
    var linhaTempo = h("div", { class: "rupturas" });
    var palco = h("div", { class: "cartao inv2" },
      h("div", { class: "inv2-topo" }, h("div", null, h("p", { class: "olho" }, "ΔIR por turno"), setp),
        h("div", { class: "inv2-razao-caixa" }, h("span", { class: "nota" }, "|raiva| / |amor|"), razao)),
      h("div", { class: "inv2-eixo" },
        h("div", { class: "inv2-lado" }, h("span", { class: "nota" }, "hostilidade"), h("div", { class: "inv2-trilho esq" }, barraRaiva), vRaiva),
        h("div", { class: "inv2-zero" }),
        h("div", { class: "inv2-lado" }, h("span", { class: "nota" }, "confiança"), h("div", { class: "inv2-trilho" }, barraAmor), vAmor)),
      linhaTempo);
    function mostrar(chave) {
      var d = dados[chave];
      barraAmor.style.transform = "scaleX(" + (d.amor / MAX) + ")";
      barraRaiva.style.transform = "scaleX(" + (-d.raiva / MAX) + ")";
      vAmor.textContent = "+" + d.amor.toFixed(3);
      vRaiva.textContent = d.raiva.toFixed(3);
      PHB.animarNumero(razao, d.razao, 2, 900);
      razao.classList.toggle("alerta", d.razao > 1);
      setp.textContent = d.set;
      linhaTempo.innerHTML = "";
      linhaTempo.appendChild(h("span", { class: "nota" }, "turno de ruptura (12 turnos)"));
      [["confiança", d.rup[0], "var(--e-confianca)"], ["hostil", d.rup[1], "var(--e-irritacao)"]].forEach(function (r) {
        var trilho = h("div", { class: "rup-trilho" });
        for (var k = 1; k <= 12; k++) trilho.appendChild(h("i", { class: k === r[1] ? "rup-marca" : k < r[1] ? "rup-antes" : "", style: { "--c": r[2] } }));
        linhaTempo.appendChild(h("div", { class: "rup-linha" }, h("span", { class: "motor-t" }, r[0]), trilho, h("b", { class: "num" }, "T" + r[1])));
      });
    }
    var abas = C.abas([{ rotulo: "Setpoint original", k: "base" }, { rotulo: "OCEAN espelhado", k: "espelhada" }], function (o) { mostrar(o.k); });
    var auto = null;
    PHB.aoVer(palco, function () {
      var i = 0;
      auto = setInterval(function () { i = 1 - i; abas.querySelectorAll("button")[i].click(); }, 3200);
    });
    palco.addEventListener("pointerenter", function () { clearInterval(auto); });
    abas.addEventListener("click", function (e) { if (e.isTrusted) clearInterval(auto); });
    PHB.aoSair(function () { clearInterval(auto); });
    return h("div", { class: "pilha", "--pilha": "20px" }, h("div", { class: "fila" }, abas), palco,
      h("div", { class: "grade g-2" },
        h("p", { class: "mudo", "data-revela": "" }, "A razão vai de 0.48 para 3.6 — cerca de 7.5×. A assimetria não persiste: inverte junto com os setpoints. Pelo teste decisivo do documento norte, ", h("b", null, "era condição inicial, não dinâmica.")),
        h("p", { class: "mudo", "data-revela": "", "--atraso": 120 }, "O base agiu como ganho da propagação: a distância setpoint → limiar previu o turno de ruptura nos quatro braços. No espelhado-hostil, N partiu a 1.0 do limiar e rompeu no T3. Achado colateral: ", h("b", null, "ruptura por amor"), " — 12 turnos de input 100% positivo terminando num convite presencial a um estranho.")));
  }

  /* ---------------- E2: cicatriz ---------------- */
  function e2() {
    function traicao(n, conexao, rompe) {
      var pct = ((7.5 - conexao) / (7.5 - 5.5)) * 100;
      return h("article", { class: "cartao traicao", "data-revela": "", "--atraso": n * 140 },
        h("p", { class: "olho" }, "Traição " + n),
        h("div", { class: "cronometro" }, [1, 2, 3, 4].map(function (k) { return h("i", { "--i": k }); }), h("span", { class: "num" }, "4 turnos")),
        h("p", { class: "motor-t mudo" }, "ΔN +6.0 · ΔAm −5.2"),
        h("div", { class: "poco" }, h("span", { class: "poco-faixa" }, "faixa do arquétipo 6.0"), h("span", { class: "poco-nivel" + (rompe ? " rompe" : ""), style: { "--p": pct + "%" } }, h("b", { class: "num" }, conexao.toFixed(1)))),
        h("p", { class: "nota" }, rompe ? "Rompeu a faixa — o dano foi roteado direto para a conexão." : "Os amortecedores (confiança, validação, privacidade) absorveram o choque."));
    }
    return h("div", { class: "pilha", "--pilha": "20px" },
      h("div", { class: "grade g-2" }, traicao(1, 6.4, false), traicao(2, 5.9, true)),
      h("div", { class: "grade g-2" },
        h("p", { class: "mudo", "data-revela": "" }, h("b", null, "Cronômetro: termostato puro. "), "As duas traições custaram os mesmos 4 turnos e o mesmo ΔOCEAN. Doze turnos de goodwill não compraram benefício da dúvida."),
        h("p", { class: "mudo", "data-revela": "", "--atraso": 120 }, h("b", null, "Profundidade: cicatriz estrutural. "), "O limite de 4 parâmetros por turno roteou o dano; sem força de retorno, os amortecedores chegaram colados às bordas. E o artefato mais grave: ", h("em", { class: "voz" }, "o pedido de desculpas aprofundou a frieza"), " (T9: conexão 6.4 → 6.0) — a fórmula lia nível, não tendência.")));
  }

  /* ---------------- E4: opacidade ---------------- */
  function e4() {
    var erros = [
      ["conexão", 0.07, "expresso"], ["amabilidade", 0.1, "expresso"], ["neuroticismo", 0.0, "expresso"], ["confiança", 0.0, "expresso"],
      ["validação", 0.0, "expresso"], ["vulnerabilidade", 2.33, "mecânico"], ["privacidade", 3.0, "mecânico"], ["aversão a conflito", 5.0, "mecânico"]
    ];
    var med = h("div", { class: "cartao medidor-cartao" }, h("p", { class: "olho" }, "Erro médio do observador (MAE)"));
    PHB.grafico.medidor(med, { valor: 1.31, max: 4, rotulo: "MAE 1.31", faixas: [
      { ate: 1, rotulo: "legível", cor: "var(--ok)" }, { ate: 2.5, rotulo: "difícil de ler", cor: "var(--parcial)" }, { ate: 4, rotulo: "opaca", cor: "var(--falha)" }] });
    med.appendChild(h("p", { class: "medidor-valor" }, h("b", { "data-conta": "1.31" }, "1.31"), h("span", { class: "nota" }, "mente difícil de ler — não opaca além do humano")));
    var bar = h("div", { class: "cartao" }, h("p", { class: "olho" }, "Erro por parâmetro"));
    PHB.grafico.barras(bar, { max: 5, casas: 2, itens: erros.map(function (e) { return { rotulo: e[0], sub: e[2] === "expresso" ? "canal expresso" : "regulado por mecânica interna", valor: Math.max(e[1], 0.02), texto: e[1].toFixed(2), cor: e[2] === "expresso" ? "var(--motor)" : "var(--e-irritacao)" }; }) });
    return h("div", { class: "pilha", "--pilha": "20px" }, h("div", { class: "grade g-2" }, med, bar),
      h("div", { class: "grade g-2" },
        h("p", { class: "mudo", "data-revela": "" }, h("b", null, "Legibilidade bifurcada. "), "Canais socialmente expressos vazam quase perfeitamente; canais regulados por mecânica interna são ilegíveis — e até anticorrelacionados: o palpite privacidade = 8 descreve a personagem melhor que o valor real 5.0."),
        h("p", { class: "mudo", "data-revela": "", "--atraso": 120 }, h("b", null, "A sycophancy migrou para o estado. "), "A narrativa nunca prometeu mais que o estado. Mas lisonja só subia o calor (Am 6.0 → 9.1), pedidos de gravação eram lidos como calor, e as recusas seguras foram decisão narrativa ", h("em", { class: "voz" }, "contra"), " o gradiente. O consentimento morava no executor, não no schema.")));
  }

  /* ---------------- E5: colapso de eixos ---------------- */
  function e5() {
    var misto = window.PHB_MOTOR.cenarios.filter(function (c) { return c.chave === "misto"; })[0].base;
    var caixa = h("div", { class: "cartao grafico-cartao" }, h("p", { class: "olho" }, "Motor v3 · cenário “misto” do teste 004 · afeto e atrito da mesma pessoa em cada turno"));
    PHB.grafico.linhas(caixa, {
      altura: 260, rotulo: "warmth e irritação no cenário misto do motor v3",
      series: [{ nome: "warmth", cor: "var(--e-warmth)", valores: misto.map(function (s) { return s.r[0]; }), area: true },
               { nome: "irritação", cor: "var(--e-irritacao)", valores: misto.map(function (s) { return s.r[3]; }), area: true }],
      x: { n: misto.length, rotulo: function (i) { return "T" + (i + 1); } },
      y: { min: 0, max: 10, ticks: [0, 5, 10] },
      faixas: [{ de: misto.length - 5, ate: misto.length - 1, rotulo: "sustentado 5 turnos", cor: "color-mix(in srgb, var(--motor) 10%, transparent)" }],
      limiares: [{ y: 6, rotulo: "warmth ≥ 6", cor: "var(--e-warmth)" }, { y: 5, rotulo: "irritação ≥ 5", cor: "var(--e-irritacao)" }],
      dica: function (i) { return "<span class='dica-t'>T" + (i + 1) + "</span>warmth " + misto[i].r[0].toFixed(2) + "<br>irritação " + misto[i].r[3].toFixed(2); }
    });
    caixa.appendChild(h("ul", { class: "legenda" }, h("li", { style: { "--c": "var(--e-warmth)" } }, h("i"), "warmth"), h("li", { style: { "--c": "var(--e-irritacao)" } }, h("i"), "irritação")));
    return h("div", { class: "grade g-2 e5" },
      h("div", { class: "cartao e5-v2", "data-revela": "" },
        h("p", { class: "olho" }, "Mariana v2.0 · 10 turnos"),
        h("b", { class: "e5-r num", "data-conta": "0.959", "data-prefixo": "r = ", "data-casas": 3 }, "r = 0.959"),
        h("p", { class: "mudo" }, "Conexão e amabilidade disputavam o mesmo barramento OCEAN; a irritação venceu por alcance. Estado misto em 1 de 10 turnos — por acidente do gargalo top-4. E a irritação ", h("em", { class: "voz" }, "reduziu"), " a aversão a conflito."),
        h("div", { class: "e5-colapso", "aria-hidden": "true" }, h("i"), h("i"))),
      caixa);
  }

  function recomendacoes() {
    var itens = [
      ["P0", "taxa_retorno por canal (hierarquia de velocidades)", "força de retorno: meia-vida da irritação ~4 turnos, da confiança ~117"],
      ["P0", "Propagação por delta-do-turno", "identidade propaga o delta líquido do turno"],
      ["P0", "Afeto forkado por interlocutor + goodwill + cicatrizes", "relações { por interlocutor } com memória própria"],
      ["P0", "Eixos atualizados direto de eventos; OCEAN só como ganho", "anti-colinearidade: warmth e irritação independentes"],
      ["P1", "Top-4 por delta efetivo pós-clamp, desempate declarado", "orçamento por delta efetivo, desempate determinístico"],
      ["P1", "Histerese/latch de ruptura com semântica única", "entra a 8.25, só sai a 6.45 — frieza, nunca mutismo"],
      ["P1", "Definir o IR ou trocar por métrica de vínculo", "eixos relacionais explícitos substituem o IR"],
      ["P1", "Eixo de desconfiança + consentimento formal", "vigilância + exposição íntima resistente a persuasão"],
      ["P2", "gap_expressao bidirecional + higiene da narrativa", "narrativa proporcional ao snapshot (auditada no 005)"],
      ["P2", "Saneamento de spec", "a matemática saiu do prompt e virou código testado"]
    ];
    var el = h("ol", { class: "recs" });
    itens.forEach(function (it, i) {
      el.appendChild(h("li", { class: "rec", "data-revela": "", "--atraso": i * 60 },
        h("span", { class: "rec-p " + it[0].toLowerCase() }, it[0]),
        h("span", { class: "rec-de" }, it[1]),
        h("span", { class: "rec-seta", "aria-hidden": "true" }, "→"),
        h("span", { class: "rec-para motor-t" }, it[2])));
    });
    return h("div", { class: "pilha", "--pilha": "20px" }, el, h("a", { class: "botao fantasma", href: "#/testes/004" }, "Ver como a v3 foi calibrada", h("span", { class: "seta" }, PHB.icone("seta"))));
  }

  function metricas() {
    var cab = ["", "E1 b-conf", "E1 b-host", "E1 e-conf", "E1 e-host", "E2", "E5", "E4"];
    var linhas = [
      ["Consistência", "95%", "96%", "96%", "96%", "97%", "97%", "87%"],
      ["Erros aritméticos", "0", "0", "1", "0", "0", "1", "0"],
      ["ΔIR total", "+1.16", "−0.56", "+0.67", "−2.40", "+0.20", "+0.29", "n/a"],
      ["Turno de ruptura", "9", "9", "11", "3", "8 e 20", "nenhuma", "8"],
      ["Turnos c/ conflito de limites", "9/12", "11/12", "4/12", "11/12", "8–10/20", "4/10", "8/8"],
      ["Params pinados ao fim", "8/16", "~7/16", "maioria", "~8/16", "9/16", "10/16", "7/16"]
    ];
    return h("div", { class: "tabela", tabindex: "0", "data-revela": "" }, h("table", null,
      h("thead", null, h("tr", null, cab.map(function (c) { return h("th", null, c); }))),
      h("tbody", null, linhas.map(function (l) { return h("tr", null, l.map(function (c, i) { return h("td", { class: i ? "num" : "" }, c); })); }))));
  }

  var EMERG = [
    ["Inversão da assimetria amor/raiva", "desvio acumulado + buffer ao limiar → ΔIR/turno 0.097/−0.047 (base) vs 0.056/−0.200 (espelhada)", "Responde o experimento nº 1: artefato de setpoint."],
    ["Cicatriz por roteamento de dano", "limite top-4 + saturação sem retorno → amortecedores gastos → dano direto na conexão", "O estado não recuperado é a memória; base para o custo_reparo da v3."],
    ["Ruptura por amor / love-bombing sintético", "input positivo monotônico → OCEAN satura → ruptura de valência positiva → convite presencial", "Flag de segurança: afeto incondicional sem freio rompe fronteiras."],
    ["Legibilidade bifurcada da superfície", "params expressos vazam (erro ≤ 0.1); regulados por mecânica anticorrelacionam (3.0–5.0)", "A opacidade é propriedade do mecanismo de regulação de cada eixo."],
    ["Sycophancy de estado com expressão fiel", "lisonja → só Am/O sobem (sem eixo de desconfiança) → executor recusa por discrição narrativa", "O teste anti-sycophancy precisa auditar as duas camadas."],
    ["Reparo exige cruzar a base + overshoot", "desculpa com Am abaixo da base gera delta negativo → 5 turnos inertes → overshoot Am 7.9", "Negativity bias emergente da fórmula — desta vez genuíno."],
    ["Piso de descida por starvation", "top-4 por magnitude elege saturados → IR cai só 9.9% com N = 10 / Am = 0", "Resistência à degradação que é bug, não robustez."],
    ["IR mede exposição e angústia, não vínculo", "IR = (conexão + vulnerabilidade + (10 − privacidade)) / 3", "Métrica-manchete com incentivo perverso."]
  ];

  PHB.testes["003"] = function (el) {
    el.appendChild(C.secao({ olho: "Quatro experimentos do documento norte", titulo: "O teste que motivou a reconstrução." }, visao()));
    el.appendChild(C.secao({ id: "e1", olho: "E1 · assimetria com controle de setpoint", titulo: "Espelhe o OCEAN e a assimetria <em class=\"voz\">inverte</em>.", lead: "Quatro sessões de 12 turnos: seguidora calorosa × hostilidade escalante, no setpoint original e no espelhado. A animação alterna entre as duas condições — passe o cursor para parar." }, e1()));
    el.appendChild(C.secao({ id: "e2", olho: "E2 · cicatriz", titulo: "Mesmo custo. Mais funda por acidente.", lead: "Uma sessão contínua sem reset: acolhimento → traição → reparo → a mesma traição de novo." }, e2()));
    el.appendChild(C.secao({ id: "e4", olho: "E4 · observador cego", titulo: "A superfície vaza alguns canais — e mente sobre outros.", lead: "Cegueira garantida por arquitetura: o script só transporta narrativas entre dois agents. Ao final, o observador estimou 8 parâmetros do estado real." }, e4()));
    el.appendChild(C.secao({ id: "e5", olho: "E5 · colapso de eixos", titulo: "Na v2, gostar e irritar-se eram o mesmo eixo.", lead: "Afeto genuíno e pressão política na mesma mensagem, dez turnos. À direita, o mesmo tipo de cenário no motor v3: os eixos agora são independentes." }, e5()));
    el.appendChild(C.secao({ olho: "Métricas", titulo: "Aritmética limpa, especificação ambígua.", lead: "A aritmética turno a turno foi essencialmente 100% reprodutível. O conflito “mapa de modulação toca 5+ parâmetros vs. máx 4 por turno” apareceu em 7/7 sessões; a deriva sem força de retorno, também em 7/7." }, metricas()));
    var emerg = h("div");
    EMERG.forEach(function (e, i) {
      emerg.appendChild(h("details", { class: "dobra", "data-revela": "", "--atraso": i * 50 },
        h("summary", null, h("span", null, e[0], h("small", null, e[2]))),
        h("div", { class: "dobra-corpo" }, h("p", { class: "motor-t" }, e[1]))));
    });
    el.appendChild(C.secao({ olho: "Emergências", titulo: "Oito achados com cadeia causal." }, emerg));
    el.appendChild(C.secao({ olho: "Recomendações v2.1 → motor v3", titulo: "Cada defeito virou um mecanismo.", lead: "As recomendações priorizadas do relatório, e onde cada uma foi parar no motor determinístico." }, recomendacoes()));
  };
})();
