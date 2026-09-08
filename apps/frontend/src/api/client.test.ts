import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ApiError, createApi, parseProfile, parseSnapshot } from './client';
import { startServer } from '../../tests/server';

describe('contrato com o servidor Python real', () => {
  let server: Awaited<ReturnType<typeof startServer>>;
  let client: ReturnType<typeof createApi>;
  beforeAll(async () => { server = await startServer(); client = createApi(server.base); });
  afterAll(async () => { await server?.stop(); });
  it('lê configuração e listas vazias sem inserir dados demonstrativos', async () => {
    expect(await client.config()).toEqual({ llm: false, modelo: null });
    expect(await client.profiles()).toEqual([]);
    expect(await client.sessions()).toEqual([]);
    expect((await client.catalog()).length).toBeGreaterThan(0);
  });
  it('cria perfil e sessão, persiste um turno e distingue o modo indisponível', async () => {
    const profile = await client.createProfile({ nome: 'Perfil de teste', bio: '', voz: '', ocean_base: { abertura: 5, conscienciosidade: 5, extroversao: 5, amabilidade: 5, neuroticismo: 5 } });
    const session = await client.createSession(profile.id);
    expect((await client.session(session.id)).turnos).toEqual([]);
    const turn = await client.manual(session.id, 'Pessoa A', [{ tipo: 'elogio_especifico', intensidade: 0.6 }]);
    expect(turn.turno).toBe(1);
    expect((await client.session(session.id)).turnos[0]).toEqual(turn);
    await expect(client.message(session.id, 'Pessoa A', 'Olá')).rejects.toMatchObject({ kind: 'http', status: 503, uncertain: false });
    expect((await client.session(session.id)).turnos).toHaveLength(1);
  });
  it('expõe erro HTTP com status sem transformá-lo em lista vazia', async () => {
    await expect(client.session('nao-existe')).rejects.toBeInstanceOf(ApiError);
    await expect(client.session('nao-existe')).rejects.toMatchObject({ kind: 'http', status: 404 });
  });
});
it('rejeita números inválidos e preserva valores ausentes nos snapshots antigos', () => {
  expect(parseSnapshot({ rel: { confianca: 0 } })).toEqual({ rel: { confianca: 0 } });
  expect(() => parseSnapshot({ goodwill: NaN })).toThrow();
  expect(() => parseProfile({ id: 'x', nome: 'x', bio: '', voz: '', criada_em: 'x', ocean_base: { abertura: 5 } })).toThrow();
});
