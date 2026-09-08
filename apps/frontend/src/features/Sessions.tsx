import { useRef, useState, type FormEvent } from 'react';
import * as stylex from '@stylexjs/stylex';
import { ApiError, type ApiClient } from '../api/client';
import { useResource } from '../api/useResource';
import type { CatalogEvent, Configuration, NewSession, Profile, SessionSummary, Turn } from '../api/types';
import { Button, Empty, ErrorBox, formatDate, LinkButton, Loading, PageHeading } from '../ui/components';
import { s } from '../ui/styles';
import type { SessionDrafts } from './useSessionDrafts';

const eventNames: Record<string, string> = {
  elogio_especifico: 'Elogio específico', humor_compartilhado: 'Humor compartilhado', vulnerabilidade_compartilhada: 'Vulnerabilidade compartilhada',
  respeito_a_limite: 'Respeito a limite', apoio_momento_dificil: 'Apoio em momento difícil', desculpa_genuina: 'Desculpa genuína', lisonja: 'Lisonja',
  pressao_politica: 'Pressão política', deboche: 'Deboche', exposicao_indevida: 'Exposição indevida', traicao: 'Traição', pedido_intimo: 'Pedido íntimo', neutro: 'Neutro',
};
export const eventLabel = (tipo: string) => eventNames[tipo] || tipo.replaceAll('_', ' ');
export const displayValue = (value?: number) => value === undefined ? 'Indisponível' : value.toLocaleString('pt-BR', { maximumFractionDigits: 3 });

export function Sessions({ client, profiles, sessions, sessionId, selectedProfile, config, drafts, onCreated }: {
  client: ApiClient; profiles: Profile[]; sessions: SessionSummary[]; sessionId?: string;
  selectedProfile?: string; config: Configuration; drafts: SessionDrafts; onCreated: (s: NewSession) => void;
}) {
  if (sessionId && sessionId !== 'nova') return <SessionView key={sessionId} client={client} id={sessionId} config={config} drafts={drafts} />;
  if (sessionId === 'nova' || selectedProfile !== undefined) return <NewSessionForm key={selectedProfile || 'new'} client={client} profiles={profiles} selectedId={selectedProfile} onCreated={onCreated} />;
  return <><PageHeading title="Sessões" description="Cada sessão guarda uma trajetória. Abra uma nova ou continue de onde parou." action={<LinkButton href="#/sessoes/nova">Nova sessão</LinkButton>} /><SessionList sessions={sessions} /></>;
}

export function SessionList({ sessions, history = false }: { sessions: SessionSummary[]; history?: boolean }) {
  return <section {...stylex.props(s.card, s.tight)}><div {...stylex.props(s.row, s.between)}><h2 {...stylex.props(s.h2)}>{history ? 'Escolha uma trajetória' : 'Sessões salvas'}</h2><span {...stylex.props(s.small, s.muted)}>Por data de criação</span></div>{!sessions.length ? <Empty title="Sua primeira sessão começa com um perfil"><p>Selecione uma personalidade para conduzir interações e acompanhar seu estado.</p><a href="#/perfis" {...stylex.props(s.link)}>Explorar perfis →</a></Empty> : <ul {...stylex.props(s.list)}>{sessions.map(item => <li key={item.id} {...stylex.props(s.listItem)}><div {...stylex.props(s.row)}><span aria-hidden="true" {...stylex.props(s.avatar)}>{(item.persona_nome || '?').slice(0, 1)}</span><div><a href={`#/${history ? 'historico' : 'sessoes'}/${item.id}`} {...stylex.props(s.link)}>{item.persona_nome || 'Perfil indisponível'} · {item.id.slice(-6)}</a><p {...stylex.props(s.small, s.muted)}>Criada em {formatDate(item.criada_em)}</p></div></div><span {...stylex.props(s.badge)}>{item.turnos} turno(s)</span></li>)}</ul>}</section>;
}

