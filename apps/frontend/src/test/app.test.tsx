// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { createApi } from '../api/client';
import { startServer } from './server';

let server: Awaited<ReturnType<typeof startServer>>;
beforeAll(async () => { server = await startServer(); });
afterAll(async () => { await server?.stop(); });
afterEach(cleanup);
it('mostra o workspace vazio do servidor e navega com links acessíveis', async () => {
  render(<App client={createApi(server.base)} />);
  expect(await screen.findByRole('heading', { name: 'Seu próximo ponto de partida.' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Nenhuma sessão por aqui' })).toBeTruthy();
  await userEvent.click(screen.getByRole('link', { name: 'Perfis' }));
  expect(await screen.findByRole('heading', { name: 'Perfis' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Perfis' }).getAttribute('aria-current')).toBe('page');
});
