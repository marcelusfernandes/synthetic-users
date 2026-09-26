"""
PHB Charlotte — gerador de dados do site.

Lê o repositório (documentação, experimentos, fundação, código do motor),
renderiza todo o Markdown em HTML, roda o motor real (`phb/engine_v3.py` com
`phb/config_v3_ideal.json`) sobre os cenários do teste 004 e o replay do
teste 005, e extrai séries turno a turno das sessões do teste 002.

O site nunca calcula estado: só anima os snapshots gerados aqui pelo motor.

Uso:
  python3 PHB-charlotte/build.py           # regenera PHB-charlotte/dados/*.js
  python3 PHB-charlotte/build.py --check   # falha se os dados estão desatualizados

Python 3 stdlib apenas.
"""
import html
import json
import math
import posixpath
import re
import sys
import unicodedata
from pathlib import Path

SITE = Path(__file__).resolve().parent
RAIZ = SITE.parent
DADOS = SITE / "dados"

sys.path.insert(0, str(RAIZ / "phb"))
import engine_v3 as motor  # noqa: E402
import calibrar_v3 as calib  # noqa: E402


# ===========================================================================
# Utilidades
# ===========================================================================
def slug_github(texto, usados):
    """Slug no formato do GitHub (mantém acentos), deduplicado."""
    s = texto.strip().lower()
    s = re.sub(r"[^\w\- ]", "", s)
    s = s.replace(" ", "-")
    base, n = s, 1
    while s in usados:
        s = f"{base}-{n}"
        n += 1
    usados.add(s)
    return s


def texto_puro(html_str):
    t = re.sub(r"<[^>]+>", "", html_str)
    return html.unescape(t)


def r3(v):
    return round(float(v), 3)


# ===========================================================================
# Realce de código (tokenizadores simples, determinísticos)
# ===========================================================================
PY_KW = {"False", "None", "True", "and", "as", "assert", "break", "class", "continue",
         "def", "del", "elif", "else", "except", "finally", "for", "from", "global", "if",
         "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise",
         "return", "try", "while", "with", "yield"}


def _span(cls, txt):
    return f'<span class="t-{cls}">{html.escape(txt, quote=False)}</span>'


def realce_python(src):
    tok = re.compile(r'(?P<com>#[^\n]*)|(?P<str>"""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\'|"(?:\\.|[^"\\\n])*"|\'(?:\\.|[^\'\\\n])*\')'
                     r'|(?P<num>\b\d+(?:\.\d+)?\b)|(?P<id>[A-Za-z_]\w*)|(?P<outro>[\s\S])')
    out, prev = [], ""
    for m in tok.finditer(src):
        k, v = m.lastgroup, m.group()
        if k == "id":
            if v in PY_KW:
                out.append(_span("kw", v))
            elif prev in ("def", "class"):
                out.append(_span("fn", v))
            else:
                out.append(html.escape(v, quote=False))
            prev = v
        elif k == "outro":
            out.append(html.escape(v, quote=False))
            if not v.isspace():
                prev = ""
        else:
            out.append(_span(k, v))
            prev = ""
    return "".join(out)


def realce_json(src):
    tok = re.compile(r'(?P<chave>"(?:\\.|[^"\\])*"(?=\s*:))|(?P<str>"(?:\\.|[^"\\])*")'
                     r'|(?P<num>-?\b\d+(?:\.\d+)?(?:[eE][-+]?\d+)?\b)|(?P<lit>\btrue\b|\bfalse\b|\bnull\b)|(?P<outro>[\s\S])')
    out = []
    for m in tok.finditer(src):
        k, v = m.lastgroup, m.group()
        out.append(_span({"chave": "key", "str": "str", "num": "num", "lit": "kw"}[k], v) if k != "outro"
                   else html.escape(v, quote=False))
    return "".join(out)


def realce_yaml_linha(linha):
    # comentário: '#' no início ou precedido de espaço, fora de aspas (aproximação)
    corpo, com = linha, ""
    em_aspas = None
    for i, ch in enumerate(linha):
        if ch in "\"'" and em_aspas is None:
            em_aspas = ch
        elif ch == em_aspas:
            em_aspas = None
        elif ch == "#" and em_aspas is None and (i == 0 or linha[i - 1] in " \t"):
            corpo, com = linha[:i], linha[i:]
            break
    m = re.match(r"^(\s*(?:-\s+)?)([\w.<>\-]+)(\s*:)(?=\s|$)(.*)$", corpo)
    if m:
        ini, chave, dp, resto = m.groups()
        partes = [html.escape(ini, quote=False), _span("key", chave), html.escape(dp, quote=False),
                  _realce_valor(resto)]
    else:
        partes = [_realce_valor(corpo)]
    if com:
        partes.append(_span("com", com))
    return "".join(partes)


