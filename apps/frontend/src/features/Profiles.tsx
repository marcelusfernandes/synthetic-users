import { useRef, type FormEvent } from 'react';
import * as stylex from '@stylexjs/stylex';
import { type ApiClient } from '../api/client';
import { useResource } from '../api/useResource';
import { traits, traitLabels, type ProfileInput, type Profile } from '../api/types';
import { Button, Empty, ErrorBox, formatDate, LinkButton, Loading, PageHeading } from '../ui/components';
import { s } from '../ui/styles';
import type { Creation } from './useCreation';
import { CreationRecovery } from './CreationRecovery';

const descriptions = {
  abertura: 'Interesse por novidades e exploração.',
  conscienciosidade: 'Organização, disciplina e atenção a compromissos.',
  extroversao: 'Disposição para contato e expressão social.',
  amabilidade: 'Inclinação à cooperação e consideração pelo outro.',
  neuroticismo: 'Sensibilidade à tensão e a emoções negativas.',
};
export function Profiles({ client, profiles, selectedId, creation }: { client: ApiClient; profiles: Profile[]; selectedId?: string; creation: Creation<ProfileInput, Profile> }) {
  if (selectedId === 'novo') return <ProfileForm creation={creation} />;
  if (selectedId) return <ProfileDetail key={selectedId} client={client} id={selectedId} />;
  return <>
    <PageHeading title="Perfis" description="Personalidades que dão contexto às suas interações." action={<LinkButton href="#/perfis/novo">Criar perfil <span aria-hidden="true">＋</span></LinkButton>} />
    {!profiles.length ? <section {...stylex.props(s.card)}><Empty title="Quem vai participar?"><p>Comece com um nome e uma personalidade base. Bio e voz ajudam a dar contexto à conversa.</p></Empty><LinkButton href="#/perfis/novo">Criar primeiro perfil</LinkButton></section> : <div {...stylex.props(s.grid)}>{profiles.map(p => <article key={p.id} {...stylex.props(s.card, s.stack)}><div {...stylex.props(s.row, s.between)}><span aria-hidden="true" {...stylex.props(s.avatar)}>{p.nome.slice(0, 1)}</span><span {...stylex.props(s.badge)}>Perfil salvo</span></div><div {...stylex.props(s.tight)}><h2 {...stylex.props(s.h2)}>{p.nome}</h2><p {...stylex.props(s.muted, s.wrap)}>{p.bio || 'Bio não informada.'}</p></div><div {...stylex.props(s.row, s.between)}><span {...stylex.props(s.small, s.muted)}>Criado em {formatDate(p.criada_em)}</span><a href={`#/perfis/${p.id}`} {...stylex.props(s.link)}>Ver perfil →</a></div></article>)}</div>}
    <p {...stylex.props(s.small, s.muted)}>Cada sessão parte dos parâmetros salvos do perfil. Edição de perfis existentes e atributos adicionais ficam para uma próxima evolução.</p>
  </>;
}