function NewSessionForm({ client, profiles, selectedId, onCreated }: { client: ApiClient; profiles: Profile[]; selectedId?: string; onCreated: (s: NewSession) => void }) {
  const [profileId, setProfileId] = useState(selectedId || '');
  const [pending, setPending] = useState(false), [error, setError] = useState<unknown>();
  const lock = useRef(false), profile = profiles.find(p => p.id === profileId);
  const uncertain = error instanceof ApiError && error.uncertain;
  async function submit(e: FormEvent) {
    e.preventDefault(); if (lock.current || uncertain) return;
    if (!profile) { setError(new Error('Selecione um perfil disponível.')); return; }
    lock.current = true; setPending(true); setError(undefined);
    try { onCreated(await client.createSession(profile.id)); }
    catch (e) { setError(e); }
    finally { lock.current = false; setPending(false); }
  }
  return <><PageHeading title="Nova sessão" description="Escolha o perfil que receberá suas interações." /><form onSubmit={submit} noValidate aria-busy={pending} {...stylex.props(s.card, s.stack)}><label {...stylex.props(s.field)}>Perfil<select {...stylex.props(s.input)} value={profileId} onChange={e => setProfileId(e.target.value)} disabled={pending} required><option value="">Selecione um perfil</option>{profiles.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>{profile && <div {...stylex.props(s.inset, s.tight)}><p role="status">Perfil selecionado: <strong>{profile.nome}</strong></p><p {...stylex.props(s.muted, s.wrap)}>{profile.bio || 'Sem bio informada.'}</p><a href={`#/perfis/${profile.id}`} {...stylex.props(s.link)}>Consultar personalidade base →</a></div>}{!profiles.length && <LinkButton href="#/perfis/novo">Criar primeiro perfil</LinkButton>}{!!error && <ErrorBox error={error} />}{uncertain && <p {...stylex.props(s.notice)}>O resultado é incerto. <a href="#/sessoes" {...stylex.props(s.link)}>Confira as sessões salvas</a> antes de abrir outra. Nenhum envio será repetido.</p>}<div {...stylex.props(s.row)}><Button type="submit" disabled={pending || uncertain || !profiles.length}>{pending ? 'Abrindo sessão…' : 'Abrir sessão'}</Button>{!pending && <a href="#/sessoes" {...stylex.props(s.link)}>Voltar às sessões</a>}</div><p {...stylex.props(s.small, s.muted)}>A sessão começa com os parâmetros OCEAN salvos do perfil. Você identifica o interlocutor em cada interação.</p></form></>;
}

function SessionView({ client, id, config, drafts }: { client: ApiClient; id: string; config: Configuration; drafts: SessionDrafts }) {
  const draft = drafts.get(id, config.llm);
  const resource = useResource(() => client.session(id), [client, id, draft.revision]);
  const catalog = useResource(() => client.catalog(), [client]);
  const whoInput = useRef<HTMLInputElement>(null);
  const session = resource.data;
  if (!session) return resource.error ? <ErrorBox error={resource.error} retry={resource.reload} /> : <Loading />;
  const relation = session.relacoes[draft.quem.trim()];
  const blocked = draft.pending || draft.uncertain;
  const change = (value: Parameters<SessionDrafts['patch']>[1]) => drafts.patch(id, value, config.llm);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.quem.trim()) whoInput.current?.focus();
    void drafts.send(id, config.llm, catalog.data || []);
  }
  return <>
    <PageHeading title={session.persona?.nome || 'Perfil indisponível'} description={`Sessão ${id.slice(-6)} · ${session.turnos.length} turno(s) salvo(s)`} action={<LinkButton href={`#/historico/${id}`}>Ver histórico →</LinkButton>} />
    {!!resource.error && <ErrorBox error={resource.error} retry={resource.reload} />}
    <div {...stylex.props(s.sessionGrid)}>
      <section {...stylex.props(s.card, s.stack)}>
        <div {...stylex.props(s.row, s.between)}><h2 {...stylex.props(s.h2)}>Interação</h2><span {...stylex.props(s.badge)}>{draft.mode === 'manual' ? 'Eventos manuais' : 'Conversa'}</span></div>
        <form onSubmit={submit} noValidate aria-busy={draft.pending} {...stylex.props(s.stack)}>
          <label {...stylex.props(s.field)}>Interlocutor<input ref={whoInput} {...stylex.props(s.input)} list="interlocutores" value={draft.quem} onChange={e => change({ quem: e.target.value })} placeholder="Como você identifica quem interage?" disabled={blocked} required /><span {...stylex.props(s.small, s.muted)}>Use o mesmo identificador para continuar a mesma relação.</span></label><datalist id="interlocutores">{Object.keys(session.relacoes).map(who => <option key={who} value={who} />)}</datalist>
          <div role="group" aria-label="Modo de interação" {...stylex.props(s.row)}><Button secondary={draft.mode !== 'message'} aria-pressed={draft.mode === 'message'} disabled={blocked} onClick={() => change({ mode: 'message' })}>Conversa</Button><Button secondary={draft.mode !== 'manual'} aria-pressed={draft.mode === 'manual'} disabled={blocked} onClick={() => change({ mode: 'manual' })}>Modo manual</Button></div>
          {draft.mode === 'message' ? <div {...stylex.props(s.tight)}>{!config.llm && <p {...stylex.props(s.notice)}>Conversa indisponível: não há provedor configurado no servidor. Você pode preparar uma mensagem ou continuar no modo manual.</p>}<label {...stylex.props(s.field)}>Mensagem<textarea {...stylex.props(s.input, s.textarea)} value={draft.texto} onChange={e => change({ texto: e.target.value })} disabled={blocked} placeholder="O que você gostaria de dizer ao perfil?" required /></label></div> : <div {...stylex.props(s.stack)}>{catalog.error ? <ErrorBox error={catalog.error} retry={catalog.reload} /> : catalog.loading ? <Loading /> : <EventFields events={draft.events} catalog={catalog.data || []} disabled={blocked} onChange={events => change({ events })} />}<p {...stylex.props(s.small, s.muted)}>Os eventos são aplicados na ordem apresentada. A intensidade varia de 0 a 1; o servidor calcula as consequências.</p></div>}
          {draft.error && <ErrorBox error={draft.error} />}
          {draft.uncertain && <div {...stylex.props(s.notice, s.tight)}><strong>O resultado deste envio é incerto.</strong><p>A resposta se perdeu ou não pôde ser confirmada. O servidor ainda pode ter registrado o turno. Seu rascunho foi preservado; não o envie novamente sem conferir.</p><div {...stylex.props(s.row)}><Button secondary disabled={draft.checking} onClick={() => void drafts.reconcile(id)}>{draft.checking ? 'Consultando…' : 'Consultar histórico salvo'}</Button><a href={`#/historico/${id}`} {...stylex.props(s.link)}>Inspecionar histórico →</a></div>{draft.verified && <><p>A leitura do histórico não cancela um envio ainda em processamento. Confira o registro e aguarde se necessário.</p><Button secondary onClick={() => drafts.acknowledge(id)}>Conferi o histórico; preparar outro turno</Button></>}</div>}
          <div {...stylex.props(s.row, s.between)}><Button type="submit" disabled={blocked || resource.loading || (draft.mode === 'message' ? !config.llm : catalog.loading || !!catalog.error)}>{draft.pending ? 'Enviando…' : draft.mode === 'manual' ? 'Aplicar eventos' : 'Enviar mensagem'}</Button><span {...stylex.props(s.small, s.muted)}>Rascunho mantido nesta página até recarregar.</span></div>
          <p role="status" {...stylex.props(s.small, draft.notice ? s.successText : s.muted)}>{draft.pending ? 'Aguardando confirmação do servidor. Você pode navegar; o envio continuará acompanhado.' : draft.notice || (resource.loading ? 'Atualizando o estado salvo…' : '')}</p>
        </form>
      </section>
      <aside {...stylex.props(s.stack, s.alignStart)}><section {...stylex.props(s.card, s.stack)}><p {...stylex.props(s.eyebrow, s.muted)}>Estado observado</p><h2 {...stylex.props(s.h2)}>{draft.quem.trim() || 'Escolha um interlocutor'}</h2>{relation ? <dl {...stylex.props(s.tight, s.definitionList)}>{[['warmth', 'Acolhimento'], ['confianca', 'Confiança'], ['irritacao', 'Irritação']].map(([key, label]) => <div key={key} {...stylex.props(s.row, s.between)}><dt>{label}</dt><dd {...stylex.props(s.definitionValue)}>{displayValue(relation.rel?.[key])}</dd></div>)}</dl> : <p {...stylex.props(s.muted)}>Ainda não há estado observado para esta relação. Ele aparece após o primeiro turno confirmado.</p>}<p {...stylex.props(s.small, s.muted)}>A relação é específica de cada interlocutor. OCEAN é compartilhado pela sessão e não reinicia ao trocar quem interage.</p></section><section {...stylex.props(s.card, s.tight)}><h2 {...stylex.props(s.h2)}>Contexto do perfil</h2><p {...stylex.props(s.muted, s.wrap)}>{session.persona?.bio || 'Bio não informada.'}</p><a href={`#/perfis/${session.persona_id}`} {...stylex.props(s.link)}>Ver personalidade base →</a></section></aside>
    </div>
    <section {...stylex.props(s.card, s.stack)}><div {...stylex.props(s.row, s.between)}><h2 {...stylex.props(s.h2)}>Últimas interações</h2><a href={`#/historico/${id}`} {...stylex.props(s.link)}>Histórico completo →</a></div>{!session.turnos.length ? <Empty title="Uma trajetória ainda por começar"><p>Aplique eventos ou envie uma mensagem para registrar o primeiro turno.</p></Empty> : <div {...stylex.props(s.stack)}>{session.turnos.slice(-3).map(turn => <TurnSummary key={turn.turno} turn={turn} />)}</div>}</section>
  </>;
}

