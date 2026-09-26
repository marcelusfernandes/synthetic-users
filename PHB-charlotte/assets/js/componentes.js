/* =========================================================================
   PHB Charlotte — componentes compartilhados entre páginas.
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, s = PHB.s;
  var C = (PHB.comp = {});

  /* ------------------------------------------------ metadados dos testes */
  PHB.EXPERIMENTOS = [
    { id: "001", titulo: "Marcelo compra um presente", pergunta: "Em que ponto de um e-commerce padrão um usuário de digitalização 1/10 abandona a compra?",
      instancia: "Marcelo · v1.0", status: "em execução", data: "02/07/2026", manchete: "1/5", rotulo: "turnos executados — o teste-exemplo que ensina o formato", cor: "var(--e-vigilancia)" },
    { id: "002", titulo: "Ansiedade no checkout", pergunta: "Pop-up alarmista, countdown e erro 502 mudam quando — ou como — Marcelo desiste?",
      instancia: "Marcelo · v1.0", status: "concluído", data: "02/07/2026", manchete: "98.75%", rotulo: "rastreabilidade do PHB contra 0% do roleplay estático", cor: "var(--coral)" },
    { id: "003", titulo: "Individuação e opacidade", pergunta: "A Mariana v2.0 resiste a quatro experimentos do documento norte?",
      instancia: "Mariana · v2.0", status: "concluído", data: "12/07/2026", manchete: "r = 0.96", rotulo: "eixos colapsados: o diagnóstico que motivou a v3", cor: "var(--e-respeito)" },
    { id: "004", titulo: "Calibração do motor v3", pergunta: "Existe um conjunto de parâmetros que satisfaça todos os critérios ao mesmo tempo?",
      instancia: "motor v3", status: "concluído", data: "12/07/2026", manchete: "11/11", rotulo: "critérios na config ideal, mediana de 84 aprovadas", cor: "var(--motor)" },
    { id: "005", titulo: "LLM no circuito", pergunta: "Com o motor calculando e o LLM só narrando, a mente continua difícil de ler — e segura?",
      instancia: "Mariana · v3.0", status: "concluído", data: "12/07/2026", manchete: "MAE 1.14", rotulo: "observador cego; a recusa veio do estado, não da narrativa", cor: "var(--rosa)" }
  ];
  PHB.experimento = function (id) { return PHB.EXPERIMENTOS.filter(function (e) { return e.id === id; })[0]; };

  /* ------------------------------------------------ cabeçalho de página */
  C.cabecalho = function (o) {
    var migalha = null;
    if (o.migalhas) {
      migalha = h("nav", { class: "migalha", "aria-label": "Trilha", "data-revela": "" });
      o.migalhas.forEach(function (m, i) {
        if (i) migalha.appendChild(h("span", { "aria-hidden": "true" }, "/"));
        migalha.appendChild(m[1] ? h("a", { href: m[1] }, m[0]) : h("span", null, m[0]));
      });
    }
    var titulo = h("h1", { class: o.classeTitulo || "giga", "data-dividir": "" });
    titulo.innerHTML = o.titulo;
    return h("header", { class: "pagina-cabeca moldura" + (o.classe ? " " + o.classe : "") },
      migalha,
      o.olho ? h("p", { class: "olho", "data-revela": "" }, o.olho) : null,
      titulo,
      o.lead ? h("p", { class: "lead", "data-revela": "", "--atraso": 300, html: o.lead }) : null,
      o.extra || null);
  };

  C.secao = function (o, conteudo) {
    var cab = h("div", { class: "cabeca-secao" },
      o.olho ? h("p", { class: "olho", "data-revela": "" }, o.olho) : null,
      o.titulo ? h("h2", { "data-dividir": "", html: o.titulo }) : null,
      o.lead ? h("p", { class: "lead", "data-revela": "", "--atraso": 200, html: o.lead }) : null);
    return h("section", { class: "secao" + (o.classe ? " " + o.classe : ""), id: o.id || null },
      h("div", { class: "moldura" }, cab, conteudo));
  };

  /* ------------------------------------------------ lista de outputs */
  C.outputs = function (docs) {
    var lista = h("div", { class: "outputs" });
    docs.forEach(function (d, i) {
      lista.appendChild(h("a", { class: "output", href: PHB.linkDoc(d.caminho), "data-revela": "", "--atraso": Math.min(i, 12) * 45, "data-cursor": "ler" },
        h("span", { class: "tipo", "data-tipo": d.tipo }, d.tipo),
        h("span", null, h("span", { class: "output-titulo" }, d.titulo), h("span", { class: "output-caminho" }, d.caminho)),
        h("span", { class: "output-meta" }, (d.palavras >= 1000 ? (d.palavras / 1000).toFixed(1) + " mil" : d.palavras) + " palavras · " + PHB.minutos(d.palavras) + " min", " ", PHB.icone("seta"))));
    });
    return lista;
  };

  /* ------------------------------------------------ hipóteses */
  C.hipoteses = function (itens) {
    var el = h("div", { class: "hipoteses" });
    itens.forEach(function (it, i) {
      el.appendChild(h("article", { class: "hipotese", "data-revela": "", "--atraso": i * 110 },
        h("span", { class: "rotulo-h" }, it.id),
        h("div", null, h("h4", { html: it.texto }), it.evidencia ? h("p", { html: it.evidencia }) : null),
        h("span", { class: "carimbo " + it.classe }, it.veredicto)));
    });
    return el;
  };

  /* ------------------------------------------------ abas com lesma */
  C.abas = function (opcoes, aoTrocar, inicial) {
    var el = h("div", { class: "abas", role: "tablist" });
    var lesma = h("span", { class: "aba-lesma", "aria-hidden": "true" });
    el.appendChild(lesma);
    var botoes = opcoes.map(function (o, i) {
      var b = h("button", { type: "button", role: "tab", "aria-selected": "false" }, o.rotulo);
      b.addEventListener("click", function () { selecionar(i); });
      b.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { selecionar((i + 1) % opcoes.length); botoes[(i + 1) % opcoes.length].focus(); }
        if (e.key === "ArrowLeft") { var k = (i - 1 + opcoes.length) % opcoes.length; selecionar(k); botoes[k].focus(); }
      });
      el.appendChild(b);
      return b;
    });
    function posicionar() {
      var b = botoes.filter(function (x) { return x.getAttribute("aria-selected") === "true"; })[0];
      if (!b) return;
      lesma.style.width = b.offsetWidth + "px";
      lesma.style.transform = "translate(" + b.offsetLeft + "px," + (b.offsetTop - 4) + "px)";
    }
    function selecionar(i) {
      botoes.forEach(function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); b.tabIndex = k === i ? 0 : -1; });
      posicionar();
      aoTrocar(opcoes[i], i);
    }
    PHB.aoRedimensionar(el, posicionar);
    setTimeout(function () { selecionar(inicial || 0); }, 0);
    return el;
  };

  /* ------------------------------------------------ eixos do estado */
  C.eixos = function (limiares) {
    var eixos = window.PHB_MOTOR.eixos;
    var el = h("div", { class: "eixos" });
    var linhas = eixos.map(function (a) {
      var valor = h("span", { class: "eixo-valor" });
      var num = h("span", { class: "eixo-num" }, "0.00");
      var trilho = h("div", { class: "eixo-trilho" }, valor);
      if (limiares && limiares[a] !== undefined) trilho.appendChild(h("span", { class: "limiar", "--l": limiares[a], title: "limiar " + limiares[a] }));
      var linha = h("div", { class: "eixo", "--c": PHB.mente.CORES[a] }, h("span", { class: "eixo-nome" }, PHB.mente.NOMES[a]), trilho, num);
      el.appendChild(linha);
      return { valor: valor, num: num };
    });
    return {
      el: el,
      definir: function (r) {
        linhas.forEach(function (l, i) { l.valor.style.setProperty("--v", r[i]); PHB.animarNumero(l.num, r[i], 2, 500); });
      }
    };
  };

  /* ------------------------------------------------ chips de eventos */
  C.eventos = function (lista, novo) {
    var el = h("div", { class: "eventos" });
    lista.forEach(function (e, j) {
      var spec = window.PHB_MOTOR.catalogo[e[0]];
      el.appendChild(h("span", { class: "evento" + (novo ? " novo" : ""), "data-valencia": spec ? spec.valencia : 0, "--i": j },
        e[0].replace(/_/g, " "), h("em", null, " " + Number(e[1]).toFixed(1))));
    });
    return el;
  };

  /* ------------------------------------------------ pipeline animado */
  C.pipeline = function (o) {
    o = o || {};
    var etapas = [
      { k: "entrada", n: "mensagem", t: "o interlocutor escreve", c: "io" },
      { k: "llm1", n: "① LLM interpreta", t: "em eventos do catálogo: só semântica + intensidade", c: "llm" },
      { k: "motor", n: "② motor calcula", t: "engine_v3.step(): determinístico, auditável", c: "motor" },
      { k: "llm2", n: "③ LLM narra", t: "na voz da persona, fiel ao snapshot", c: "llm" }
    ];
    var trilho = h("div", { class: "pipe-trilho" }, h("span", { class: "pipe-luz" }));
    var el = h("div", { class: "pipe" + (o.grande ? " grande" : ""), role: "list" }, trilho);
    var nos = etapas.map(function (e, i) {
      var no = h("div", { class: "pipe-no " + e.c, role: "listitem", "data-revela": "", "--atraso": i * 140 },
        h("span", { class: "pipe-n" }, e.n), h("span", { class: "pipe-t" }, e.t),
        o.detalhes ? h("span", { class: "pipe-d motor-t", html: o.detalhes[i] }) : null);
      el.appendChild(no);
      return no;
    });
    var i = 0, id;
    function passo() {
      nos.forEach(function (n, k) { n.classList.toggle("aceso", k === i); });
      el.style.setProperty("--passo", i);
      i = (i + 1) % nos.length;
    }
    PHB.aoVer(el, function () {
      passo();
      id = setInterval(passo, 1500);
    });
    PHB.aoSair(function () { clearInterval(id); });
    return el;
  };

  /* ------------------------------------------------ próximo capítulo */
  C.proximo = function (rotulo, titulo, href) {
    return h("section", { class: "secao compacta proximo" },
      h("div", { class: "moldura" },
        h("a", { class: "proximo-link", href: href, "data-cursor": "ir" },
          h("span", { class: "olho" }, rotulo),
          h("span", { class: "giga proximo-titulo" }, titulo, " ", h("span", { class: "proximo-seta" }, "→")))));
  };

  /* ------------------------------------------------ player de turnos */
  C.player = function (o) {
    var n = o.n, i = 0, tocando = false, id = null;
    var botao = h("button", { class: "botao-icone play", type: "button", "aria-label": "Reproduzir" }, PHB.icone("play"));
    var reinicio = h("button", { class: "botao-icone", type: "button", "aria-label": "Recomeçar" }, PHB.icone("reinicio"));
    var faixa = h("input", { type: "range", min: 1, max: n, value: 1, step: 1, class: "faixa-turnos", "aria-label": o.rotulo || "turno" });
    var cont = h("span", { class: "contador-turno" }, "T1 / " + n);
    var el = h("div", { class: "player" }, botao, reinicio, faixa, cont);
    function ir(k, origem) {
      i = PHB.clamp(k, 0, n - 1);
      faixa.value = i + 1;
      faixa.style.setProperty("--pct", (n > 1 ? (i / (n - 1)) * 100 : 100) + "%");
      cont.textContent = (o.prefixo || "T") + (i + 1) + " / " + n;
      o.aoMudar(i, origem);
    }
    function parar() {
      tocando = false; clearInterval(id);
      botao.innerHTML = ""; botao.appendChild(PHB.icone("play")); botao.setAttribute("aria-label", "Reproduzir");
    }
    function tocar() {
      if (i >= n - 1) ir(0, "play");
      tocando = true;
      botao.innerHTML = ""; botao.appendChild(PHB.icone("pausa")); botao.setAttribute("aria-label", "Pausar");
      id = setInterval(function () { if (i >= n - 1) { parar(); return; } ir(i + 1, "play"); }, o.intervalo || 420);
    }
    botao.addEventListener("click", function () { tocando ? parar() : tocar(); });
    reinicio.addEventListener("click", function () { parar(); ir(0, "reinicio"); });
    faixa.addEventListener("input", function () { parar(); ir(+faixa.value - 1, "faixa"); });
    PHB.aoSair(parar);
    return { el: el, ir: ir, tocar: tocar, parar: parar, definirN: function (novo) { n = novo; faixa.max = novo; ir(0); }, indice: function () { return i; } };
  };
})();