function ProfileForm({ creation }: { creation: Creation<ProfileInput, Profile> }) {
  const { nome, bio, voz, ocean_base: ocean } = creation.value;
  const { pending, error, uncertain } = creation;
  const setNome = (nome: string) => creation.change({ ...creation.value, nome });
  const setBio = (bio: string) => creation.change({ ...creation.value, bio });
  const setVoz = (voz: string) => creation.change({ ...creation.value, voz });
  const setOcean = (ocean_base: ProfileInput['ocean_base']) => creation.change({ ...creation.value, ocean_base });
  const nameInput = useRef<HTMLInputElement>(null);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) nameInput.current?.focus();
    void creation.submit();
  }
  return <>
    <PageHeading title="Criar perfil" description="Defina a base. A experiência de cada sessão constrói o que vem depois." />
    <form onSubmit={submit} noValidate {...stylex.props(s.stack)} aria-busy={pending}>
      <section {...stylex.props(s.card, s.stack)}><h2 {...stylex.props(s.h2)}>Identidade e expressão</h2><label {...stylex.props(s.field)}>Nome <span {...stylex.props(s.small, s.muted)}>Obrigatório</span><input ref={nameInput} {...stylex.props(s.input)} value={nome} onChange={e => setNome(e.target.value)} required disabled={pending || uncertain} autoComplete="off" /></label><div {...stylex.props(s.grid)}><label {...stylex.props(s.field)}>Bio <span {...stylex.props(s.small, s.muted)}>Contexto e experiências que orientam a expressão.</span><textarea {...stylex.props(s.input, s.textarea)} value={bio} onChange={e => setBio(e.target.value)} disabled={pending || uncertain} /></label><label {...stylex.props(s.field)}>Voz <span {...stylex.props(s.small, s.muted)}>Como esse perfil costuma se comunicar.</span><textarea {...stylex.props(s.input, s.textarea)} value={voz} onChange={e => setVoz(e.target.value)} disabled={pending || uncertain} /></label></div><p {...stylex.props(s.small, s.muted)}>Bio e voz contextualizam o texto. Os cinco parâmetros abaixo definem a personalidade inicial do motor.</p></section>
      <section {...stylex.props(s.card, s.stack)}><div {...stylex.props(s.row, s.between)}><h2 {...stylex.props(s.h2)}>Personalidade base</h2><span {...stylex.props(s.badge)}>OCEAN · escala de 0 a 10</span></div><details><summary {...stylex.props(s.link)}>Entender os parâmetros</summary><div {...stylex.props(s.inset, s.tight)}>{traits.map(k => <p key={k}><strong>{traitLabels[k]}.</strong> {descriptions[k]}</p>)}<p {...stylex.props(s.small, s.muted)}>Os valores descrevem uma configuração do modelo, sem diagnóstico ou julgamento sobre uma pessoa.</p></div></details><div {...stylex.props(s.grid)}>{traits.map(k => <label key={k} {...stylex.props(s.field)}><span {...stylex.props(s.row, s.between)}>{traitLabels[k]}<output htmlFor={`ocean-${k}`}>{ocean[k].toLocaleString('pt-BR')}</output></span><input id={`ocean-${k}`} aria-label={traitLabels[k]} type="range" min="0" max="10" step="0.1" value={ocean[k]} onChange={e => setOcean({ ...ocean, [k]: Number(e.target.value) })} disabled={pending || uncertain} {...stylex.props(s.range)} /><span {...stylex.props(s.small, s.muted)}>0 — menor intensidade · 10 — maior intensidade</span></label>)}</div></section>
      {!!error && <ErrorBox error={error} />}
      {uncertain && <CreationRecovery {...creation} href="#/perfis" label="perfis" />}
      <div {...stylex.props(s.row)}><Button type="submit" disabled={pending || uncertain}>{pending ? 'Salvando perfil…' : 'Salvar perfil'}</Button>{!pending && <a href="#/perfis" {...stylex.props(s.link)}>Voltar aos perfis</a>}<span role="status" {...stylex.props(s.small, s.muted)}>{pending ? 'Aguardando confirmação do servidor.' : ''}</span></div>
    </form>
  </>;
}

function ProfileDetail({ client, id }: { client: ApiClient; id: string }) {
  const { data: profile, error, loading, reload } = useResource(() => client.profile(id), [client, id]);
  if (error) return <ErrorBox error={error} retry={reload} />;
  if (loading || !profile) return <Loading />;
  return <><PageHeading title={profile.nome} description={`Perfil salvo · ${formatDate(profile.criada_em)}`} action={<LinkButton href={`#/sessoes?perfil=${encodeURIComponent(profile.id)}`}>Selecionar para sessão →</LinkButton>} /><div role="status" {...stylex.props(s.badge, s.good)}>Perfil disponível para novas sessões</div><section {...stylex.props(s.card, s.grid)}><div {...stylex.props(s.tight)}><h2 {...stylex.props(s.h2)}>Bio</h2><p {...stylex.props(s.wrap, s.muted)}>{profile.bio || 'Não informada.'}</p></div><div {...stylex.props(s.tight)}><h2 {...stylex.props(s.h2)}>Voz</h2><p {...stylex.props(s.wrap, s.muted)}>{profile.voz || 'Não informada.'}</p></div></section><section {...stylex.props(s.card, s.stack)}><h2 {...stylex.props(s.h2)}>Personalidade base</h2><p {...stylex.props(s.muted)}>Parâmetros iniciais de uma nova sessão, na escala de 0 a 10.</p><dl {...stylex.props(s.grid, s.definitionList)}>{traits.map(k => <div key={k} {...stylex.props(s.inset, s.row, s.between)}><dt>{traitLabels[k]}</dt><dd {...stylex.props(s.definitionValue)}>{profile.ocean_base[k].toLocaleString('pt-BR')}</dd></div>)}</dl></section><a href="#/perfis" {...stylex.props(s.link)}>← Voltar aos perfis</a></>;
}
