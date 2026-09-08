import { useRef, useState } from 'react';
import { ApiError } from '../api/client';

type State<T> = { value: T; pending: boolean; checking: boolean; verified: boolean; error?: Error };
// Criações também sobrevivem à navegação. O lock usa ref para impedir dois envios no mesmo frame.
export function useCreation<T, R>(initial: () => T, validate: (value: T) => string | undefined, request: (value: T) => Promise<R>, inspect: () => Promise<unknown>, onCreated: (result: R, origin: string) => void) {
  const makeInitial = (): State<T> => ({ value: initial(), pending: false, checking: false, verified: false });
  const [state, setState] = useState(makeInitial);
  const ref = useRef(state);
  const update = (value: Partial<State<T>>) => { ref.current = { ...ref.current, ...value }; setState(ref.current); };
  const uncertain = state.error instanceof ApiError && state.error.uncertain;
  const blocked = () => ref.current.pending || (ref.current.error instanceof ApiError && ref.current.error.uncertain);
  function change(value: T) { if (!blocked()) update({ value }); }
  async function submit() {
    if (blocked()) return;
    const value = ref.current.value, invalid = validate(value), origin = window.location.hash;
    if (invalid) { update({ error: new Error(invalid) }); return; }
    update({ pending: true, error: undefined, verified: false });
    try { const result = await request(value); ref.current = makeInitial(); setState(ref.current); onCreated(result, origin); }
    catch (e) { update({ pending: false, error: e instanceof Error ? e : new Error('Não foi possível concluir a criação.') }); }
  }
  async function reconcile() {
    if (ref.current.checking) return;
    update({ checking: true, verified: false });
    try { await inspect(); update({ checking: false, verified: true }); }
    // Uma falha de consulta não apaga a incerteza original.
    catch { update({ checking: false, error: new ApiError('Não foi possível consultar os registros. Tente consultar novamente antes de continuar.', 'network', undefined, true) }); }
  }
  function startNew() { if (!ref.current.verified || ref.current.pending || ref.current.checking) return; ref.current = makeInitial(); setState(ref.current); }
  return { ...state, uncertain, change, submit, reconcile, startNew };
}
export type Creation<T, R> = ReturnType<typeof useCreation<T, R>>;