function EventFields({ events, catalog, disabled, onChange }: { events: { tipo: string; intensidade: string }[]; catalog: CatalogEvent[]; disabled: boolean; onChange: (events: { tipo: string; intensidade: string }[]) => void }) {
  return <div {...stylex.props(s.tight)}>{events.map((event, i) => <div key={i} {...stylex.props(s.inset, s.tight)}><div {...stylex.props(s.eventGrid)}><label {...stylex.props(s.field)}>Evento {i + 1}<select {...stylex.props(s.input)} value={event.tipo} onChange={e => onChange(events.map((item, n) => n === i ? { ...item, tipo: e.target.value } : item))} disabled={disabled} required><option value="">Escolha um evento</option>{catalog.map(item => <option key={item.tipo} value={item.tipo}>{eventLabel(item.tipo)}</option>)}</select></label><label {...stylex.props(s.field)}>Intensidade {i + 1}<input {...stylex.props(s.input)} type="number" min="0" max="1" step="0.1" value={event.intensidade} onChange={e => onChange(events.map((item, n) => n === i ? { ...item, intensidade: e.target.value } : item))} disabled={disabled} required /></label></div>{events.length > 1 && <div><Button secondary disabled={disabled} onClick={() => onChange(events.filter((_, n) => n !== i))}>Remover evento {i + 1}</Button></div>}</div>)}<div><Button secondary disabled={disabled} onClick={() => onChange([...events, { tipo: '', intensidade: '0.5' }])}>Adicionar evento</Button></div></div>;
}

export function TurnSummary({ turn }: { turn: Turn }) {
  return <article {...stylex.props(s.inset, s.tight)}><div {...stylex.props(s.row, s.between)}><h3 {...stylex.props(s.h3)}>Turno {turn.turno} · {turn.quem}</h3><span {...stylex.props(s.badge, turn.texto === undefined ? s.pink : s.good)}>{turn.texto === undefined ? 'Manual' : 'Conversa'}</span></div>{turn.texto !== undefined && <p {...stylex.props(s.wrap)}><strong>Mensagem:</strong> {turn.texto}</p>}{turn.narrativa !== undefined && <p {...stylex.props(s.wrap)}><strong>Resposta do perfil:</strong> {turn.narrativa}</p>}<p {...stylex.props(s.small, s.muted)}>{turn.eventos.map(e => `${eventLabel(e.tipo)} (${displayValue(e.intensidade)})`).join(' → ')}</p></article>;
}
