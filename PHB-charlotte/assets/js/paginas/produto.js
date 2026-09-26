/* =========================================================================
   Do laboratório ao produto — core M3, contrato HTTP, validação, processo.
   Fontes: docs/core-experiencia.md, docs/validacao-core.md,
   contracts/http-atual.md, README.md, docs/piloto-openrouter.md, docs/codex.md.
   ========================================================================= */
(function () {
  "use strict";
  var PHB = window.PHB, h = PHB.h, C = PHB.comp;

  function jornadaProduto() {
    var etapas = [
      ["Perfil", "nome, bio, voz e os cinco OCEAN de 0 a 10", "#/perfis"],
      ["Sessão", "abrir ou retomar; o interlocutor identifica a relação", "#/sessoes"],
      ["Interação", "conversa com LLM ou eventos manuais do catálogo", "/mensagem · /turno"],
      ["Histórico", "eventos, texto, narrativa, snapshot e log por turno", "evolução por relação"],
      ["Retomada", "recarregar e continuar do estado salvo", "sem reenvio automático"]
    ];
    var trilha = h("ol", { class: "jp" });
    etapas.forEach(function (e, i) {
      trilha.appendChild(h("li", { class: "jp-etapa", "data-revela": "", "--atraso": i * 120, style: { "--i": i } },
        h("span", { class: "jp-ponto" }), h("b", null, e[0]), h("span", { class: "mudo" }, e[1]), h("code", null, e[2])));
    });
    return h("div", { class: "pilha", "--pilha": "20px" }, trilha,
      h("p", { class: "mudo", "data-revela": "" }, "React + TypeScript + StyleX em ", h("code", null, "apps/frontend/"), ", separado da API Python stdlib. O front só mostra o novo estado após confirmação do servidor e nunca recalcula eixos: exibe o snapshot que o motor devolve."));
  }

  function validacao() {
    var nums = h("div", { class: "numeros" },
      h("div", { class: "numero" }, h("small", null, "motor"), h("b", null, "14/14"), h("span", null, "testes em phb/test_engine_v3.py")),
      h("div", { class: "numero" }, h("small", null, "API, LLM e estáticos"), h("b", null, "56/56"), h("span", null, "integração com servidor real em porta efêmera")),
      h("div", { class: "numero" }, h("small", null, "frontend"), h("b", null, "22/22"), h("span", null, "testes em seis arquivos, fetch real para o Python")),
      h("div", { class: "numero" }, h("small", null, "TypeScript + build"), h("b", null, "0"), h("span", null, "erros; JS/CSS locais, StyleX extraído")));
    var qa = [
      ["Fundação", "overview vazio real, navegação, foco no título, Tab/Enter, reload"],
      ["Perfil", "nome vazio anuncia erro e recebe foco; OCEAN por seta; detalhe/lista/reload preservam valores"],
      ["Sessão manual", "interlocutor obrigatório, adicionar/remover eventos, ordem preservada"],
      ["Conversa emulada", "pending visível, controles bloqueados, um turno confirmado"],
      ["Falhas do provedor", "erro explícito, rascunho preservado, contador e estado não avançam"],
      ["Resposta perdida", "vira incerteza; só a conferência libera o formulário"],
      ["Telas estreitas", "390 px e 320 px: formulários, tabelas e gráfico utilizáveis"]
    ];
    var lista = h("div", { class: "qa" });
    qa.forEach(function (q, i) {
      lista.appendChild(h("div", { class: "qa-linha", "data-revela": "", "--atraso": i * 60 }, h("span", { class: "caixa feita" }), h("b", null, q[0]), h("span", { class: "mudo" }, q[1])));
    });
    var bugs = [
      ["Rótulos do gráfico encolhiam no celular", "texto SVG responsivo, margem maior, rótulos reduzidos aos extremos"],
      ["Criação pendente perdida ao desmontar o formulário", "estado da criação subiu para o App"],
      ["Confirmação duplicava um card já listado", "confirmação passa a atualizar por id"]
    ];
    var corrigidos = h("div", { class: "grade g-3" });
    bugs.forEach(function (b, i) {
      corrigidos.appendChild(h("article", { class: "cartao bug", "data-revela": "", "--atraso": i * 100 },
        h("span", { class: "carimbo ok" }, "corrigido"), h("h3", null, b[0]), h("p", { class: "mudo" }, b[1])));
    });
    return h("div", { class: "pilha", "--pilha": "28px" }, nums,
      h("div", { class: "grade g-2" }, h("div", { class: "cartao" }, h("p", { class: "olho" }, "QA independente no navegador"), lista),
        h("div", { class: "pilha" }, h("p", { class: "lead", "data-revela": "" }, "Validação técnica, não pesquisa humana: o provedor de QA devolve respostas fixas e não comprova qualidade de um modelo real. Não houve avaliação com cinco pessoas nem comprovação de fidelidade comportamental."),
          h("p", { class: "nota" }, "Ambiente: macOS e CI Linux, Python 3.12, Node 22; viewports 1718×904, 390×844 e 320 px, emulados."))),
      h("p", { class: "olho" }, "Problemas encontrados e corrigidos"), corrigidos);
  }

  function rotas() {
    var r = [
      ["GET", "/api/config", "{llm, modelo}"], ["GET", "/api/catalogo", "os 13 eventos do motor"], ["GET", "/api/personas", "lista"],
      ["POST", "/api/personas", "cria (nome, bio, voz, ocean_base)"], ["GET", "/api/personas/{id}", "uma persona"], ["GET", "/api/sessoes", "resumos"],
      ["POST", "/api/sessoes", "abre para persona_id"], ["GET", "/api/sessoes/{id}", "persona, relações e turnos"],
      ["POST", "/api/sessoes/{id}/turno", "eventos → engine_v3.step()"], ["POST", "/api/sessoes/{id}/mensagem", "interpreta → step() → narra"]
    ];
    var el = h("div", { class: "rotas" });
    r.forEach(function (x, i) {
      el.appendChild(h("div", { class: "rota", "data-revela": "", "--atraso": i * 45 },
        h("span", { class: "verbo " + x[0].toLowerCase() }, x[0]), h("code", null, x[1]), h("span", { class: "mudo" }, x[2])));
    });
    var prov = h("div", { class: "grade g-2" },
      h("div", { class: "cartao" }, h("p", { class: "olho" }, "provedor padrão"), h("h3", null, "Anthropic"), h("p", { class: "mudo" }, "PHB_MODEL padrão claude-sonnet-5. Só a chave do provedor selecionado liga o turno com LLM.")),
      h("div", { class: "cartao" }, h("p", { class: "olho" }, "alternativo"), h("h3", null, "OpenRouter"), h("p", { class: "mudo" }, "PHB_MODEL obrigatório, sem fallback silencioso. Respostas vazias ou incompletas encerram o ciclo sem persistir turno parcial.")));
    return h("div", { class: "pilha", "--pilha": "24px" }, el, prov,
      h("p", { class: "nota" }, "Segredos só por ambiente: a chave nunca aparece em arquivo, log ou resposta HTTP. Sem ela, o front funciona com eventos escolhidos à mão."));
  }

  function anexos() {
    var A = window.PHB_INDICE.anexos;
    var g = h("div", { class: "grade g-2 anexos" });
    A.forEach(function (a, i) {
      var quadro = h("div", { class: "anexo-quadro" }, h("div", { class: "anexo-barra" }, h("i"), h("i"), h("i"), h("span", { class: "motor-t" }, a.caminho.split("/").pop())));
      var abrir = h("button", { class: "botao pequeno", type: "button" }, "Carregar prévia aqui");
      var alvo = h("div", { class: "anexo-alvo" }, abrir);
      abrir.addEventListener("click", function () {
        alvo.innerHTML = "";
        alvo.appendChild(h("iframe", { src: "../" + a.caminho, title: a.titulo, loading: "lazy" }));
      });
      quadro.appendChild(alvo);
      g.appendChild(h("article", { class: "cartao anexo", "data-revela": "", "--atraso": i * 120 },
        quadro, h("h3", null, a.titulo),
        h("a", { class: "sublinha nota", href: "../" + a.caminho, target: "_blank", rel: "noopener" }, "abrir em nova aba ↗")));
    });
    return h("div", { class: "pilha" }, g, h("p", { class: "nota" }, "Documentos HTML autocontidos do repositório, abertos a partir de ../docs/. Funcionam quando o site é servido a partir da raiz do repositório ou aberto pelo disco."));
  }

  PHB.paginas.produto = {
    render: function (el) {
      el.appendChild(C.cabecalho({ olho: "Core da experiência · M3", titulo: "Do laboratório à <em class=\"voz\">interface</em>.",
        lead: "A jornada perfil → sessão → interação → histórico → retomada, com um front React/TypeScript/StyleX sobre a API Python e o motor preservados." }));
      el.appendChild(C.secao({ olho: "A jornada do produto", titulo: "Cinco passos, estado sempre do servidor." }, jornadaProduto()));
      el.appendChild(C.secao({ olho: "Validação do core", titulo: "Comprovado — e com limites declarados." }, validacao()));
      el.appendChild(C.secao({ olho: "Contrato HTTP", titulo: "Dez rotas entre a interface e o motor." }, rotas()));
      el.appendChild(C.secao({ olho: "Anexos visuais", titulo: "As peças HTML do repositório." }, anexos()));
      var docs = PHB.docs().filter(function (d) { return d.grupo === "produto"; });
      el.appendChild(C.secao({ olho: "Leitura integral", titulo: "Produto e processo.", lead: "O guia do core, a validação, o contrato HTTP, o piloto OpenRouter e o desenvolvimento com Codex." }, C.outputs(docs)));
      el.appendChild(C.proximo("Próximo", "O arquivo completo", "#/arquivo"));
      return "Produto";
    }
  };
})();
