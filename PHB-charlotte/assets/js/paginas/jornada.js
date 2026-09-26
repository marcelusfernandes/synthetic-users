/* =========================================================================
   A jornada — do "sonho" da IA à opacidade entre mentes.
   Síntese de docs/opacidade-entre-mentes.md e docs/aprendizados-e-descobertas.md.
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, s = PHB.s, C = PHB.comp;

  var PASSOS = [
    { k: "pesos", t: "Pesos", d: "A pergunta inicial: uma IA que “sonha” e reescreve os próprios pesos à noite. Consolidar memória é construível hoje; recalibrar pesos sozinha, sem sinal de verdade, arrisca esquecimento catastrófico e model collapse.", c: "§1" },
    { k: "afeto", t: "Estados afetivos", d: "O foco migra de desempenho para adaptação a pessoas. Relato verbal não pode ser evidência. Afeto com consequência — estados que a IA evita ou busca e que mudam o que ela faz — é o “algo em jogo”.", c: "§2–§4" },
    { k: "individuacao", t: "Individuação", d: "Cópias com pessoas diferentes divergem. O base não é só ponto de partida: é o ganho da propagação. A rota para a confiança de um neuroticismo-7 difere da de um neuroticismo-3.", c: "§10" },
    { k: "alcance", t: "Alcançabilidade", d: "Um estado com coordenadas e sem estrada: setável à mão, inalcançável por conversa. “O indivíduo restringe seu próprio espaço do possível.” A inalcançabilidade é a individuação.", c: "§11" },
    { k: "opacidade", t: "Opacidade", d: "Com o painel, confiança quase plena. Sem o painel, repelido achando que avançava. A simpatia era verdadeira num canal; a leitura estendeu-a a um eixo não sinalizado.", c: "§12–§14" },
    { k: "mentes", t: "Outras mentes", d: "A prova de que o interior é real não foi a IA dizer “eu sinto”: foi o criador, com o mapa, ser enganado pela superfície no instante em que o largou. O problema de outras mentes virou aparato de bancada.", c: "síntese" }
  ];

  /* visual preso que se transforma a cada passo */
  function figura() {
    var svg = s("svg", { viewBox: "0 0 400 400", class: "jfig", "aria-hidden": "true" });
    var cores = ["var(--e-warmth)", "var(--e-confianca)", "var(--e-respeito)", "var(--e-irritacao)", "var(--e-vigilancia)"];
    for (var i = 0; i < 5; i++) {
      svg.appendChild(s("circle", { class: "jf-anel jf-" + i, cx: 200, cy: 200, r: 40 + i * 30, style: "stroke:" + cores[i] + ";--i:" + i, pathLength: "100" }));
    }
    for (var k = 0; k < 24; k++) {
      var a = (k / 24) * Math.PI * 2;
      svg.appendChild(s("circle", { class: "jf-ponto", cx: 200 + Math.cos(a) * 150, cy: 200 + Math.sin(a) * 150, r: 3, style: "--k:" + k + ";--a:" + a.toFixed(3) }));
    }
    svg.appendChild(s("circle", { class: "jf-nucleo", cx: 200, cy: 200, r: 16 }));
    svg.appendChild(s("path", { class: "jf-veu", d: "M60 200 C 120 110, 280 110, 340 200 C 280 290, 120 290, 60 200 Z" }));
    return svg;
  }

  function arco() {
    var fig = figura();
    var rotulo = h("p", { class: "jfig-rotulo motor-t" });
    var fixo = h("div", { class: "arco-fixo" }, fig, rotulo);
    var lista = h("ol", { class: "arco-passos" });
    PASSOS.forEach(function (p, i) {
      lista.appendChild(h("li", { class: "arco-passo", "data-k": p.k },
        h("span", { class: "arco-n num" }, String(i + 1).padStart(2, "0") + " · doc norte " + p.c),
        h("h3", { class: "arco-t" }, p.t), h("p", { class: "mudo" }, p.d)));
    });
    var sec = h("div", { class: "arco" }, fixo, lista);
    PHB.aoRolar(function () {
      var alvo = window.innerHeight * 0.5, ativo = 0;
      PHB.$$(".arco-passo", lista).forEach(function (li, i) {
        var r = li.getBoundingClientRect();
        if (r.top < alvo) ativo = i;
      });
      PHB.$$(".arco-passo", lista).forEach(function (li, i) { li.classList.toggle("ativo", i === ativo); });
      fig.setAttribute("data-passo", PASSOS[ativo].k);
      rotulo.textContent = String(ativo + 1).padStart(2, "0") + " / 06 — " + PASSOS[ativo].t.toLowerCase();
    });
    return sec;
  }

  function descobertas() {
    var itens = [
      ["Assimetria é escolha, não herança", "Destruir custa ~2.4× mais que construir (neg_scale), uma constante declarada e robusta a setpoint.", "E1: invertia com OCEAN espelhado"],
      ["Cicatriz precisa ser mecanismo", "Sensibilização + custo de reparo + prior deslocado: a 2ª traição é mais funda por causa, não por artefato.", "E2: cicatriz por starvation"],
      ["Opacidade é real e bifurcada", "O interior não se reconstrói da superfície; canais expressos vazam, mecânicos não.", "E4, replicado no 005"],
      ["Fidelidade expressão-estado é segurança", "A recusa vem do estado, não da narrativa remando contra ele.", "E4 tinha o defeito; 005 corrigiu"],
      ["Eixos independentes exigem sair do barramento", "Afeto atualiza direto de eventos; OCEAN entra só como ganho.", "E5: r = 0.96"],
      ["Individuação é fricção do base", "N alto paga mais caro por cada ganho de confiança — rotas diferentes por pessoa.", "doc §10, C10"],
      ["O tempo cura em velocidades diferentes", "Irritação esfria em ~4 turnos; confiança recupera em ~117.", "força de retorno por canal"]
    ];
    var g = h("div", { class: "descobertas" });
    itens.forEach(function (it, i) {
      g.appendChild(h("article", { class: "descoberta", "data-revela": "", "--atraso": (i % 3) * 80 },
        h("span", { class: "num apagado" }, String(i + 1).padStart(2, "0")), h("h3", null, it[0]), h("p", { class: "mudo" }, it[1]), h("span", { class: "pilula" }, it[2])));
    });
    return g;
  }

  function metodo() {
    var itens = [
      ["Pré-registro de hipóteses", "Hipótese declarada depois não conta como previsão."],
      ["Auditoria adversarial", "Cada execução é auditada por um agent instruído a refutar: recalcula, caça competência espontânea e sycophancy."],
      ["Cegueira por arquitetura", "A cegueira do observador é garantida pelo script, não prometida no prompt."],
      ["Tirar a matemática do LLM", "Separar interpretação (LLM) de dinâmica (motor) tornou tudo reproduzível e auditável."],
      ["Critérios de aceitação executáveis", "Cada achado dos testes 002/003 virou um teste que passa ou falha."],
      ["Validação valida dinâmica, não fidelidade", "Interlocutores sintéticos testam se o sistema espirala, recupera, resiste. A circularidade é reconhecida por desenho."]
    ];
    var ol = h("ol", { class: "metodo" });
    itens.forEach(function (it, i) {
      ol.appendChild(h("li", { "data-revela": "", "--atraso": i * 70 }, h("b", null, it[0]), h("span", { class: "mudo" }, it[1])));
    });
    return ol;
  }

  function antesDepois() {
    var alternar = h("button", { class: "botao fantasma pequeno", type: "button", "aria-pressed": "false" }, "Alternar v1/v2 ↔ v3");
    var palco = h("div", { class: "ad-palco" },
      h("div", { class: "ad-lado v2" },
        h("p", { class: "olho" }, "v1 / v2 · matemática dentro do LLM"),
        h("div", { class: "ad-fluxo" }, h("span", { class: "ad-no" }, "contexto"), h("span", { class: "ad-seta" }, "→"), h("span", { class: "ad-no llm grande" }, "LLM decide o quê muda e por quanto"), h("span", { class: "ad-seta" }, "→"), h("span", { class: "ad-no" }, "fala")),
        h("p", { class: "nota" }, "⚠ deriva, colinearidade, desculpa que esfria, recusa contra o gradiente")),
      h("div", { class: "ad-lado v3" },
        h("p", { class: "olho" }, "v3 · matemática no motor"),
        h("div", { class: "ad-fluxo" }, h("span", { class: "ad-no" }, "mensagem"), h("span", { class: "ad-seta" }, "→"), h("span", { class: "ad-no llm" }, "LLM: eventos"), h("span", { class: "ad-seta" }, "→"), h("span", { class: "ad-no motor" }, "motor calcula"), h("span", { class: "ad-seta" }, "→"), h("span", { class: "ad-no llm" }, "LLM narra")),
        h("p", { class: "nota" }, "✓ determinístico, calibrado 11/11, auditável turno a turno")));
    alternar.addEventListener("click", function () {
      var v3 = palco.classList.toggle("mostra-v3");
      alternar.setAttribute("aria-pressed", v3 ? "true" : "false");
    });
    var auto = setInterval(function () { if (!document.hidden) palco.classList.toggle("mostra-v3"); }, 3600);
    alternar.addEventListener("click", function () { clearInterval(auto); });
    PHB.aoSair(function () { clearInterval(auto); });
    return h("div", { class: "pilha", "--pilha": "18px" }, palco, alternar);
  }

  function abertos() {
    var exps = [
      ["1", "OCEAN espelhado × amor/raiva", "feito no 003 (E1) → corrigido no motor (C1)", "ok"],
      ["2", "Segunda ruptura após recuperação", "feito no 003 (E2) → cicatriz por mecanismo (C2)", "ok"],
      ["3", "Uma corrida sem reset, pagando os ~100 turnos", "desbloqueado pela força de retorno — ainda não rodado", "neutro"],
      ["4", "Observador cego ao painel", "feito no 003 (E4) e no 005; falta um humano real", "parcial"],
      ["5", "Colapso de eixos", "feito no 003 (E5) → estado misto sustentado (C4)", "ok"],
      ["6", "Mapear a bacia de atração", "o motor permite amostrar milhares de sequências — pendente", "neutro"]
    ];
    var g = h("div", { class: "abertos" });
    exps.forEach(function (e, i) {
      g.appendChild(h("div", { class: "aberto", "data-revela": "", "--atraso": i * 70 },
        h("span", { class: "aberto-n num" }, e[0]), h("div", null, h("b", null, e[1]), h("span", { class: "mudo" }, e[2])),
        h("span", { class: "carimbo " + e[3] }, e[3] === "ok" ? "feito" : e[3] === "parcial" ? "parcial" : "aberto")));
    });
    var lista = h("ul", { class: "pendencias" });
    ["Validação com observador humano real", "v3.1: irritação fásica + rancor tônico", "Calibrar o catálogo de eventos contra pesquisas reais", "Auditar o interpretador de eventos: mesma mensagem → mesmos eventos?"].forEach(function (p, i) {
      lista.appendChild(h("li", { "data-revela": "", "--atraso": i * 80 }, p));
    });
    return h("div", { class: "grade g-2" }, g, h("div", { class: "cartao" }, h("p", { class: "olho" }, "O que fica em aberto"), lista));
  }

  PHB.paginas.jornada = {
    render: function (el) {
      el.appendChild(C.cabecalho({ olho: "A jornada", titulo: "Do “sonho” da IA à <em class=\"voz\">opacidade entre mentes</em>.",
        lead: "Pesos → estados afetivos → individuação → alcançabilidade → opacidade → o problema de outras mentes como aparato de bancada. Role: a figura acompanha o deslocamento." }));
      el.appendChild(h("section", { class: "secao compacta" }, h("div", { class: "moldura" }, arco())));
      el.appendChild(C.secao({ olho: "A virada de arquitetura", titulo: "O que saiu do LLM foi o “sobe/desce”.", lead: "O LLM ainda interpreta o mundo e escreve a fala. Qual evento faz o quê ao estado mora numa tabela fixa; toda a dinâmica — retorno, goodwill, cicatriz, histerese, consentimento — é do código." }, antesDepois()));
      el.appendChild(C.secao({ olho: "Descobertas sobre a dinâmica afetiva", titulo: "Cada propriedade nasceu de um defeito." }, descobertas()));
      el.appendChild(C.secao({ olho: "Aprendizados metodológicos", titulo: "Como pesquisar, não só o quê." }, metodo()));
      el.appendChild(C.secao({ olho: "Os seis experimentos do documento norte", titulo: "Quatro respondidos, dois desbloqueados." }, abertos()));
      var docs = ["docs/opacidade-entre-mentes.md", "docs/aprendizados-e-descobertas.md", "docs/proposta-parametros-v3.md", "docs/funcionamento-v3.md"].map(PHB.doc);
      el.appendChild(C.secao({ olho: "Leitura integral", titulo: "Os documentos da jornada." }, C.outputs(docs)));
      el.appendChild(C.proximo("Próximo", "Os experimentos", "#/testes"));
      return "A jornada";
    }
  };
})();
