// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { createApi } from '../api/client';
import { startServer } from './server';

let server: Awaited<ReturnType<typeof startServer>>;
beforeAll(async () => { server = await startServer(); });
afterAll(async () => { await server?.stop(); });
afterEach(cleanup);
it('valida o nome, cria um perfil com OCEAN, relê os detalhes e seleciona para sessão', async () => {
  const client = createApi(server.base), user = userEvent.setup();
  window.history.replaceState(null, '', '#/perfis');
  const view = render(<App client={client} />);
  await user.click(await screen.findByRole('link', { name: 'Criar perfil' }));
  await user.click(await screen.findByRole('button', { name: 'Salvar perfil' }));
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Informe um nome para o perfil.');
  await user.type(screen.getByRole('textbox', { name: /^Nome/ }), 'Lia de teste');
  await user.type(screen.getByRole('textbox', { name: /^Bio/ }), 'Pesquisa produtos com cuidado.');
  await user.type(screen.getByRole('textbox', { name: /^Voz/ }), 'Direta e cordial.');
  fireEvent.change(screen.getByRole('slider', { name: 'Abertura' }), { target: { value: '7.2' } });
  await user.click(screen.getByRole('button', { name: 'Salvar perfil' }));
  expect(await screen.findByRole('heading', { name: 'Lia de teste' })).toBeTruthy();
  const profiles = await client.profiles();
  expect(profiles).toHaveLength(1);
  expect(profiles[0]).toMatchObject({ nome: 'Lia de teste', bio: 'Pesquisa produtos com cuidado.', voz: 'Direta e cordial.', ocean_base: { abertura: 7.2 } });
  expect(Object.keys(profiles[0].ocean_base)).toHaveLength(5);
  view.unmount(); render(<App client={client} />);
  expect(await screen.findByRole('heading', { name: 'Lia de teste' })).toBeTruthy();
  await user.click(screen.getByRole('link', { name: 'Selecionar para sessão →' }));
  await waitFor(() => expect(window.location.hash).toBe(`#/sessoes?perfil=${profiles[0].id}`));
  expect(await screen.findByText(/Perfil selecionado:/)).toBeTruthy();
});
