/* =========================================================================
   Fundação v1/v2 — camadas RPG, observabilidade, arquétipos, padrões,
   modificadores, dual class, canon e instâncias.
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, C = PHB.comp;

  function camadas() {
    var itens = [
      ["Personalidade", "Player", "Identidade única, variação individual (±1 dentro do range). OCEAN com base e atual.", "var(--e-warmth)"],
      ["Arquétipo", "Classe", "Kit de comportamentos, ranges de parâmetros e limites. Um Caçador de Ofertas não ignora preços.", "var(--e-respeito)"],
      ["Padrões de compra", "Situações", "Modificadores contextuais cumulativos, com clamp 1–10.", "var(--e-confianca)"],
      ["Pesquisas reais", "Canon / Lore", "Guardrails e referências autênticas: o comportamento válido de cada arquétipo.", "var(--e-vigilancia)"]
    ];
    var pilha = h("div", { class: "camadas", tabindex: "0", "aria-label": "Camadas do sistema; passe o cursor para separar" });
    itens.forEach(function (c, i) {
      pilha.appendChild(h("div", { class: "camada", style: { "--i": i, "--c": c[3] } },
        h("span", { class: "camada-rpg motor-t" }, c[1]), h("b", null, c[0]), h("span", { class: "camada-d" }, c[2])));
    });
    return h("div", { class: "grade g-2 camadas-grade" }, pilha,
      h("div", { class: "pilha" },
        h("p", { class: "lead", "data-revela": "" }, "Assim como um Bárbaro não invoca magia de alto nível, um Caçador de Ofertas não ignora preços. As camadas superiores variam a expressão, mas nunca quebram os boundaries das inferiores."),
        h("p", { class: "mudo", "data-revela": "", "--atraso": 120 }, "O motor v3 preserva esta camada de identidade e substitui a de dinâmica afetiva: a matemática saiu do LLM e o afeto passou a ser forkado por interlocutor.")));
  }

  function observabilidade() {
    var itens = [
      ["Reasoning", "Processo decisório interno", "por que decidiu"],
      ["Externalização", "Resposta e comunicação verbal", "o que disse"],
      ["Ação (MCP)", "Navegação e interações reais", "o que fez"]
    ];
    var g = h("div", { class: "obs" });
    itens.forEach(function (it, i) {
      g.appendChild(h("article", { class: "obs-camada", "data-revela": "", "--atraso": i * 140 },
        h("span", { class: "num apagado" }, "0" + (i + 1)), h("h3", null, it[0]), h("p", { class: "mudo" }, it[1]), h("span", { class: "pilula motor" }, it[2])));
    });
    return h("div", { class: "pilha", "--pilha": "18px" }, g,
      h("p", { class: "nota", "data-revela": "" }, "A consistência entre as três camadas valida se o agente opera dentro dos parâmetros — espelhando métodos de auditoria de alinhamento para detectar comportamento desalinhado."));
  }

  function arquetipos() {
    var F = window.PHB_SERIES.fundacao;
    var selecionado = 0;
    var lista = h("div", { class: "arq-lista", role: "tablist", "aria-label": "Arquétipos" });
    var palco = h("div", { class: "cartao arq-palco" });
    var nome = h("h3", { class: "arq-nome" }), desc = h("p", { class: "mudo" }), padroes = h("p", { class: "nota" });
    var params = h("div", { class: "arq-params" });
    var ler = h("a", { class: "botao fantasma pequeno" }, "Specs de decisão completas", h("span", { class: "seta" }, PHB.icone("seta")));
    palco.appendChild(h("div", { class: "pilha", "--pilha": "10px" }, nome, desc, padroes));
    palco.appendChild(params);
    palco.appendChild(ler);
    var linhas = F.arquetipos[0].parametros.map(function (p) {
      var faixa = h("span", { class: "arq-faixa" });
      var val = h("span", { class: "arq-val num" });
      params.appendChild(h("div", { class: "arq-param" }, h("span", null, p[0]), h("div", { class: "arq-trilho" }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (k) { return h("i", { "--k": k }); }), faixa), val));
      return { faixa: faixa, val: val };
    });
    function mostrar(i) {
      selecionado = i;
      var a = F.arquetipos[i];
      nome.textContent = a.nome;
      desc.textContent = a.descricao;
      padroes.textContent = "padrão primário: " + a.primario + " · secundário: " + a.secundario;
      a.parametros.forEach(function (p, k) {
        linhas[k].faixa.style.left = ((p[1] - 1) / 10) * 100 + "%";
        linhas[k].faixa.style.width = ((p[2] - p[1] + 1) / 10) * 100 + "%";
        linhas[k].val.textContent = p[1] + "–" + p[2];
      });
      ler.setAttribute("href", PHB.linkDoc(a.caminho));
      PHB.$$("button", lista).forEach(function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); });
    }
    F.arquetipos.forEach(function (a, i) {
      var b = h("button", { type: "button", role: "tab", class: "arq-botao", "aria-selected": "false" }, h("span", { class: "num apagado" }, String(i + 1).padStart(2, "0")), a.nome);
      b.addEventListener("click", function () { mostrar(i); });
      b.addEventListener("pointerenter", function () { if (window.matchMedia("(hover: hover)").matches) mostrar(i); });
      lista.appendChild(b);
    });
    mostrar(0);
    return h("div", { class: "arq-grade" }, lista, palco);
  }

  function padroes() {
    var F = window.PHB_SERIES.fundacao;
    var g = h("div", { class: "grade g-4" });
    F.padroes.forEach(function (p, i) {
      g.appendChild(h("a", { class: "cartao cartao-link padrao", href: PHB.linkDoc(p.caminho), "data-revela": "", "--atraso": i * 80, "data-cursor": "ler" },
        h("h3", null, p.nome), h("p", { class: "mudo" }, p.descricao),
        h("div", { class: "mods" }, p.modificadores.map(function (m) { return h("span", { class: "mod " + (m[1].charAt(0) === "-" ? "neg" : "pos") }, h("b", { class: "num" }, m[1]), " " + m[0]); }))));
    });
    return g;
  }

  function modificadores() {
    var F = window.PHB_SERIES.fundacao;
    var g = h("div", { class: "grade g-3" });
    F.modificadores.forEach(function (m, i) {
      g.appendChild(h("article", { class: "cartao modif", "data-revela": "", "--atraso": i * 90 },
        h("h3", null, m.nome.replace("Modificadores ", "")),
        h("ul", null, m.linhas.map(function (l) { return h("li", null, h("b", null, l[0]), h("span", { class: "mudo" }, l[1]), l[2] ? h("small", { class: "nota" }, l[2]) : null); })),
        h("a", { class: "sublinha nota", href: PHB.linkDoc(m.caminho) }, "regras de aplicação →")));
    });
    return g;
  }

  function dualClass() {
    return h("div", { class: "grade g-2 dual" },
      h("div", { class: "cartao dual-palco", tabindex: "0" },
        h("div", { class: "dual-circ principal" }, h("b", null, "Caçador de Ofertas"), h("span", { class: "nota" }, "principal")),
        h("div", { class: "dual-circ secundario" }, h("b", null, "Organizador do Rolê"), h("span", { class: "nota" }, "secundário")),
        h("span", { class: "dual-gatilho pilula" }, "gatilho: promoção no trabalho")),
      h("div", { class: "pilha" },
        h("p", { class: "lead", "data-revela": "" }, "Ativação temporária de um segundo arquétipo, mantendo o principal como base. O principal sempre tem precedência em conflitos; no máximo dois ativos; ao fim do gatilho, volta ao único."),
        h("ul", { class: "pendencias" }, ["Eventos de vida — semanas a meses", "Sazonalidade — dias a semanas", "Contexto social — horas a um dia", "Mudança financeira — variável"].map(function (t) { return h("li", null, t); })),
        h("a", { class: "botao fantasma pequeno", href: "#/doc/dual_class/transicoes.md" }, "Transições e regras", h("span", { class: "seta" }, PHB.icone("seta")))));
  }

  function canon() {
    var linhas = [["Usar como referência de comportamento válido", "Copiar falas literalmente"], ["Extrair padrões de linguagem", "Repetir situações específicas"], ["Entender motivações reais", "Assumir dados demográficos como regra"], ["Validar consistência do arquétipo", "Usar como script de respostas"]];
    return h("div", { class: "canon" },
      h("div", { class: "canon-col ok" }, h("p", { class: "olho" }, "permitido"), linhas.map(function (l, i) { return h("p", { "data-revela": "", "--atraso": i * 80 }, l[0]); })),
      h("div", { class: "canon-col nao" }, h("p", { class: "olho" }, "proibido"), linhas.map(function (l, i) { return h("p", { "data-revela": "", "--atraso": i * 80 + 40 }, l[1]); })));
  }

  function propagacao() {
    var passos = [
      ["Neuroticismo", "7.0 → 8.5", "+1.5 × (−0.4) × 0.1 × 2", "−0.12"],
      ["Abertura", "3.0 → 2.5", "−0.5 × (+0.3) × 0.1 × 2", "−0.03"]
    ];
    var el = h("div", { class: "cartao propag" },
      h("p", { class: "olho" }, "Exemplo documentado — Marcelo diante de um formulário de criação de conta"),
      h("code", { class: "propag-formula" }, "delta_parametro = Σ (delta_traço × modulador × 0.1 × 2)"));
    passos.forEach(function (p, i) {
      el.appendChild(h("div", { class: "propag-linha", "data-revela": "", "--atraso": 200 + i * 250 },
        h("b", null, p[0]), h("span", { class: "num" }, p[1]), h("span", { class: "motor-t mudo" }, p[2]), h("b", { class: "num neg" }, p[3])));
    });
    el.appendChild(h("div", { class: "propag-res", "data-revela": "", "--atraso": 800 }, h("span", null, "digitalização"), h("b", { class: "num" }, "1.0 → 0.85"), h("span", { class: "voz" }, "Marcelo desiste e vai tentar resolver pessoalmente.")));
    return el;
  }

  function instancias() {
    var itens = [
      ["exemplos/marcelorj.mdc", "v1.0", "no LLM", "1 parâmetro · caso didático", "Marcelo"],
      ["exemplos/mariana.mdc", "v2.0", "no LLM", "16 parâmetros, antagonistas, trade-offs, ruptura", "Mariana"],
      ["exemplos/mariana_v3.mdc", "v3.0", "no motor", "afeto forkado; LLM interpreta e narra", "Mariana"],
      ["personas/mariana.json", "seed", "no motor", "a persona default do front", "Mariana"]
    ];
    var g = h("div", { class: "grade g-4" });
    itens.forEach(function (it, i) {
      g.appendChild(h("a", { class: "cartao cartao-link instancia", href: PHB.linkDoc(it[0]), "data-revela": "", "--atraso": i * 80, "data-cursor": "ler" },
        h("div", { class: "fila" }, h("span", { class: "pilula " + (it[2] === "no motor" ? "motor" : "llm") }, it[1]), h("span", { class: "nota" }, "matemática " + it[2])),
        h("h3", { class: "voz instancia-nome" }, it[4]), h("p", { class: "mudo" }, it[3]), h("span", { class: "output-caminho" }, it[0])));
    });
    return g;
  }

  PHB.paginas.fundacao = {
    render: function (el) {
      el.appendChild(C.cabecalho({ olho: "Fundação · schema v1/v2", titulo: "Personas como <em class=\"voz\">sistemas dinâmicos</em>.",
        lead: "Antes do motor, a metodologia: camadas hierárquicas com precedência estrita, três camadas de observabilidade, sete arquétipos com ranges calibrados em pesquisa real, padrões de compra e modificadores de contexto." }));
      el.appendChild(C.secao({ olho: "Arquitetura em camadas", titulo: "Uma analogia de RPG.", lead: "Passe o cursor sobre a pilha para separar as camadas." }, camadas()));
      el.appendChild(C.secao({ olho: "Observabilidade", titulo: "Por que decidiu, o que disse, o que fez." }, observabilidade()));
      el.appendChild(C.secao({ olho: "Propagação OCEAN (v1/v2)", titulo: "Contexto → OCEAN → parâmetro → comportamento." }, propagacao()));
      el.appendChild(C.secao({ olho: "7 arquétipos", titulo: "Classes com limites.", lead: "Ranges de 1 a 10 por parâmetro comportamental. O respondente mais extremo em cada atributo define os limites do arquétipo." }, arquetipos()));
      el.appendChild(C.secao({ olho: "Padrões de compra", titulo: "Situações que modificam." }, padroes()));
      el.appendChild(C.secao({ olho: "Modificadores de contexto", titulo: "Calendário, vida, grupo." }, modificadores()));
      el.appendChild(C.secao({ olho: "Dual class", titulo: "Dois arquétipos, um de cada vez no comando." }, dualClass()));
      el.appendChild(C.secao({ olho: "Pesquisas reais · canon", titulo: "Referências, não templates.", lead: "O usuário sintético deve agir <em>como</em> os entrevistados agiriam, não repetir <em>o que</em> disseram." }, canon()));
      el.appendChild(C.secao({ olho: "Instâncias executáveis", titulo: "Uma por versão de schema." }, instancias()));
      var docs = PHB.docs().filter(function (d) { return d.grupo === "fundacao" || d.caminho === "documentacao.md" || d.caminho === "README.md"; });
      el.appendChild(C.secao({ olho: "Leitura integral", titulo: "Todos os documentos da fundação." }, C.outputs(docs)));
      el.appendChild(C.proximo("Próximo", "Do laboratório ao produto", "#/produto"));
      return "Fundação";
    }
  };
})();