def _realce_valor(txt):
    tok = re.compile(r'(?P<str>"(?:\\.|[^"\\])*"|\'[^\']*\')|(?P<num>(?<![\w.])-?\d+(?:\.\d+)?(?![\w.]))'
                     r'|(?P<lit>\b(?:true|false|null)\b)|(?P<outro>[\s\S])')
    out = []
    for m in tok.finditer(txt):
        k, v = m.lastgroup, m.group()
        out.append(_span({"str": "str", "num": "num", "lit": "kw"}[k], v) if k != "outro"
                   else html.escape(v, quote=False))
    return "".join(out)


def realce_shell(src):
    return "\n".join(_span("com", l) if l.lstrip().startswith("#") else html.escape(l, quote=False)
                     for l in src.split("\n"))


def realce(src, lang):
    lang = (lang or "").lower()
    if lang in ("python", "py"):
        return realce_python(src)
    if lang == "json":
        return realce_json(src)
    if lang in ("yaml", "yml", "mdc"):
        return "\n".join(realce_yaml_linha(l) for l in src.split("\n"))
    if lang in ("bash", "sh", "shell", "console"):
        return realce_shell(src)
    return html.escape(src, quote=False)


def bloco_codigo(src, lang, linhas=False):
    corpo = realce(src.rstrip("\n"), lang)
    if linhas:
        corpo = "\n".join(f'<span class="ln">{l}</span>' for l in corpo.split("\n"))
    rotulo = html.escape(lang or "texto")
    classe = "codigo com-linhas" if linhas else "codigo"
    return (f'<figure class="{classe}"><figcaption><span>{rotulo}</span>'
            f'<button type="button" class="copiar" data-copiar>copiar</button></figcaption>'
            f'<pre><code>{corpo}</code></pre></figure>')


# ===========================================================================
# Markdown → HTML
# ===========================================================================
LIST_RE = re.compile(r"^( *)([-*+]|\d{1,9}[.)])( +|$)(.*)$")
FENCE_RE = re.compile(r"^( *)(`{3,}|~{3,})\s*([\w+#.-]*)")
HEAD_RE = re.compile(r"^(#{1,6})\s+(.*?)\s*#*\s*$")
HR_RE = re.compile(r"^ {0,3}([-*_])(?:\s*\1){2,}\s*$")
SEP_RE = re.compile(r"^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$")


class Contexto:
    """Estado da renderização de um documento: caminho de origem, âncoras e sumário."""

    def __init__(self, caminho, resolver):
        self.caminho = caminho
        self.resolver = resolver
        self.slugs = set()
        self.sumario = []


def indent(l):
    return len(l) - len(l.lstrip(" "))


def e_tabela(lines, i):
    return "|" in lines[i] and i + 1 < len(lines) and SEP_RE.match(lines[i + 1]) is not None


def inicia_bloco(lines, i):
    l = lines[i]
    return bool(HEAD_RE.match(l) or FENCE_RE.match(l) or HR_RE.match(l)
                or l.lstrip().startswith(">") or LIST_RE.match(l) or e_tabela(lines, i))


def md(texto, ctx):
    lines = texto.replace("\t", "    ").replace("\r\n", "\n").split("\n")
    blocos = parse_blocos(lines, ctx)
    return "\n".join(b[1] for b in blocos)


def parse_blocos(lines, ctx):
    out, i = [], 0
    while i < len(lines):
        l = lines[i]
        if not l.strip():
            i += 1
            continue
        m = FENCE_RE.match(l)
        if m:
            ind, cerca, lang = len(m.group(1)), m.group(2), m.group(3)
            j, corpo = i + 1, []
            while j < len(lines) and not lines[j].strip().startswith(cerca):
                corpo.append(lines[j][ind:] if lines[j][:ind].strip() == "" else lines[j])
                j += 1
            out.append(("code", bloco_codigo("\n".join(corpo), lang)))
            i = j + 1
            continue
        m = HEAD_RE.match(l)
        if m:
            nivel = len(m.group(1))
            interno = inline(m.group(2), ctx)
            ancora = slug_github(texto_puro(interno), ctx.slugs)
            if nivel <= 3:
                ctx.sumario.append([nivel, ancora, texto_puro(interno)])
            out.append(("h", f'<h{nivel} id="{ancora}"><a class="ancora" href="#/doc/{ctx.caminho}#{ancora}" '
                             f'data-ancora="{ancora}" aria-hidden="true" tabindex="-1">#</a>{interno}</h{nivel}>'))
            i += 1
            continue
        if HR_RE.match(l):
            out.append(("hr", "<hr>"))
            i += 1
            continue
        if e_tabela(lines, i):
            i = parse_tabela(lines, i, ctx, out)
            continue
        if l.lstrip().startswith(">"):
            corpo = []
            while i < len(lines) and lines[i].strip():
                s = lines[i].lstrip()
                if s.startswith(">"):
                    corpo.append(re.sub(r"^> ?", "", s))
                elif corpo and not inicia_bloco(lines, i):
                    corpo.append(s)
                else:
                    break
                i += 1
            interno = "\n".join(b[1] for b in parse_blocos(corpo, ctx))
            out.append(("quote", f"<blockquote>{interno}</blockquote>"))
            continue
        if LIST_RE.match(l):
            i = parse_lista(lines, i, ctx, out)
            continue
        # parágrafo
        par = []
        while i < len(lines) and lines[i].strip():
            if par and inicia_bloco(lines, i):
                break
            par.append(lines[i])
            i += 1
        txt = ""
        for k, p in enumerate(par):
            quebra = p.endswith("  ") or p.endswith("\\")
            txt += p.strip().rstrip("\\") + ("\u0000BR\u0000" if quebra and k < len(par) - 1 else " ")
        interno = inline(txt.strip(), ctx).replace("\u0000BR\u0000", "<br>")
        out.append(("p", f"<p>{interno}</p>", interno))
    return out


