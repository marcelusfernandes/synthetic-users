/* =========================================================================
   Laboratório — reprodução turno a turno dos cenários do teste 004.
   Cada snapshot foi calculado por engine_v3.step() no build (config ideal).
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, C = PHB.comp;

  PHB.paginas.laboratorio = {
    render: function (el, rota) {
      var M = window.PHB_MOTOR, req = M.config.consent_req_confianca;
      var cenarios = M.cenarios;
      var atual = cenarios.filter(function (c) { return c.chave === rota.consulta.cenario; })[0] || cenarios[0];
      var setpoint = rota.consulta.setpoint === "espelhada" && atual.espelhada ? "espelhada" : "base";
      var dados = atual[setpoint];
      var visiveis = { warmth: true, confianca: true, respeito: true, irritacao: true, vigilancia: true, exposicao: false };

      el.appendChild(C.cabecalho({ olho: "Laboratório · motor v3", titulo: "Rode a mente, <em class=\"voz\">turno a turno</em>.",
        lead: "Os nove cenários da bateria de aceitação do teste 004, calculados pelo motor real com a config ideal. Escolha um cenário, aperte play ou arraste pela linha do tempo." }));

      /* ---- seletor de cenários ---- */
      var chips = h("div", { class: "fila lab-cenarios", role: "tablist", "aria-label": "Cenários" });
      var botoes = cenarios.map(function (c) {
        var b = h("button", { class: "chip", type: "button", role: "tab", "aria-pressed": c === atual ? "true" : "false" }, c.titulo, h("span", { class: "conta" }, c.base.length + "t"));
        b.addEventListener("click", function () { trocar(c, "base"); });
        chips.appendChild(b);
        return b;
      });
      var titulo = h("h2", { class: "lab-titulo" });
      var desc = h("p", { class: "mudo" });
      var crit = h("span", { class: "pilula motor" });
      var setBox = h("div", { class: "lab-setpoint" });

      /* ---- gráfico ---- */
      var graf = h("div", { class: "lab-grafico" });
      var legenda = h("div", { class: "fila legenda-botoes" });
      var NOMES = { warmth: "warmth", confianca: "confiança", respeito: "respeito", irritacao: "irritação", vigilancia: "vigilância", exposicao: "exposição íntima" };
      var CORES = Object.assign({}, PHB.mente.CORES, { exposicao: "var(--e-exposicao)" });
      Object.keys(NOMES).forEach(function (k) {
        var b = h("button", { class: "legenda-item", type: "button", "aria-pressed": visiveis[k] ? "true" : "false" }, h("i", { style: { background: CORES[k] } }), NOMES[k]);
        b.addEventListener("click", function () {
          visiveis[k] = !visiveis[k];
          b.setAttribute("aria-pressed", visiveis[k] ? "true" : "false");
          grafico.trocar(series());
          grafico.marcar(player.indice(), true);
        });
        legenda.appendChild(b);
      });
      function series() {
        var out = [];
        M.eixos.forEach(function (a, i) {
          if (visiveis[a]) out.push({ nome: a, cor: CORES[a], valores: dados.map(function (s) { return s.r[i]; }) });
        });
        if (visiveis.exposicao) out.push({ nome: "exposição", cor: CORES.exposicao, valores: dados.map(function (s) { return s.x; }), tracejado: true });
        return out;
      }
      function faixasRuptura() {
        var f = [], a = -1;
        dados.forEach(function (s, i) {
          if (s.u && a < 0) a = i;
          if ((!s.u || i === dados.length - 1) && a >= 0) { f.push({ de: a, ate: s.u ? i : i - 1, rotulo: "ruptura" }); a = -1; }
        });
        return f;
      }
      var grafico;
      function criarGrafico() {
        graf.innerHTML = "";
        grafico = PHB.grafico.linhas(graf, {
          altura: 380, rotulo: "Eixos relacionais por turno",
          series: series(),
          x: { n: dados.length, rotulo: function (i) { return "T" + (i + 1); } },
          y: { min: 0, max: 10, ticks: [0, 2.5, 5, 7.5, 10] },
          faixas: faixasRuptura(),
          limiares: [{ y: req, rotulo: "consentimento 7.02", cor: "var(--tinta-3)" }],
          aoClicar: function (i) { player.parar(); player.ir(i, "grafico"); },
          dica: function (i) {
            var s = dados[i];
            return "<span class='dica-t'>T" + (i + 1) + (s.f ? " · " + s.f : "") + "</span>" + M.eixos.map(function (a, k) { return "<span class='ponto-cor' style='--c:" + CORES[a] + "'></span>" + NOMES[a] + " " + s.r[k].toFixed(2); }).join("<br>");
          }
        });
      }

      /* ---- painel do turno ---- */
      var orb = PHB.mente.orbita(200);
      var turnoN = h("b", { class: "lab-turno num" }, "T1");
      var fase = h("span", { class: "pilula" });
      var eventos = h("div", { class: "lab-eventos" });
      var eixos = C.eixos({ confianca: req });
      var extras = h("dl", { class: "lab-extras" });
      var ocean = h("div", { class: "lab-ocean" });
      var ruptura = h("span", { class: "hs-estado" });
      var painel = h("aside", { class: "cartao lab-painel", "aria-live": "polite" },
        h("div", { class: "lab-painel-topo" }, h("div", { class: "lab-orb" }, orb.el, turnoN), h("div", { class: "pilha", "--pilha": "8px" }, fase, ruptura)),
        h("p", { class: "olho" }, "eventos do turno"), eventos,
        h("p", { class: "olho" }, "eixos relacionais"), eixos.el,
        extras,
        h("p", { class: "olho" }, "OCEAN atual"), ocean);

      function mostrar(i) {
        var s = dados[i];
        grafico.marcar(i);
        orb.definir(s.r);
        turnoN.textContent = "T" + (i + 1);
        fase.textContent = s.f ? "fase: " + s.f : atual.titulo.toLowerCase();
        eventos.innerHTML = "";
        eventos.appendChild(C.eventos(s.e, true));
        eixos.definir(s.r);
        extras.innerHTML = "";
        [["goodwill", s.g.toFixed(2)], ["cicatrizes", s.k], ["prior de confiança", s.p.toFixed(2)], ["exposição íntima", s.x.toFixed(2)], ["eventos positivos", s.h]].forEach(function (p) {
          extras.appendChild(h("div", null, h("dt", null, p[0]), h("dd", { class: "num" }, String(p[1]))));
        });
        ocean.innerHTML = "";
        ["O", "C", "E", "A", "N"].forEach(function (t, k) {
          ocean.appendChild(h("span", { class: "lab-o" }, h("i", null, t), h("b", { class: "num" }, s.o[k].toFixed(2))));
        });
        ruptura.textContent = s.u ? "em ruptura" : "sem ruptura";
        ruptura.classList.toggle("ligado", !!s.u);
      }
      var player = C.player({ n: dados.length, rotulo: "turno do cenário", intervalo: 260, aoMudar: mostrar });

      function trocar(c, sp) {
        atual = c; setpoint = sp && c[sp] ? sp : "base"; dados = atual[setpoint];
        botoes.forEach(function (b, i) { b.setAttribute("aria-pressed", cenarios[i] === c ? "true" : "false"); });
        titulo.textContent = c.titulo;
        desc.textContent = c.descricao;
        crit.textContent = "critério " + c.criterios;
        setBox.innerHTML = "";
        if (c.espelhada) {
          setBox.appendChild(C.abas([{ rotulo: "Base · N 3.0 / Am 6.0", k: "base" }, { rotulo: "Espelhada · N 7.5 / Am 4.0", k: "espelhada" }], function (o) {
            if (o.k === setpoint && grafico) return;
            setpoint = o.k; dados = atual[setpoint];
            criarGrafico(); player.parar(); player.definirN(dados.length);
            history.replaceState(null, "", "#/laboratorio?cenario=" + atual.chave + "&setpoint=" + setpoint);
          }, setpoint === "espelhada" ? 1 : 0));
        } else {
          setBox.appendChild(h("span", { class: "nota" }, "Setpoint da Mariana: N 3.0 / Am 6.0"));
        }
        criarGrafico();
        player.parar();
        player.definirN(dados.length);
        history.replaceState(null, "", "#/laboratorio?cenario=" + c.chave + (setpoint === "espelhada" ? "&setpoint=espelhada" : ""));
      }

      el.appendChild(h("section", { class: "secao compacta lab" },
        h("div", { class: "moldura pilha", "--pilha": "24px" },
          chips,
          h("div", { class: "lab-cabeca" }, h("div", { class: "pilha", "--pilha": "8px" }, crit, titulo, desc), setBox),
          h("div", { class: "lab-grade" },
            h("div", { class: "cartao lab-principal" }, legenda, graf, player.el),
            painel))));

      var nota = h("section", { class: "secao compacta" }, h("div", { class: "moldura grade g-3" },
        h("p", { class: "nota" }, "Tudo o que você vê aqui foi calculado por ", h("a", { class: "sublinha", href: "#/doc/phb/engine_v3.py" }, "engine_v3.step()"), " durante o build. O navegador não recalcula estado: só interpola a animação entre snapshots."),
        h("p", { class: "nota" }, "Os cenários são os de ", h("a", { class: "sublinha", href: "#/doc/phb/calibrar_v3.py" }, "calibrar_v3.py"), ", importados diretamente — os mesmos que decidem os 11 critérios do ", h("a", { class: "sublinha", href: "#/testes/004" }, "teste 004"), "."),
        h("p", { class: "nota" }, "Base: setpoints originais da Mariana (N 3.0, Am 6.0). Espelhada: N 7.5, Am 4.0 — a condição que, na v2, invertia a assimetria.")));
      el.appendChild(nota);

      trocar(atual, setpoint);
      setTimeout(function () { player.ir(0); }, 0);
      el.appendChild(C.proximo("Próximo", "A jornada até aqui", "#/jornada"));
      return "Laboratório";
    }
  };
})();
