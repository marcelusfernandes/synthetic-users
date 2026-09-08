import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

export type ProxyMode = 'pass' | 'drop-response' | 'invalid-response' | 'http-400' | 'http-404' | 'http-500' | 'http-502' | 'http-503';
// Injeta falhas na fronteira HTTP. Em pass/drop/invalid, o backend real recebe e processa o POST.
export async function startProxy(target: string) {
  if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(target)) throw new Error('Proxy de teste restrito a loopback.');
  const state = { mode: 'pass' as ProxyMode, postDelay: 0, holdPostResponses: false, failGet: false, requests: [] as { method: string; path: string }[] };
  const held: (() => void)[] = [];
  const release = () => { state.holdPostResponses = false; held.splice(0).forEach(resolve => resolve()); };
  const server = createServer(async (req, res) => {
    const method = req.method || 'GET', path = req.url || '/';
    state.requests.push({ method, path });
    const mode = state.mode, mutation = method === 'POST';
    const status = mutation && mode.startsWith('http-') ? Number(mode.slice(5)) : state.failGet && method === 'GET' && path.startsWith('/api/') ? 503 : 0;
    let body = '';
    for await (const chunk of req) body += chunk.toString();
    if (status) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ erro: `Falha HTTP ${status} induzida no proxy local.` })); return; }
    try {
      const response = await fetch(target + path, { method, headers: mutation ? { 'Content-Type': 'application/json' } : undefined, body: mutation ? body : undefined });
      const bytes = Buffer.from(await response.arrayBuffer());
      if (mutation && state.holdPostResponses) await new Promise<void>(resolve => held.push(resolve));
      if (mutation && state.postDelay) await new Promise(r => setTimeout(r, state.postDelay));
      if (mutation && mode === 'drop-response') { res.destroy(); return; }
      if (mutation && mode === 'invalid-response') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"resposta":"incompleta"}'); return; }
      res.writeHead(response.status, { 'Content-Type': response.headers.get('content-type') || 'application/octet-stream', 'Content-Length': bytes.length });
      res.end(bytes);
    } catch { res.destroy(); }
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  return { state, release, base: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, stop: async () => { release(); server.closeAllConnections(); await new Promise<void>((r, fail) => server.close(e => e ? fail(e) : r())); } };
}