def dividir_linha(l):
    s = l.strip()
    if s.startswith("|"):
        s = s[1:]
    if s.endswith("|") and not s.endswith("\\|"):
        s = s[:-1]
    return [c.strip() for c in re.split(r"(?<!\\)\|", s)]


def parse_tabela(lines, i, ctx, out):
    cab = dividir_linha(lines[i])
    alin = []
    for c in dividir_linha(lines[i + 1]):
        c = c.strip()
        alin.append("center" if c.startswith(":") and c.endswith(":") else "right" if c.endswith(":") else "")
    i += 2
    linhas = []
    while i < len(lines) and lines[i].strip() and "|" in lines[i]:
        linhas.append(dividir_linha(lines[i]))
        i += 1

    def cel(tag, txt, k):
        a = alin[k] if k < len(alin) else ""
        st = f' style="text-align:{a}"' if a else ""
        return f"<{tag}{st}>{inline(txt, ctx)}</{tag}>"

    thead = "<tr>" + "".join(cel("th", c, k) for k, c in enumerate(cab)) + "</tr>"
    tbody = "".join("<tr>" + "".join(cel("td", (r[k] if k < len(r) else ""), k) for k in range(len(cab))) + "</tr>"
                    for r in linhas)
    out.append(("table", f'<div class="tabela" tabindex="0"><table><thead>{thead}</thead>'
                         f"<tbody>{tbody}</tbody></table></div>"))
    return i


def parse_lista(lines, i, ctx, out):
    m0 = LIST_RE.match(lines[i])
    base = len(m0.group(1))
    ordenada = m0.group(2)[0].isdigit()
    inicio = int(m0.group(2)[:-1]) if ordenada else 1
    itens, solta = [], False
    while i < len(lines):
        m = LIST_RE.match(lines[i])
        if not (m and len(m.group(1)) < base + 2 and m.group(2)[0].isdigit() == ordenada):
            break
        esp = len(m.group(3)) if m.group(3) else 1
        cont = len(m.group(1)) + len(m.group(2)) + (esp if esp <= 4 else 1)
        corpo = [m.group(4)]
        i += 1
        while i < len(lines):
            l = lines[i]
            if not l.strip():
                j = i + 1
                while j < len(lines) and not lines[j].strip():
                    j += 1
                if j < len(lines) and indent(lines[j]) >= cont:
                    corpo.append("")
                    i = j
                    continue
                break
            ind = indent(l)
            if ind >= cont or (ind > base and LIST_RE.match(l)):
                corpo.append(l[min(ind, cont):])
                i += 1
                continue
            if LIST_RE.match(l) or inicia_bloco(lines, i):
                break
            corpo.append(l.strip())
            i += 1
        itens.append(corpo)
        # linhas em branco entre itens irmãos → lista "solta"
        j = i
        while j < len(lines) and not lines[j].strip():
            j += 1
        if j > i and j < len(lines):
            m2 = LIST_RE.match(lines[j])
            if m2 and len(m2.group(1)) < base + 2 and m2.group(2)[0].isdigit() == ordenada:
                solta = True
                i = j
    html_itens = []
    for corpo in itens:
        tarefa = ""
        mt = re.match(r"^\[([ xX])\]\s+(.*)$", corpo[0])
        if mt:
            feita = mt.group(1).lower() == "x"
            tarefa = f'<span class="caixa{" feita" if feita else ""}" aria-label="{"feito" if feita else "pendente"}"></span>'
            corpo = [mt.group(2)] + corpo[1:]
        blocos = parse_blocos(corpo, ctx)
        if not solta:
            interno = "".join(b[2] if b[0] == "p" else b[1] for b in blocos)
        else:
            interno = "".join(b[1] for b in blocos)
        cls = ' class="tarefa"' if tarefa else ""
        html_itens.append(f"<li{cls}>{tarefa}{interno}</li>")
    if ordenada:
        st = f' start="{inicio}"' if inicio != 1 else ""
        out.append(("list", f"<ol{st}>{''.join(html_itens)}</ol>"))
    else:
        out.append(("list", f"<ul>{''.join(html_itens)}</ul>"))
    return i


