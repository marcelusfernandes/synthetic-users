# PHB Charlotte

Site local que apresenta o laboratório PHB como **case de motion design**: os
experimentos 001–005, o motor v3, a fundação da metodologia v1/v2, o produto e
**todos os outputs** do repositório (protocolos, sessões turno a turno,
auditorias adversariais, relatórios, documentos e código), em HTML, CSS e
JavaScript puros — sem build de front, sem dependências e sem CDN em runtime.

## Abrir

Abra `PHB-charlotte/index.html` direto no navegador (funciona via `file://`), ou
sirva a raiz do repositório para que os anexos HTML de `docs/` também abram:

```sh
python3 -m http.server 8000     # na raiz do repositório
# http://127.0.0.1:8000/PHB-charlotte/
```

## O que tem

| Rota | Conteúdo |
|---|---|
| `#/` | Visão geral: herói “superfície × interior”, números, jornada em rolagem horizontal, os cinco experimentos, princípios de movimento e atalhos |
| `#/jornada` | Do “sonho” da IA à opacidade entre mentes — figura presa que se transforma a cada passo |
| `#/testes` e `#/testes/00N` | Um capítulo por experimento, com hipóteses, visualizações e a lista completa dos outputs |
| `#/motor` | Pipeline, anatomia do estado, as 7 etapas de `step()`, catálogo de eventos, força de retorno, histerese e a configuração calibrada |
| `#/laboratorio` | Os 9 cenários da bateria do teste 004, reproduzidos turno a turno (base e OCEAN espelhado) |
| `#/fundacao` | Camadas RPG, observabilidade, arquétipos, padrões de compra, modificadores, dual class, canon e instâncias |
| `#/produto` | Core M3: jornada, validação, contrato HTTP e anexos visuais |
| `#/arquivo` | Todos os documentos, com busca (inclusive no texto integral), filtros e animação FLIP |
| `#/doc/<caminho>` | Leitura integral de qualquer arquivo, com sumário, progresso e anterior/próximo |

Busca global: tecle `/` ou `Ctrl/⌘ + K`. Tema claro/escuro e movimento
pleno/reduzido ficam no cabeçalho (o site respeita `prefers-reduced-motion`).

## Dados: gerados, nunca recalculados no navegador

`build.py` (Python stdlib) lê o repositório e escreve `dados/*.js`:

- `indice.js` e `textos.js` — todo o Markdown/código renderizado em HTML, com
  links internos reescritos para rotas do site (`textos.js` carrega sob demanda);
- `motor.js` — catálogo, config ideal, critérios e tolerâncias de
  `phb/config_v3_ideal.json`, e os cenários de `phb/calibrar_v3.py` **rodados por
  `engine_v3.step()`**, além do replay do teste 005 (conferido contra
  `testes/005-llm-in-the-loop/sessoes/estado_final.json`; o build falha se divergir);
- `series.js` — séries turno a turno extraídas das sessões do teste 002, o
  diálogo do teste 005 e os dados da fundação.

O navegador só interpola a animação entre snapshots: nenhum código do site
calcula eixos, OCEAN, goodwill ou ruptura. Números de relatórios que não vêm do
motor estão transcritos nos scripts de cada página, com a fonte citada no topo.

```sh
python3 PHB-charlotte/build.py          # regenera dados/*.js (e avisa links quebrados)
python3 PHB-charlotte/build.py --check  # falha se dados/*.js estiver desatualizado
make site                               # atalho para o build
```

Rode o build sempre que documentos, sessões, relatórios ou o motor mudarem.

## Estrutura

```
PHB-charlotte/
├── index.html          # casca da página e ordem dos scripts
├── build.py            # gera dados/*.js a partir do repositório
├── dados/              # gerado — não editar à mão
├── assets/css/         # tokens (claro/escuro, tempos de movimento), base, componentes, páginas
├── assets/js/          # núcleo (movimento, ciclo de vida), gráficos SVG, herói, componentes, app (rotas)
│   └── paginas/        # uma página por arquivo
└── assets/fontes/      # Bricolage Grotesque, Fraunces e JetBrains Mono (SIL OFL 1.1)
```

## Princípios de movimento

- **O movimento é o dado.** Durações, easings e limiares vêm do motor: todo hover
  constrói em 620 ms e desfaz em 260 ms — a razão de ~2.4× entre `neg_scale` e
  `pos_scale` da config ideal.
- **Cada canal volta na sua velocidade.** A demonstração de força de retorno
  usa as meias-vidas calibradas (irritação ~4 turnos, confiança ~117).
- **Superfície × interior.** O herói mostra a fala da Mariana; a lente do cursor
  revela o estado que o motor calculou no mesmo turno.
- **Movimento reduzido de verdade.** Com a preferência ativa, animações viram
  estados finais e a página continua completa.
