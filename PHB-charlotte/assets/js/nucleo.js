/* =========================================================================
   PHB Charlotte — núcleo: DOM, movimento e ciclo de vida das páginas.
   Scripts clássicos (sem módulos) para abrir direto do disco (file://).
   ========================================================================= */
(function () {
  "use strict";

  var PHB = (window.PHB = window.PHB || {});
  PHB.paginas = {};

  /* ---------------------------------------------------------------- DOM */
  function aplicarAttrs(el, attrs, svg) {
    if (!attrs) return;
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "class") el.setAttribute("class", v);
      else if (k === "style" && typeof v === "object") {
        Object.keys(v).forEach(function (p) {
          if (p.indexOf("--") === 0) el.style.setProperty(p, v[p]);
          else el.style[p] = v[p];
        });
      }
      else if (k === "html") el.innerHTML = v;
      else if (k === "text") el.textContent = v;
      else if (k === "dataset") Object.assign(el.dataset, v);
      else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (k.indexOf("--") === 0) el.style.setProperty(k, v);
      else el.setAttribute(k, v === true ? "" : v);
    });
  }
  function anexar(el, filhos) {
    filhos.forEach(function (f) {
      if (f === null || f === undefined || f === false) return;
      if (Array.isArray(f)) return anexar(el, f);
      el.appendChild(typeof f === "object" ? f : document.createTextNode(String(f)));
    });
  }
  /** h("div", {class: "x"}, filho, "texto", [lista]) */
  PHB.h = function (tag, attrs) {
    var el = document.createElement(tag);
    aplicarAttrs(el, attrs, false);
    anexar(el, Array.prototype.slice.call(arguments, 2));
    return el;
  };
  var NS = "http://www.w3.org/2000/svg";
  PHB.s = function (tag, attrs) {
    var el = document.createElementNS(NS, tag);
    aplicarAttrs(el, attrs, true);
    anexar(el, Array.prototype.slice.call(arguments, 2));
    return el;
  };
  PHB.$ = function (sel, raiz) { return (raiz || document).querySelector(sel); };
  PHB.$$ = function (sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); };
  PHB.esc = function (t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  PHB.fmt = function (n, casas) {
    if (n === null || n === undefined || isNaN(n)) return "—";
    return Number(n).toFixed(casas === undefined ? 2 : casas);
  };
  PHB.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  PHB.lerp = function (a, b, t) { return a + (b - a) * t; };
  PHB.icone = function (nome) {
    var p = {
      seta: "M5 12h14M13 6l6 6-6 6",
      voltar: "M19 12H5M11 18l-6-6 6-6",
      sol: "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
      lua: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z",
      busca: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4",
      menu: "M4 8h16M4 16h16",
      fechar: "M6 6l12 12M18 6 6 18",
      onda: "M2 12c2.5-5 5-5 7.5 0s5 5 7.5 0 3.5-3 5-2",
      pausa: "M8 5v14M16 5v14",
      play: "M7 5l12 7-12 7Z",
      reinicio: "M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5",
      externo: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
      olho: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
      cadeado: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5Z"
    }[nome];
    return PHB.s("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.7",
      "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, PHB.s("path", { d: p }));
  };

  /* ------------------------------------------------------- movimento */
  PHB.semMovimento = function () { return document.documentElement.classList.contains("sem-movimento"); };
  PHB.ease = {
    saida: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); },
    suave: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    mola: function (t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    linear: function (t) { return t; }
  };
  /** Interpola de→para em `dur` ms; devolve função que cancela. */
  PHB.tween = function (o) {
    var ease = o.ease || PHB.ease.saida, dur = o.dur || 800, t0 = null, id, parado = false;
    if (PHB.semMovimento() || dur <= 0) {
      o.aoAtualizar(o.para, 1);
      if (o.aoFim) o.aoFim();
      return function () {};
    }
    function passo(ts) {
      if (parado) return;
      if (t0 === null) t0 = ts + (o.atraso || 0);
      var p = PHB.clamp((ts - t0) / dur, 0, 1);
      if (ts >= t0) o.aoAtualizar(PHB.lerp(o.de, o.para, ease(p)), p);
      if (p < 1) id = requestAnimationFrame(passo);
      else if (o.aoFim) o.aoFim();
    }
    id = requestAnimationFrame(passo);
    return function () { parado = true; cancelAnimationFrame(id); };
  };

  /* ------------------------------------------- ciclo de vida da página */
  var limpezas = [];
  PHB.aoSair = function (fn) { limpezas.push(fn); return fn; };
  PHB.limparPagina = function () {
    limpezas.splice(0).forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
  };
  /** Laço de animação que para sozinho ao trocar de página. */
  PHB.laco = function (fn) {
    var id, vivo = true;
    function q(ts) { if (!vivo) return; fn(ts); id = requestAnimationFrame(q); }
    id = requestAnimationFrame(q);
    var parar = function () { vivo = false; cancelAnimationFrame(id); };
    PHB.aoSair(parar);
    return parar;
  };
  PHB.ouvir = function (alvo, ev, fn, opts) {
    alvo.addEventListener(ev, fn, opts);
    PHB.aoSair(function () { alvo.removeEventListener(ev, fn, opts); });
  };
  PHB.aoRolar = function (fn) {
    var pedido = false;
    function h() { if (pedido) return; pedido = true; requestAnimationFrame(function () { pedido = false; fn(); }); }
    PHB.ouvir(window, "scroll", h, { passive: true });
    PHB.ouvir(window, "resize", h);
    fn();
  };
  PHB.aoRedimensionar = function (el, fn) {
    if (!("ResizeObserver" in window)) { fn(); return; }
    var ultimo = -1, t;
    var ro = new ResizeObserver(function (ents) {
      var w = Math.round(ents[0].contentRect.width);
      if (w === ultimo) return;
      var primeira = ultimo === -1;
      ultimo = w;
      clearTimeout(t);
      if (primeira) fn(w); else t = setTimeout(function () { fn(w); }, 120);
    });
    ro.observe(el);
    PHB.aoSair(function () { ro.disconnect(); clearTimeout(t); });
  };

  /** Executa fn uma vez quando o elemento entra na viewport. */
  PHB.aoVer = function (el, fn, margem) {
    if (!("IntersectionObserver" in window)) { fn(el); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); }
      });
    }, { rootMargin: margem || "0px 0px -12% 0px", threshold: 0.01 });
    io.observe(el);
    PHB.aoSair(function () { io.disconnect(); });
  };

  /* --------------------------------------------------- texto dividido */
  PHB.dividir = function (el) {
    if (el.dataset.dividido) return;
    el.dataset.dividido = "1";
    var i = 0;
    (function andar(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (f) {
        if (f.nodeType === 3) {
          var partes = f.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          partes.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var interno = PHB.h("span", { "--i": i++ }, p);
            frag.appendChild(PHB.h("span", { class: "palavra" }, interno));
          });
          no.replaceChild(frag, f);
        } else if (f.nodeType === 1 && !f.classList.contains("palavra")) {
          andar(f);
        }
      });
    })(el);
    el.classList.add("dividido");
  };

  /* ------------------------------------------------ contadores */
  PHB.contar = function (el) {
    var alvo = parseFloat(el.dataset.conta);
    var casas = el.dataset.casas !== undefined ? +el.dataset.casas : (String(el.dataset.conta).split(".")[1] || "").length;
    var pre = el.dataset.prefixo || "", suf = el.dataset.sufixo || "";
    var sep = el.dataset.milhar === "1";
    function fmt(v) {
      var s = v.toFixed(casas);
      if (sep) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return pre + s + suf;
    }
    PHB.tween({ de: 0, para: alvo, dur: +(el.dataset.dur || 1600), ease: PHB.ease.saida,
      aoAtualizar: function (v) { el.textContent = fmt(v); } });
  };

  /** Anima um número de um valor a outro (mudança de turno, por exemplo). */
  PHB.animarNumero = function (el, para, casas, dur) {
    var de = parseFloat(el.dataset.valor || el.textContent) || 0;
    el.dataset.valor = para;
    if (el._cancel) el._cancel();
    el._cancel = PHB.tween({ de: de, para: para, dur: dur || 600, ease: PHB.ease.saida,
      aoAtualizar: function (v) { el.textContent = PHB.fmt(v, casas === undefined ? 2 : casas); } });
  };

  /* --------------------------------------- revelações ao rolar */
  PHB.revelar = function (raiz) {
    PHB.$$("[data-dividir]", raiz).forEach(function (el) {
      PHB.dividir(el);
      PHB.aoVer(el, function () { el.classList.add("visto"); });
    });
    PHB.$$("[data-revela]", raiz).forEach(function (el) {
      PHB.aoVer(el, function () { el.classList.add("visto"); });
    });
    PHB.$$("[data-conta]", raiz).forEach(function (el) {
      el.textContent = (el.dataset.prefixo || "") + "0" + (el.dataset.sufixo || "");
      PHB.aoVer(el, PHB.contar);
    });
    PHB.$$(".inclinavel", raiz).forEach(PHB.inclinar);
    PHB.$$("[data-magnetico]", raiz).forEach(PHB.magnetico);
  };
  /** Escalona revelações: cada filho recebe --atraso crescente. */
  PHB.escalonar = function (els, passo, base) {
    els.forEach(function (el, i) { el.style.setProperty("--atraso", (base || 0) + i * (passo || 70)); });
  };

  /* ------------------------------------------- micro-interações */
  var finoPonteiro = window.matchMedia("(hover: hover) and (pointer: fine)");
  PHB.inclinar = function (el) {
    if (!finoPonteiro.matches) return;
    var max = +(el.dataset.inclina || 5), anim;
    function mover(e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      el.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      if (PHB.semMovimento()) return;
      el.style.transition = "transform 120ms linear";
      el.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * max).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * max).toFixed(2) + "deg) translateY(-4px)";
    }
    function sair() {
      el.style.transition = "transform 900ms var(--e-mola)";
      el.style.transform = "";
    }
    el.addEventListener("pointermove", mover);
    el.addEventListener("pointerleave", sair);
  };
  PHB.magnetico = function (el) {
    if (!finoPonteiro.matches) return;
    var forca = +(el.dataset.magnetico || 0.3);
    el.addEventListener("pointermove", function (e) {
      if (PHB.semMovimento()) return;
      var r = el.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.style.transition = "transform 150ms var(--e-saida)";
      el.style.transform = "translate(" + (dx * forca).toFixed(1) + "px," + (dy * forca).toFixed(1) + "px)";
    });
    el.addEventListener("pointerleave", function () {
      el.style.transition = "transform 800ms var(--e-mola)";
      el.style.transform = "";
    });
  };

  /* ---------------------------------------------------- dica flutuante */
  var dicaEl = null;
  PHB.dica = {
    mostrar: function (html, x, y) {
      if (!dicaEl) { dicaEl = PHB.h("div", { class: "dica", role: "tooltip" }); document.body.appendChild(dicaEl); }
      dicaEl.innerHTML = html;
      var w = dicaEl.offsetWidth, hgt = dicaEl.offsetHeight;
      var left = PHB.clamp(x + 16, 12, window.innerWidth - w - 12);
      var top = y + 18 + hgt > window.innerHeight - 8 ? y - hgt - 14 : y + 18;
      dicaEl.style.left = left + "px";
      dicaEl.style.top = Math.max(8, top) + "px";
      dicaEl.classList.add("visivel");
    },
    esconder: function () { if (dicaEl) dicaEl.classList.remove("visivel"); }
  };

  /* ------------------------------------------------ scripts sob demanda */
  var carregando = {};
  PHB.carregar = function (src, global) {
    if (global && window[global]) return Promise.resolve(window[global]);
    if (!carregando[src]) {
      carregando[src] = new Promise(function (ok, erro) {
        var s = document.createElement("script");
        s.src = src;
        s.onload = function () { ok(global ? window[global] : true); };
        s.onerror = erro;
        document.head.appendChild(s);
      });
    }
    return carregando[src];
  };
  PHB.textos = function () { return PHB.carregar("dados/textos.js", "PHB_TEXTOS"); };

  /* ------------------------------------------------------- acervo */
  PHB.docs = function () { return window.PHB_INDICE.documentos; };
  PHB.doc = function (caminho) {
    return PHB.docs().filter(function (d) { return d.caminho === caminho; })[0];
  };
  PHB.docsDoTeste = function (id) {
    var ordem = ["protocolo", "sessão", "auditoria", "dados", "relatório"];
    return PHB.docs().filter(function (d) { return d.teste === id; }).sort(function (a, b) {
      return ordem.indexOf(a.tipo) - ordem.indexOf(b.tipo) || a.caminho.localeCompare(b.caminho);
    });
  };
  PHB.minutos = function (palavras) { return Math.max(1, Math.round(palavras / 210)); };
  PHB.linkDoc = function (caminho) { return "#/doc/" + caminho; };

  /* botão "copiar" nos blocos de código renderizados */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-copiar]");
    if (!b) return;
    var code = b.closest("figure").querySelector("code");
    var txt = code ? code.innerText : "";
    var feito = function () {
      b.textContent = "copiado ✓";
      setTimeout(function () { b.textContent = "copiar"; }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(feito, feito);
    else {
      var ta = PHB.h("textarea", { style: { position: "fixed", opacity: "0" } }, txt);
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (err) { /* sem permissão: ignora */ }
      ta.remove(); feito();
    }
  });
})();
