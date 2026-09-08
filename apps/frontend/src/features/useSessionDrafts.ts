import { useRef, useState } from 'react';
import { ApiError, type ApiClient } from '../api/client';
import type { CatalogEvent, Turn } from '../api/types';

export type DraftEvent = { tipo: string; intensidade: string };
export type SessionDraft = {
  quem: string; texto: string; mode: 'manual' | 'message'; events: DraftEvent[];
  pending: boolean; uncertain: boolean; verified: boolean; checking: boolean;
  error?: Error; notice: string; revision: number;
};
const blankEvents = (): DraftEvent[] => [{ tipo: '', intensidade: '0.5' }];
const initial = (llm: boolean): SessionDraft => ({ quem: '', texto: '', mode: llm ? 'message' : 'manual', events: blankEvents(), pending: false, uncertain: false, verified: false, checking: false, notice: '', revision: 0 });
const asError = (e: unknown) => e instanceof Error ? e : new Error('Não foi possível concluir o envio.');

// Mantido no App: trocar de rota não perde rascunhos nem libera um envio pendente.
// A memória dura até recarregar/fechar a página; não grava texto em localStorage.
export function useSessionDrafts(client: ApiClient, onTurn: (id: string, turn: Turn) => void) {
  const ref = useRef<Record<string, SessionDraft>>({});
  const [drafts, setDrafts] = useState(ref.current);
  const get = (id: string, llm = false) => ref.current[id] || initial(llm);
  function patch(id: string, value: Partial<SessionDraft>, llm = false) {
    ref.current = { ...ref.current, [id]: { ...get(id, llm), ...value } };
    setDrafts(ref.current);
  }
  async function send(id: string, llm: boolean, catalog: CatalogEvent[]) {
    const draft = get(id, llm);
    if (draft.pending || draft.uncertain) return;
    const quem = draft.quem.trim();
    const events = draft.events.map(e => ({ tipo: e.tipo, intensidade: Number(e.intensidade) }));
    let invalid = '';
    if (!quem) invalid = 'Informe quem está interagindo com o perfil.';
    else if (draft.mode === 'message' && !llm) invalid = 'A conversa está indisponível. Você pode usar o modo manual.';
    else if (draft.mode === 'message' && !draft.texto.trim()) invalid = 'Escreva uma mensagem antes de enviar.';
    else if (draft.mode === 'manual' && (!events.length || events.some((e, i) => !catalog.some(c => c.tipo === e.tipo) || !draft.events[i].intensidade.trim() || !Number.isFinite(e.intensidade) || e.intensidade < 0 || e.intensidade > 1))) invalid = 'Escolha os eventos e informe intensidades entre 0 e 1.';
    if (invalid) { patch(id, { error: new Error(invalid), notice: '' }, llm); return; }
    patch(id, { pending: true, error: undefined, notice: '', verified: false }, llm);
    try {
      const turn = draft.mode === 'manual' ? await client.manual(id, quem, events) : await client.message(id, quem, draft.texto);
      patch(id, { pending: false, notice: `Turno ${turn.turno} confirmado e salvo.`, revision: get(id).revision + 1,
        ...(draft.mode === 'message' ? { texto: '' } : { events: blankEvents() }) });
      onTurn(id, turn);
    } catch (e) {
      patch(id, { pending: false, error: asError(e), uncertain: e instanceof ApiError && e.uncertain });
    }
  }
  async function reconcile(id: string) {
    if (get(id).checking) return;
    patch(id, { checking: true, verified: false });
    try {
      await client.session(id);
      patch(id, { checking: false, verified: true, revision: get(id).revision + 1, notice: 'Histórico consultado. Confira se o envio aparece antes de continuar.' });
    } catch (e) { patch(id, { checking: false, error: asError(e), notice: '' }); }
  }
  function acknowledge(id: string) {
    if (!get(id).verified || get(id).checking) return;
    patch(id, { uncertain: false, verified: false, error: undefined, texto: '', events: blankEvents(), notice: 'Novo turno liberado após sua conferência. Nenhum envio foi repetido.' });
  }
  return { get, patch, send, reconcile, acknowledge, drafts };
}
export type SessionDrafts = ReturnType<typeof useSessionDrafts>;
