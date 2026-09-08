// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { createApi } from '../api/client';
import { startServer } from '../../tests/server';
import { startProvider } from '../../tests/provider';

afterEach(cleanup);
const profileInput = { nome: 'Perfil de sessão', bio: 'Dados fictícios.', voz: '', ocean_base: { abertura: 5, conscienciosidade: 5, extroversao: 5, amabilidade: 5, neuroticismo: 5 } };

it('abre, aplica dois eventos ordenados, preserva rascunho entre rotas e retoma após recarga', async () => {
  const server = await startServer(), client = createApi(server.base), user = userEvent.setup();
  try {
    const profile = await client.createProfile(profileInput);
    window.history.replaceState(null, '', `#/sessoes?perfil=${profile.id}`);
    const view = render(<App client={client} />);
    await user.click(await screen.findByRole('button', { name: 'Abrir sessão' }));
    await user.type(await screen.findByRole('combobox', { name: /^Interlocutor/ }), 'Pessoa A');
    await user.click(screen.getByRole('button', { name: 'Conversa' }));
    expect(screen.getByText(/Conversa indisponível:/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enviar mensagem' }).hasAttribute('disabled')).toBe(true);
    await user.type(screen.getByRole('textbox', { name: 'Mensagem' }), 'Rascunho para continuar.');
    await user.click(screen.getByRole('button', { name: 'Modo manual' }));
    await user.selectOptions(await screen.findByRole('combobox', { name: 'Evento 1' }), 'elogio_especifico');
    await user.clear(screen.getByRole('spinbutton', { name: 'Intensidade 1' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Intensidade 1' }), '0.6');
    await user.click(screen.getByRole('button', { name: 'Adicionar evento' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Evento 2' }), 'humor_compartilhado');
    await user.click(screen.getByRole('button', { name: 'Aplicar eventos' }));
    expect(await screen.findByText('Turno 1 confirmado e salvo.')).toBeTruthy();
    const sessionId = window.location.hash.split('/')[2];
    const saved = await client.session(sessionId);
    expect(saved.turnos[0].eventos).toEqual([{ tipo: 'elogio_especifico', intensidade: 0.6 }, { tipo: 'humor_compartilhado', intensidade: 0.5 }]);
    await user.click(screen.getByRole('link', { name: 'Perfis' }));
    await user.click(screen.getByRole('link', { name: 'Sessões' }));
    await user.click(await screen.findByRole('link', { name: new RegExp(`Perfil de sessão · ${sessionId.slice(-6)}`) }));
    await user.click(await screen.findByRole('button', { name: 'Conversa' }));
    expect(screen.getByRole('textbox', { name: 'Mensagem' })).toHaveProperty('value', 'Rascunho para continuar.');
    view.unmount(); render(<App client={client} />);
    expect(await screen.findByRole('heading', { name: 'Turno 1 · Pessoa A' })).toBeTruthy();
    await user.type(await screen.findByRole('combobox', { name: /^Interlocutor/ }), 'Pessoa A');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Evento 1' }), 'neutro');
    await user.click(screen.getByRole('button', { name: 'Aplicar eventos' }));
    expect(await screen.findByText('Turno 2 confirmado e salvo.')).toBeTruthy();
    expect((await client.session(sessionId)).turnos).toHaveLength(2);
  } finally { cleanup(); await server.stop(); }
});

it('conversa pelo pipeline real, bloqueia envio duplicado e preserva entrada nas duas falhas do provedor', async () => {
  const provider = await startProvider(), server = await startServer({ providerUrl: provider.url });
  const client = createApi(server.base), user = userEvent.setup();
  try {
    const profile = await client.createProfile(profileInput), session = await client.createSession(profile.id);
    window.history.replaceState(null, '', `#/sessoes/${session.id}`);
    render(<App client={client} />);
    await user.type(await screen.findByRole('combobox', { name: /^Interlocutor/ }), 'Pessoa B');
    await user.type(screen.getByRole('textbox', { name: 'Mensagem' }), 'Gostei do seu cuidado.');
    provider.state.delay = 150;
    await user.dblClick(screen.getByRole('button', { name: 'Enviar mensagem' }));
    expect(await screen.findByText('Turno 1 confirmado e salvo.')).toBeTruthy();
    expect(await screen.findByText(/Obrigada por observar esse cuidado/)).toBeTruthy();
    expect(provider.state.calls).toEqual(['interpretar', 'narrar']);
    expect((await client.session(session.id)).turnos).toHaveLength(1);
    for (const mode of ['interpret-error', 'narrate-error'] as const) {
      provider.state.mode = mode; provider.state.delay = 0;
      await user.clear(screen.getByRole('textbox', { name: 'Mensagem' }));
      await user.type(screen.getByRole('textbox', { name: 'Mensagem' }), `Manter ${mode}`);
      await waitFor(() => expect(screen.getByRole('button', { name: 'Enviar mensagem' }).hasAttribute('disabled')).toBe(false));
      await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }));
      expect(await screen.findByRole('alert')).toBeTruthy();
      expect(screen.getByRole('textbox', { name: 'Mensagem' })).toHaveProperty('value', `Manter ${mode}`);
      expect((await client.session(session.id)).turnos).toHaveLength(1);
    }
  } finally { cleanup(); await server.stop(); await provider.stop(); }
});
