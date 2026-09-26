/* =========================================================================
   Leitor — qualquer documento do acervo, na íntegra.
   Sumário com scroll-spy, progresso de leitura, anterior/próximo.
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h;

  function vizinhos(doc) {
    var docs = PHB.docs().filter(function (d) { return doc.teste ? d.teste === doc.teste : d.grupo === doc.grupo; });
    if (doc.teste) docs = PHB.docsDoTeste(doc.teste);
    var i = docs.indexOf(doc);
    return [docs[i - 1], docs[i + 1]];
  }

  PHB.paginas.leitor = {
    render: function (el, rota) {
      var caminho = rota.params[0];
      var doc = PHB.doc(caminho);
      if (!doc) {
        el.appendChild(h("div", { class: "moldura pagina-cabeca" }, h("h1", { class: "giga" }, "Documento não encontrado."),
          h("p", { class: "lead" }, h("code", null, caminho), " não faz parte do acervo."), h("a", { class: "botao", href: "#/arquivo" }, "Ir ao arquivo")));
        return "Não encontrado";
      }
      var codigo = !/\.md$/.test(caminho);
      var grupoRot = { experimentos: ["Experimentos", "#/testes"], explicacoes: ["Explicações", "#/arquivo?grupo=explicacoes"], fundacao: ["Fundação", "#/fundacao"], produto: ["Produto", "#/produto"], codigo: ["Código", "#/motor"] }[doc.grupo] || ["Arquivo", "#/arquivo"];
      var migalhas = [["Arquivo", "#/arquivo"], grupoRot];
      if (doc.teste) migalhas.push(["Teste " + doc.teste, "#/testes/" + doc.teste]);

      var cab = h("header", { class: "leitor-cabeca" },
        h("nav", { class: "migalha", "aria-label": "Trilha" }, migalhas.map(function (m, i) { return [i ? h("span", { "aria-hidden": "true" }, "/") : null, h("a", { href: m[1] }, m[0])]; })),
        h("div", { class: "fila" }, h("span", { class: "tipo", "data-tipo": doc.tipo }, doc.tipo),
          h("span", { class: "motor-t apagado" }, doc.palavras.toLocaleString("pt-BR") + " palavras · " + PHB.minutos(doc.palavras) + " min · " + doc.linhas + " linhas")),
        codigo ? h("h1", { class: "giga leitor-titulo" }, doc.titulo) : null,
        h("div", { class: "fila leitor-acoes" },
          h("code", { class: "leitor-caminho" }, caminho),
          h("a", { class: "chip", href: "../" + caminho, target: "_blank", rel: "noopener" }, "abrir o arquivo-fonte ↗"),
          doc.teste ? h("a", { class: "chip", href: "#/testes/" + doc.teste }, "página do teste " + doc.teste) : null));

      var corpo = h("article", { class: "prosa leitor-corpo" + (codigo ? " leitor-codigo" : ""), "aria-busy": "true" },
        h("div", { class: "carregando" }, h("i"), h("i"), h("i")));
      var sumario = null;
      if (!codigo && doc.sumario.length > 2) {
        sumario = h("nav", { class: "sumario", "aria-label": "Sumário do documento" }, h("p", { class: "olho" }, "neste documento"));
        var ul = h("ol");
        doc.sumario.forEach(function (s) {
          if (s[0] === 1) return;
          ul.appendChild(h("li", { class: "n" + s[0] }, h("a", { href: "#/doc/" + caminho + "#" + s[1], "data-alvo": s[1] }, s[2])));
        });
        sumario.appendChild(ul);
      }
      var viz = vizinhos(doc);
      var nav = h("nav", { class: "leitor-nav", "aria-label": "Documentos vizinhos" },
        viz[0] ? h("a", { class: "cartao cartao-link", href: PHB.linkDoc(viz[0].caminho) }, h("span", { class: "olho" }, "anterior"), h("b", null, viz[0].titulo), h("span", { class: "output-caminho" }, viz[0].caminho)) : h("span"),
        viz[1] ? h("a", { class: "cartao cartao-link seguinte", href: PHB.linkDoc(viz[1].caminho) }, h("span", { class: "olho" }, "próximo"), h("b", null, viz[1].titulo), h("span", { class: "output-caminho" }, viz[1].caminho)) : h("span"));

      el.appendChild(h("div", { class: "moldura leitor" + (sumario ? " com-sumario" : "") },
        cab, h("div", { class: "leitor-grade" }, corpo, sumario), nav));

      PHB.textos().then(function (T) {
        if (!corpo.isConnected) return;
        corpo.innerHTML = T[caminho] || "<p>Conteúdo indisponível.</p>";
        corpo.removeAttribute("aria-busy");
        corpo.classList.add("chegou");
        if (rota.ancora) setTimeout(function () { PHB.rolarAncora(rota.ancora, false); }, 30);
        if (!sumario) return;
        var links = PHB.$$("a[data-alvo]", sumario);
        var alvos = links.map(function (a) { return document.getElementById(a.dataset.alvo); });
        PHB.aoRolar(function () {
          var ativo = 0;
          alvos.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < 140) ativo = i; });
          links.forEach(function (a, i) { a.classList.toggle("ativo", i === ativo); });
          var sel = links[ativo];
          if (sel && sumario.scrollHeight > sumario.clientHeight) {
            var r = sel.offsetTop - sumario.clientHeight / 2;
            if (Math.abs(sumario.scrollTop - r) > 60) sumario.scrollTop = r;
          }
        });
      }, function () {
        corpo.innerHTML = "<p>Não foi possível carregar <code>dados/textos.js</code>. Rode <code>python3 PHB-charlotte/build.py</code>.</p>";
      });
      return doc.titulo;
    }
  };
})();
