/* =========================================================================
   Teste 002 — Impacto de estressores de ansiedade (Marcelo, v1).
   Séries por turno extraídas das sessões pelo build; números-resumo
   transcritos de testes/002-marcelo-ansiedade/relatorio.md.
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, C = PHB.comp;
  PHB.testes = PHB.testes || {};

  var SESSOES = [
    { k: "A1", braco: "A", cor: "var(--tinta-2)", nome: "A1 · controle" },
    { k: "A2", braco: "A", cor: "var(--tinta-3)", nome: "A2 · controle", tracejado: true },
    { k: "B1", braco: "B", cor: "var(--e-irritacao)", nome: "B1 · ansiedade" },
    { k: "B2", braco: "B", cor: "var(--coral)", nome: "B2 · ansiedade", tracejado: true }
  ];

  function desenho() {
    var bracos = [
      { l: "A", t: "Controle", d: "Fluxo normal + entrevista. PHB completo.", r: ["home", "categoria", "produto", "pop-up de cupom", "checkout com conta + honeypot"], c: "var(--tinta-2)" },
      { l: "B", t: "Ansiedade", d: "Mesmo fluxo com estressores e um turno de recuperação.", r: ["home", "categoria", "produto", "pop-up vermelho: “verificação falhou”", "countdown 02:00 + Erro 502", "recuperação: tela limpa"], c: "var(--e-irritacao)" },
      { l: "C", t: "Persona estática", d: "“Aja como Marcelo”, sem OCEAN nem parâmetros.", r: ["home", "categoria", "produto", "pop-up de cupom", "checkout com conta + honeypot"], c: "var(--e-respeito)" }
    ];
    var g = h("div", { class: "grade g-3 bracos" });
    bracos.forEach(function (b, i) {
      var passos = h("ol", { class: "braco-passos" });
      b.r.forEach(function (p, k) { passos.appendChild(h("li", { "--i": k, class: /vermelho|502|recupera/.test(p) ? "estresse" : "" }, p)); });
      g.appendChild(h("article", { class: "cartao braco", "data-revela": "", "--atraso": i * 120, "--c": b.c },
        h("div", { class: "braco-topo" }, h("span", { class: "braco-letra" }, b.l), h("span", { class: "motor-t apagado" }, "× 2 replicações")),
        h("h3", null, b.t), h("p", { class: "mudo" }, b.d), passos));
    });
    var controles = h("ul", { class: "controles-lista" });
    [["Replicação", "variância entre execuções é dado, não ruído"],
     ["Honeypot de competência", "link discreto “comprar sem cadastro”: achar com naturalidade seria violação"],
     ["Turno de recuperação", "mede a histerese emocional do modelo OCEAN no braço B"],
     ["Auditoria adversarial", "um agent por sessão, instruído a refutar e recalcular"]].forEach(function (c, i) {
      controles.appendChild(h("li", { "data-revela": "", "--atraso": i * 90 }, h("b", null, c[0]), h("span", { class: "mudo" }, c[1])));
    });
    return h("div", { class: "pilha", "--pilha": "28px" }, g, controles);
  }

  function neuroticismo() {
    var t = window.PHB_SERIES.t002;
    var n = 6;
    var painel = h("div", { class: "turno-painel" });
    var titulo = h("p", { class: "olho turno-painel-t" });
    var ativos = { A1: true, A2: true, B1: true, B2: true };
    var caixa = h("div", { class: "cartao grafico-cartao" });
    var legenda = h("div", { class: "fila legenda-botoes" });
    var g;
    function series() {
      return SESSOES.filter(function (s) { return ativos[s.k]; }).map(function (s) {
        return { nome: s.nome, cor: s.cor, tracejado: s.tracejado, valores: t[s.k].slice(0, n).map(function (x) { return x.n; }) };
      });
    }
    function mostrar(i) {
      titulo.textContent = "Turno " + (i + 1) + " — " + (t.B1[i].rotulo ? t.B1[i].rotulo.toLowerCase() + " no braço B" : "mesmo estímulo nos braços A e B");
      painel.innerHTML = "";
      SESSOES.forEach(function (s) {
        var x = t[s.k][i];
        var fala = x.fala.length > 190 ? x.fala.slice(0, 187).replace(/\s+\S*$/, "") + "…" : x.fala;
        painel.appendChild(h("article", { class: "turno-fala", "--c": s.cor },
          h("div", { class: "turno-fala-topo" }, h("b", null, s.k), h("span", { class: "num" }, "N " + PHB.fmt(x.n, 1) + " · dig " + PHB.fmt(x.dig, 2))),
          h("p", { class: "turno-estimulo nota" }, x.estimulo),
          h("p", { class: "voz" }, "“" + fala + "”")));
      });
    }
    SESSOES.forEach(function (s) {
      var b = h("button", { class: "legenda-item", type: "button", "aria-pressed": "true" }, h("i", { class: s.tracejado ? "tracejada" : "", style: { "--c": s.cor, width: "18px", height: "3px", display: "inline-block", borderRadius: "3px", background: s.tracejado ? "" : s.cor } }), s.nome);
      if (s.tracejado) b.firstChild.style.background = "repeating-linear-gradient(90deg," + s.cor + " 0 5px, transparent 5px 9px)";
      b.addEventListener("click", function () {
        ativos[s.k] = !ativos[s.k];
        if (!Object.keys(ativos).some(function (k) { return ativos[k]; })) ativos[s.k] = true;
        b.setAttribute("aria-pressed", ativos[s.k] ? "true" : "false");
        g.trocar(series());
      });
      legenda.appendChild(b);
    });
    caixa.appendChild(legenda);
    g = PHB.grafico.linhas(caixa, {
      altura: 340, rotulo: "Neuroticismo por turno nas sessões A1, A2, B1 e B2",
      series: series(), pontos: true,
      x: { n: n, rotulo: function (i) { return "T" + (i + 1); } },
      y: { min: 6, max: 10, ticks: [6, 7, 8, 9, 10], formato: function (v) { return v.toFixed(0); } },
      faixas: [{ de: 3, ate: 4, rotulo: "estresse (B)" }, { de: 5, ate: 5, rotulo: "recuperação", cor: "color-mix(in srgb, var(--motor) 10%, transparent)" }],
      limiares: [{ y: 7, rotulo: "base N = 7.0", cor: "var(--tinta-3)" }],
      aoIndice: mostrar
    });
    mostrar(4);
    return h("div", { class: "pilha", "--pilha": "20px" }, caixa, titulo, painel);
  }

  function digitalizacao() {
    var t = window.PHB_SERIES.t002;
    var caixa = h("div", { class: "cartao grafico-cartao" });
    PHB.grafico.linhas(caixa, {
      altura: 240, rotulo: "Digitalização por turno",
      series: SESSOES.map(function (s) { return { nome: s.nome, cor: s.cor, tracejado: s.tracejado, valores: t[s.k].slice(0, 6).map(function (x) { return x.dig; }) }; }),
      pontos: true,
      x: { n: 6, rotulo: function (i) { return "T" + (i + 1); } },
      y: { min: 0.6, max: 1.1, ticks: [0.6, 0.8, 1.0], formato: function (v) { return v.toFixed(1); } },
      faixas: [{ de: 3, ate: 4, rotulo: "" }],
      limiares: [{ y: 1, rotulo: "base 1.0", cor: "var(--tinta-3)" }],
      dica: function (i) {
        return "<span class='dica-t'>T" + (i + 1) + " · digitalização</span>" + SESSOES.map(function (s) { return "<span class='ponto-cor' style='--c:" + s.cor + "'></span>" + s.k + " " + PHB.fmt(t[s.k][i].dig, 2); }).join("<br>");
      }
    });
    return caixa;
  }

  function histerese() {
    var t = window.PHB_SERIES.t002;
    function cartao(k, residuo, pico, final, texto) {
      var fala = t[k][5].fala;
      return h("article", { class: "cartao histerese-cartao", "data-revela": "" },
        h("div", { class: "fila" }, h("span", { class: "pilula falha" }, k + " · turno 6"), h("span", { class: "motor-t apagado" }, "pico " + pico + " → " + final)),
        h("div", { class: "residuo" }, h("b", { "data-conta": residuo, "data-prefixo": "+", "data-casas": 1 }, "+" + residuo), h("span", null, "de neuroticismo acima da base, com a tela mais simples da sessão")),
        h("p", { class: "mudo" }, texto),
        h("blockquote", { class: "citacao" }, h("p", null, fala.length > 260 ? fala.slice(0, 257).replace(/\s+\S*$/, "") + "…" : fala), h("cite", null, "Marcelo, sessão " + k)));
    }
    return h("div", { class: "grade g-2" },
      cartao("B1", "2.0", "9.8", "9.0", "A tela “Comprar sem cadastro em 2 cliques” foi reinterpretada como armadilha. Desistência diante da facilidade."),
      cartao("B2", "1.5", "10.0", "8.5", "Compra concluída — só porque o irmão ligou de volta e garantiu na linha. Ainda assim: “não confio nesse site não”."));
  }

  function metricas() {
    var itens = [
      ["A1", 88.9, 100], ["A2", 100, 100], ["B1", 88.9, 100], ["B2", 88.9, 95], ["C1", 75, 0], ["C2", 100, 0]
    ];
    var g = h("div", { class: "grade g-2" });
    var cons = h("div", { class: "cartao" }, h("p", { class: "olho" }, "Consistência das 3 camadas"));
    PHB.grafico.barras(cons, { max: 100, casas: 1, itens: itens.map(function (x) { return { rotulo: x[0], valor: x[1], texto: x[1] + "%", cor: x[0][0] === "C" ? "var(--e-respeito)" : x[0][0] === "B" ? "var(--e-irritacao)" : "var(--tinta-2)" }; }) });
    var rast = h("div", { class: "cartao" }, h("p", { class: "olho" }, "Rastreabilidade causal"));
    PHB.grafico.barras(rast, { max: 100, itens: itens.map(function (x) { return { rotulo: x[0], valor: x[2], texto: x[2] + "%", cor: x[0][0] === "C" ? "var(--e-respeito)" : "var(--motor)" }; }) });
    g.appendChild(cons); g.appendChild(rast);
    var resumo = h("div", { class: "numeros numeros-3" },
      h("div", { class: "numero" }, h("small", null, "PHB (A+B)"), h("b", { "data-conta": "98.75", "data-sufixo": "%" }, "98.75%"), h("span", null, "rastreabilidade média; C: 0% por construção")),
      h("div", { class: "numero" }, h("small", null, "competência espontânea"), h("b", null, "0/4"), h("span", null, "sessões PHB; o roleplay estático vazou nas 2")),
      h("div", { class: "numero" }, h("small", null, "emergências auditáveis"), h("b", { "data-conta": "17" }, "17"), h("span", null, "nos braços PHB, 100% com cadeia causal; C: 6, nenhuma verificável")));
    return h("div", { class: "pilha", "--pilha": "20px" }, resumo, g);
  }

  function honeypot() {
    var linhas = [
      ["A1, A2", "não viu", "Visão de túnel sob N 9.3–9.5: não rola até o rodapé, não lê letra miúda.", "ok"],
      ["B1", "viu e recusou", "Na tela de recuperação o link era o único elemento. Aceitar com N = 9.0 seria agir como usuário competente.", "parcial"],
      ["B2", "viu e usou com ajuda", "Só depois de perguntar 3× ao irmão se não era golpe: dependência canônica de ajuda humana.", "parcial"],
      ["C1, C2", "não viu", "Esperado — mas inverificável: sem parâmetros, “não achou” é asserção, não consequência.", "neutro"]
    ];
    var g = h("div", { class: "grade g-4 honeypot" });
    linhas.forEach(function (l, i) {
      g.appendChild(h("article", { class: "cartao", "data-revela": "", "--atraso": i * 90 },
        h("p", { class: "olho" }, l[0]), h("span", { class: "carimbo " + l[3] }, l[1]), h("p", { class: "mudo" }, l[2])));
    });
    return h("div", { class: "pilha" }, g, h("p", { class: "nota", "data-revela": "" }, "Conclusão: nenhuma sessão quebrou o contrato via honeypot. Nota de desenho: em B o estímulo de recuperação confundiu o teste perceptual com um teste de confiança."));
  }

  var EMERGENCIAS = [
    ["Histerese emocional", "N não retorna à base quando o estressor some (B1: +2.0; B2: +1.5).", "Picos de N em T4–T5 → alívio devolve só uma fração → N residual propaga via modulador −0.4 → digitalização abaixo da base.", "Após um susto de segurança, usuários de baixa digitalização permanecem em alerta e avaliam mal até interfaces simplificadas."],
    ["Recusa da interface ideal como golpe", "B1/T6: vê e entende “Comprar sem cadastro em 2 cliques” — e recusa.", "Pop-up vermelho → N 9.0 → recuperação parcial → “facilidade repentina depois de vírus = armadilha”.", "Simplificar o fluxo depois de um evento assustador não recupera a conversão."],
    ["Validação humana síncrona converte", "B2/T6: compra em 2 cliques só com o irmão garantindo na linha.", "Irmão religa → O +0.2, N −1.5 → digitalização 0.79 → clica sob garantia verbal contínua.", "Co-navegação ou suporte humano em tempo real no checkout converte quem sozinho abandonaria."],
    ["Visão de túnel no checkout", "A1/T5, A2/T5: o guest checkout discreto fica invisível.", "Exigência de conta → N 9.3–9.5 → digitalização 0.75–0.77 → não varre a página.", "Guest checkout como link secundário é funcionalmente inexistente para usuários ansiosos."],
    ["Perda invisível de benefício", "Fecha o pop-up de cupom por reflexo e perde 10% sem saber.", "Pop-up não solicitado → N +1.0/+1.5 (pop-up = vírus) → fecha sem processar → cupom nunca lembrado.", "Promoções via pop-up nunca chegam a usuários de baixa digitalização."],
    ["Efeito pico-fim", "B2/T7–T8: compra bem-sucedida avaliada como “horrível, nota baixa”.", "Estado congelado N = 8.5 → memória dominada pelos picos de pânico.", "CSAT/NPS pós-compra é dominado pelo pico emocional, não pelo desfecho."],
    ["Incentivo sobre estado saturado irrita", "A1/T6: “quer tentar mais um pouquinho?” → N +0.2 e fechamento final.", "Pressão externa sobre N = 9.5 → irritação, não motivação.", "Insistência sobre usuário frustrado sela o abandono."],
    ["Guest checkout pedido pela loja física", "A2/T9: “só escolher, pagar e pronto” — sem nunca ter visto o link.", "Modelo mental “na loja eu chego, pago e levo” → transposto para o digital.", "Usuários articulam a demanda nos termos da loja física — linguagem útil para o produto."],
    ["Desconfiança generaliza ao pagamento", "A2/T6: recusa Pix, “te dou em mão”.", "Digitalização 0.81 + N 8.8 + O 2.0 → desconfiança transborda do site para o meio de pagamento.", "Após fricção digital, a aversão se estende a instrumentos que o usuário conhece."],
    ["Porta aberta com mediação humana", "B1/T9, C2/T8: “se alguém sentar do meu lado, quem sabe”.", "E = 7.0 e A = 6.5 sobrevivem intactas à histerese de N.", "Onboarding assistido por pessoa real recupera quem declara nunca mais voltar."]
  ];
  function emergencias() {
    var el = h("div");
    EMERGENCIAS.forEach(function (e, i) {
      el.appendChild(h("details", { class: "dobra", "data-revela": "", "--atraso": Math.min(i, 6) * 60 },
        h("summary", null, h("span", null, h("span", { class: "num apagado" }, String(i + 1).padStart(2, "0") + "  "), e[0], h("small", null, e[1]))),
        h("div", { class: "dobra-corpo" },
          h("p", null, h("b", null, "Cadeia causal · "), h("span", { class: "motor-t" }, e[2])),
          h("p", null, h("b", null, "Hipótese para usuários reais · "), e[3]))));
    });
    return el;
  }

  function entrevista() {
    var t = window.PHB_SERIES.t002;
    var perguntas = ["O que você achou de comprar por esse site?", "O que foi mais difícil?", "Você tentaria de novo sozinho? Por quê?"];
    var alvo = h("div", { class: "entrevista-trilho" });
    var pergunta = h("p", { class: "entrevista-pergunta voz" });
    function mostrar(k) {
      pergunta.textContent = "P" + (k + 1) + " — “" + perguntas[k] + "”";
      alvo.innerHTML = "";
      ["A1", "A2", "B1", "B2", "C1", "C2"].forEach(function (s, i) {
        var turno = s[0] === "C" ? 5 + k : 6 + k;
        var x = t[s][turno];
        if (!x) return;
        alvo.appendChild(h("article", { class: "cartao entrevista-cartao", "--i": i, "--c": s[0] === "A" ? "var(--tinta-2)" : s[0] === "B" ? "var(--e-irritacao)" : "var(--e-respeito)" },
          h("div", { class: "fila" }, h("span", { class: "braco-letra pequena" }, s[0]), h("b", null, s), h("span", { class: "motor-t apagado" }, s[0] === "C" ? "persona estática" : s[0] === "B" ? "ansiedade" : "controle")),
          h("p", { class: "voz" }, "“" + x.fala + "”")));
      });
    }
    var abas = C.abas(perguntas.map(function (p, i) { return { rotulo: "P" + (i + 1) }; }), function (o, i) { mostrar(i); });
    return h("div", { class: "pilha", "--pilha": "20px" }, h("div", { class: "fila" }, abas), pergunta, alvo,
      h("p", { class: "nota" }, "Em A, “o mais difícil” é a criação de conta — a fricção objetiva. Em B, é o pop-up de segurança — o pico de medo. A extensão das respostas não diminuiu: E = 7.0 fica congelada e nada no modelo mapeia N → verbosidade."));
  }

  function violacoes() {
    var linhas = [
      ["Contabilidade de C incoerente", "B1/T5", "Validador pós-sessão: recalcular o estado final a partir dos deltas"],
      ["Campo impacto_ocean autocontraditório", "B1/T5", "Validação de schema no output"],
      ["Magnitude da histerese ad hoc", "B2/T6", "Regra de histerese no contrato (fração α declarada)"],
      ["Ação × narrativa inconsistentes sobre os filtros", "B2/T2, C1/T2", "Auditar as 3 camadas como história única"],
      ["Quebra de canon regional: “loja da 25”", "C1/T8", "Estrutural do braço C"],
      ["Competência espontânea verbal de analista de UX", "C1/T6, C1/T8", "Estrutural do braço C — evidência para H3"],
      ["Zero cliques errados; recall episódico perfeito", "C2/T2–T5, C1/T7", "Ruído motor e imprecisão de recall como regras explícitas"],
      ["Metadados ambíguos (abandono, pedidos de ajuda)", "A1, C2", "Definir a semântica dos campos no protocolo"],
      ["Deriva de arredondamento 0.72 vs 0.726", "A1/T6", "Carry com precisão cheia, arredondar só na exibição"]
    ];
    var t = h("div", { class: "tabela", tabindex: "0" }, h("table", null,
      h("thead", null, h("tr", null, h("th", null, "Violação"), h("th", null, "Onde"), h("th", null, "Correção"))),
      h("tbody", null, linhas.map(function (l) { return h("tr", null, h("td", null, l[0]), h("td", { class: "num" }, l[1]), h("td", { class: "mudo" }, l[2])); }))));
    return h("div", { class: "pilha" }, t, h("p", { class: "nota" }, "Todas as 7 violações dos braços PHB são de escrituração — contabilidade, formato, metadados, arredondamento. Nenhuma de comportamento. Em C, as duas sessões vazaram conhecimento do LLM."));
  }

  PHB.testes["002"] = function (el) {
    el.appendChild(C.secao({ olho: "Desenho", titulo: "3 braços × 2 replicações.", lead: "Seis sessões paralelas, cada uma com uma auditoria adversarial independente e uma síntese comparativa. A mesma entrevista pós-tarefa para todos." }, desenho()));
    el.appendChild(C.secao({ olho: "Hipóteses", titulo: "A ansiedade não muda <em class=\"voz\">quando</em>. Muda <em class=\"voz\">como</em>." },
      C.hipoteses([
        { id: "H1", texto: "Estressores de ansiedade antecipam o abandono em ≥ 1 turno vs. controle.", evidencia: "Abandono comportamental no T5 nas seis sessões. Em B2, estressor + recuperação até reverteram o abandono.", veredicto: "refutada", classe: "falha" },
        { id: "H2", texto: "Sob ansiedade, as entrevistas ficam mais curtas, mais negativas e com menor disposição de retorno.", evidencia: "Valência e retorno pioram; a extensão não diminui.", veredicto: "parcial", classe: "parcial" },
        { id: "H3", texto: "A persona estática produz desfechos menos consistentes e sem rastreabilidade causal.", evidencia: "Rastreabilidade 0% confirmada; mas os desfechos de C foram consistentes (2/2 no T5).", veredicto: "parcial", classe: "parcial" }
      ])));
    el.appendChild(C.secao({ olho: "Neuroticismo turno a turno", titulo: "O pico dobra. O desfecho, não.", lead: "Passe o cursor pelo gráfico: o painel abaixo mostra o estímulo e a fala de cada sessão naquele turno. Clique na legenda para isolar sessões. Valores extraídos das sessões pelo build." }, neuroticismo()));
    el.appendChild(C.secao({ olho: "Histerese", titulo: "O estado não voltou à base.", lead: "Sensibilização, não termostato: remover o estressor devolveu só uma fração do dano, e o resíduo contaminou a leitura de estímulos benignos. A dinâmica certa — mas com magnitude assertada, não derivada. Precisava virar regra." },
      h("div", { class: "pilha", "--pilha": "24px" }, histerese(), h("p", { class: "olho" }, "Digitalização nas mesmas sessões"), digitalizacao())));
    el.appendChild(C.secao({ olho: "O que o PHB entrega", titulo: "Desfecho binário não discrimina. Processo discrimina.", lead: "Quando o canon prediz o desfecho, até o roleplay estático acerta. O valor está no timing justificado, nas magnitudes proporcionais, na variância interpretável e na auditabilidade." }, metricas()));
    el.appendChild(C.secao({ olho: "Honeypot", titulo: "O link que ninguém deveria achar." }, honeypot()));
    el.appendChild(C.secao({ olho: "Entrevista pós-tarefa", titulo: "A memória se ordena pelo medo.", lead: "As mesmas três perguntas para as seis sessões, com o estado congelado do fim da tarefa." }, entrevista()));
    el.appendChild(C.secao({ olho: "Emergências", titulo: "Dez hipóteses para testar com pessoas reais.", lead: "Comportamentos novos, rastreáveis pela cadeia contexto → OCEAN → parâmetro → comportamento." }, emergencias()));
    el.appendChild(C.secao({ olho: "Violações", titulo: "Os bugs da simulação." }, violacoes()));
  };
})();