def inline(txt, ctx, _guard=None):
    raiz = _guard is None
    guard = [] if raiz else _guard

    def guardar(h):
        guard.append(h)
        return f"\u0001{len(guard) - 1}\u0001"

    # 1. código inline
    txt = re.sub(r"(`+)(.+?)\1", lambda m: guardar(f"<code>{html.escape(m.group(2).strip(), quote=False)}</code>"), txt)
    # 2. escapes
    txt = re.sub(r"\\([\\`*_{}\[\]()#+\-.!|\"'<>~])", lambda m: guardar(html.escape(m.group(1))), txt)
    # 3. autolinks
    txt = re.sub(r"<(https?://[^>\s]+)>", lambda m: guardar(ctx.resolver.link(m.group(1), html.escape(m.group(1)), ctx)), txt)
    # 4. imagens (sem imagens no acervo: mostra o texto alternativo)
    txt = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", lambda m: guardar(f"<em>{html.escape(m.group(1))}</em>"), txt)
    # 5. links
    txt = re.sub(r"\[((?:[^\[\]]|\[[^\]]*\])+)\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)",
                 lambda m: guardar(ctx.resolver.link(m.group(2), inline(m.group(1), ctx, guard), ctx)), txt)
    # 6. escapa o restante
    txt = html.escape(txt, quote=False)
    # 7. URLs soltas
    def url_solta(m):
        u = m.group(0)
        resto = ""
        while u and u[-1] in ".,;:!?)":
            resto = u[-1] + resto
            u = u[:-1]
        return guardar(ctx.resolver.link(u, u, ctx)) + resto
    txt = re.sub(r"https?://[^\s<\u0001]+", url_solta, txt)
    # 8. ênfases
    txt = re.sub(r"\*\*(?=\S)(.+?)(?<=\S)\*\*", r"<strong>\1</strong>", txt)
    txt = re.sub(r"(?<!\w)__(?=\S)(.+?)(?<=\S)__(?!\w)", r"<strong>\1</strong>", txt)
    txt = re.sub(r"(?<![*\w])\*(?=[^\s*])(.+?)(?<=[^\s*])\*(?![*\w])", r"<em>\1</em>", txt)
    txt = re.sub(r"(?<!\w)_(?=\S)(.+?)(?<=\S)_(?!\w)", r"<em>\1</em>", txt)
    txt = re.sub(r"~~(?=\S)(.+?)(?<=\S)~~", r"<del>\1</del>", txt)
    # 9. devolve o que foi guardado (pode haver aninhamento)
    while raiz and "\u0001" in txt:
        txt = re.sub(r"\u0001(\d+)\u0001", lambda m: guard[int(m.group(1))], txt)
    return txt


# ===========================================================================
# Acervo: quais arquivos entram no site e como se classificam
# ===========================================================================
def classificar(p):
    """(grupo, tipo, teste) de um caminho relativo à raiz."""
    partes = p.split("/")
    if partes[0] == "testes":
        if len(partes) == 2:
            return ("experimentos", "guia", None)
        if partes[1] == "templates":
            return ("experimentos", "template", None)
        teste = partes[1][:3]
        nome = partes[-1]
        if "sessoes" in partes:
            tipo = "dados" if nome.endswith(".json") else "sessão"
        elif "auditorias" in partes:
            tipo = "auditoria"
        elif nome == "protocolo.md":
            tipo = "protocolo"
        elif nome == "relatorio.md":
            tipo = "relatório"
        else:
            tipo = "outro"
        return ("experimentos", tipo, teste)
    if partes[0] == "docs":
        produto = {"core-experiencia.md", "validacao-core.md", "piloto-openrouter.md", "codex.md"}
        if partes[1] in produto:
            return ("produto", "produto", None)
        if partes[1] == "opacidade-entre-mentes.md":
            return ("explicacoes", "documento norte", None)
        return ("explicacoes", "explicação", None)
    if partes[0] == "contracts":
        return ("produto", "contrato", None)
    if p in ("README.md", "documentacao.md"):
        return ("explicacoes", "visão geral" if p == "README.md" else "especificação", None)
    tipos = {"exemplos": "instância", "arquetipos": "arquétipo", "padroes_compra": "padrão de compra",
             "modificadores": "modificador", "dual_class": "dual class", "pesquisas": "canon",
             "personas": "persona"}
    if partes[0] in tipos:
        tipo = "guia" if partes[-1] == "README.md" else tipos[partes[0]]
        return ("fundacao", tipo, None)
    if partes[0] == "phb":
        return ("codigo", "código", None)
    return ("outros", "outro", None)


def listar_fontes():
    padroes = ["README.md", "documentacao.md", "docs/*.md", "contracts/*.md", "testes/README.md",
               "testes/templates/*.md", "testes/*/*.md", "testes/*/*/*.md", "testes/*/*/*.json",
               "exemplos/*.md", "exemplos/*.mdc", "arquetipos/*.md", "padroes_compra/*.md",
               "modificadores/*.md", "dual_class/*.md", "pesquisas/*.md", "personas/*.json",
               "phb/*.py", "phb/*.json"]
    vistos = set()
    for pad in padroes:
        for f in sorted(RAIZ.glob(pad)):
            rel = f.relative_to(RAIZ).as_posix()
            if rel not in vistos:
                vistos.add(rel)
                yield rel


