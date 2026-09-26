/* =========================================================================
   Arquivo — todos os documentos e outputs, com busca, filtros e FLIP.
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, C = PHB.comp;

  var GRUPOS = [["todos", "Tudo"], ["experimentos", "Experimentos"], ["explicacoes", "Explicações"], ["fundacao", "Fundação"], ["produto", "Produto"], ["codigo", "Código"]];

  PHB.paginas.arquivo = {
    render: function (el, rota) {
      var docs = PHB.docs();
      var estado = { grupo: rota.consulta.grupo || "todos", tipo: rota.consulta.tipo || "", teste: rota.consulta.teste || "", q: rota.consulta.q || "", integral: false };
      var textosNorm = null;

      el.appendChild(C.cabecalho({ olho: "Arquivo", titulo: "Todos os <em class=\"voz\">outputs</em>.",
        lead: docs.length + " documentos: protocolos, sessões turno a turno, auditorias adversariais, relatórios, explicações, fundação e o código do motor. Cada um abre na íntegra, com sumário e links internos." }));

      var busca = h("input", { type: "search", class: "arq-busca", placeholder: "Filtrar por título, caminho ou seção…", value: estado.q, "aria-label": "Filtrar documentos" });
      var integral = h("label", { class: "arq-integral" }, h("input", { type: "checkbox" }), h("span", null, "buscar também no texto integral"));
      var grupos = h("div", { class: "fila", role: "group", "aria-label": "Grupo" });
      var tipos = h("div", { class: "fila arq-tipos", role: "group", "aria-label": "Tipo" });
      var testes = h("div", { class: "fila", role: "group", "aria-label": "Teste" });
      var contagem = h("p", { class: "arq-contagem num", "aria-live": "polite" });
      var lista = h("div", { class: "outputs arq-lista" });

      function contar(filtro) { return docs.filter(filtro).length; }
      GRUPOS.forEach(function (g) {
        var n = g[0] === "todos" ? docs.length : contar(function (d) { return d.grupo === g[0]; });
        var b = h("button", { class: "chip", type: "button", "aria-pressed": estado.grupo === g[0] ? "true" : "false", "data-g": g[0] }, g[1], h("span", { class: "conta" }, String(n)));
        b.addEventListener("click", function () { estado.grupo = g[0]; estado.tipo = ""; estado.teste = ""; sincronizar(); });
        grupos.appendChild(b);
      });
      ["001", "002", "003", "004", "005"].forEach(function (t) {
        var b = h("button", { class: "chip", type: "button", "aria-pressed": "false", "data-t": t }, "teste " + t, h("span", { class: "conta" }, String(contar(function (d) { return d.teste === t; }))));
        b.addEventListener("click", function () { estado.teste = estado.teste === t ? "" : t; if (estado.teste) estado.grupo = "experimentos"; sincronizar(); });
        testes.appendChild(b);
      });

      /* itens da lista, criados uma vez e reordenados com FLIP */
      var itens = {};
      docs.forEach(function (d) {
        var a = h("a", { class: "output", href: PHB.linkDoc(d.caminho), "data-cursor": "ler" },
          h("span", { class: "tipo", "data-tipo": d.tipo }, d.tipo),
          h("span", null, h("span", { class: "output-titulo" }, d.titulo), h("span", { class: "output-caminho" }, d.caminho),
            d.resumo ? h("span", { class: "output-resumo" }, d.resumo) : null),
          h("span", { class: "output-meta" }, (d.teste ? "teste " + d.teste + " · " : "") + PHB.minutos(d.palavras) + " min", " ", PHB.icone("seta")));
        d._n = PHB.normal(d.titulo + " " + d.caminho + " " + d.tipo + " " + d.resumo + " " + d.sumario.map(function (x) { return x[2]; }).join(" "));
        itens[d.caminho] = a;
      });

      function tiposDisponiveis() {
        var base = docs.filter(function (d) { return estado.grupo === "todos" || d.grupo === estado.grupo; });
        var t = {};
        base.forEach(function (d) { t[d.tipo] = (t[d.tipo] || 0) + 1; });
        tipos.innerHTML = "";
        Object.keys(t).sort().forEach(function (k) {
          var b = h("button", { class: "chip", type: "button", "aria-pressed": estado.tipo === k ? "true" : "false" }, k, h("span", { class: "conta" }, String(t[k])));
          b.addEventListener("click", function () { estado.tipo = estado.tipo === k ? "" : k; sincronizar(); });
          tipos.appendChild(b);
        });
      }

      function filtrar() {
        var termos = PHB.normal(estado.q.trim()).split(/\s+/).filter(Boolean);
        return docs.filter(function (d) {
          if (estado.grupo !== "todos" && d.grupo !== estado.grupo) return false;
          if (estado.tipo && d.tipo !== estado.tipo) return false;
          if (estado.teste && d.teste !== estado.teste) return false;
          if (!termos.length) return true;
          return termos.every(function (t) {
            return d._n.indexOf(t) >= 0 || (estado.integral && textosNorm && textosNorm[d.caminho].indexOf(t) >= 0);
          });
        });
      }

      function render() {
        var visiveis = filtrar();
        // FLIP: primeiro, as posições antigas
        var antes = {};
        Object.keys(itens).forEach(function (k) { if (itens[k].parentNode) antes[k] = itens[k].getBoundingClientRect(); });
        var novos = {};
        visiveis.forEach(function (d) { novos[d.caminho] = true; });
        Object.keys(itens).forEach(function (k) { if (!novos[k] && itens[k].parentNode) itens[k].remove(); });
        visiveis.forEach(function (d) { lista.appendChild(itens[d.caminho]); });
        if (!PHB.semMovimento()) {
          visiveis.forEach(function (d, i) {
            var el2 = itens[d.caminho], depois = el2.getBoundingClientRect();
            var a = antes[d.caminho];
            if (a) {
              var dy = a.top - depois.top;
              if (Math.abs(dy) > 1) el2.animate([{ transform: "translateY(" + dy + "px)" }, { transform: "none" }], { duration: 560, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
            } else {
              el2.animate([{ opacity: 0, transform: "translateY(14px) scale(0.98)" }, { opacity: 1, transform: "none" }], { duration: 520, delay: Math.min(i, 14) * 22, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" });
            }
          });
        }
        contagem.textContent = visiveis.length + " de " + docs.length + " documentos" + (visiveis.length ? "" : " — nenhum resultado");
        var palavras = visiveis.reduce(function (acc, d) { return acc + d.palavras; }, 0);
        if (visiveis.length) contagem.textContent += " · " + (palavras / 1000).toFixed(1) + " mil palavras";
      }

      function sincronizar() {
        PHB.$$("[data-g]", grupos).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.g === estado.grupo ? "true" : "false"); });
        PHB.$$("[data-t]", testes).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.t === estado.teste ? "true" : "false"); });
        tiposDisponiveis();
        render();
        var q = [];
        if (estado.grupo !== "todos") q.push("grupo=" + encodeURIComponent(estado.grupo));
        if (estado.tipo) q.push("tipo=" + encodeURIComponent(estado.tipo));
        if (estado.teste) q.push("teste=" + estado.teste);
        if (estado.q) q.push("q=" + encodeURIComponent(estado.q));
        history.replaceState(null, "", "#/arquivo" + (q.length ? "?" + q.join("&") : ""));
      }

      var espera;
      busca.addEventListener("input", function () { clearTimeout(espera); espera = setTimeout(function () { estado.q = busca.value; sincronizar(); }, 120); });
      integral.querySelector("input").addEventListener("change", function (e) {
        estado.integral = e.target.checked;
        if (estado.integral && !textosNorm) {
          contagem.textContent = "carregando o texto integral…";
          PHB.textos().then(function (T) {
            textosNorm = {};
            Object.keys(T).forEach(function (k) { textosNorm[k] = PHB.normal(T[k].replace(/<[^>]+>/g, " ")); });
            sincronizar();
          });
        } else sincronizar();
      });

      var anexosEl = h("div", { class: "fila" });
      window.PHB_INDICE.anexos.forEach(function (a) {
        anexosEl.appendChild(h("a", { class: "chip", href: "../" + a.caminho, target: "_blank", rel: "noopener" }, a.titulo + " ↗"));
      });

      el.appendChild(h("section", { class: "secao compacta" }, h("div", { class: "moldura pilha", "--pilha": "18px" },
        h("div", { class: "arq-filtros cartao" }, busca, integral, h("p", { class: "olho" }, "grupo"), grupos, h("p", { class: "olho" }, "tipo"), tipos, h("p", { class: "olho" }, "experimento"), testes),
        contagem, lista,
        h("div", { class: "arq-anexos" }, h("p", { class: "olho" }, "anexos HTML"), anexosEl))));
      sincronizar();
      return "Arquivo";
    }
  };
})();
