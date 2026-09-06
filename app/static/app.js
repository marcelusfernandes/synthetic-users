/**
 * app.js — só EXIBE o que a API devolve; nenhuma conta de eixo relacional,
 * de traço OCEAN, goodwill ou ruptura acontece aqui (CLAUDE.md, invariante
 * 1). A única aritmética permitida neste arquivo é posicionar barras
 * (valor / 10, para largura em %) — todo o resto (retorno, ganhos,
 * histerese de ruptura, cicatrizes...) é phb/engine_v3.py::step()/snapshot().
 */
"use strict";

const OCEAN_LABELS = {
  abertura: "Abertura", conscienciosidade: "Conscienciosidade",
  extroversao: "Extroversão", amabilidade: "Amabilidade", neuroticismo: "Neuroticismo",
};
const REL_LABELS = {
  warmth: "Warmth", confianca: "Confiança", respeito: "Respeito",
  irritacao: "Irritação", vigilancia: "Vigilância",
};

const estado = {
  personas: [], personaSelecionadaId: null,
  sessoes: [], sessaoSelecionadaId: null, sessaoDetalhe: null,
  catalogo: [], interlocutorSelecionado: null,
};

// --- HTTP -------------------------------------------------------------

async function apiGet(caminho) {
  const resp = await fetch(caminho);
  const corpo = await resp.json().catch(() => null);
  return { ok: resp.ok, status: resp.status, corpo };
}