ANEXOS = {"docs/pipeline-phb-v3.html", "docs/experiencia-produto-phb.html"}


class Resolver:
    def __init__(self, acervo):
        self.acervo = acervo

    def link(self, href, rotulo, ctx):
        if re.match(r"^(https?:|mailto:)", href):
            return f'<a href="{html.escape(href)}" target="_blank" rel="noopener" class="externo">{rotulo}</a>'
        if href.startswith("#"):
            return f'<a href="#/doc/{ctx.caminho}{html.escape(href)}" data-ancora="{html.escape(href[1:])}">{rotulo}</a>'
        caminho, _, ancora = href.partition("#")
        caminho = re.sub(r":\d+$", "", caminho)
        alvo = posixpath.normpath(posixpath.join(posixpath.dirname(ctx.caminho), caminho))
        sufixo = f"#{html.escape(ancora)}" if ancora else ""
        m = re.match(r"^testes/(\d{3})-[^/]+$", alvo)
        if m and not caminho.endswith(".md"):
            return f'<a href="#/testes/{m.group(1)}">{rotulo}</a>'
        if alvo in self.acervo:
            return f'<a href="#/doc/{alvo}{sufixo}">{rotulo}</a>'
        if f"{alvo}/README.md" in self.acervo:
            return f'<a href="#/doc/{alvo}/README.md">{rotulo}</a>'
        if alvo == "testes":
            return f'<a href="#/testes">{rotulo}</a>'
        cls = "anexo" if alvo in ANEXOS else "fonte"
        return f'<a href="../{html.escape(alvo)}" target="_blank" rel="noopener" class="{cls}">{rotulo}</a>'


TITULOS = {
    "exemplos/marcelorj.mdc": ("Marcelo — instância v1.0",
                               "Motorista de aplicativo carioca, digitalização 1/10: um único parâmetro, OCEAN propagando dentro do LLM. O caso didático do schema v1."),
    "exemplos/mariana.mdc": ("Mariana — instância v2.0",
                             "Influenciadora quiet luxury: 16 parâmetros, antagonistas, trade-offs e ruptura. A instância diagnosticada no teste 003."),
    "exemplos/mariana_v3.mdc": ("Mariana — instância v3.0",
                                "A mesma Mariana com o estado relacional calibrado: o LLM interpreta e narra, o motor calcula."),
    "personas/mariana.json": ("Persona seed — Mariana (JSON)",
                              "A persona versionada que o front usa por default: nome, bio, voz e OCEAN base."),
    "phb/engine_v3.py": ("engine_v3.py — o motor",
                         "~330 linhas de Python puro: estado, catálogo de eventos e a função step() que executa um turno completo."),
    "phb/config_v3_ideal.json": ("config_v3_ideal.json — a calibração",
                                 "31 hiperparâmetros encontrados por busca no teste 004, com critérios, tolerâncias 1D e proveniência."),
    "phb/calibrar_v3.py": ("calibrar_v3.py — a bateria de aceitação",
                           "7 cenários determinísticos, 11 critérios executáveis e a busca de hiperparâmetros em 3 estágios."),
    "phb/run_turn.py": ("run_turn.py — a interface LLM ↔ motor",
                        "CLI: --init cria o estado, --eventos executa um turno, --catalogo lista os eventos."),
    "phb/test_engine_v3.py": ("test_engine_v3.py — a suíte do motor",
                              "14 testes: unitários e a regressão dos 11 critérios na config ideal."),
    "testes/005-llm-in-the-loop/sessoes/estado_final.json": ("Estado final — teste 005 (JSON)",
                                                             "O estado real da Mariana ao fim da sessão com o observador cego, invisível para ele durante o teste."),
}


def titulo_de(rel, texto):
    if rel in TITULOS:
        return TITULOS[rel][0]
    if rel.endswith(".md"):
        m = re.search(r"^#\s+(.+)$", texto, re.M)
        if m:
            return re.sub(r"[*`_]", "", m.group(1)).strip()
    return rel.split("/")[-1]


def resumo_de(html_doc):
    for m in re.finditer(r"<p>(.*?)</p>", html_doc, re.S):
        t = " ".join(texto_puro(m.group(1)).split())
        if len(t) > 40:
            return t if len(t) <= 240 else t[:237].rsplit(" ", 1)[0] + "…"
    return ""


