/* =========================================================================
   PHB Charlotte — roteador, navegação, transições, cursor e busca.
   Roteamento por hash (#/rota) para funcionar via file:// e em qualquer
   servidor estático.
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, $ = PHB.$, $$ = PHB.$$;
  var raiz = document.documentElement;

  /* ------------------------------------------------ preferências */
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function gravar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* armazenamento indisponível */ } }

  var mqMov = window.matchMedia("(prefers-reduced-motion: reduce)");
  function aplicarMovimento() {
    var pref = ler("phb-movimento");
    var reduzido = pref ? pref === "reduzido" : mqMov.matches;
    raiz.classList.toggle("sem-movimento", reduzido);
    var b = $("#botao-movimento");
    if (b) {
      b.setAttribute("aria-pressed", reduzido ? "true" : "false");
      b.setAttribute("aria-label", reduzido ? "Movimento reduzido — ativar movimento pleno" : "Movimento pleno — reduzir movimento");
      b.title = reduzido ? "Movimento reduzido" : "Movimento pleno";
    }
  }
  function temaAtual() {
    var t = raiz.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  function aplicarTemaIcone() {
    var b = $("#botao-tema");
    if (!b) return;
    b.innerHTML = "";
    b.appendChild(PHB.icone(temaAtual() === "dark" ? "sol" : "lua"));
    b.setAttribute("aria-label", temaAtual() === "dark" ? "Usar tema claro" : "Usar tema escuro");
  }

  /* ---------------------------------------------------- rotas */
  var ROTAS = [
    { re: /^\/?$/, pagina: "inicio", nav: "" },
    { re: /^\/jornada$/, pagina: "jornada", nav: "jornada" },
    { re: /^\/testes$/, pagina: "testes", nav: "testes" },
    { re: /^\/testes\/(\d{3})$/, pagina: "teste", nav: "testes" },
    { re: /^\/motor$/, pagina: "motor", nav: "motor" },
    { re: /^\/laboratorio$/, pagina: "laboratorio", nav: "laboratorio" },
    { re: /^\/fundacao$/, pagina: "fundacao", nav: "fundacao" },
    { re: /^\/produto$/, pagina: "produto", nav: "produto" },
    { re: /^\/arquivo$/, pagina: "arquivo", nav: "arquivo" },
    { re: /^\/doc\/(.+)$/, pagina: "leitor", nav: "arquivo" }
  ];
  PHB.NAV = [
    { rota: "", rotulo: "Visão geral" },
    { rota: "jornada", rotulo: "Jornada" },
    { rota: "testes", rotulo: "Experimentos" },
    { rota: "motor", rotulo: "Motor" },
    { rota: "laboratorio", rotulo: "Laboratório" },
    { rota: "fundacao", rotulo: "Fundação" },
    { rota: "produto", rotulo: "Produto" },
    { rota: "arquivo", rotulo: "Arquivo" }
  ];

  function analisar(hash) {
    var bruto = (hash || "").replace(/^#/, "");
    if (bruto.charAt(0) !== "/") bruto = "/";
    var ancora = "";
    var k = bruto.indexOf("#");
    if (k >= 0) { ancora = bruto.slice(k + 1); bruto = bruto.slice(0, k); }
    var consulta = {};
    var q = bruto.indexOf("?");
    if (q >= 0) {
      bruto.slice(q + 1).split("&").forEach(function (par) {
        var kv = par.split("=");
        if (kv[0]) consulta[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
      });
      bruto = bruto.slice(0, q);
    }
    var caminho = decodeURIComponent(bruto);
    for (var i = 0; i < ROTAS.length; i++) {
      var m = caminho.match(ROTAS[i].re);
      if (m) return { pagina: ROTAS[i].pagina, nav: ROTAS[i].nav, params: m.slice(1), consulta: consulta, ancora: decodeURIComponent(ancora), caminho: caminho };
    }
    return { pagina: "inicio", nav: "", params: [], consulta: consulta, ancora: "", caminho: "/" };
  }

  /* ------------------------------------------------- renderização */
  var main, atual = null, primeira = true, emTransicao = false, pendente = null;

  function rolarAncora(ancora, suave) {
    if (!ancora) return false;
    var alvo = document.getElementById(ancora);
    if (!alvo) return false;
    alvo.scrollIntoView({ behavior: suave && !PHB.semMovimento() ? "smooth" : "auto", block: "start" });
    return true;
  }
  PHB.rolarAncora = rolarAncora;

  function montar(rota) {
    PHB.limparPagina();
    PHB.dica.esconder();
    main.innerHTML = "";
    var pagina = PHB.paginas[rota.pagina];
    var envolto = h("div", { class: "pagina pagina-" + rota.pagina });
    main.appendChild(envolto);
    var titulo = "";
    try {
      titulo = pagina.render(envolto, rota) || "";
    } catch (e) {
      console.error(e);
      envolto.appendChild(h("div", { class: "moldura pagina-cabeca" }, h("h1", null, "Algo saiu do lugar."), h("p", { class: "lead" }, String(e))));
    }
    document.title = (titulo ? titulo + " · " : "") + "PHB Charlotte";
    PHB.revelar(envolto);
    atualizarNav(rota.nav);
    window.scrollTo(0, 0);
    if (rota.ancora) setTimeout(function () { rolarAncora(rota.ancora, false); }, 60);
    main.focus({ preventScroll: true });
    atual = rota;
  }

  function navegar() {
    var rota = analisar(location.hash);
    if (atual && rota.caminho === atual.caminho && JSON.stringify(rota.consulta) === JSON.stringify(atual.consulta)) {
      if (rota.ancora) rolarAncora(rota.ancora, true);
      return;
    }
    if (emTransicao) { pendente = rota; return; }
    fecharMenu();
    var cortina = $(".cortina");
    if (primeira) {
      primeira = false;
      montar(rota);
      cortina.classList.add("revelando");
      setTimeout(function () { cortina.className = "cortina"; }, PHB.semMovimento() ? 0 : 1100);
      return;
    }
    if (PHB.semMovimento()) { montar(rota); return; }
    emTransicao = true;
    var rotulo = $(".rotulo-cortina");
    rotulo.textContent = rotuloDaRota(rota);
    cortina.className = "cortina cobrindo";
    setTimeout(function () {
      montar(rota);
      cortina.className = "cortina revelando";
      setTimeout(function () {
        cortina.className = "cortina";
        emTransicao = false;
        if (pendente) { var p = pendente; pendente = null; if (p.caminho !== atual.caminho) navegar(); }
      }, 760);
    }, 620);
  }
  function rotuloDaRota(r) {
    if (r.pagina === "teste") return "Teste " + r.params[0];
    if (r.pagina === "leitor") { var d = PHB.doc(r.params[0]); return d ? d.tipo : "documento"; }
    var n = PHB.NAV.filter(function (x) { return x.rota === r.nav; })[0];
    return n ? n.rotulo : "";
  }

  /* ---------------------------------------------------- navegação */
  function atualizarNav(chave) {
    $$("[data-rota]").forEach(function (a) {
      if (a.dataset.rota === chave) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    moverLesma(document.querySelector(".nav a[aria-current]"));
  }
  function moverLesma(a) {
    var lesma = $(".nav .lesma");
    if (!lesma) return;
    if (!a) { lesma.style.opacity = 0; return; }
    lesma.style.opacity = 1;
    lesma.style.width = a.offsetWidth + "px";
    lesma.style.transform = "translateX(" + a.offsetLeft + "px)";
  }
  function construirNav() {
    var nav = $(".nav-envolto .nav");
    PHB.NAV.forEach(function (n) {
      nav.appendChild(h("a", { href: "#/" + n.rota, "data-rota": n.rota }, n.rotulo));
    });
    nav.appendChild(h("span", { class: "lesma", "aria-hidden": "true" }));
    nav.addEventListener("pointerover", function (e) { var a = e.target.closest("a"); if (a) moverLesma(a); });
    nav.addEventListener("pointerleave", function () { moverLesma(nav.querySelector("a[aria-current]")); });
    window.addEventListener("resize", function () { moverLesma(nav.querySelector("a[aria-current]")); });

    var menu = $("#menu-cheio");
    PHB.NAV.forEach(function (n, i) {
      menu.appendChild(h("a", { href: "#/" + n.rota, "data-rota": n.rota, "--i": i }, h("small", null, "0" + (i + 1)), n.rotulo));
    });
  }
  function fecharMenu() {
    var menu = $("#menu-cheio"), b = $("#botao-menu");
    if (!menu.classList.contains("aberto")) return;
    menu.classList.remove("aberto");
    menu.setAttribute("aria-hidden", "true");
    b.setAttribute("aria-expanded", "false");
    b.innerHTML = ""; b.appendChild(PHB.icone("menu"));
    document.body.classList.remove("travado");
  }
  function alternarMenu() {
    var menu = $("#menu-cheio"), b = $("#botao-menu");
    if (menu.classList.contains("aberto")) { fecharMenu(); return; }
    menu.classList.add("aberto");
    menu.setAttribute("aria-hidden", "false");
    b.setAttribute("aria-expanded", "true");
    b.innerHTML = ""; b.appendChild(PHB.icone("fechar"));
    document.body.classList.add("travado");
  }

  /* cabeçalho que se esconde ao descer e volta ao subir */
  function cabecalho() {
    var topo = $(".topo"), ultimo = 0, barra = $(".progresso");
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      topo.classList.toggle("rolado", y > 20);
      topo.classList.toggle("escondido", y > 320 && y > ultimo + 4 && !$("#menu-cheio").classList.contains("aberto"));
      if (y < ultimo - 4) topo.classList.remove("escondido");
      ultimo = y;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.setProperty("--p", total > 0 ? (y / total).toFixed(4) : 0);
    }, { passive: true });
  }

  /* ------------------------------------------------------ cursor */
  function cursor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var c = $(".cursor"), rotulo = c.querySelector(".cursor-rotulo");
    var x = -100, y = -100, cx = -100, cy = -100, vivo = false;
    window.addEventListener("pointermove", function (e) {
      x = e.clientX; y = e.clientY;
      if (!vivo) { vivo = true; cx = x; cy = y; c.classList.add("ativo"); }
      var alvo = e.target.closest ? e.target.closest("[data-cursor]") : null;
      if (alvo) { c.classList.add("grande"); rotulo.textContent = alvo.dataset.cursor; }
      else c.classList.remove("grande");
    }, { passive: true });
    document.addEventListener("pointerleave", function () { c.classList.remove("ativo"); vivo = false; });
    (function passo() {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      c.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px)";
      requestAnimationFrame(passo);
    })();
  }

  /* ------------------------------------------------------ paleta */
  function normal(t) { return String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  PHB.normal = normal;
  function paleta() {
    var p = $(".paleta"), input = p.querySelector("input"), lista = p.querySelector(".paleta-lista");
    var itens = [], sel = 0, foco = null;
    input.placeholder = "Buscar em " + PHB.docs().length + " documentos, páginas e experimentos…";
    var paginas = PHB.NAV.map(function (n) { return { titulo: n.rotulo, caminho: "página", href: "#/" + n.rota, tipo: "página" }; })
      .concat(["001", "002", "003", "004", "005"].map(function (t) { return { titulo: "Experimento " + t, caminho: "página", href: "#/testes/" + t, tipo: "página" }; }));
    var docs = PHB.docs().map(function (d) { return { titulo: d.titulo, caminho: d.caminho, href: PHB.linkDoc(d.caminho), tipo: d.tipo, extra: d.sumario.map(function (s) { return s[2]; }).join(" ") }; });
    var todos = paginas.concat(docs);
    todos.forEach(function (i) { i._n = normal(i.titulo + " " + i.caminho + " " + i.tipo); i._x = normal(i.extra || ""); });

    function marcar(t, q) {
      if (!q) return PHB.esc(t);
      var nt = normal(t), k = nt.indexOf(q.split(" ")[0]);
      if (k < 0) return PHB.esc(t);
      var l = q.split(" ")[0].length;
      return PHB.esc(t.slice(0, k)) + "<mark>" + PHB.esc(t.slice(k, k + l)) + "</mark>" + PHB.esc(t.slice(k + l));
    }
    function filtrar() {
      var q = normal(input.value.trim());
      var termos = q.split(/\s+/).filter(Boolean);
      itens = todos.map(function (it) {
        if (!termos.length) return { it: it, p: it.tipo === "página" ? 2 : 0 };
        var ok = termos.every(function (t) { return it._n.indexOf(t) >= 0 || it._x.indexOf(t) >= 0; });
        if (!ok) return null;
        var p = termos.reduce(function (acc, t) { return acc + (normal(it.titulo).indexOf(t) >= 0 ? 3 : it._n.indexOf(t) >= 0 ? 2 : 1); }, 0);
        return { it: it, p: p + (it.tipo === "página" ? 0.5 : 0) };
      }).filter(Boolean).sort(function (a, b) { return b.p - a.p; }).slice(0, 40).map(function (x) { return x.it; });
      sel = 0;
      lista.innerHTML = "";
      if (!itens.length) { lista.appendChild(h("li", { class: "paleta-vazia" }, "Nada encontrado para “" + input.value + "”.")); return; }
      itens.forEach(function (it, i) {
        lista.appendChild(h("li", { role: "none" }, h("a", { href: it.href, role: "option", id: "op-" + i, "aria-selected": i === 0 ? "true" : "false" },
          h("span", { class: "tipo", "data-tipo": it.tipo }, it.tipo),
          h("span", { html: marcar(it.titulo, q) }),
          h("span", { class: "caminho" }, it.caminho))));
      });
      input.setAttribute("aria-activedescendant", "op-0");
    }
    function mover(d) {
      var ops = $$("[role=option]", lista);
      if (!ops.length) return;
      ops[sel].setAttribute("aria-selected", "false");
      sel = (sel + d + ops.length) % ops.length;
      ops[sel].setAttribute("aria-selected", "true");
      ops[sel].scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", ops[sel].id);
    }
    function abrir() {
      foco = document.activeElement;
      p.classList.add("aberta"); p.setAttribute("aria-hidden", "false");
      input.value = ""; filtrar();
      setTimeout(function () { input.focus(); }, 30);
    }
    function fechar() {
      p.classList.remove("aberta"); p.setAttribute("aria-hidden", "true");
      if (foco && foco.focus) foco.focus({ preventScroll: true });
    }
    PHB.abrirBusca = abrir;
    input.addEventListener("input", filtrar);
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); mover(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); mover(-1); }
      else if (e.key === "Enter") { var a = $$("[role=option]", lista)[sel]; if (a) { location.hash = a.getAttribute("href"); fechar(); } }
      else if (e.key === "Escape") fechar();
    });
    lista.addEventListener("click", function (e) { if (e.target.closest("a")) fechar(); });
    p.addEventListener("click", function (e) { if (e.target === p) fechar(); });
    document.addEventListener("keydown", function (e) {
      var digitando = /input|textarea|select/i.test(document.activeElement.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !digitando)) { e.preventDefault(); abrir(); }
      else if (e.key === "Escape" && p.classList.contains("aberta")) fechar();
      else if (e.key === "Escape") fecharMenu();
    });
  }

  /* ------------------------------------------------------- início */
  function iniciar() {
    main = $("#conteudo");
    construirNav();
    aplicarMovimento();
    aplicarTemaIcone();
    $("#botao-menu").appendChild(PHB.icone("menu"));
    $("#botao-busca").prepend(PHB.icone("busca"));
    $("#botao-movimento").appendChild(PHB.icone("onda"));

    $("#botao-tema").addEventListener("click", function () {
      var novo = temaAtual() === "dark" ? "light" : "dark";
      raiz.setAttribute("data-theme", novo);
      gravar("phb-tema", novo);
      aplicarTemaIcone();
      document.dispatchEvent(new CustomEvent("phb:tema"));
    });
    $("#botao-movimento").addEventListener("click", function () {
      gravar("phb-movimento", raiz.classList.contains("sem-movimento") ? "pleno" : "reduzido");
      aplicarMovimento();
      document.dispatchEvent(new CustomEvent("phb:movimento"));
    });
    mqMov.addEventListener && mqMov.addEventListener("change", aplicarMovimento);
    $("#botao-menu").addEventListener("click", alternarMenu);
    $("#botao-busca").addEventListener("click", function () { PHB.abrirBusca(); });
    $(".pular").addEventListener("click", function (e) { e.preventDefault(); main.focus(); main.scrollIntoView(); });

    // âncoras internas de documento: rolam sem trocar de página
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href^='#/']");
      if (!a) return;
      var destino = analisar(a.getAttribute("href"));
      if (atual && destino.caminho === atual.caminho && destino.ancora) {
        e.preventDefault();
        history.replaceState(null, "", a.getAttribute("href"));
        rolarAncora(destino.ancora, true);
      } else if (a.getAttribute("href") === location.hash) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: PHB.semMovimento() ? "auto" : "smooth" });
      }
    });

    cabecalho();
    cursor();
    paleta();
    window.addEventListener("hashchange", navegar);
    navegar();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
