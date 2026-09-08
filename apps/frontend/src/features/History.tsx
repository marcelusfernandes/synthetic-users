import { useId, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import type { ApiClient } from '../api/client';
import { useResource } from '../api/useResource';
import { traits, traitLabels, type SessionSummary, type Turn } from '../api/types';
import { Empty, ErrorBox, LinkButton, Loading, PageHeading } from '../ui/components';
import { s } from '../ui/styles';
import { displayValue, SessionList, TurnSummary } from './Sessions';

const axes = { warmth: 'Acolhimento', confianca: 'Confiança', respeito: 'Respeito', irritacao: 'Irritação', vigilancia: 'Vigilância' };
type Axis = keyof typeof axes;
const relationMetrics = { goodwill: 'Boa vontade acumulada', prior_confianca: 'Predisposição à confiança', exposicao_intima: 'Exposição íntima', cicatrizes: 'Cicatrizes registradas' } as const;

export function History({ client, sessions, sessionId }: { client: ApiClient; sessions: SessionSummary[]; sessionId?: string }) {
  if (sessionId) return <HistoryDetail key={sessionId} client={client} id={sessionId} />;
  return <><PageHeading title="Histórico" description="Inspecione uma trajetória, turno por turno, e o estado observado em cada momento." /><SessionList sessions={sessions} history /></>;
}

function HistoryDetail({ client, id }: { client: ApiClient; id: string }) {
  const resource = useResource(() => client.session(id), [client, id]);
  const [chosenWho, setWho] = useState<string>();
  const [chosenTurn, setTurn] = useState<number>();
  const [axis, setAxis] = useState<Axis>('confianca');
  if (!resource.data) return resource.error ? <ErrorBox error={resource.error} retry={resource.reload} /> : <Loading />;
  const session = resource.data;
  const people = [...new Set([...session.turnos.map(t => t.quem), ...Object.keys(session.relacoes)])];
  const who = chosenWho ?? session.turnos.at(-1)?.quem ?? people[0] ?? '';
  const turns = session.turnos.filter(t => t.quem === who);
  const selected = turns.find(t => t.turno === chosenTurn) || turns.at(-1);
  const before = selected ? turns.slice(0, turns.indexOf(selected)).at(-1) : undefined;
  return <>
    <PageHeading title={`Histórico de ${session.persona?.nome || 'perfil indisponível'}`} description={`Sessão ${id.slice(-6)} · ${session.turnos.length} turno(s) salvo(s) · ${people.length} interlocutor(es)`} action={<LinkButton href={`#/sessoes/${id}`}>Continuar sessão →</LinkButton>} />
    {!session.turnos.length ? <section {...stylex.props(s.card)}><Empty title="Ainda não há turnos registrados"><p>Depois da primeira interação, você poderá consultar eventos, narrativa e estado aqui. Nenhum estado inicial será presumido.</p></Empty></section> : <>
      <section {...stylex.props(s.card, s.stack)}>
        <div {...stylex.props(s.row, s.between)}><h2 {...stylex.props(s.h2)}>Evolução da relação</h2><span {...stylex.props(s.badge)}>Observações do motor · 0 a 10</span></div>
        <div {...stylex.props(s.grid)}><label {...stylex.props(s.field)}>Relação com<select {...stylex.props(s.input)} value={who} onChange={e => { setWho(e.target.value); setTurn(undefined); }}>{people.map(p => <option key={p} value={p}>{p}</option>)}</select></label><label {...stylex.props(s.field)}>Medida observada<select {...stylex.props(s.input)} value={axis} onChange={e => setAxis(e.target.value as Axis)}>{Object.entries(axes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
        {turns.length ? <Evolution turns={turns} axis={axis} who={who} /> : <Empty title="Sem observações por turno para esta relação"><p>O histórico salvo não contém snapshots dessa relação. Não usamos valores padrão para preencher a lacuna.</p></Empty>}
        <p {...stylex.props(s.small, s.muted)}>A comparação usa apenas turnos de {who}. A primeira observação já é posterior a uma interação; não há um ponto inicial inventado. Estas medidas descrevem o motor, não satisfação humana ou validade estatística.</p>
      </section>
      {selected && <>
        <section {...stylex.props(s.card, s.stack)}>
          <div {...stylex.props(s.row, s.between)}><h2 {...stylex.props(s.h2)}>Inspecionar um turno</h2><span {...stylex.props(s.badge)}>{turns.length} observação(ões) desta relação</span></div>
          <label {...stylex.props(s.field)}>Turno<select {...stylex.props(s.input)} value={selected.turno} onChange={e => setTurn(Number(e.target.value))}>{turns.map(t => <option key={t.turno} value={t.turno}>Turno {t.turno} · {t.quem} · {t.texto === undefined ? 'Manual' : 'Conversa'}</option>)}</select></label>
          <TurnSummary turn={selected} />
          <div {...stylex.props(s.row, s.between)}><h2 {...stylex.props(s.h2)}>Estado após o turno {selected.turno}</h2><span {...stylex.props(s.badge, selected.snapshot.ruptura === undefined ? null : selected.snapshot.ruptura ? s.pink : s.good)}>{selected.snapshot.ruptura === undefined ? 'Ruptura indisponível' : selected.snapshot.ruptura ? 'Ruptura ativa' : 'Sem ruptura'}</span></div>
          <p {...stylex.props(s.muted)}>{before ? `Comparação com a observação anterior desta relação, no turno ${before.turno}.` : 'Sem observação anterior desta relação. Os valores iniciais não foram registrados.'}</p>
          <div {...stylex.props(s.tableWrap)}><table {...stylex.props(s.table)}><caption {...stylex.props(s.srOnly)}>Estado da relação com {selected.quem} após o turno {selected.turno}</caption><thead><tr><th scope="col" {...stylex.props(s.cell)}>Medida</th><th scope="col" {...stylex.props(s.cell)}>Anterior observado</th><th scope="col" {...stylex.props(s.cell)}>Turno {selected.turno}</th></tr></thead><tbody>{Object.entries(axes).map(([key, label]) => <tr key={key}><th scope="row" {...stylex.props(s.cell, s.normalWeight)}>{label}</th><td {...stylex.props(s.cell, s.muted)}>{displayValue(before?.snapshot.rel?.[key])}</td><td {...stylex.props(s.cell, s.definitionValue)}>{displayValue(selected.snapshot.rel?.[key])}</td></tr>)}</tbody></table></div>
          <div {...stylex.props(s.grid)}><section {...stylex.props(s.inset, s.tight)}><h3 {...stylex.props(s.h3)}>Personalidade compartilhada</h3><p {...stylex.props(s.small, s.muted)}>OCEAN da sessão observado após este turno. Outros interlocutores também influenciam essa trajetória.</p><dl {...stylex.props(s.tight, s.definitionList)}>{traits.map(k => <div key={k} {...stylex.props(s.row, s.between)}><dt>{traitLabels[k]}</dt><dd {...stylex.props(s.definitionValue)}>{displayValue(selected.snapshot.ocean?.[k])}</dd></div>)}</dl></section><section {...stylex.props(s.inset, s.tight)}><h3 {...stylex.props(s.h3)}>Memória da relação</h3><dl {...stylex.props(s.tight, s.definitionList)}>{Object.entries(relationMetrics).map(([key, label]) => <div key={key} {...stylex.props(s.row, s.between)}><dt>{label}</dt><dd {...stylex.props(s.definitionValue)}>{displayValue(selected.snapshot[key as keyof typeof relationMetrics])}</dd></div>)}</dl><p {...stylex.props(s.small, s.muted)}>Valores registrados no snapshot; cicatrizes é uma contagem.</p></section></div>
          <details><summary {...stylex.props(s.link)}>Inspecionar registro técnico</summary><div {...stylex.props(s.tight)}><p {...stylex.props(s.small, s.muted)}>Snapshot e log recebidos da API. Os deltas do log registram uma etapa do cálculo e podem diferir da mudança final, que inclui outras etapas do motor.</p><pre tabIndex={0} aria-label="Snapshot e log do turno" {...stylex.props(s.code)}>{JSON.stringify({ snapshot: selected.snapshot, log: selected.log }, null, 2)}</pre></div></details>
        </section>
      </>}
    </>}
    <a href="#/historico" {...stylex.props(s.link)}>← Escolher outra sessão</a>
  </>;
}

function Evolution({ turns, axis, who }: { turns: Turn[]; axis: Axis; who: string }) {
  const titleId = useId();
  const points = turns.map((turn, i) => {
    const value = turn.snapshot.rel?.[axis];
    return { turn, value, x: turns.length === 1 ? 320 : 60 + i * 540 / (turns.length - 1), y: value === undefined || value < 0 || value > 10 ? undefined : 170 - value * 14 };
  });
  let connected = false;
  const path = points.map(p => { if (p.y === undefined) { connected = false; return ''; } const command = connected ? 'L' : 'M'; connected = true; return `${command}${p.x},${p.y}`; }).join(' ');
  const any = points.some(p => p.y !== undefined);
  return <div {...stylex.props(s.tight)}>{any ? <svg role="img" aria-labelledby={titleId} viewBox="0 0 640 208" {...stylex.props(s.chart)}><title id={titleId}>{axes[axis]} por turno para {who}. Valores disponíveis na tabela abaixo.</title>{[0, 5, 10].map(n => <g key={n}><line x1="60" x2="600" y1={170 - n * 14} y2={170 - n * 14} {...stylex.props(s.chartGrid)} /><text x="10" y={174 - n * 14} {...stylex.props(s.chartText)}>{n}</text></g>)}<path d={path} {...stylex.props(s.chartLine)} />{points.map((p, i) => <g key={p.turn.turno}>{p.y !== undefined && <circle cx={p.x} cy={p.y} r="5" {...stylex.props(s.chartDot)}><title>Turno {p.turn.turno}: {displayValue(p.value)}</title></circle>}{(turns.length <= 6 || i === 0 || i === turns.length - 1) && <text x={p.x} y="199" textAnchor="middle" {...stylex.props(s.chartText)}>T{p.turn.turno}</text>}</g>)}</svg> : <p {...stylex.props(s.notice)}>Não há valores disponíveis nesta escala para traçar a evolução.</p>}{points.some(p => p.y === undefined) && <p {...stylex.props(s.small, s.muted)}>Observações ausentes ou fora da escala não são conectadas no gráfico.</p>}<details><summary {...stylex.props(s.link)}>Ver valores da evolução</summary><div {...stylex.props(s.tableWrap)}><table {...stylex.props(s.table)}><caption {...stylex.props(s.srOnly)}>{axes[axis]} de {who} por turno</caption><thead><tr><th scope="col" {...stylex.props(s.cell)}>Turno</th><th scope="col" {...stylex.props(s.cell)}>{axes[axis]}</th></tr></thead><tbody>{points.map(p => <tr key={p.turn.turno}><th scope="row" {...stylex.props(s.cell, s.normalWeight)}>{p.turn.turno}</th><td {...stylex.props(s.cell)}>{displayValue(p.value)}</td></tr>)}</tbody></table></div></details></div>;
}