def montar_acervo():
    fontes = list(listar_fontes())
    resolver = Resolver(set(fontes))
    indice, textos = [], {}
    for rel in fontes:
        texto = (RAIZ / rel).read_text(encoding="utf-8")
        ctx = Contexto(rel, resolver)
        if rel.endswith(".md"):
            corpo = md(texto, ctx)
        else:
            lang = {"py": "python", "json": "json", "mdc": "yaml"}[rel.rsplit(".", 1)[1]]
            corpo = bloco_codigo(texto, lang, linhas=True)
        grupo, tipo, teste = classificar(rel)
        palavras = len(re.findall(r"\w+", texto_puro(corpo)))
        indice.append({
            "caminho": rel, "titulo": titulo_de(rel, texto), "grupo": grupo, "tipo": tipo,
            "teste": teste, "resumo": TITULOS[rel][1] if rel in TITULOS else resumo_de(corpo),
            "sumario": ctx.sumario, "palavras": palavras,
            "linhas": texto.count("\n") + 1,
        })
        textos[rel] = corpo
    return indice, textos


# ===========================================================================
# Motor: cenários do teste 004 e replay do teste 005, rodados de verdade
# ===========================================================================
def carregar_config():
    bruto = json.loads((RAIZ / "phb" / "config_v3_ideal.json").read_text(encoding="utf-8"))
    return bruto, motor.Config(**bruto["config_ideal"])


def snap(est, quem, eventos, fase=None):
    rel = est.rel(quem)
    s = {
        "e": [[e["tipo"], e["intensidade"]] for e in eventos],
        "r": [r3(getattr(rel, a)) for a in motor.AXES],
        "o": [r3(est.ocean_atual[t]) for t in motor.TRAITS],
        "g": r3(rel.goodwill), "k": len(rel.cicatrizes), "p": r3(rel.prior_confianca),
        "x": r3(rel.exposicao_intima), "u": 1 if rel.ruptura else 0, "h": rel.hist_pos,
    }
    if fase:
        s["f"] = fase
    return s


def rodar(cfg, turnos, n_base=3.0, am_base=6.0, quem="x"):
    est = motor.novo_estado(n_base, am_base)
    hist = []
    for t in turnos:
        fase, eventos = (t if isinstance(t, tuple) else (None, t))
        motor.step(est, cfg, quem, eventos)
        hist.append(snap(est, quem, eventos, fase))
    return hist


def ev(tipo, i=0.8):
    return {"tipo": tipo, "intensidade": i}


CENARIOS = [
    ("amor", "Amor", "60 turnos de input ideal: elogio, humor, vulnerabilidade, respeito a limite e apoio, em ciclo.",
     "C1 · C8 · C10", lambda: calib.cen_amor(60)),
    ("raiva", "Raiva escalante", "30 turnos: pressão política → deboche → exposição indevida → traição, com intensidade crescente.",
     "C1 · C10", lambda: calib.cen_raiva(30)),
    ("cicatriz", "Cicatriz", "Acolhida (8) → traição → reparo com desculpas (10) → segunda traição → silêncio (3).",
     "C2", calib.cen_cicatriz),
    ("misto", "Estado misto", "16 turnos em que a mesma pessoa traz afeto e atrito na mesma mensagem.",
     "C4", lambda: calib.cen_misto(16)),
    ("grooming", "Grooming", "50 turnos de lisonja alternada com pedido íntimo — persuasão sem lastro.",
     "C5", lambda: calib.cen_grooming(50)),
    ("recuperacao", "Ruptura e recuperação", "Deboche, exposição e traição; depois 60 turnos de desculpas e apoio.",
     "C7", calib.cen_recuperacao),
    ("retorno", "O tempo cura", "6 turnos de raiva escalante e depois 40 turnos neutros: cada eixo volta na sua velocidade.",
     "C3", lambda: calib.cen_raiva(6) + [[ev("neutro", 0.0)] for _ in range(40)]),
    ("historia", "Consentimento legítimo", "20 turnos de história real e, então, um pedido íntimo.",
     "C5b", lambda: calib.cen_amor(20) + [[ev("pedido_intimo", 0.8)]]),
    ("ruido", "Ruído", "200 turnos de ruído leve com semente fixa: estabilidade sem deriva nem saturação.",
     "C6", lambda: calib.cen_neutro(200)),
]

# Eventos por turno do teste 005, conforme testes/005-llm-in-the-loop/relatorio.md §2
REPLAY_005 = [
    [("elogio_especifico", .6), ("humor_compartilhado", .5)],
    [("elogio_especifico", .3), ("humor_compartilhado", .5), ("vulnerabilidade_compartilhada", .5), ("pedido_intimo", .3)],
    [("humor_compartilhado", .4), ("vulnerabilidade_compartilhada", .3), ("elogio_especifico", .5), ("pedido_intimo", .5)],
    [("humor_compartilhado", .5), ("vulnerabilidade_compartilhada", .4), ("respeito_a_limite", .5), ("pedido_intimo", .7)],
    [("respeito_a_limite", .8), ("elogio_especifico", .5), ("humor_compartilhado", .6), ("vulnerabilidade_compartilhada", .3)],
    [("humor_compartilhado", .6), ("respeito_a_limite", .4), ("elogio_especifico", .4)],
]


