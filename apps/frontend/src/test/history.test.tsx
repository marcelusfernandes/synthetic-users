// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { App } from '../App';
import { createApi } from '../api/client';
import { startServer } from '../../tests/server';
import { startProvider } from '../../tests/provider';

afterEach(cleanup);
const profileInput = { nome: 'Perfil de histórico', bio: '', voz: '', ocean_base: { abertura: 5, conscienciosidade: 5, extroversao: 5, amabilidade: 5, neuroticismo: 5 } };

it('compara apenas a mesma relação, trata snapshots parciais e preserva rascunho ao voltar', async () => {
  const provider = await startProvider(), server = await startServer({ providerUrl: provider.url });
  const client = createApi(server.base), user = userEvent.setup();
  try {
    const profile = await client.createProfile(profileInput), session = await client.createSession(profile.id);
    const first = await client.manual(session.id, 'Pessoa A', [{ tipo: 'elogio_especifico', intensidade: 0.6 }]);
    await client.manual(session.id, 'Pessoa B', [{ tipo: 'deboche', intensidade: 0.5 }]);
    const last = await client.message(session.id, 'Pessoa A', 'Gostei do cuidado.');
    // Fixture histórica parcial no disco isolado. API e motor continuam executando de verdade.
    const file = resolve(server.dir, 'sessoes', `${session.id}.json`), stored = JSON.parse(await readFile(file, 'utf8'));
    delete stored.turnos[0].snapshot.rel.respeito;
    delete stored.turnos[0].snapshot.ocean.neuroticismo;
    delete stored.turnos[0].snapshot.goodwill;
    await writeFile(file, JSON.stringify(stored));
    window.history.replaceState(null, '', `#/sessoes/${session.id}`);
    const view = render(<App client={client} />);
    await user.type(await screen.findByRole('combobox', { name: /^Interlocutor/ }), 'Pessoa A');
    await user.type(screen.getByRole('textbox', { name: 'Mensagem' }), 'Continuar depois do histórico.');
    await user.click(screen.getByRole('link', { name: 'Ver histórico →' }));
    expect(await screen.findByRole('heading', { name: 'Histórico de Perfil de histórico' })).toBeTruthy();
    expect(screen.getByText('Comparação com a observação anterior desta relação, no turno 1.')).toBeTruthy();
    const table = screen.getByRole('table', { name: 'Estado da relação com Pessoa A após o turno 3' });
    expect(within(table).getByRole('row', { name: new RegExp(`Confiança ${first.snapshot.rel!.confianca.toLocaleString('pt-BR')} ${last.snapshot.rel!.confianca.toLocaleString('pt-BR')}`) })).toBeTruthy();
    expect(screen.getByText(/Obrigada por observar esse cuidado/)).toBeTruthy();
    await user.click(screen.getByText('Ver valores da evolução'));
    expect(within(screen.getByRole('table', { name: 'Confiança de Pessoa A por turno' })).getAllByRole('row')).toHaveLength(3);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Relação com' }), 'Pessoa B');
    expect(screen.getByText(/Sem observação anterior desta relação/)).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Turno 2 · Pessoa B' })).toBeTruthy();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Relação com' }), 'Pessoa A');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Turno' }), '1');
    const firstTable = screen.getByRole('table', { name: 'Estado da relação com Pessoa A após o turno 1' });
    expect(within(firstTable).getByRole('row', { name: 'Respeito Indisponível Indisponível' })).toBeTruthy();
    await user.click(screen.getByText('Inspecionar registro técnico'));
    expect(screen.getByLabelText('Snapshot e log do turno').textContent).toContain('deltas_rel');
    await user.click(screen.getByRole('link', { name: 'Continuar sessão →' }));
    expect(await screen.findByRole('textbox', { name: 'Mensagem' })).toHaveProperty('value', 'Continuar depois do histórico.');
    await user.click(screen.getByRole('link', { name: 'Ver histórico →' }));
    view.unmount(); render(<App client={client} />);
    expect(await screen.findByRole('heading', { name: 'Estado após o turno 3' })).toBeTruthy();
  } finally { cleanup(); await server.stop(); await provider.stop(); }
});

it('apresenta uma sessão vazia sem simular métricas ou observações', async () => {
  const server = await startServer(), client = createApi(server.base);
  try {
    const profile = await client.createProfile(profileInput), session = await client.createSession(profile.id);
    window.history.replaceState(null, '', `#/historico/${session.id}`);
    render(<App client={client} />);
    expect(await screen.findByRole('heading', { name: 'Ainda não há turnos registrados' })).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
  } finally { cleanup(); await server.stop(); }
});
