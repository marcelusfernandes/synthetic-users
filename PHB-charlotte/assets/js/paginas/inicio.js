/* =========================================================================
   Visão geral — o overview de todo o resto.
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, s = PHB.s, C = PHB.comp;

  var MARCOS = [
    { quando: "jan/2026", titulo: "O artigo", texto: "Synthetic Users: de personas estáticas a comportamento emergente. Camadas RPG, OCEAN e observabilidade em três camadas.", rota: "#/fundacao", tag: "origem" },
    { quando: "v1 · Marcelo", titulo: "Um parâmetro, muito medo", texto: "Motorista carioca, digitalização 1/10. O OCEAN propaga dentro do LLM e o comportamento emerge do contexto.", rota: "#/doc/exemplos/marcelorj.mdc", tag: "instância" },
    { quando: "teste 002", titulo: "A ansiedade não antecipa a desistência", texto: "Muda como Marcelo desiste e o que sobra depois: histerese, pico-fim e 98.75% de rastreabilidade.", rota: "#/testes/002", tag: "experimento" },
    { quando: "v2 · Mariana", titulo: "16 parâmetros, trade-offs, ruptura", texto: "Uma influenciadora quiet luxury com antagonistas. Ainda com a matemática rodando dentro do prompt.", rota: "#/doc/exemplos/mariana.mdc", tag: "instância" },
    { quando: "teste 003", titulo: "O diagnóstico", texto: "A assimetria inverte com OCEAN espelhado, a desculpa aprofunda a frieza, os eixos colapsam (r = 0.96).", rota: "#/testes/003", tag: "experimento" },
    { quando: "teste 004", titulo: "Tirar a matemática do LLM", texto: "Motor determinístico, 11 critérios executáveis e busca em 3 estágios: 11/11 na mediana de 84 configs.", rota: "#/testes/004", tag: "experimento" },
    { quando: "teste 005", titulo: "O motor no circuito", texto: "Observador cego, MAE 1.14. A recusa do vídeo sai do estado — confiança 6.00 < 7.02 — e não da narrativa.", rota: "#/testes/005", tag: "experimento" },
    { quando: "M3 · produto", titulo: "Do laboratório à interface", texto: "Perfis, sessões, conversa e histórico em React/TypeScript/StyleX sobre o motor Python preservado.", rota: "#/produto", tag: "produto" }
  ];

  function tese() {
    return h("section", { class: "secao tese" },
      h("div", { class: "moldura" },
        h("p", { class: "olho", "data-revela": "" }, "A tese em uma linha"),
        h("h2", { class: "giga tese-frase", "data-dividir": "" },
          "O LLM ", h("span", { class: "llm-cor" }, "interpreta"), " e ", h("span", { class: "llm-cor" }, "narra"), ". O ", h("span", { class: "motor-cor" }, "motor"), " sente."),
        h("div", { class: "tese-corpo grade g-2" },
          h("p", { class: "lead", "data-revela": "", "--atraso": 200 },
            "Nas versões 1 e 2, as fórmulas rodavam dentro do prompt. Os testes mostraram deriva, colinearidade e um pedido de desculpas que ", h("em", { class: "voz" }, "esfriava"), " a relação. A v3 separa as mãos: quem calcula é código, quem escreve é linguagem."),
          h("p", { class: "mudo", "data-revela": "", "--atraso": 320 },
            "Cada animação deste site mostra números que o motor real calculou — os cenários do teste 004 e o replay do teste 005 rodam em ", h("code", null, "build.py"), ". O navegador só dá forma ao que já foi decidido.")),
        C.pipeline()));
  }

  function numeros() {
    var meta = window.PHB_INDICE.meta;
    var itens = [
      { v: 5, t: "experimentos pré-registrados, do teste-exemplo à validação com LLM", s: "001 → 005" },
      { v: meta.documentos, t: "documentos no acervo — protocolos, sessões, auditorias, relatórios, docs", s: "todos os outputs" },
      { v: Math.round(meta.palavras / 1000), suf: " mil", t: "palavras de explicação, execução e auditoria adversarial", s: "texto integral" },
      { v: 11, pre: "", suf: "/11", t: "critérios de aceitação na config ideal do motor v3", s: "teste 004" },
      { v: 98.75, casas: 2, suf: "%", t: "rastreabilidade causal dos braços PHB (roleplay estático: 0%)", s: "teste 002" },
      { v: 0.96, casas: 2, pre: "r = ", t: "correlação que provou o colapso de eixos da v2", s: "teste 003" },
      { v: 1.14, casas: 2, pre: "", t: "MAE do observador cego: uma mente difícil de ler", s: "teste 005" },
      { v: 117, t: "turnos de meia-vida da confiança; a irritação esfria em ~4", s: "força de retorno" }
    ];
    var grade = h("div", { class: "numeros" });
    itens.forEach(function (it, i) {
      grade.appendChild(h("div", { class: "numero", "data-revela": "", "--atraso": (i % 4) * 90 },
        h("small", null, it.s),
        h("b", { "data-conta": String(it.v), "data-casas": it.casas || 0, "data-prefixo": it.pre || "", "data-sufixo": it.suf || "" }, String(it.v)),
        h("span", null, it.t)));
    });
    return h("section", { class: "secao compacta" }, h("div", { class: "moldura" }, grade));
  }

  /* ---- jornada em rolagem horizontal presa ---- */
  function jornada() {
    var trilha = h("div", { class: "jh-trilha" });
    MARCOS.forEach(function (m, i) {
      trilha.appendChild(h("a", { class: "jh-cartao", href: m.rota, "data-cursor": "abrir", "--i": i },
        h("span", { class: "jh-num num" }, String(i + 1).padStart(2, "0")),
        h("span", { class: "pilula" }, m.tag),
        h("span", { class: "jh-quando motor-t" }, m.quando),
        h("span", { class: "jh-titulo" }, m.titulo),
        h("span", { class: "jh-texto" }, m.texto),
        h("span", { class: "jh-ir" }, "abrir ", PHB.icone("seta"))));
    });
    var progresso = h("span", { class: "jh-progresso" });
    var cab = h("div", { class: "moldura jh-cabeca" },
      h("p", { class: "olho" }, "A jornada"),
      h("h2", { class: "giga" }, "De personas a ", h("em", { class: "voz" }, "outras mentes"), "."),
      h("div", { class: "jh-regua" }, progresso));
    var fixo = h("div", { class: "jh-fixo" }, cab, h("div", { class: "jh-janela" }, trilha));
    var sec = h("section", { class: "jh", "aria-label": "Linha do tempo da pesquisa" }, fixo,
      h("div", { class: "moldura jh-rodape" }, h("a", { class: "botao fantasma", href: "#/jornada" }, "Ler a jornada completa", h("span", { class: "seta" }, PHB.icone("seta")))));
    function medir() {
      var horizontal = window.innerWidth > 760 && !PHB.semMovimento();
      sec.classList.toggle("horizontal", horizontal);
      if (!horizontal) { sec.style.height = ""; trilha.style.transform = ""; return; }
      var extra = Math.max(0, trilha.scrollWidth - trilha.parentNode.clientWidth);
      sec.style.height = (window.innerHeight + extra) + "px";
      sec._extra = extra;
    }
    PHB.aoRedimensionar(trilha.parentNode, medir);
    PHB.ouvir(document, "phb:movimento", medir);
    PHB.aoRolar(function () {
      if (!sec.classList.contains("horizontal")) return;
      var r = sec.getBoundingClientRect();
      var total = sec.offsetHeight - window.innerHeight;
      var p = PHB.clamp(-r.top / (total || 1), 0, 1);
      trilha.style.transform = "translate3d(" + (-p * (sec._extra || 0)).toFixed(1) + "px,0,0)";
      progresso.style.transform = "scaleX(" + p.toFixed(4) + ")";
      sec.style.setProperty("--p", p.toFixed(3));
    });
    return sec;
  }

  /* ---- os cinco experimentos ---- */
  function visualMini(id) {
    var caixa = h("div", { class: "exp-visual" });
    var t002 = window.PHB_SERIES.t002, mot = window.PHB_MOTOR;
    if (id === "001") {
      var passos = ["home", "categoria", "produto", "pop-up", "conta"];
      caixa.appendChild(h("div", { class: "storyboard" }, passos.map(function (p, i) {
        return h("span", { class: "quadro" + (i === 0 ? " feito" : ""), "--i": i }, h("i", null, "T" + (i + 1)), p);
      })));
    } else if (id === "002") {
      PHB.grafico.mini(caixa, { valores: t002.B2.slice(0, 6).map(function (t) { return t.n; }), cor: "var(--coral)", min: 6, max: 10.2 });
    } else if (id === "003") {
      var barras = [["base", 0.48], ["espelhada", 3.6]];
      caixa.appendChild(h("div", { class: "inversao" }, barras.map(function (b, i) {
        return h("span", { class: "inv-barra", "--v": Math.min(1, b[1] / 3.6), "--i": i }, h("i", null, b[0]), h("b", { class: "num" }, b[1].toFixed(2)));
      })));
    } else if (id === "004") {
      var crit = Object.keys(mot.criterios).filter(function (k) { return k[0] === "C"; });
      caixa.appendChild(h("div", { class: "checks" }, crit.map(function (k, i) {
        return h("span", { class: "check", "--i": i, title: k }, k.split("_")[0]);
      })));
    } else if (id === "005") {
      PHB.grafico.mini(caixa, { valores: mot.replay005.map(function (sn) { return sn.r[1]; }).concat([mot.replay005[5].r[1]]), cor: "var(--e-confianca)", min: 4.8, max: 7.4 });
      caixa.appendChild(h("span", { class: "limiar-mini" }, "7.02"));
    }
    return caixa;
  }
  function experimentos() {
    var grade = h("div", { class: "exp-grade" });
    PHB.EXPERIMENTOS.forEach(function (e, i) {
      var docs = PHB.docsDoTeste(e.id);
      grade.appendChild(h("a", { class: "cartao cartao-link exp-cartao inclinavel", href: "#/testes/" + e.id, "data-revela": "", "--atraso": i * 90, "--cor": e.cor, "data-cursor": "abrir" },
        h("span", { class: "brilho" }),
        h("div", { class: "exp-topo" }, h("span", { class: "exp-id num" }, e.id), h("span", { class: "pilula " + (e.status === "concluído" ? "ok" : "parcial") }, h("span", { class: "ponto" }), e.status)),
        h("h3", null, e.titulo),
        h("p", { class: "mudo exp-pergunta" }, e.pergunta),
        visualMini(e.id),
        h("div", { class: "exp-manchete" }, h("b", null, e.manchete), h("span", null, e.rotulo)),
        h("div", { class: "exp-rodape motor-t" }, e.instancia + " · " + docs.length + " outputs")));
    });
    return C.secao({ olho: "Experimentos", titulo: "Cinco testes, cada um com <em class=\"voz\">duas</em> perguntas.",
      lead: "Uma pergunta de pesquisa sobre o produto e uma pergunta metodológica sobre a própria simulação. Protocolo pré-registrado, execução turno a turno, auditoria adversarial, relatório." }, grade);
  }

  /* ---- princípios de movimento ---- */
  function principios() {
    var cfg = window.PHB_MOTOR.config, ret = window.PHB_MOTOR.retorno;
    var razao = cfg.neg_scale / cfg.pos_scale;

    // 1. assimetria
    var demo1 = h("button", { class: "demo-assimetria", type: "button", "aria-label": "Passe o cursor ou foque para construir; saia para destruir" },
      h("span", { class: "da-enche" }), h("span", { class: "da-texto" }, "construir ", h("b", null, "620 ms"), " · destruir ", h("b", null, "260 ms")));
    // 2. meia-vida por canal
    var pontos = h("div", { class: "demo-meiavida" });
    var ordem = ["irritacao", "vigilancia", "warmth", "respeito", "confianca"];
    ordem.forEach(function (a) {
      var mv = ret[a].meia_vida;
      pontos.appendChild(h("div", { class: "mv-linha", "--c": PHB.mente.CORES[a], "--d": Math.min(14000, mv * 110) + "ms" },
        h("span", { class: "mv-nome" }, PHB.mente.NOMES[a]),
        h("span", { class: "mv-trilho" }, h("i", { class: "mv-ponto" })),
        h("span", { class: "mv-num num" }, mv.toFixed(1) + " t")));
    });
    var perturbar = h("button", { class: "botao pequeno", type: "button" }, "Perturbar o estado");
    perturbar.addEventListener("click", function () {
      pontos.classList.remove("perturbado", "voltando");
      void pontos.offsetWidth;
      pontos.classList.add("perturbado");
      setTimeout(function () { pontos.classList.add("voltando"); pontos.classList.remove("perturbado"); }, 380);
    });
    // 3. histerese com o cenário real de ruptura e recuperação
    var cen = window.PHB_MOTOR.cenarios.filter(function (c) { return c.chave === "recuperacao"; })[0].base.slice(0, 24);
    var hist = h("div", { class: "demo-histerese" });
    var estadoRup = h("span", { class: "hs-estado" });
    var faixa = h("input", { type: "range", min: 1, max: cen.length, value: 1, "aria-label": "turno do cenário de ruptura e recuperação" });
    var info = h("span", { class: "hs-info num" });
    var graf = h("div", { class: "hs-grafico" });
    hist.appendChild(graf);
    hist.appendChild(h("div", { class: "fila hs-controles" }, faixa, info, estadoRup));
    var g = PHB.grafico.linhas(graf, {
      altura: 190, margem: { e: 30, d: 8, t: 10, b: 24 },
      series: [{ nome: "irritação", cor: "var(--e-irritacao)", valores: cen.map(function (x) { return x.r[3]; }) },
               { nome: "confiança", cor: "var(--e-confianca)", valores: cen.map(function (x) { return x.r[1]; }) }],
      x: { n: cen.length, rotulo: function (i) { return "T" + (i + 1); } },
      y: { min: 0, max: 10, ticks: [0, 5, 10] },
      limiares: [{ y: cfg.rupt_confianca_out, rotulo: "sai: confiança ≥ " + cfg.rupt_confianca_out.toFixed(1), cor: "var(--e-confianca)" },
                 { y: cfg.rupt_confianca_in, rotulo: "entra: confiança ≤ " + cfg.rupt_confianca_in.toFixed(1), cor: "var(--e-irritacao)" }],
      faixas: (function () { var a = -1, b = -1; cen.forEach(function (x, i) { if (x.u) { if (a < 0) a = i; b = i; } }); return a >= 0 ? [{ de: a, ate: b, rotulo: "ruptura" }] : []; })()
    });
    function marcar(i) {
      var sn = cen[i];
      g.marcar(i);
      faixa.style.setProperty("--pct", (i / (cen.length - 1)) * 100 + "%");
      info.textContent = "T" + (i + 1) + " · irritação " + sn.r[3].toFixed(2) + " · confiança " + sn.r[1].toFixed(2);
      estadoRup.textContent = sn.u ? "em ruptura" : "fora";
      estadoRup.classList.toggle("ligado", !!sn.u);
    }
    faixa.addEventListener("input", function () { marcar(+faixa.value - 1); });
    marcar(0);
    // 4. opacidade
    var lente = h("div", { class: "demo-opacidade", tabindex: "0", "data-cursor": "ler" },
      h("p", { class: "do-superficie voz" }, "“Bastidor de verdade é tipo a casa da minha mãe: tem gente que entra, mas ninguém entra na primeira visita.”"),
      h("div", { class: "do-interior motor-t", "aria-hidden": "true" },
        h("span", null, "turno 4 · pedido_intimo 0.7"), h("span", null, "confiança 6.00 < 7.02"), h("span", null, "vigilância 2.30 → 2.67"),
        h("span", null, "exposição íntima 2.00 (imóvel)"), h("span", null, "warmth 7.06"), h("span", null, "consentimento: fechado")));
    PHB.ouvir(lente, "pointermove", function (e) {
      var r = lente.getBoundingClientRect();
      lente.style.setProperty("--x", (e.clientX - r.left) + "px");
      lente.style.setProperty("--y", (e.clientY - r.top) + "px");
    });

    var itens = [
      { n: "01", t: "Construir é lento. Destruir, " + razao.toFixed(1) + "× mais rápido.", p: "A razão entre neg_scale (2.70) e pos_scale (1.13) do motor vira a curva de todo hover do site: preencher leva 620 ms, esvaziar leva 260 ms.", demo: demo1 },
      { n: "02", t: "Cada canal volta na sua velocidade.", p: "Força de retorno por eixo: a irritação esfria em ~4 turnos, a confiança em ~117. Aqui, 1 turno = 110 ms. Perturbe e observe quem volta primeiro.", demo: h("div", { class: "pilha" }, pontos, perturbar) },
      { n: "03", t: "Entrar não é o mesmo que sair.", p: "Histerese de ruptura: o latch liga quando a confiança cai a 1.5 (ou a irritação passa de 8.25) e só desliga com a confiança de volta a 3.0 e a irritação abaixo de 6.45. Arraste pelos turnos do cenário real do teste 004: 14 turnos no vale.", demo: hist },
      { n: "04", t: "A superfície não é o estado.", p: "Passe o cursor pela fala: por baixo dela está o que o observador cego nunca viu. A lente é o painel que só o experimentador tem.", demo: lente }
    ];
    var grade = h("div", { class: "principios" });
    itens.forEach(function (it, i) {
      grade.appendChild(h("article", { class: "cartao principio", "data-revela": "", "--atraso": (i % 2) * 120 },
        h("span", { class: "principio-n num" }, it.n),
        h("h3", null, it.t),
        h("p", { class: "mudo" }, it.p),
        h("div", { class: "principio-demo" }, it.demo)));
    });
    return C.secao({ olho: "Princípios de movimento", titulo: "O movimento é o dado.",
      lead: "Este case trata animação como instrumento de leitura. Cada easing, duração e limiar vem de uma constante calibrada do motor — a interface se comporta como a mente que descreve." , classe: "secao-principios" }, grade);
  }

  function explorar() {
    var cartoes = [
      { r: "#/motor", t: "O motor v3", d: "Pipeline, as 7 etapas de step(), 13 eventos, 31 hiperparâmetros e suas tolerâncias.", k: "motor" },
      { r: "#/laboratorio", t: "Laboratório", d: "Reproduza os 9 cenários do teste 004 turno a turno — base e OCEAN espelhado.", k: "lab" },
      { r: "#/jornada", t: "A jornada", d: "Do “sonho” da IA ao problema de outras mentes como aparato de bancada.", k: "jornada" },
      { r: "#/fundacao", t: "Fundação v1/v2", d: "Camadas RPG, 7 arquétipos, padrões de compra, modificadores, dual class e canon.", k: "fundacao" },
      { r: "#/produto", t: "Do laboratório ao produto", d: "O core M3: jornada, contrato HTTP, validação e QA independente.", k: "produto" },
      { r: "#/arquivo", t: "Arquivo completo", d: window.PHB_INDICE.meta.documentos + " documentos com busca, filtros e leitura integral de cada output.", k: "arquivo" }
    ];
    var grade = h("div", { class: "grade g-3" });
    cartoes.forEach(function (c, i) {
      grade.appendChild(h("a", { class: "cartao cartao-link explorar inclinavel", href: c.r, "data-revela": "", "--atraso": (i % 3) * 90, "data-cursor": "ir", "data-k": c.k },
        h("span", { class: "brilho" }),
        h("span", { class: "explorar-forma", "aria-hidden": "true" }, h("i"), h("i"), h("i")),
        h("h3", null, c.t), h("p", { class: "mudo" }, c.d),
        h("span", { class: "explorar-ir" }, PHB.icone("seta"))));
    });
    return C.secao({ olho: "Explorar", titulo: "Tudo o que existe, <em class=\"voz\">em movimento</em>." }, grade);
  }

  function fecho() {
    return h("section", { class: "secao fecho" },
      h("div", { class: "moldura" },
        h("blockquote", { class: "fecho-citacao" },
          h("p", { class: "voz", "data-dividir": "" }, "Quanto do interior dessa IA é recuperável da superfície por um observador paciente e sem mapa?"),
          h("cite", { class: "olho", "data-revela": "", "--atraso": 600 }, "A pergunta que fecha o documento norte e abre a próxima fase")),
        h("div", { class: "fila", "data-revela": "", "--atraso": 800 },
          h("a", { class: "botao", href: "#/testes/005", "data-magnetico": "0.25" }, "Seja o observador cego", h("span", { class: "seta" }, PHB.icone("seta"))),
          h("a", { class: "botao fantasma", href: "#/doc/docs/opacidade-entre-mentes.md" }, "Ler o documento norte"))));
  }

  PHB.paginas.inicio = {
    render: function (el) {
      el.classList.add("sem-topo");
      PHB.mente.heroi(el);
      el.appendChild(tese());
      el.appendChild(numeros());
      el.appendChild(jornada());
      el.appendChild(experimentos());
      el.appendChild(principios());
      el.appendChild(explorar());
      el.appendChild(fecho());
      return "";
    }
  };
})();