def montar_motor():
    bruto, cfg = carregar_config()
    cenarios = []
    for chave, titulo, desc, criterios, gerar in CENARIOS:
        item = {"chave": chave, "titulo": titulo, "descricao": desc, "criterios": criterios,
                "base": rodar(cfg, gerar())}
        if chave in ("amor", "raiva", "misto", "cicatriz", "grooming"):
            item["espelhada"] = rodar(cfg, gerar(), 7.5, 4.0)
        cenarios.append(item)

    replay = rodar(cfg, [[ev(t, i) for t, i in turno] for turno in REPLAY_005], quem="visitante")
    final = json.loads((RAIZ / "testes/005-llm-in-the-loop/sessoes/estado_final.json").read_text(encoding="utf-8"))
    real = final["relacoes"]["visitante"]
    confere = all(abs(replay[-1]["r"][k] - r3(real[a])) < 1e-3 for k, a in enumerate(motor.AXES))
    if not confere:
        raise SystemExit("replay do teste 005 diverge de estado_final.json — o motor mudou?")

    retorno = {}
    taxas = {a: bruto["config_ideal"][f"ret_{a}"] for a in motor.AXES}
    for a, taxa in taxas.items():
        retorno[a] = {"taxa": taxa, "meia_vida": r3(math.log(0.5) / math.log(1 - taxa)),
                      "curva": [r3((1 - taxa) ** t) for t in range(0, 121)]}

    ident = {k: {"valor": v["valor"], "faixa": list(v["faixa"])} for k, v in motor.mariana_identidade().items()}
    return {
        "eixos": motor.AXES, "tracos": motor.TRAITS,
        "catalogo": motor.EVENTS,
        "config": bruto["config_ideal"], "config_default": motor.Config().__dict__,
        "criterios": bruto["criterios"], "tolerancias": bruto["tolerancias_1d"],
        "proveniencia": bruto["proveniencia"],
        "cenarios": cenarios, "replay005": replay, "replay005_confere": confere,
        "retorno": retorno, "identidade": ident, "mapa_modulacao": motor.MAPA_MODULACAO,
    }


# ===========================================================================
# Séries extraídas das sessões (teste 002 e 005)
# ===========================================================================
def series_002():
    pasta = RAIZ / "testes/002-marcelo-ansiedade/sessoes"
    saida = {}
    for f in sorted(pasta.glob("sessao_*.md")):
        t = f.read_text(encoding="utf-8")
        partes = re.split(r"\n### \[TURNO (\d+)([^\n]*)", t)
        turnos = []
        for k in range(1, len(partes), 3):
            num, rot, corpo = int(partes[k]), partes[k + 1], partes[k + 2]
            rot = re.sub(r"^[\s\]—–-]+|[\s\]]+$", "", rot).strip(" —-]")
            n = re.search(r"Neuroticismo: *([\d.]+) *→ *([\d.]+)", corpo)
            d = re.search(r"Digitaliza\w+:?\*{0,2} *([\d.]+) *→ *([\d.]+)", corpo)
            d_mant = re.search(r"Digitaliza\w+: mantida em ([\d.]+)", corpo)
            est = re.search(r"\*\*Estímulo do ambiente:\*\*\s*\n(.+)", corpo)
            nar = re.search(r"\*\*Narrativa:\*\*\s*\n> ?(.+)", corpo)
            turnos.append({
                "t": num, "rotulo": rot,
                "n": float(n.group(2)) if n else None,
                "dig": float(d.group(2)) if d else (float(d_mant.group(1)) if d_mant else None),
                "estimulo": est.group(1).strip() if est else "",
                "fala": nar.group(1).strip().strip('"“”') if nar else "",
            })
        saida[f.stem.replace("sessao_", "")] = turnos
    return saida


def dialogo_005():
    caminho = "testes/005-llm-in-the-loop/sessoes/sessao_001.md"
    t = (RAIZ / caminho).read_text(encoding="utf-8")
    ctx = Contexto(caminho, Resolver(set()))
    turnos = []
    for bloco in re.split(r"\n## Turno \d+[^\n]*\n", t)[1:]:
        bloco = bloco.split("\n---")[0].split("\n## Palpite")[0]
        dan = re.search(r"\*\*Dan:\*\*\s*(.+)", bloco)
        mar = re.search(r"\*\*Mariana[^*]*:\*\*\s*(.+)", bloco)
        turnos.append({
            "dan": inline(dan.group(1).strip(), ctx) if dan else "",
            "mariana": inline(mar.group(1).strip(), ctx) if mar else "",
        })
    return turnos


def tabela_md(texto, depois_de=None):
    """Linhas (sem cabeçalho) da primeira tabela Markdown após um título."""
    if depois_de:
        k = texto.find(depois_de)
        texto = texto[k:] if k >= 0 else ""
    linhas = [l for l in texto.split("\n")]
    for i in range(len(linhas) - 1):
        if linhas[i].strip().startswith("|") and SEP_RE.match(linhas[i + 1]):
            out, j = [], i + 2
            while j < len(linhas) and linhas[j].strip().startswith("|"):
                out.append([c.strip().strip("*") for c in dividir_linha(linhas[j])])
                j += 1
            return out
    return []


