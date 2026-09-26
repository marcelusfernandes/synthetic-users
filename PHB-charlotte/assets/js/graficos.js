/* =========================================================================
   PHB Charlotte — gráficos em SVG que se desenham.
   Só exibem valores prontos (snapshots do motor ou números dos relatórios).
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, s = PHB.s, h = PHB.h;
  var G = (PHB.grafico = {});

  function caminho(pts) {
    var d = "", aberto = false;
    pts.forEach(function (p) {
      if (!p) { aberto = false; return; }
      d += (aberto ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1);
      aberto = true;
    });
    return d;
  }
  function desenharTracos(svg, atraso) {
    PHB.$$("[data-tracar]", svg).forEach(function (p, i) {
      var len = p.getTotalLength ? p.getTotalLength() : 0;
      if (!len || PHB.semMovimento()) return;
      p.style.strokeDasharray = len + " " + len;
      p.style.strokeDashoffset = len;
      p.getBoundingClientRect();
      p.style.transition = "stroke-dashoffset 1700ms var(--e-saida) " + ((atraso || 0) + i * 140) + "ms";
      p.style.strokeDashoffset = "0";
      p.addEventListener("transitionend", function () { p.style.strokeDasharray = ""; }, { once: true });
    });
    PHB.$$("[data-surgir]", svg).forEach(function (el, i) {
      if (PHB.semMovimento()) return;
      el.style.opacity = "0";
      el.getBoundingClientRect();
      el.style.transition = "opacity 900ms var(--e-saida) " + (500 + i * 40) + "ms";
      el.style.opacity = "";
    });
  }

  /* --------------------------------------------------------------- linhas */
  G.linhas = function (alvo, o) {
    var estado = { indice: null, desenhado: false, largura: 0 };
    var caixa = h("div", { class: "grafico" });
    alvo.appendChild(caixa);
    var alt = o.altura || 320;
    var m = Object.assign({ e: 44, d: 18, t: 18, b: 34 }, o.margem || {});
    var n = o.x.n;
    var ymin = o.y.min, ymax = o.y.max;
    var svg, guia, pontosHover = [], cabeca, W;

    function X(i) { return m.e + (n <= 1 ? 0 : (i / (n - 1)) * (W - m.e - m.d)); }
    function Y(v) { return m.t + (1 - (v - ymin) / (ymax - ymin)) * (alt - m.t - m.b); }

    function render(w) {
      W = Math.max(280, w);
      caixa.innerHTML = "";
      svg = s("svg", { viewBox: "0 0 " + W + " " + alt, width: W, height: alt, role: "img", "aria-label": o.rotulo || "gráfico" });
      var fundo = s("g", { class: "g-fundo" });
      svg.appendChild(fundo);
      (o.faixas || []).forEach(function (f) {
        var x0 = X(Math.max(0, f.de - 0.5)), x1 = X(Math.min(n - 1, f.ate + 0.5));
        fundo.appendChild(s("rect", { x: x0, y: m.t, width: Math.max(2, x1 - x0), height: alt - m.t - m.b, class: "g-faixa", style: f.cor ? "fill:" + f.cor : null }));
        if (f.rotulo) fundo.appendChild(s("text", { x: x0 + 6, y: m.t + 14, class: "g-faixa-t" }, f.rotulo));
      });
      (o.y.ticks || []).forEach(function (t) {
        fundo.appendChild(s("line", { x1: m.e, x2: W - m.d, y1: Y(t), y2: Y(t), class: "g-grade" }));
        fundo.appendChild(s("text", { x: m.e - 10, y: Y(t) + 4, class: "g-eixo", "text-anchor": "end" }, o.y.formato ? o.y.formato(t) : t));
      });
      var passo = o.x.passo || Math.max(1, Math.ceil(n / Math.max(3, Math.floor((W - m.e) / 64))));
      for (var i = 0; i < n; i += passo) {
        fundo.appendChild(s("text", { x: X(i), y: alt - 10, class: "g-eixo", "text-anchor": "middle" }, o.x.rotulo ? o.x.rotulo(i) : i + 1));
      }
      (o.limiares || []).forEach(function (l) {
        fundo.appendChild(s("line", { x1: m.e, x2: W - m.d, y1: Y(l.y), y2: Y(l.y), class: "g-limiar", style: "stroke:" + (l.cor || "var(--tinta-3)") }));
        if (l.rotulo) fundo.appendChild(s("text", { x: W - m.d - 4, y: Y(l.y) - 6, class: "g-limiar-t", "text-anchor": "end", style: "fill:" + (l.cor || "var(--tinta-3)") }, l.rotulo));
      });
      (o.marcas || []).forEach(function (mk) {
        fundo.appendChild(s("line", { x1: X(mk.x), x2: X(mk.x), y1: m.t, y2: alt - m.b, class: "g-marca" }));
        if (mk.rotulo) fundo.appendChild(s("text", { x: X(mk.x) + 5, y: alt - m.b - 8, class: "g-marca-t" }, mk.rotulo));
      });

      var linhas = s("g", { class: "g-linhas" });
      svg.appendChild(linhas);
      pontosHover = [];
      o.series.forEach(function (se) {
        var pts = se.valores.map(function (v, i) { return v === null || v === undefined ? null : [X(i), Y(v)]; });
        if (se.area) {
          var validos = pts.filter(Boolean);
          if (validos.length) {
            var dA = caminho(pts) + "L" + validos[validos.length - 1][0] + " " + Y(ymin) + "L" + validos[0][0] + " " + Y(ymin) + "Z";
            linhas.appendChild(s("path", { d: dA, class: "g-area", style: "fill:" + se.cor, "data-surgir": "" }));
          }
        }
        linhas.appendChild(s("path", {
          d: caminho(pts), class: "g-linha" + (se.tracejado ? " tracejada" : ""), "data-tracar": se.tracejado ? null : "",
          style: "stroke:" + se.cor + (se.largura ? ";stroke-width:" + se.largura : "")
        }));
        if (o.pontos) {
          pts.forEach(function (p) {
            if (p) linhas.appendChild(s("circle", { cx: p[0], cy: p[1], r: 3.2, class: "g-ponto", style: "fill:" + se.cor, "data-surgir": "" }));
          });
        }
        var ph = s("circle", { r: 5.5, class: "g-foco", style: "stroke:" + se.cor });
        pontosHover.push({ el: ph, pts: pts });
        linhas.appendChild(ph);
      });
      guia = s("line", { y1: m.t, y2: alt - m.b, class: "g-guia" });
      svg.appendChild(guia);
      cabeca = s("g", { class: "g-cabeca" }, s("line", { y1: m.t - 6, y2: alt - m.b, class: "g-cabeca-l" }), s("circle", { cy: m.t - 6, r: 4, class: "g-cabeca-p" }));
      svg.appendChild(cabeca);
      var alvoRato = s("rect", { x: m.e - 10, y: 0, width: W - m.e - m.d + 20, height: alt, fill: "transparent", class: "g-rato" });
      svg.appendChild(alvoRato);
      caixa.appendChild(svg);

      function indiceDe(ev) {
        var r = svg.getBoundingClientRect();
        var x = (ev.clientX - r.left) * (W / r.width);
        return PHB.clamp(Math.round(((x - m.e) / (W - m.e - m.d)) * (n - 1)), 0, n - 1);
      }
      function focar(i, ev) {
        svg.classList.add("focando");
        guia.setAttribute("x1", X(i)); guia.setAttribute("x2", X(i));
        pontosHover.forEach(function (ph) {
          var p = ph.pts[i];
          if (p) { ph.el.setAttribute("cx", p[0]); ph.el.setAttribute("cy", p[1]); ph.el.style.opacity = 1; }
          else ph.el.style.opacity = 0;
        });
        if (o.dica && ev) PHB.dica.mostrar(o.dica(i), ev.clientX, ev.clientY);
        if (o.aoIndice) o.aoIndice(i);
      }
      alvoRato.addEventListener("pointermove", function (ev) { focar(indiceDe(ev), ev); });
      alvoRato.addEventListener("pointerdown", function (ev) { focar(indiceDe(ev), ev); if (o.aoClicar) o.aoClicar(indiceDe(ev)); });
      alvoRato.addEventListener("pointerleave", function () {
        svg.classList.remove("focando"); PHB.dica.esconder();
        pontosHover.forEach(function (ph) { ph.el.style.opacity = 0; });
        if (o.aoSairFoco) o.aoSairFoco();
      });
      if (estado.indice !== null) api.marcar(estado.indice, true);
      if (estado.desenhado) return;
      if (o.animar === false) { estado.desenhado = true; return; }
      PHB.$$("[data-tracar]", svg).forEach(function (p) { p.style.opacity = "0"; });
      PHB.$$("[data-surgir]", svg).forEach(function (p) { p.style.opacity = "0"; });
      PHB.aoVer(caixa, function () {
        estado.desenhado = true;
        PHB.$$("[data-tracar]", svg).forEach(function (p) { p.style.opacity = ""; });
        desenharTracos(svg, o.atraso);
      });
    }

    var api = {
      el: caixa,
      marcar: function (i, instantaneo) {
        estado.indice = i;
        if (!cabeca) return;
        if (i === null) { cabeca.style.opacity = 0; return; }
        cabeca.style.opacity = 1;
        cabeca.style.transition = instantaneo ? "none" : "";
        cabeca.style.transform = "translateX(" + X(i).toFixed(1) + "px)";
      },
      trocar: function (series, y) {
        o.series = series;
        if (y) { o.y = y; ymin = y.min; ymax = y.max; }
        if (o.x.nFn) n = o.x.nFn();
        estado.desenhado = false;
        render(W || caixa.clientWidth);
      },
      definirN: function (novo) { n = novo; o.x.n = novo; }
    };
    PHB.aoRedimensionar(caixa, render);
    return api;
  };

  /* ------------------------------------------------- barras horizontais */
  G.barras = function (alvo, o) {
    var lista = h("div", { class: "barras" + (o.classe ? " " + o.classe : "") });
    o.itens.forEach(function (it, i) {
      var pct = PHB.clamp((it.valor / (it.max || o.max || 10)) * 100, 0, 100);
      var barra = h("div", { class: "barra-enchimento", style: { background: it.cor || "var(--tinta)" } });
      var linha = h("div", { class: "barra" + (it.destaque ? " destaque" : ""), "--atraso": i * 90 },
        h("div", { class: "barra-rotulo" }, h("span", { html: it.rotulo }), it.sub ? h("small", { html: it.sub }) : null),
        h("div", { class: "barra-trilho" }, barra, it.marca !== undefined ? h("span", { class: "barra-marca", style: { left: PHB.clamp((it.marca / (it.max || o.max || 10)) * 100, 0, 100) + "%" }, title: it.marcaRotulo || "" }) : null),
        h("div", { class: "barra-valor num" }, it.texto !== undefined ? it.texto : PHB.fmt(it.valor, o.casas))
      );
      linha._pct = pct;
      linha._barra = barra;
      lista.appendChild(linha);
    });
    alvo.appendChild(lista);
    PHB.aoVer(lista, function () {
      PHB.$$(".barra", lista).forEach(function (l, i) {
        setTimeout(function () { l._barra.style.transform = "scaleX(" + (l._pct / 100) + ")"; l.classList.add("cheia"); }, PHB.semMovimento() ? 0 : i * 90);
      });
    });
    return lista;
  };

  /* -------------------------------------------------- medidor (arco) */
  G.medidor = function (alvo, o) {
    var W = 320, H = 190, cx = 160, cy = 170, r = 132;
    var max = o.max;
    function ponto(v, raio) {
      var a = Math.PI * (1 - v / max);
      return [cx + raio * Math.cos(a), cy - raio * Math.sin(a)];
    }
    function arco(v0, v1, raio) {
      var p0 = ponto(v0, raio), p1 = ponto(v1, raio);
      return "M" + p0[0] + " " + p0[1] + "A" + raio + " " + raio + " 0 0 1 " + p1[0] + " " + p1[1];
    }
    var svg = s("svg", { viewBox: "-30 -8 " + (W + 60) + " " + (H + 8), class: "medidor", role: "img", "aria-label": o.rotulo || "" });
    var ini = 0;
    (o.faixas || []).forEach(function (f) {
      svg.appendChild(s("path", { d: arco(ini, f.ate, r), class: "medidor-faixa", style: "stroke:" + f.cor }));
      var meio = ponto((ini + f.ate) / 2, r + 22);
      svg.appendChild(s("text", { x: meio[0], y: meio[1], class: "medidor-t", "text-anchor": "middle" }, f.rotulo));
      ini = f.ate;
    });
    var agulha = s("g", { class: "medidor-agulha" },
      s("line", { x1: cx, y1: cy, x2: cx - r + 16, y2: cy }),
      s("circle", { cx: cx, cy: cy, r: 7 }));
    svg.appendChild(agulha);
    (o.marcas || []).forEach(function (mk) {
      var p0 = ponto(mk.valor, r - 14), p1 = ponto(mk.valor, r + 10);
      svg.appendChild(s("line", { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], class: "medidor-marca", style: "stroke:" + (mk.cor || "var(--tinta)") }));
    });
    alvo.appendChild(svg);
    function girar(v) {
      agulha.style.transform = "rotate(" + (180 * v / max).toFixed(2) + "deg)";
    }
    girar(0);
    PHB.aoVer(svg, function () {
      agulha.style.transition = PHB.semMovimento() ? "none" : "transform 1800ms var(--e-mola)";
      girar(o.valor);
    });
    return { el: svg, definir: function (v) { agulha.style.transition = "transform 1200ms var(--e-mola)"; girar(v); } };
  };

  /* -------------------------------------------------------- minigráfico */
  G.mini = function (alvo, o) {
    var W = o.largura || 240, H = o.altura || 64, n = o.valores.length;
    var min = o.min !== undefined ? o.min : Math.min.apply(null, o.valores);
    var max = o.max !== undefined ? o.max : Math.max.apply(null, o.valores);
    var pts = o.valores.map(function (v, i) { return [2 + (i / (n - 1)) * (W - 4), 3 + (1 - (v - min) / (max - min || 1)) * (H - 6)]; });
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "mini", preserveAspectRatio: "none", "aria-hidden": "true" },
      s("path", { d: caminho(pts) + "L" + (W - 2) + " " + H + "L2 " + H + "Z", class: "mini-area", style: "fill:" + o.cor }),
      s("path", { d: caminho(pts), class: "mini-linha", style: "stroke:" + o.cor, "data-tracar": "" }));
    alvo.appendChild(svg);
    var p = svg.querySelector("[data-tracar]");
    p.style.opacity = 0;
    PHB.aoVer(svg, function () { p.style.opacity = ""; desenharTracos(svg, o.atraso || 0); });
    return svg;
  };

  /* ---------------------------------------------- faixas de tolerância */
  G.tolerancia = function (alvo, o) {
    var lista = h("div", { class: "tolerancias" });
    var lo = o.escala[0], hi = o.escala[1];
    function pos(v) { return PHB.clamp((v - lo) / (hi - lo), 0, 1) * 100; }
    o.itens.forEach(function (it, i) {
      var rl = it.lo / it.ideal, rh = it.hi / it.ideal;
      var pontual = Math.abs(rh - rl) < 1e-6;
      var faixa = h("span", { class: "tol-faixa" + (pontual ? " pontual" : "") + (it.apertado ? " apertada" : ""),
        style: { left: pos(rl) + "%", width: Math.max(0.6, pos(rh) - pos(rl)) + "%" } });
      lista.appendChild(h("div", { class: "tol", "data-revela": "", "--atraso": i * 40 },
        h("code", { class: "tol-nome" }, it.nome),
        h("div", { class: "tol-trilho" }, h("span", { class: "tol-ideal" }), faixa),
        h("span", { class: "tol-valor num" }, it.texto)));
    });
    alvo.appendChild(lista);
    return lista;
  };
})();
