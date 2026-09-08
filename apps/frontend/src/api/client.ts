import { traits, type CatalogEvent, type Configuration, type EventInput, type NewSession, type Ocean, type Profile, type ProfileInput, type Session, type SessionSummary, type Snapshot, type Turn } from './types';

type JsonObject = Record<string, unknown>;
const object = (v: unknown): JsonObject => {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) throw new Error('objeto esperado');
  return v as JsonObject;
};
const string = (v: unknown): string => { if (typeof v !== 'string') throw new Error('texto esperado'); return v; };
const number = (v: unknown): number => { if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error('número esperado'); return v; };
const boolean = (v: unknown): boolean => { if (typeof v !== 'boolean') throw new Error('booleano esperado'); return v; };
const nullableString = (v: unknown) => v === null ? null : string(v);
const array = <T>(v: unknown, parse: (item: unknown) => T): T[] => { if (!Array.isArray(v)) throw new Error('lista esperada'); return v.map(parse); };
const numericMap = (v: unknown) => Object.fromEntries(Object.entries(object(v)).map(([k, n]) => [k, number(n)]));
const parseOcean = (v: unknown): Ocean => {
  const o = object(v);
  return Object.fromEntries(traits.map(k => { const n = number(o[k]); if (n < 0 || n > 10) throw new Error('OCEAN fora da escala'); return [k, n]; })) as Ocean;
};
export const parseProfile = (v: unknown): Profile => {
  const o = object(v);
  return { id: string(o.id), nome: string(o.nome), bio: string(o.bio), voz: string(o.voz), ocean_base: parseOcean(o.ocean_base), criada_em: string(o.criada_em) };
};
const parseEvent = (v: unknown): EventInput => { const o = object(v); return { tipo: string(o.tipo), intensidade: number(o.intensidade) }; };
export const parseSnapshot = (v: unknown): Snapshot => {
  const o = object(v), result: Snapshot = {};
  if (o.ocean !== undefined) result.ocean = numericMap(o.ocean);
  if (o.rel !== undefined) result.rel = numericMap(o.rel);
  for (const k of ['goodwill', 'cicatrizes', 'prior_confianca', 'exposicao_intima'] as const) if (o[k] !== undefined) result[k] = number(o[k]);
  if (o.ruptura !== undefined) result.ruptura = boolean(o.ruptura);
  return result;
};
export const parseTurn = (v: unknown): Turn => {
  const o = object(v);
  const t: Turn = { turno: number(o.turno), quem: string(o.quem), eventos: array(o.eventos, parseEvent), snapshot: parseSnapshot(o.snapshot), log: object(o.log) };
  if (o.texto !== undefined) t.texto = string(o.texto);
  if (o.narrativa !== undefined) t.narrativa = string(o.narrativa);
  return t;
};
export const parseSession = (v: unknown): Session => {
  const o = object(v);
  return { id: string(o.id), persona_id: string(o.persona_id), persona: o.persona === null ? null : parseProfile(o.persona),
    relacoes: Object.fromEntries(Object.entries(object(o.relacoes)).map(([who, s]) => [who, parseSnapshot(s)])), turnos: array(o.turnos, parseTurn) };
};
export class ApiError extends Error {
  constructor(message: string, public kind: 'http' | 'network' | 'invalid', public status?: number, public uncertain = false) { super(message); this.name = 'ApiError'; }
}
export function createApi(base = '') {
  async function request<T>(path: string, parse: (v: unknown) => T, body?: unknown): Promise<T> {
    const mutation = body !== undefined;
    let response: Response;
    try { response = await fetch(`${base}/api${path}`, { method: mutation ? 'POST' : 'GET', headers: mutation ? { 'Content-Type': 'application/json' } : undefined, body: mutation ? JSON.stringify(body) : undefined }); }
    catch { throw new ApiError('Não foi possível alcançar o servidor. Verifique a conexão.', 'network', undefined, mutation); }
    let json: unknown;
    try { json = await response.json(); }
    catch { throw new ApiError('O servidor retornou uma resposta que não conseguimos ler.', 'invalid', response.status, mutation); }
    if (!response.ok) {
      const message = json && typeof json === 'object' && 'erro' in json && typeof json.erro === 'string' ? json.erro : 'A solicitação não pôde ser concluída.';
      throw new ApiError(message, 'http', response.status, mutation && ![400, 404, 502, 503].includes(response.status));
    }
    try { return parse(json); }
    catch { throw new ApiError('A resposta do servidor está incompleta ou em um formato inesperado.', 'invalid', response.status, mutation); }
  }
  const id = encodeURIComponent;
  return {
    config: () => request<Configuration>('/config', v => { const o = object(v); return { llm: boolean(o.llm), modelo: nullableString(o.modelo) }; }),
    catalog: () => request<CatalogEvent[]>('/catalogo', v => array(object(v).eventos, x => { const o = object(x); return { tipo: string(o.tipo), eixos: numericMap(o.eixos), valencia: number(o.valencia) }; })),
    profiles: () => request('/personas', v => array(object(v).personas, parseProfile)),
    profile: (profileId: string) => request(`/personas/${id(profileId)}`, parseProfile),
    createProfile: (input: ProfileInput) => request('/personas', parseProfile, input),
    sessions: () => request<SessionSummary[]>('/sessoes', v => array(object(v).sessoes, x => { const o = object(x); return { id: string(o.id), persona_id: string(o.persona_id), persona_nome: nullableString(o.persona_nome), criada_em: string(o.criada_em), turnos: number(o.turnos) }; })),
    session: (sessionId: string) => request(`/sessoes/${id(sessionId)}`, parseSession),
    createSession: (profileId: string) => request<NewSession>('/sessoes', v => { const o = object(v); return { id: string(o.id), persona_id: string(o.persona_id), criada_em: string(o.criada_em), turnos: array(o.turnos, parseTurn) }; }, { persona_id: profileId }),
    manual: (sessionId: string, quem: string, eventos: EventInput[]) => request(`/sessoes/${id(sessionId)}/turno`, parseTurn, { quem, eventos }),
    message: (sessionId: string, quem: string, texto: string) => request(`/sessoes/${id(sessionId)}/mensagem`, parseTurn, { quem, texto }),
  };
}
export type ApiClient = ReturnType<typeof createApi>;
export const api = createApi();
