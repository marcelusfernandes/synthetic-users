import { useEffect, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { api, type ApiClient } from './api/client';
import type { Configuration, Profile, SessionSummary } from './api/types';
import { Empty, ErrorBox, formatDate, Icon, LinkButton, Loading, PageHeading } from './ui/components';
import { s } from './ui/styles';

export type HomeData = { profiles: Profile[]; sessions: SessionSummary[]; config: Configuration };
const navigation = [
  { href: '#/', label: 'Visão geral', icon: 'overview' },
  { href: '#/perfis', label: 'Perfis', icon: 'profiles' },
  { href: '#/sessoes', label: 'Sessões', icon: 'sessions' },
  { href: '#/historico', label: 'Histórico', icon: 'history' },
] as const;

export function App({ client = api }: { client?: ApiClient }) {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [data, setData] = useState<HomeData>();
  const [error, setError] = useState<unknown>();
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const change = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    document.getElementById('page-title')?.focus();
    window.scrollTo?.(0, 0);
  }, [route, !!data]);
  useEffect(() => {
    let active = true; setError(undefined);
    Promise.all([client.profiles(), client.sessions(), client.config()]).then(([profiles, sessions, config]) => {
      if (active) setData({ profiles, sessions: sessions.sort((a, b) => b.criada_em.localeCompare(a.criada_em)), config });
    }).catch(e => { if (active) setError(e); });
    return () => { active = false; };
  }, [client, revision]);
  const section = route.split('/')[1] || '';
  return <div {...stylex.props(s.page)}>
    <a href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }} {...stylex.props(s.skip)}>Pular para o conteúdo</a>
    <div {...stylex.props(s.layout)}>
      <aside {...stylex.props(s.sidebar)}>
        <a href="#/" aria-label="Synthetic, início" {...stylex.props(s.brand)}><span aria-hidden="true" {...stylex.props(s.mark)}><i {...stylex.props(s.dot)} /><i {...stylex.props(s.dot, s.dotPink)} /><i {...stylex.props(s.dot, s.dotPeach)} /></span>synthetic<span {...stylex.props(s.small)}>®</span></a>
        <nav aria-label="Navegação principal" {...stylex.props(s.nav)}>{navigation.map(item => {
          const active = section === (item.href.split('/')[1] || '');
          return <a key={item.href} href={item.href} aria-current={active ? 'page' : undefined} {...stylex.props(s.navLink, active && s.activeNav)}><Icon name={item.icon} />{item.label}</a>;
        })}</nav>
        <div {...stylex.props(s.sideBottom)}><p {...stylex.props(s.eyebrow)}>Seu espaço de simulação</p><p>Perfis consistentes.<br />Interações rastreáveis.</p><a href="/">Abrir laboratório clássico ↗</a></div>
      </aside>
      <main id="main" tabIndex={-1} {...stylex.props(s.main)}>
        <div {...stylex.props(s.topbar)}><span>WORKSPACE <span aria-hidden="true">/</span> <strong>Local</strong></span><span {...stylex.props(s.badge, data?.config.llm ? s.good : s.pink)}>{data ? data.config.llm ? 'Conversa disponível' : 'Modo manual disponível' : 'Conectando ao laboratório…'}</span></div>
        <div {...stylex.props(s.stack)}>{error ? <ErrorBox error={error} retry={() => setRevision(r => r + 1)} /> : !data ? <Loading /> : section === '' ? <Overview data={data} /> : ['perfis', 'sessoes', 'historico'].includes(section) ? <>
          <PageHeading title={navigation.find(n => n.href === `#/${section}`)!.label} description="Uma etapa de cada vez, do perfil à evolução da interação." />
          <section {...stylex.props(s.card)}><Empty title="Esta área está em construção"><p>A fundação já está conectada ao servidor. A jornada será habilitada na próxima etapa.</p></Empty><a href="/" {...stylex.props(s.link)}>Usar o laboratório clássico ↗</a></section>
        </> : <><PageHeading title="Página não encontrada" description="Este endereço não corresponde a uma área do workspace." /><LinkButton href="#/">Voltar ao início</LinkButton></>}</div>
      </main>
    </div>
  </div>;
}

function Overview({ data }: { data: HomeData }) {
  const latest = data.sessions[0];
  return <>
    <PageHeading title="Seu próximo ponto de partida." description="Crie um perfil, conduza uma interação e acompanhe o que muda." action={<LinkButton href="#/perfis">Explorar perfis <span aria-hidden="true">↗</span></LinkButton>} />
    <div {...stylex.props(s.grid)}>
      <section {...stylex.props(s.card, s.hero)}><p {...stylex.props(s.eyebrow)}>{latest ? 'Retome uma sessão' : 'Comece pelo perfil'}</p><div {...stylex.props(s.tight)}><h2 {...stylex.props(s.h1)}>{latest ? latest.persona_nome || 'Perfil indisponível' : 'Uma personalidade.\nNovas perspectivas.'}</h2><p>{latest ? `${latest.turnos} turno(s) · Criada em ${formatDate(latest.criada_em)}` : 'Defina quem participa antes de iniciar a conversa.'}</p></div><LinkButton href={latest ? `#/sessoes/${latest.id}` : '#/perfis'} light>{latest ? 'Abrir sessão' : 'Ver perfis'} <span aria-hidden="true">→</span></LinkButton></section>
      <div {...stylex.props(s.stack)}><section {...stylex.props(s.card, s.row, s.between)}><div {...stylex.props(s.tight)}><p {...stylex.props(s.muted)}>Perfis disponíveis</p><p {...stylex.props(s.metric)}>{data.profiles.length}</p></div><span aria-hidden="true" {...stylex.props(s.avatar)}><Icon name="profiles" /></span></section><section {...stylex.props(s.card, s.row, s.between)}><div {...stylex.props(s.tight)}><p {...stylex.props(s.muted)}>Sessões salvas</p><p {...stylex.props(s.metric)}>{data.sessions.length}</p></div><span aria-hidden="true" {...stylex.props(s.avatar)}><Icon name="sessions" /></span></section></div>
    </div>
    <section {...stylex.props(s.card, s.tight)}><div {...stylex.props(s.row, s.between)}><h2 {...stylex.props(s.h2)}>Sessões recentes</h2><span {...stylex.props(s.small, s.muted)}>Por data de criação</span></div>{!data.sessions.length ? <Empty title="Nenhuma sessão por aqui"><p>Suas interações aparecerão aqui assim que você iniciar uma sessão.</p></Empty> : <ul {...stylex.props(s.list)}>{data.sessions.slice(0, 4).map(session => <li key={session.id} {...stylex.props(s.listItem)}><div {...stylex.props(s.row)}><span aria-hidden="true" {...stylex.props(s.avatar)}>{(session.persona_nome || '?').slice(0, 1)}</span><div><a href={`#/sessoes/${session.id}`} {...stylex.props(s.link)}>{session.persona_nome || 'Perfil indisponível'}</a><p {...stylex.props(s.small, s.muted)}>Criada em {formatDate(session.criada_em)}</p></div></div><span {...stylex.props(s.badge)}>{session.turnos} turno(s)</span></li>)}</ul>}</section>
    <p {...stylex.props(s.small, s.muted)}>Simulações para explorar hipóteses. Os resultados descrevem este modelo e precisam ser confrontados com pesquisa com pessoas.</p>
  </>;
}
