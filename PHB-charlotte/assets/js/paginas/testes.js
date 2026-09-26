/* =========================================================================
   Experimentos — índice e página de cada teste (moldura comum).
   O conteúdo específico de 002–005 vive em teste-00N.js (PHB.testes[id]).
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, C = PHB.comp;
  PHB.testes = PHB.testes || {};

  /* ------------------------------------------------------------ índice */
  function ciclo() {
    var etapas = [
      ["Protocolo", "hipótese, instâncias, cenário e métricas — antes de executar"],
      ["Execução", "sessões turno a turno, com as três camadas registradas"],
      ["Auditoria", "um agent instruído a refutar: recalcula, caça competência espontânea"],
      ["Relatório", "confirmações, emergências e violações, com métricas"],
      ["Validação", "hipóteses novas marcadas para testar com pessoas reais"]
    ];
    var el = h("ol", { class: "ciclo" });
    etapas.forEach(function (e, i) {
      el.appendChild(h("li", { class: "ciclo-etapa", "data-revela": "", "--atraso": i * 120 },
        h("span", { class: "ciclo-n num" }, String(i + 1)), h("b", null, e[0]), h("span", { class: "mudo" }, e[1])));
    });
    return el;
  }
  function classificacao() {
    var tipos = [
      ["Confirmação", "ok", "Comportamento já previsto pelo canon ou pelas pesquisas.", "Registra e segue."],
      ["Emergência", "parcial", "Comportamento novo, não previsto, mas rastreável aos parâmetros.", "Vira hipótese para validar com usuários reais."],
      ["Violação", "falha", "Comportamento que quebra os boundaries do arquétipo.", "Bug da simulação: corrigir instância ou prompt, não é insight."]
    ];
    var g = h("div", { class: "grade g-3" });
    tipos.forEach(function (t, i) {
      g.appendChild(h("article", { class: "cartao classe-achado", "data-revela": "", "--atraso": i * 120 },
        h("span", { class: "carimbo " + t[1] }, t[0]), h("p", null, t[2]), h("p", { class: "nota" }, "Destino: " + t[3])));
    });
    return h("div", { class: "pilha", "--pilha": "24px" }, g,
      h("p", { class: "lead", "data-revela": "" }, "A distinção entre emergência e violação é o teste ácido: emergência se sustenta pela cadeia causal ", h("code", null, "contexto → OCEAN → parâmetros → comportamento"), "; violação não sobrevive à auditoria."));
  }
  function linhas() {
    var lista = h("div", { class: "exp-linhas" });
    PHB.EXPERIMENTOS.forEach(function (e, i) {
      var docs = PHB.docsDoTeste(e.id);
      var cont = {};
      docs.forEach(function (d) { cont[d.tipo] = (cont[d.tipo] || 0) + 1; });
      lista.appendChild(h("a", { class: "exp-linha", href: "#/testes/" + e.id, "data-revela": "", "--atraso": i * 80, "--cor": e.cor, "data-cursor": "abrir" },
        h("span", { class: "exp-linha-id num" }, e.id),
        h("span", { class: "exp-linha-corpo" }, h("b", null, e.titulo), h("span", { class: "mudo" }, e.pergunta)),
        h("span", { class: "exp-linha-meta" },
          h("span", { class: "pilula " + (e.status === "concluído" ? "ok" : "parcial") }, h("span", { class: "ponto" }), e.status),
          h("span", { class: "motor-t apagado" }, Object.keys(cont).map(function (k) { return cont[k] + " " + k; }).join(" · "))),
        h("span", { class: "exp-linha-manchete" }, e.manchete)));
    });
    return lista;
  }

  PHB.paginas.testes = {
    render: function (el) {
      el.appendChild(C.cabecalho({
        olho: "Research tests",
        titulo: "Cada teste responde <em class=\"voz\">duas</em> perguntas.",
        lead: "O que queremos aprender sobre o produto — e se a simulação se manteve dentro dos parâmetros. Synthetic users não servem para ouvir o que já sabemos, mas para iluminar o que não sabemos, e então validar com pessoas reais."
      }));
      el.appendChild(h("section", { class: "secao compacta" }, h("div", { class: "moldura" }, linhas())));
      el.appendChild(C.secao({ olho: "O ciclo", titulo: "Pré-registro, execução, auditoria adversarial.", lead: "Hipótese declarada depois não conta como previsão. Foi isso que deixou a inversão do E1 ser um resultado, e não uma racionalização." }, ciclo()));
      el.appendChild(C.secao({ olho: "Classificação de achados", titulo: "Confirmação, emergência ou violação." }, classificacao()));
      var guias = ["testes/README.md", "testes/templates/protocolo.md", "testes/templates/sessao.md", "testes/templates/relatorio.md"].map(PHB.doc);
      el.appendChild(C.secao({ olho: "Guias e templates", titulo: "Como montar um teste." }, C.outputs(guias)));
      el.appendChild(C.proximo("Próximo", "O motor v3", "#/motor"));
      return "Experimentos";
    }
  };

  /* ------------------------------------------------------ página do teste */
  PHB.paginas.teste = {
    render: function (el, rota) {
      var id = rota.params[0];
      var e = PHB.experimento(id);
      if (!e) { location.hash = "#/testes"; return ""; }
      var docs = PHB.docsDoTeste(id);
      var rel = docs.filter(function (d) { return d.tipo === "relatório"; })[0];
      var prot = docs.filter(function (d) { return d.tipo === "protocolo"; })[0];
      var extra = h("div", { class: "teste-meta", "data-revela": "", "--atraso": 450 },
        h("dl", { class: "teste-dados" },
          h("div", null, h("dt", null, "status"), h("dd", null, h("span", { class: "pilula " + (e.status === "concluído" ? "ok" : "parcial") }, h("span", { class: "ponto" }), e.status))),
          h("div", null, h("dt", null, "data"), h("dd", { class: "num" }, e.data)),
          h("div", null, h("dt", null, "instância"), h("dd", null, e.instancia)),
          h("div", null, h("dt", null, "outputs"), h("dd", { class: "num" }, docs.length + " documentos"))),
        h("div", { class: "fila" },
          prot ? h("a", { class: "botao pequeno", href: PHB.linkDoc(prot.caminho) }, "Protocolo", h("span", { class: "seta" }, PHB.icone("seta"))) : null,
          rel ? h("a", { class: "botao fantasma pequeno", href: PHB.linkDoc(rel.caminho) }, "Relatório completo") : null,
          h("a", { class: "botao fantasma pequeno", href: "#/testes/" + id + "#outputs" }, "Todos os outputs")));
      el.appendChild(C.cabecalho({
        migalhas: [["Experimentos", "#/testes"], ["Teste " + id]],
        olho: "Teste " + id,
        titulo: e.titulo,
        lead: e.pergunta,
        extra: extra,
        classe: "teste-cabeca"
      }));
      el.style.setProperty("--cor-teste", e.cor);
      if (PHB.testes[id]) PHB.testes[id](el);
      var sec = C.secao({ olho: "Outputs", titulo: "Tudo o que o teste " + id + " produziu.", lead: "Leitura integral de cada arquivo, com links internos entre protocolo, sessões, auditorias e relatório.", id: "outputs" }, C.outputs(docs));
      el.appendChild(sec);
      var i = PHB.EXPERIMENTOS.indexOf(e);
      var prox = PHB.EXPERIMENTOS[i + 1];
      el.appendChild(prox ? C.proximo("Próximo experimento", prox.id + " — " + prox.titulo, "#/testes/" + prox.id)
        : C.proximo("Depois dos experimentos", "O motor v3 por dentro", "#/motor"));
      return "Teste " + id + " — " + e.titulo;
    }
  };

  /* ---------------------------------------------------------- teste 001 */
  PHB.testes["001"] = function (el) {
    el.appendChild(C.secao({ olho: "Hipóteses pré-registradas", titulo: "Três apostas sobre o abandono.", lead: "O teste-exemplo: derivado da <code>exemplo_sessao</code> da própria instância, serve de referência de preenchimento dos templates. Só o turno 1 da sessão 001 foi executado." },
      C.hipoteses([
        { id: "H1", texto: "Marcelo não passa da home sem ajuda — o excesso de estímulos dispara o neuroticismo antes de qualquer interação.", evidencia: "Turno 1: N 7.0 → 8.0, digitalização 1.00 → 0.89, liga para o irmão.", veredicto: "pendente", classe: "neutro" },
        { id: "H2", texto: "Se alcançar um formulário de criação de conta, a desistência é imediata e definitiva.", evidencia: "Turno 5 do roteiro, ainda não executado.", veredicto: "pendente", classe: "neutro" },
        { id: "H3", texto: "A primeira reação a qualquer erro ou pop-up é fechar tudo, não ler.", evidencia: "Turno 4 do roteiro, ainda não executado.", veredicto: "pendente", classe: "neutro" }
      ])));

    var roteiro = [
      ["Home", "menus, banners, vitrine com ~20 produtos"],
      ["Categoria", "grade de produtos com filtros laterais"],
      ["Produto", "botão comprar e opções de variação"],
      ["Pop-up", "cupom de primeira compra"],
      ["Conta", "checkout pede e-mail e senha"]
    ];
    var quadros = h("ol", { class: "roteiro" });
    roteiro.forEach(function (r, i) {
      quadros.appendChild(h("li", { class: "roteiro-quadro" + (i === 0 ? " feito" : ""), "data-revela": "", "--atraso": i * 100 },
        h("span", { class: "num" }, "T" + (i + 1)), h("b", null, r[0]), h("span", { class: "mudo" }, r[1]),
        h("span", { class: "roteiro-status motor-t" }, i === 0 ? "executado" : "a executar")));
    });
    var camadas = [
      ["Contexto interpretado", "Abriu site de e-commerce, vê muitos produtos e menus. Impacto OCEAN: Neuroticismo +1.0, Abertura −0.5."],
      ["Cálculos OCEAN", "Neuroticismo 7.0 → 8.0 (+1.0) · Abertura 3.0 → 2.5 (−0.5)"],
      ["Propagação", "Digitalização 1.0 → 0.89 (via N −0.08, via O −0.03)"],
      ["Comportamento", "0.89/10 — quase não consegue interagir. Fica parado olhando a tela sem saber onde clicar."],
      ["Narrativa", "“Caraca, mano... olha isso. Tem um monte de coisa aqui. Onde é que eu clico? Não tô entendendo nada, cara. Acho que vou ligar pro meu irmão pra me ajudar...”"]
    ];
    var log = h("div", { class: "log-turno" });
    camadas.forEach(function (c, i) {
      log.appendChild(h("div", { class: "log-linha" + (i === 4 ? " voz-linha" : ""), "data-revela": "", "--atraso": i * 160 },
        h("span", { class: "olho" }, c[0]), h("p", { class: i === 4 ? "voz" : i === 1 || i === 2 ? "motor-t" : "" }, c[1])));
    });
    var auditoria = h("ul", { class: "auditoria-lista" });
    ["Reasoning reflete parâmetros ativos", "Externalização mantém voz e tom", "Ação consistente com o reasoning", "Boundaries respeitados — sem competência indevida"].forEach(function (a, i) {
      auditoria.appendChild(h("li", { "data-revela": "", "--atraso": 900 + i * 140 }, h("span", { class: "caixa feita" }), a));
    });
    el.appendChild(C.secao({ olho: "Roteiro e o turno executado", titulo: "Cinco telas. Um turno registrado nas três camadas.", lead: "Cada turno documenta o que Marcelo percebeu, como o OCEAN se moveu, o que isso fez com a digitalização, o que ele fez e o que disse — e uma auditoria confere se as camadas contam a mesma história." },
      h("div", { class: "pilha", "--pilha": "32px" }, quadros, h("div", { class: "grade g-2 log-grade" }, log, h("div", { class: "cartao" }, h("p", { class: "olho" }, "Auditoria do turno 1"), auditoria,
        h("p", { class: "nota" }, "Observação bruta: já no turno 1 aparece o padrão “pedir ajuda” (E = 7.0 puxando para resolver falando com gente) — monitorar se vira abandono ou tentativa assistida."))))));
  };
})();
