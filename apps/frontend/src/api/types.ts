export const traits = ['abertura', 'conscienciosidade', 'extroversao', 'amabilidade', 'neuroticismo'] as const;
export type Trait = typeof traits[number];
export type Ocean = Record<Trait, number>;
export const traitLabels: Record<Trait, string> = {
  abertura: 'Abertura', conscienciosidade: 'Conscienciosidade', extroversao: 'Extroversão',
  amabilidade: 'Amabilidade', neuroticismo: 'Neuroticismo',
};
export type ProfileInput = { nome: string; bio: string; voz: string; ocean_base: Ocean };
export type Profile = ProfileInput & { id: string; criada_em: string };
export type Configuration = { llm: boolean; modelo: string | null };
export type SessionSummary = { id: string; persona_id: string; persona_nome: string | null; turnos: number; criada_em: string };
export type EventInput = { tipo: string; intensidade: number };
export type CatalogEvent = { tipo: string; eixos: Record<string, number>; valencia: number };
// Campos ausentes em snapshots históricos ficam indisponíveis; nunca viram zero.
export type Snapshot = {
  ocean?: Partial<Ocean>; rel?: Record<string, number>; goodwill?: number; cicatrizes?: number;
  prior_confianca?: number; exposicao_intima?: number; ruptura?: boolean;
};
export type Turn = {
  turno: number; quem: string; eventos: EventInput[]; snapshot: Snapshot;
  log: Record<string, unknown>; texto?: string; narrativa?: string;
};
export type Session = { id: string; persona_id: string; persona: Profile | null; relacoes: Record<string, Snapshot>; turnos: Turn[] };
export type NewSession = { id: string; persona_id: string; criada_em: string; turnos: Turn[] };
