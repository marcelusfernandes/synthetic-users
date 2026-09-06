"""
`Handler` — o roteador HTTP da API (personas, sessões, turnos, estáticos).

Cada rota chama `app.store` (persistência) e, no máximo, `engine_v3.step`/
`snapshot` (o motor) — nenhum cálculo de eixo, OCEAN, goodwill ou ruptura
acontece aqui (CLAUDE.md, invariante 1). Qualquer exceção não tratada vira
500 `{"erro": ...}`; o traceback vai para stderr, nunca para o corpo da
resposta.
"""
import json
import re
import sys
import traceback
from http.server import BaseHTTPRequestHandler
from urllib.parse import unquote, urlsplit

from engine_v3 import EVENTS, novo_estado, snapshot, step
import run_turn

from . import estatico, store, validacao

ROTA_PERSONA = re.compile(r"^/api/personas/([^/]+)$")
ROTA_SESSAO = re.compile(r"^/api/sessoes/([^/]+)$")
ROTA_TURNO = re.compile(r"^/api/sessoes/([^/]+)/turno$")
ROTA_ESTATICO = re.compile(r"^/static/(.+)$")


class Handler(BaseHTTPRequestHandler):
    # --- utilitários de resposta ---------------------------------------

    def _dados_dir(self) -> str:
        return self.server.dados_dir

    def _json(self, status: int, payload) -> None:
        corpo = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    def _erro(self, status: int, mensagem: str) -> None:
        self._json(status, {"erro": mensagem})

    def _erro_interno(self) -> None:
        traceback.print_exc(file=sys.stderr)
        self._erro(500, "erro interno")

    def _servir_arquivo(self, caminho_relativo: str) -> None:
        resolvido = estatico.resolver_arquivo(caminho_relativo)
        if resolvido is None:
            self._erro(404, "não encontrado")
            return
        caminho_abs, mime = resolvido
        with open(caminho_abs, "rb") as f:
            corpo = f.read()
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    def _ler_corpo_json(self):
        tamanho = int(self.headers.get("Content-Length") or 0)
        bruto = self.rfile.read(tamanho) if tamanho else b""
        if not bruto:
            return {}
        try:
            return json.loads(bruto)
        except json.JSONDecodeError:
            raise ValueError("JSON inválido")

    def log_message(self, formato, *args):  # silencia o log de acesso padrão
        pass

    # --- despacho ---------------------------------------------------------

    def do_GET(self):
        caminho = unquote(urlsplit(self.path).path)
        try:
            self._rotear_get(caminho)
        except store.IdInvalido:
            self._erro(404, "não encontrado")
        except Exception:
            self._erro_interno()

    def do_POST(self):
        caminho = unquote(urlsplit(self.path).path)
        try:
            self._rotear_post(caminho)
        except store.IdInvalido:
            self._erro(404, "não encontrado")
        except ValueError as e:
            self._erro(400, str(e))
        except Exception:
            self._erro_interno()

    # --- rotas GET ----------------------------------------------------

    def _rotear_get(self, caminho: str) -> None:
        m_persona = ROTA_PERSONA.match(caminho)
        m_sessao = ROTA_SESSAO.match(caminho)
        m_estatico = ROTA_ESTATICO.match(caminho)

        if caminho == "/":
            self._servir_arquivo("index.html")
        elif caminho == "/api/config":
            self._json(200, {"llm": False, "modelo": None})
        elif caminho == "/api/catalogo":
            self._json(200, {"eventos": [
                {"tipo": tipo, "eixos": spec["axes"], "valencia": spec["valencia"]}
                for tipo, spec in EVENTS.items()
            ]})
        elif caminho == "/api/personas":
            self._json(200, {"personas": store.listar_personas(self._dados_dir())})
        elif m_persona:
            self._get_persona(m_persona.group(1))
        elif caminho == "/api/sessoes":
            self._json(200, {"sessoes": self._listar_sessoes_resumo()})
        elif m_sessao:
            self._get_sessao(m_sessao.group(1))
        elif m_estatico:
            self._servir_arquivo(m_estatico.group(1))
        else:
            self._erro(404, "não encontrado")

    def _get_persona(self, persona_id: str) -> None:
        persona = store.carregar_persona(self._dados_dir(), persona_id)
        if persona is None:
            self._erro(404, "persona não encontrada")
        else:
            self._json(200, persona)

    def _listar_sessoes_resumo(self) -> list:
        dados_dir = self._dados_dir()
        resumo = []
        for s in store.listar_sessoes(dados_dir):
            persona = store.carregar_persona(dados_dir, s["persona_id"])
            resumo.append({
                "id": s["id"], "persona_id": s["persona_id"],
                "persona_nome": persona["nome"] if persona else None,
                "turnos": len(s["turnos"]), "criada_em": s["criada_em"],
            })
        return resumo

    def _get_sessao(self, sessao_id: str) -> None:
        dados_dir = self._dados_dir()
        doc = store.carregar_sessao(dados_dir, sessao_id)
        if doc is None:
            self._erro(404, "sessão não encontrada")
            return
        persona = store.carregar_persona(dados_dir, doc["persona_id"])
        estado = doc["estado_obj"]
        relacoes = {quem: snapshot(estado, quem) for quem in estado.relacoes}
        self._json(200, {
            "id": doc["id"], "persona_id": doc["persona_id"], "persona": persona,
            "relacoes": relacoes, "turnos": doc["turnos"],
        })

    # --- rotas POST ---------------------------------------------------

    def _rotear_post(self, caminho: str) -> None:
        m_turno = ROTA_TURNO.match(caminho)
        if caminho == "/api/personas":
            self._criar_persona()
        elif caminho == "/api/sessoes":
            self._criar_sessao()
        elif m_turno:
            self._executar_turno(m_turno.group(1))
        else:
            self._erro(404, "não encontrado")

    def _criar_persona(self) -> None:
        persona_validada = validacao.validar_persona(self._ler_corpo_json())
        dados_dir = self._dados_dir()
        persona = {
            "id": store.novo_id(persona_validada["nome"]),
            "criada_em": store.agora_iso(),
            **persona_validada,
        }
        store.salvar_persona(dados_dir, persona)
        self._json(201, persona)

    def _criar_sessao(self) -> None:
        dados = self._ler_corpo_json()
        if not isinstance(dados, dict):
            raise ValueError("corpo inválido: esperado um objeto JSON")
        persona_id = str(dados.get("persona_id") or "").strip()
        if not persona_id:
            raise ValueError("persona_id não pode ser vazio")

        dados_dir = self._dados_dir()
        persona = store.carregar_persona(dados_dir, persona_id)
        if persona is None:
            self._erro(404, "persona não encontrada")
            return

        estado = novo_estado(ocean_base=persona["ocean_base"])
        sessao = {
            "id": store.novo_id(persona["nome"]),
            "persona_id": persona_id,
            "criada_em": store.agora_iso(),
            "turnos": [],
            "estado_obj": estado,
        }
        store.salvar_sessao(dados_dir, sessao)
        self._json(201, {
            "id": sessao["id"], "persona_id": persona_id,
            "criada_em": sessao["criada_em"], "turnos": [],
        })

    def _executar_turno(self, sessao_id: str) -> None:
        turno_validado = validacao.validar_turno(self._ler_corpo_json())
        dados_dir = self._dados_dir()
        doc = store.carregar_sessao(dados_dir, sessao_id)
        if doc is None:
            self._erro(404, "sessão não encontrada")
            return

        estado = doc["estado_obj"]
        log = step(estado, run_turn.cfg_ideal(), turno_validado["quem"], turno_validado["eventos"])
        snap = snapshot(estado, turno_validado["quem"])
        turno = {
            "turno": len(doc["turnos"]) + 1,
            "quem": turno_validado["quem"],
            "eventos": turno_validado["eventos"],
            "snapshot": snap,
            "log": log,
        }
        doc["turnos"].append(turno)
        store.salvar_sessao(dados_dir, doc)
        self._json(200, turno)
