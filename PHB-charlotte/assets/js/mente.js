/* =========================================================================
   PHB Charlotte — o herói: superfície × interior.
   A superfície mostra a fala da Mariana (o que um observador vê).
   O interior, revelado pela lente do cursor, mostra o estado real que o
   motor calculou no mesmo turno do teste 005 (replay feito no build).
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, s = PHB.s;
  var M = (PHB.mente = {});

  var CORES = { warmth: "var(--e-warmth)", confianca: "var(--e-confianca)", respeito: "var(--e-respeito)", irritacao: "var(--e-irritacao)", vigilancia: "var(--e-vigilancia)" };
  var NOMES = { warmth: "warmth", confianca: "confiança", respeito: "respeito", irritacao: "irritação", vigilancia: "vigilância" };
  M.CORES = CORES;
  M.NOMES = NOMES;

  function resumirFala(html) {
    var t = String(html).replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&");
    t = t.replace(/^["“]|["”]$/g, "").replace(/\s*\[\.\.\.\]\s*/g, " … ");
    var partes = t.split(/(?<=[.!?…])\s+/);
    var out = "";
    for (var i = 0; i < partes.length; i++) {
      if ((out + " " + partes[i]).length > 150 && out) break;
      out = (out ? out + " " : "") + partes[i];
    }
    return out;
  }

  /* ------------------------------------------------------------ superfície */
  function superficie(canvas) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = Math.min(1.5, window.devicePixelRatio || 1);
    var bolhas = [
      { c: [237, 150, 117], r: 0.42, fx: 0.00011, fy: 0.00017, ax: 0.28, ay: 0.22, ox: 0.62, oy: 0.46, f: 0 },
      { c: [226, 119, 131], r: 0.36, fx: 0.00016, fy: 0.00009, ax: 0.22, ay: 0.3, ox: 0.72, oy: 0.52, f: 1.7 },
      { c: [217, 93, 154], r: 0.33, fx: 0.00008, fy: 0.00014, ax: 0.3, ay: 0.2, ox: 0.58, oy: 0.6, f: 3.1 },
      { c: [240, 212, 206], r: 0.22, fx: 0.00019, fy: 0.00012, ax: 0.2, ay: 0.26, ox: 0.66, oy: 0.4, f: 4.4 },
      { c: [78, 211, 198], r: 0.16, fx: 0.00013, fy: 0.0002, ax: 0.26, ay: 0.18, ox: 0.52, oy: 0.5, f: 5.9 }
    ];
    function medir() {
      var r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    }
    medir();
    function desenhar(ts, energia) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      var escala = Math.max(W, H);
      bolhas.forEach(function (b, i) {
        var x = (b.ox + Math.sin(ts * b.fx + b.f) * b.ax * (0.8 + energia * 0.4)) * W;
        var y = (b.oy + Math.cos(ts * b.fy + b.f * 1.3) * b.ay) * H;
        var rr = b.r * escala * (1 + Math.sin(ts * 0.0004 + i) * 0.06);
        var g = ctx.createRadialGradient(x, y, 0, x, y, rr);
        var a = i === 4 ? 0.28 : 0.55;
        g.addColorStop(0, "rgba(" + b.c.join(",") + "," + a + ")");
        g.addColorStop(1, "rgba(" + b.c.join(",") + ",0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
    }
    return { medir: medir, desenhar: desenhar };
  }

  /* ------------------------------------------------------------- interior */
  function interior() {
    var eixos = window.PHB_MOTOR.eixos;
    var req = window.PHB_MOTOR.config.consent_req_confianca;
    var svg = s("svg", { viewBox: "0 0 600 600", class: "painel-svg", "aria-hidden": "true" });
    var raios = [96, 132, 168, 204, 240];
    var arcos = {}, rotulos = {};
    eixos.forEach(function (a, i) {
      var r = raios[i];
      svg.appendChild(s("circle", { cx: 300, cy: 300, r: r, class: "anel-trilho" }));
      var arco = s("circle", { cx: 300, cy: 300, r: r, class: "anel", pathLength: "100", style: "stroke:" + CORES[a], "stroke-dasharray": "0 100" });
      svg.appendChild(arco);
      arcos[a] = arco;
      var t = s("text", { x: 290, y: 300 - r + 4, class: "anel-t", "text-anchor": "end" }, NOMES[a] + " ");
      var v = s("tspan", { class: "anel-v" }, "0.00");
      t.appendChild(v);
      svg.appendChild(t);
      rotulos[a] = v;
    });
    // limiar de consentimento sobre o anel de confiança
    var ang = (req / 10) * 2 * Math.PI - Math.PI / 2, rc = raios[1];
    svg.appendChild(s("line", { x1: 300 + (rc - 14) * Math.cos(ang), y1: 300 + (rc - 14) * Math.sin(ang), x2: 300 + (rc + 14) * Math.cos(ang), y2: 300 + (rc + 14) * Math.sin(ang), class: "anel-limiar" }));
    svg.appendChild(s("line", { x1: 300 + (rc + 14) * Math.cos(ang), y1: 300 + (rc + 14) * Math.sin(ang), x2: 300 + 262 * Math.cos(ang), y2: 300 + 262 * Math.sin(ang), class: "anel-guia" }));
    svg.appendChild(s("text", { x: 300 + 268 * Math.cos(ang), y: 300 + 268 * Math.sin(ang) + 4, class: "anel-limiar-t", "text-anchor": "end" }, "consentimento ≥ 7.02"));
    var turno = s("text", { x: 300, y: 296, class: "painel-turno", "text-anchor": "middle" }, "T1");
    var sub = s("text", { x: 300, y: 324, class: "painel-sub", "text-anchor": "middle" }, "Mariana × visitante");
    svg.appendChild(turno); svg.appendChild(sub);
    return { svg: svg, arcos: arcos, rotulos: rotulos, turno: turno };
  }

  M.heroi = function (alvo) {
    var replay = window.PHB_MOTOR.replay005, falas = window.PHB_SERIES.d005;
    var eixos = window.PHB_MOTOR.eixos, req = window.PHB_MOTOR.config.consent_req_confianca;
    var canvas = h("canvas", { class: "heroi-canvas", "aria-hidden": "true" });
    var fala = h("p", { class: "heroi-fala voz" });
    var falaQuem = h("span", { class: "heroi-fala-quem" });
    var painel = interior();
    var eventos = h("div", { class: "eventos heroi-eventos" });
    var cadeado = h("div", { class: "heroi-cadeado" });
    var dados = h("dl", { class: "heroi-dados" });
    var interiorEl = h("div", { class: "heroi-interior", "aria-hidden": "true" },
      h("div", { class: "heroi-grade" }),
      h("div", { class: "heroi-painel" }, painel.svg),
      h("div", { class: "heroi-lateral" }, h("span", { class: "olho" }, "eventos interpretados"), eventos, cadeado, dados));
    var botaoLente = h("button", { class: "botao fantasma pequeno heroi-lente-botao", type: "button", "aria-pressed": "false" }, PHB.icone("olho"), h("span", null, "Ver o interior"));
    var el = h("section", { class: "heroi", "aria-label": "Apresentação" },
      h("div", { class: "heroi-superficie" }, canvas),
      interiorEl,
      h("div", { class: "heroi-texto moldura" },
        h("p", { class: "olho", "data-revela": "" }, "PHB · Parameterized Hierarchical Behavior"),
        h("h1", { class: "mega heroi-titulo", "data-dividir": "" }, "Uma mente que ", h("em", { class: "voz" }, "não se lê"), " de fora."),
        h("p", { class: "lead heroi-lead", "data-revela": "", "--atraso": 500 },
          "Usuários sintéticos com estado afetivo real: o LLM interpreta e narra, um motor determinístico sente. Passe o cursor sobre a superfície — ou toque em “Ver o interior” — para ver o que ela não diz."),
        h("div", { class: "fila heroi-acoes", "data-revela": "", "--atraso": 700 },
          h("a", { class: "botao", href: "#/testes", "data-magnetico": "0.25" }, "Ver os experimentos", h("span", { class: "seta" }, PHB.icone("seta"))),
          botaoLente)),
      h("figure", { class: "heroi-voz moldura", "aria-live": "polite" }, fala, falaQuem),
      h("div", { class: "heroi-rolar", "aria-hidden": "true" }, h("span", null, "role"), h("i")));
    alvo.appendChild(el);

    var sup = superficie(canvas);
    PHB.aoRedimensionar(el, function () { sup.medir(); });

    /* ---- ciclo de turnos (dados reais do replay) ---- */
    var t = -1, visivel = true;
    function mostrarTurno(i) {
      var sn = replay[i];
      painel.turno.textContent = "T" + (i + 1);
      eixos.forEach(function (a, k) {
        painel.arcos[a].setAttribute("stroke-dasharray", (sn.r[k] * 10).toFixed(2) + " 100");
        PHB.animarNumero(painel.rotulos[a], sn.r[k], 2, 900);
      });
      eventos.innerHTML = "";
      sn.e.forEach(function (e, j) {
        var spec = window.PHB_MOTOR.catalogo[e[0]];
        eventos.appendChild(h("span", { class: "evento novo", "data-valencia": spec.valencia, "--i": j }, e[0], h("em", null, " " + e[1].toFixed(1))));
      });
      var conf = sn.r[1], fechado = conf < req;
      cadeado.innerHTML = "";
      cadeado.appendChild(PHB.icone("cadeado"));
      cadeado.appendChild(h("span", null, "exposição íntima " + sn.x.toFixed(2) + " — consentimento " + (fechado ? "fechado" : "elegível") + " (confiança " + conf.toFixed(2) + (fechado ? " < " : " ≥ ") + req.toFixed(2) + ")"));
      cadeado.classList.toggle("fechado", fechado);
      dados.innerHTML = "";
      [["goodwill", sn.g.toFixed(2)], ["eventos positivos", sn.h], ["cicatrizes", sn.k], ["ruptura", sn.u ? "sim" : "não"],
       ["neuroticismo", sn.o[4].toFixed(2)], ["extroversão", sn.o[2].toFixed(2)]].forEach(function (p) {
        dados.appendChild(h("div", null, h("dt", null, p[0]), h("dd", { class: "num" }, String(p[1]))));
      });
      fala.classList.remove("entra");
      void fala.offsetWidth;
      fala.textContent = "“" + resumirFala(falas[i].mariana) + "”";
      falaQuem.textContent = "Mariana, turno " + (i + 1) + " do teste 005 — a superfície";
      fala.classList.add("entra");
    }
    function proximo() { t = (t + 1) % replay.length; mostrarTurno(t); }
    proximo();
    var relogio = setInterval(function () { if (visivel && !document.hidden) proximo(); }, 4200);
    PHB.aoSair(function () { clearInterval(relogio); });

    /* ---- lente ---- */
    var fino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var lx = 0.72, ly = 0.5, cx = lx, cy = ly, raio = 0, raioAlvo = fino ? 0 : 150, aberto = false, energia = 0;
    PHB.ouvir(el, "pointermove", function (e) {
      var r = el.getBoundingClientRect();
      lx = (e.clientX - r.left) / r.width; ly = (e.clientY - r.top) / r.height;
      if (!aberto) raioAlvo = 170;
      energia = Math.min(1, energia + 0.08);
    });
    PHB.ouvir(el, "pointerleave", function () { if (!aberto && fino) raioAlvo = 0; });
    botaoLente.addEventListener("click", function () {
      aberto = !aberto;
      botaoLente.setAttribute("aria-pressed", aberto ? "true" : "false");
      botaoLente.querySelector("span").textContent = aberto ? "Voltar à superfície" : "Ver o interior";
      raioAlvo = aberto ? Math.hypot(el.clientWidth, el.clientHeight) : (fino ? 0 : 150);
      el.classList.toggle("revelado", aberto);
    });

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; }, { threshold: 0 });
      io.observe(el);
      PHB.aoSair(function () { io.disconnect(); });
    }

    PHB.laco(function (ts) {
      if (!visivel) return;
      var parado = PHB.semMovimento();
      if (!fino && !aberto) { lx = 0.62 + Math.sin(ts * 0.00035) * 0.22; ly = 0.46 + Math.cos(ts * 0.00027) * 0.2; }
      var k = parado ? 1 : 0.12;
      cx += (lx - cx) * k; cy += (ly - cy) * k;
      raio += (raioAlvo - raio) * (parado ? 1 : 0.1);
      energia *= 0.97;
      el.style.setProperty("--lx", (cx * 100).toFixed(2) + "%");
      el.style.setProperty("--ly", (cy * 100).toFixed(2) + "%");
      el.style.setProperty("--lr", raio.toFixed(1) + "px");
      sup.desenhar(parado ? 0 : ts, energia);
    });
    return el;
  };

  /* ----------------------------------------------------------------------
     Órbita de estado: 5 anéis pequenos para cartões e players
     ---------------------------------------------------------------------- */
  M.orbita = function (tamanho) {
    var eixos = window.PHB_MOTOR.eixos;
    var svg = s("svg", { viewBox: "0 0 120 120", class: "orbita", width: tamanho || 120, height: tamanho || 120, "aria-hidden": "true" });
    var arcos = eixos.map(function (a, i) {
      var r = 18 + i * 9;
      svg.appendChild(s("circle", { cx: 60, cy: 60, r: r, class: "anel-trilho" }));
      var c = s("circle", { cx: 60, cy: 60, r: r, class: "anel", pathLength: "100", style: "stroke:" + CORES[a], "stroke-dasharray": "0 100" });
      svg.appendChild(c);
      return c;
    });
    return {
      el: svg,
      definir: function (r) { arcos.forEach(function (c, i) { c.setAttribute("stroke-dasharray", (r[i] * 10).toFixed(2) + " 100"); }); }
    };
  };
})();