async function apiPost(caminho, dados) {
  const resp = await fetch(caminho, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  const corpo = await resp.json().catch(() => null);
  return { ok: resp.ok, status: resp.status, corpo };
}

// --- utilidades de DOM --------------------------------------------------

function el(tag, atributos, filhos) {
  const node = document.createElement(tag);
  for (const [chave, valor] of Object.entries(atributos || {})) {
    if (chave === "texto") node.textContent = valor;
    else node.setAttribute(chave, valor);
  }
  for (const filho of filhos || []) node.appendChild(filho);
  return node;
}

function mostrarErro(idElemento, mensagem) {
  const p = document.getElementById(idElemento);
  p.textContent = mensagem;
  p.hidden = !mensagem;
}

function barraLinha(rotulo, valor, max) {
  const li = el("li", { class: "barra-linha" });
  li.appendChild(el("span", { texto: rotulo }));
  const fundo = el("span", { class: "barra-fundo" });
  const preenchida = el("span", { class: "barra-preenchida" });
  const pct = Math.max(0, Math.min(100, (valor / max) * 100)); // única conta: posição da barra
  preenchida.style.width = pct + "%";
  fundo.appendChild(preenchida);
  li.appendChild(fundo);
  li.appendChild(el("span", { texto: String(valor) }));
  return li;
}

// --- Personas -----------------------------------------------------------

async function carregarPersonas() {
  const { ok, corpo } = await apiGet("/api/personas");
  estado.personas = ok && corpo ? corpo.personas : [];
  renderPersonas();
}

function renderPersonas() {
  const ul = document.getElementById("personas-lista");
  ul.textContent = "";
  for (const p of estado.personas) {
    const li = el("li", {}, [
      el("strong", { texto: p.nome }),
      el("span", { texto: " — " + p.voz }),
    ]);
    if (p.id === estado.personaSelecionadaId) li.classList.add("selecionada");
    li.addEventListener("click", () => selecionarPersona(p.id));
    ul.appendChild(li);
  }
}

function selecionarPersona(id) {
  estado.personaSelecionadaId = id;
  const persona = estado.personas.find((p) => p.id === id);
  document.getElementById("sessoes-persona-nome").textContent = persona ? persona.nome : "nenhuma";
  document.getElementById("btn-nova-sessao").disabled = !persona;
  renderPersonas();
}

function lerSlidersOcean() {
  const ocean = {};
  for (const traco of Object.keys(OCEAN_LABELS)) {
    ocean[traco] = Number(document.getElementById("persona-" + traco).value);
  }
  return ocean;
}

async function onSubmitPersona(evento) {
  evento.preventDefault();
  mostrarErro("persona-erro", "");
  const payload = {
    nome: document.getElementById("persona-nome").value,
    bio: document.getElementById("persona-bio").value,
    voz: document.getElementById("persona-voz").value,
    ocean_base: lerSlidersOcean(),
  };
  const { ok, corpo } = await apiPost("/api/personas", payload);
  if (!ok) {
    mostrarErro("persona-erro", (corpo && corpo.erro) || "erro ao criar persona");
    return;
  }
  document.getElementById("form-persona").reset();
  for (const traco of Object.keys(OCEAN_LABELS)) atualizarValorSlider(traco);
  await carregarPersonas();
}

function atualizarValorSlider(traco) {
  const input = document.getElementById("persona-" + traco);
  document.getElementById("persona-" + traco + "-valor").textContent = Number(input.value).toFixed(1);
}

// --- Sessões --------------------------------------------------------------

async function carregarSessoes() {
  const { ok, corpo } = await apiGet("/api/sessoes");
  estado.sessoes = ok && corpo ? corpo.sessoes : [];
  renderSessoes();
}

function renderSessoes() {
  const ul = document.getElementById("sessoes-lista");
  ul.textContent = "";
  for (const s of estado.sessoes) {
    const li = el("li", {}, [
      el("strong", { texto: s.persona_nome || s.persona_id }),
      el("span", { texto: ` — ${s.turnos} turno(s)` }),
    ]);
    if (s.id === estado.sessaoSelecionadaId) li.classList.add("selecionada");
    li.addEventListener("click", () => selecionarSessao(s.id));
    ul.appendChild(li);
  }
}

async function onClickNovaSessao() {
  mostrarErro("sessoes-erro", "");
  if (!estado.personaSelecionadaId) return;
  const { ok, corpo } = await apiPost("/api/sessoes", { persona_id: estado.personaSelecionadaId });
  if (!ok) {
    mostrarErro("sessoes-erro", (corpo && corpo.erro) || "erro ao criar sessão");
    return;
  }
  await carregarSessoes();
  await selecionarSessao(corpo.id);
}

async function selecionarSessao(id) {
  estado.sessaoSelecionadaId = id;
  renderSessoes();
  const { ok, corpo } = await apiGet(`/api/sessoes/${id}`);
  if (!ok) return;
  estado.sessaoDetalhe = corpo;
  const nomePersona = corpo.persona ? corpo.persona.nome : corpo.persona_id;
  document.getElementById("turno-sessao-nome").textContent = nomePersona;
  atualizarSeletorInterlocutor();
  renderHistorico();
  renderSnapshotAtual();
}

// --- Turno: catálogo de eventos --------------------------------------------

async function carregarCatalogo() {
  const { ok, corpo } = await apiGet("/api/catalogo");
  estado.catalogo = ok && corpo ? corpo.eventos : [];
  renderCatalogo();
}

function renderCatalogo() {
  const ul = document.getElementById("turno-catalogo");
  ul.textContent = "";
  for (const evento of estado.catalogo) {
    const idCheckbox = "evento-" + evento.tipo;
    const idSlider = "intensidade-" + evento.tipo;
    const checkbox = el("input", { type: "checkbox", id: idCheckbox, value: evento.tipo });
    const slider = el("input", {
      type: "range", id: idSlider, min: "0", max: "1", step: "0.05", value: "0.6",
    });
    const saida = el("output", { for: idSlider, texto: "0.60" });
    slider.addEventListener("input", () => { saida.textContent = Number(slider.value).toFixed(2); });
    const li = el("li", {}, [
      el("label", {}, [checkbox, el("span", { texto: " " + evento.tipo })]),
      el("label", {}, [el("span", { texto: "intensidade " }), slider, saida]),
    ]);
    ul.appendChild(li);
  }
}

function lerEventosSelecionados() {
  const selecionados = [];
  for (const evento of estado.catalogo) {
    const checkbox = document.getElementById("evento-" + evento.tipo);
    if (checkbox.checked) {
      const slider = document.getElementById("intensidade-" + evento.tipo);
      selecionados.push({ tipo: evento.tipo, intensidade: Number(slider.value) });
    }
  }
  return selecionados;
}

async function onSubmitTurno(evento) {
  evento.preventDefault();
  mostrarErro("turno-erro", "");
  if (!estado.sessaoSelecionadaId) {
    mostrarErro("turno-erro", "selecione uma sessão primeiro");
    return;
  }
  const quem = document.getElementById("turno-quem").value.trim();
  const eventos = lerEventosSelecionados();
  if (!quem || eventos.length === 0) {
    mostrarErro("turno-erro", "informe quem e ao menos um evento");
    return;
  }
  const { ok, corpo } = await apiPost(`/api/sessoes/${estado.sessaoSelecionadaId}/turno`, { quem, eventos });
  if (!ok) {
    mostrarErro("turno-erro", (corpo && corpo.erro) || "erro ao rodar turno");
    return;
  }
  await carregarSessoes();
  await selecionarSessao(estado.sessaoSelecionadaId);
  estado.interlocutorSelecionado = quem;
  atualizarSeletorInterlocutor();
  renderSnapshotAtual();
}

// --- Snapshot e histórico ---------------------------------------------------

function atualizarSeletorInterlocutor() {
  const bloco = document.getElementById("turno-interlocutor-bloco");
  const select = document.getElementById("turno-interlocutor");
  const relacoes = (estado.sessaoDetalhe && estado.sessaoDetalhe.relacoes) || {};
  const quems = Object.keys(relacoes);
  select.textContent = "";
  if (quems.length <= 1) {
    bloco.hidden = true;
    estado.interlocutorSelecionado = quems[0] || null;
    return;
  }
  bloco.hidden = false;
  for (const quem of quems) select.appendChild(el("option", { value: quem, texto: quem }));
  if (!estado.interlocutorSelecionado || !quems.includes(estado.interlocutorSelecionado)) {
    estado.interlocutorSelecionado = quems[0];
  }
  select.value = estado.interlocutorSelecionado;
  select.onchange = () => {
    estado.interlocutorSelecionado = select.value;
    renderSnapshotAtual();
  };
}

function renderSnapshotAtual() {
  const relacoes = (estado.sessaoDetalhe && estado.sessaoDetalhe.relacoes) || {};
  const quem = estado.interlocutorSelecionado;
  const snap = quem ? relacoes[quem] : null;
  document.getElementById("snapshot-vazio").hidden = !!snap;
  document.getElementById("snapshot-conteudo").hidden = !snap;
  if (!snap) return;
  renderSnapshot(snap);
}

function renderSnapshot(snap) {
  const ulRel = document.getElementById("snapshot-rel");
  ulRel.textContent = "";
  for (const eixo of Object.keys(REL_LABELS)) {
    ulRel.appendChild(barraLinha(REL_LABELS[eixo], snap.rel[eixo], 10));
  }

  const ulOcean = document.getElementById("snapshot-ocean");
  ulOcean.textContent = "";
  for (const traco of Object.keys(OCEAN_LABELS)) {
    ulOcean.appendChild(barraLinha(OCEAN_LABELS[traco], snap.ocean[traco], 10));
  }

  const ulOutros = document.getElementById("snapshot-outros");
  ulOutros.textContent = "";
  ulOutros.appendChild(barraLinha("Goodwill", snap.goodwill, 10));
  ulOutros.appendChild(barraLinha("Confiança-prior", snap.prior_confianca, 10));
  ulOutros.appendChild(barraLinha("Exposição íntima", snap.exposicao_intima, 10));
  const liCicatrizes = el("li", { class: "barra-linha" }, [
    el("span", { texto: "Cicatrizes" }),
    el("span", {}),
    el("span", { texto: String(snap.cicatrizes) }),
  ]);
  ulOutros.appendChild(liCicatrizes);

  const marcador = document.getElementById("snapshot-ruptura");
  marcador.textContent = snap.ruptura ? "ruptura: sim" : "ruptura: não";
  marcador.classList.toggle("rompida", !!snap.ruptura);
  marcador.classList.toggle("integra", !snap.ruptura);
}

function renderHistorico() {
  const ol = document.getElementById("historico-lista");
  ol.textContent = "";
  const turnos = (estado.sessaoDetalhe && estado.sessaoDetalhe.turnos) || [];
  for (const turno of turnos) {
    const eventosTexto = turno.eventos.map((e) => `${e.tipo} (${e.intensidade})`).join(", ");
    const li = el("li", {}, [
      el("strong", { texto: `Turno ${turno.turno} — quem: ${turno.quem}` }),
      el("p", { texto: "Eventos: " + eventosTexto }),
      el("pre", { class: "log", texto: JSON.stringify(turno.log, null, 2) }),
    ]);
    ol.appendChild(li);
  }
}

// --- inicialização ----------------------------------------------------------

function ligarSlidersOcean() {
  for (const traco of Object.keys(OCEAN_LABELS)) {
    document.getElementById("persona-" + traco).addEventListener("input", () => atualizarValorSlider(traco));
  }
}

function init() {
  ligarSlidersOcean();
  document.getElementById("form-persona").addEventListener("submit", onSubmitPersona);
  document.getElementById("btn-nova-sessao").addEventListener("click", onClickNovaSessao);
  document.getElementById("form-turno").addEventListener("submit", onSubmitTurno);
  carregarPersonas();
  carregarSessoes();
  carregarCatalogo();
}

document.addEventListener("DOMContentLoaded", init);
