// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { createApi } from '../api/client';
import { startServer } from '../../tests/server';
import { startProxy, type ProxyMode } from '../../tests/proxy';

afterEach(cleanup);
const profileInput = { nome: 'Perfil recuperação', bio: '', voz: '', ocean_base: { abertura: 5, conscienciosidade: 5, extroversao: 5, amabilidade: 5, neuroticismo: 5 } };

it.each(['drop-response', 'invalid-response', 'http-500'] as ProxyMode[])('confere histórico antes de continuar após %s, sem reenviar POST', async mode => {
  const server = await startServer(), direct = createApi(server.base), proxy = await startProxy(server.base), user = userEvent.setup();
  try {
    const profile = await direct.createProfile(profileInput), session = await direct.createSession(profile.id);
    proxy.state.mode = mode;
    window.history.replaceState(null, '', `#/sessoes/${session.id}`);
    render(<App client={createApi(proxy.base)} />);
    await user.type(await screen.findByRole('combobox', { name: /^Interlocutor/ }), 'Pessoa teste');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Evento 1' }), 'elogio_especifico');
    await user.click(screen.getByRole('button', { name: 'Aplicar eventos' }));
    expect(await screen.findByText('O resultado deste envio é incerto.')).toBeTruthy();
    expect(screen.getByRole('combobox', { name: 'Evento 1' })).toHaveProperty('value', 'elogio_especifico');
    expect(screen.getByRole('button', { name: 'Aplicar eventos' }).hasAttribute('disabled')).toBe(true);
    expect(proxy.state.requests.filter(r => r.method === 'POST')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Consultar histórico salvo' }));
    await user.click(await screen.findByRole('button', { name: 'Conferi o histórico; preparar outro turno' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Aplicar eventos' }).hasAttribute('disabled')).toBe(false));
    expect(screen.getByRole('combobox', { name: 'Evento 1' })).toHaveProperty('value', '');
    expect(proxy.state.requests.filter(r => r.method === 'POST')).toHaveLength(1);
    expect((await direct.session(session.id)).turnos).toHaveLength(mode === 'http-500' ? 0 : 1);
  } finally { cleanup(); await proxy.stop(); await server.stop(); }
});

it.each([400, 404, 502, 503])('preserva a entrada e não apresenta sucesso para HTTP %s', async status => {
  const server = await startServer(), direct = createApi(server.base), proxy = await startProxy(server.base), user = userEvent.setup();
  try {
    const profile = await direct.createProfile(profileInput), session = await direct.createSession(profile.id);
    proxy.state.mode = `http-${status}` as ProxyMode;
    window.history.replaceState(null, '', `#/sessoes/${session.id}`);
    render(<App client={createApi(proxy.base)} />);
    await user.type(await screen.findByRole('combobox', { name: /^Interlocutor/ }), 'Pessoa teste');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Evento 1' }), 'elogio_especifico');
    await user.click(screen.getByRole('button', { name: 'Aplicar eventos' }));
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', `Falha HTTP ${status} induzida no proxy local.`);
    expect(screen.getByRole('combobox', { name: 'Evento 1' })).toHaveProperty('value', 'elogio_especifico');
    expect(screen.queryByText(/confirmado e salvo/)).toBeNull();
    expect(proxy.state.requests.filter(r => r.method === 'POST')).toHaveLength(1);
    expect((await direct.session(session.id)).turnos).toHaveLength(0);
  } finally { cleanup(); await proxy.stop(); await server.stop(); }
});

it('recupera leitura após erro sem mostrar um workspace falsamente vazio', async () => {
  const server = await startServer(), proxy = await startProxy(server.base), user = userEvent.setup();
  try {
    proxy.state.failGet = true;
    window.history.replaceState(null, '', '#/');
    render(<App client={createApi(proxy.base)} />);
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.queryByText('Nenhuma sessão por aqui')).toBeNull();
    proxy.state.failGet = false;
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('heading', { name: 'Seu próximo ponto de partida.' })).toBeTruthy();
  } finally { cleanup(); await proxy.stop(); await server.stop(); }
});

it('mantém a criação pendente ao sair e voltar ao formulário, evitando nova submissão', async () => {
  const server = await startServer(), proxy = await startProxy(server.base), user = userEvent.setup();
  try {
    proxy.state.holdPostResponses = true;
    window.history.replaceState(null, '', '#/perfis/novo');
    render(<App client={createApi(proxy.base)} />);
    await user.type(await screen.findByRole('textbox', { name: /^Nome/ }), 'Perfil com resposta lenta');
    await user.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    await user.click(screen.getByRole('link', { name: 'Visão geral' }));
    await user.click(screen.getByRole('link', { name: 'Perfis' }));
    await user.click(await screen.findByRole('link', { name: 'Criar perfil' }));
    expect(await screen.findByRole('button', { name: 'Salvando perfil…' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('textbox', { name: /^Nome/ })).toHaveProperty('value', 'Perfil com resposta lenta');
    proxy.release();
    expect(await screen.findByRole('heading', { name: 'Perfil com resposta lenta' }, { timeout: 3000 })).toBeTruthy();
    expect(proxy.state.requests.filter(r => r.method === 'POST')).toHaveLength(1);
  } finally { cleanup(); await proxy.stop(); await server.stop(); }
});

it('mantém a abertura de sessão pendente e o perfil escolhido ao navegar', async () => {
  const server = await startServer(), direct = createApi(server.base), proxy = await startProxy(server.base), user = userEvent.setup();
  try {
    const profile = await direct.createProfile(profileInput);
    proxy.state.holdPostResponses = true;
    window.history.replaceState(null, '', '#/sessoes/nova');
    render(<App client={createApi(proxy.base)} />);
    await user.selectOptions(await screen.findByRole('combobox', { name: 'Perfil' }), profile.id);
    await user.click(screen.getByRole('button', { name: 'Abrir sessão' }));
    await user.click(screen.getByRole('link', { name: 'Visão geral' }));
    await user.click(screen.getByRole('link', { name: 'Sessões' }));
    await user.click(await screen.findByRole('link', { name: 'Nova sessão' }));
    expect(await screen.findByRole('button', { name: 'Abrindo sessão…' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('combobox', { name: 'Perfil' })).toHaveProperty('value', profile.id);
    proxy.release();
    expect(await screen.findByRole('heading', { name: profile.nome }, { timeout: 3000 })).toBeTruthy();
    expect(proxy.state.requests.filter(r => r.method === 'POST')).toHaveLength(1);
    expect(await direct.sessions()).toHaveLength(1);
  } finally { cleanup(); await proxy.stop(); await server.stop(); }
});

it('não duplica perfil ou sessão já lidos enquanto a resposta de criação está pendente', async () => {
  const server = await startServer(), direct = createApi(server.base), proxy = await startProxy(server.base), user = userEvent.setup();
  try {
    proxy.state.holdPostResponses = true;
    window.history.replaceState(null, '', '#/perfis/novo');
    render(<App client={createApi(proxy.base)} />);
    await user.type(await screen.findByRole('textbox', { name: /^Nome/ }), 'Perfil sem duplicação');
    await user.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    await user.click(screen.getByRole('link', { name: 'Perfis' }));
    expect(await screen.findByRole('heading', { name: 'Perfil sem duplicação' })).toBeTruthy();
    proxy.release();
    await waitFor(() => expect(screen.queryByText(/^Criação de perfil em andamento/)).toBeNull());
    expect(screen.getAllByRole('heading', { name: 'Perfil sem duplicação' })).toHaveLength(1);
    const profile = (await direct.profiles())[0];
    await user.click(screen.getByRole('link', { name: 'Sessões' }));
    await user.click(await screen.findByRole('link', { name: 'Nova sessão' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Perfil' }), profile.id);
    proxy.state.holdPostResponses = true;
    await user.click(screen.getByRole('button', { name: 'Abrir sessão' }));
    await user.click(screen.getByRole('link', { name: 'Sessões' }));
    expect(await screen.findByRole('link', { name: /^Perfil sem duplicação ·/ })).toBeTruthy();
    proxy.release();
    await waitFor(() => expect(screen.queryByText(/^Criação de sessão em andamento/)).toBeNull());
    expect(screen.getAllByRole('link', { name: /^Perfil sem duplicação ·/ })).toHaveLength(1);
    expect(await direct.profiles()).toHaveLength(1);
    expect(await direct.sessions()).toHaveLength(1);
  } finally { cleanup(); await proxy.stop(); await server.stop(); }
});

it('preserva criação incerta entre rotas e só limpa após consulta e conferência', async () => {
  const server = await startServer(), direct = createApi(server.base), proxy = await startProxy(server.base), user = userEvent.setup();
  try {
    proxy.state.mode = 'drop-response';
    window.history.replaceState(null, '', '#/perfis/novo');
    render(<App client={createApi(proxy.base)} />);
    await user.type(await screen.findByRole('textbox', { name: /^Nome/ }), 'Perfil de resposta perdida');
    await user.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /^Nome/ })).toHaveProperty('value', 'Perfil de resposta perdida');
    await user.click(screen.getByRole('button', { name: 'Consultar registros salvos' }));
    await screen.findByRole('button', { name: 'Conferi os registros; preparar nova criação' });
    await user.click(screen.getByRole('link', { name: 'Ver perfis →' }));
    expect(await screen.findByRole('heading', { name: 'Perfil de resposta perdida' })).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'Criar perfil' }));
    expect(await screen.findByRole('button', { name: 'Salvar perfil' })).toHaveProperty('disabled', true);
    await user.click(screen.getByRole('button', { name: 'Conferi os registros; preparar nova criação' }));
    expect(screen.getByRole('textbox', { name: /^Nome/ })).toHaveProperty('value', '');
    expect(screen.getByRole('button', { name: 'Salvar perfil' })).toHaveProperty('disabled', false);
    expect(proxy.state.requests.filter(r => r.method === 'POST')).toHaveLength(1);
    expect(await direct.profiles()).toHaveLength(1);
  } finally { cleanup(); await proxy.stop(); await server.stop(); }
});