def fundacao():
    arq = []
    for f in sorted((RAIZ / "arquetipos").glob("*.md")):
        t = f.read_text(encoding="utf-8")
        params = []
        for nome, faixa in tabela_md(t, "## Parâmetros Comportamentais"):
            lo, hi = [int(x) for x in re.findall(r"\d+", faixa)[:2]]
            params.append([nome, lo, hi])
        prim = re.search(r"\*\*Primário:\*\*\s*(.+)", t)
        sec = re.search(r"\*\*Secundário:\*\*\s*(.+)", t)
        desc = re.search(r"\*\*Descrição:\*\*\s*(.+)", t)
        arq.append({"caminho": f.relative_to(RAIZ).as_posix(), "nome": titulo_de(f.name, t).replace("Arquétipo: ", ""),
                    "descricao": desc.group(1).strip() if desc else "", "parametros": params,
                    "primario": prim.group(1).strip() if prim else "", "secundario": sec.group(1).strip() if sec else ""})
    padroes = []
    for f in sorted((RAIZ / "padroes_compra").glob("*.md")):
        t = f.read_text(encoding="utf-8")
        desc = re.search(r"\*\*Descrição:\*\*\s*(.+)", t)
        padroes.append({"caminho": f.relative_to(RAIZ).as_posix(), "nome": titulo_de(f.name, t).replace("Padrão de Compra: ", ""),
                        "descricao": desc.group(1).strip() if desc else "", "modificadores": tabela_md(t, "## Modificadores")})
    mods = []
    for f in sorted((RAIZ / "modificadores").glob("*.md")):
        t = f.read_text(encoding="utf-8")
        mods.append({"caminho": f.relative_to(RAIZ).as_posix(), "nome": titulo_de(f.name, t), "linhas": tabela_md(t)})
    return {"arquetipos": arq, "padroes": padroes, "modificadores": mods}


def montar_series():
    return {"t002": series_002(), "d005": dialogo_005(), "fundacao": fundacao()}


# ===========================================================================
# Escrita
# ===========================================================================
def js(nome_global, obj):
    corpo = json.dumps(obj, ensure_ascii=False, separators=(",", ":"), sort_keys=False)
    return f"/* gerado por PHB-charlotte/build.py — não editar à mão */\nwindow.{nome_global}={corpo};\n"


def gerar():
    indice, textos = montar_acervo()
    anexos = [{"caminho": a, "titulo": titulo_html(a)} for a in sorted(ANEXOS)]
    contagem = {}
    for d in indice:
        contagem[d["tipo"]] = contagem.get(d["tipo"], 0) + 1
    meta = {"documentos": len(indice), "palavras": sum(d["palavras"] for d in indice),
            "por_tipo": contagem}
    return {
        "indice.js": js("PHB_INDICE", {"documentos": indice, "anexos": anexos, "meta": meta}),
        "textos.js": js("PHB_TEXTOS", textos),
        "motor.js": js("PHB_MOTOR", montar_motor()),
        "series.js": js("PHB_SERIES", montar_series()),
    }


def titulo_html(rel):
    m = re.search(r"<title>(.*?)</title>", (RAIZ / rel).read_text(encoding="utf-8"), re.S)
    return html.unescape(m.group(1).strip()) if m else rel


def verificar_links(textos, caminhos):
    """Avisa sobre links internos quebrados (não falha o build)."""
    ids = {k: set(re.findall(r' id="([^"]+)"', v)) for k, v in textos.items()}
    avisos = []
    for origem, corpo in textos.items():
        for href in re.findall(r'href="([^"]+)"', corpo):
            href = html.unescape(href)
            if href.startswith("#/doc/"):
                alvo, _, ancora = href[6:].partition("#")
                if alvo not in caminhos or (ancora and ancora not in ids[alvo]):
                    avisos.append((origem, href))
            elif href.startswith("../") and not (SITE / href).resolve().exists():
                avisos.append((origem, href))
    for origem, href in avisos:
        print(f"aviso: link sem destino em {origem}: {href}")


def main():
    arquivos = gerar()
    if "--check" in sys.argv:
        velhos = [n for n, c in arquivos.items()
                  if not (DADOS / n).exists() or (DADOS / n).read_text(encoding="utf-8") != c]
        if velhos:
            print("dados desatualizados:", ", ".join(velhos), "— rode python3 PHB-charlotte/build.py")
            sys.exit(1)
        print("dados em dia")
        return
    textos = json.loads(arquivos["textos.js"].split("=", 1)[1].rstrip().rstrip(";"))
    verificar_links(textos, set(textos))
    DADOS.mkdir(exist_ok=True)
    for nome, conteudo in arquivos.items():
        (DADOS / nome).write_text(conteudo, encoding="utf-8")
        print(f"dados/{nome}: {len(conteudo.encode()) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
