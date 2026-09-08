import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

// Provedor HTTP emulado: produção continua usando app.llm e engine_v3 sem mocks.
export async function startProvider() {
  const state = { mode: 'success' as 'success' | 'interpret-error' | 'narrate-error', delay: 0, calls: [] as string[] };
  const server = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk.toString();
    const request = JSON.parse(body);
    const interpretation = request.system.includes('interpretador de mensagens');
    state.calls.push(interpretation ? 'interpretar' : 'narrar');
    if (state.delay) await new Promise(r => setTimeout(r, state.delay));
    const fail = state.mode === (interpretation ? 'interpret-error' : 'narrate-error');
    res.writeHead(fail ? 500 : 200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(fail ? { erro: 'falha local de teste' } : { content: [{ type: 'text', text: interpretation ? '[{"tipo":"elogio_especifico","intensidade":0.6}]' : 'Obrigada por observar esse cuidado. Podemos continuar.' }] }));
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  return { state, url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1/messages`, stop: async () => { server.closeAllConnections(); await new Promise<void>((r, fail) => server.close(e => e ? fail(e) : r())); } };
}
