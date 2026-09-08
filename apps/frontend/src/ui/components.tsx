import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { s } from './styles';

export function Button({ secondary, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return <button type="button" {...stylex.props(s.button, secondary && s.secondary)} {...props}>{children}</button>;
}
export function LinkButton({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) {
  return <a href={href} {...stylex.props(s.button, light && s.light)}>{children}</a>;
}
export function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <header {...stylex.props(s.row, s.between)}><div {...stylex.props(s.tight)}><h1 ref={heading} id="page-title" tabIndex={-1} {...stylex.props(s.h1)}>{title}</h1><p {...stylex.props(s.muted)}>{description}</p></div>{action}</header>;
}
export function Empty({ title, children }: { title: string; children: ReactNode }) {
  return <div {...stylex.props(s.empty)}><h2 {...stylex.props(s.h2)}>{title}</h2><div {...stylex.props(s.muted)}>{children}</div></div>;
}
export function ErrorBox({ error, retry }: { error: unknown; retry?: () => void }) {
  return <div role="alert" {...stylex.props(s.error, s.tight)}><p>{error instanceof Error ? error.message : 'Não foi possível concluir a solicitação.'}</p>{retry && <div><Button secondary onClick={retry}>Tentar novamente</Button></div>}</div>;
}
export function Loading() { return <p role="status" {...stylex.props(s.card, s.muted)}>Carregando dados…</p>; }
export const formatDate = (date: string) => { const d = new Date(date); return Number.isNaN(d.valueOf()) ? 'Data indisponível' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(d); };
export function Icon({ name }: { name: 'overview' | 'profiles' | 'sessions' | 'history' }) {
  const paths = { overview: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z', profiles: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0a4 4 0 0 1 8 0', sessions: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8a8.5 8.5 0 0 1-7.6 4.7a8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8a8.5 8.5 0 0 1 4.7-7.6a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z', history: 'M3 12a9 9 0 1 0 2.6-6.4 M3 3v6h6 M12 7v5l3 2' };
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
