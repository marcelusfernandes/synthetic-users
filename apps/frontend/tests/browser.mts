// Harness local de QA. Nunca carrega dados reais ou envia chamadas a provedores externos.
import { createInterface } from 'node:readline';
import { startProvider } from './provider.ts';
import { startServer } from './server.ts';
import { startProxy, type ProxyMode } from './proxy.ts';

const provider = await startProvider();
const server = await startServer({ providerUrl: provider.url, frontend: true });
const proxy = await startProxy(server.base);
console.log(JSON.stringify({ pagina: `${proxy.base}/produto/`, backend: server.base, dados: server.dir, provedor: 'HTTP local emulado' }));
console.log('Provedor: success, interpret-error, narrate-error, delay=1000. Rede: pass, drop-response, invalid-response, http-400/404/500/502/503, post-delay=1000, get-error, get-ok. stats, sair.');
const input = createInterface({ input: process.stdin, output: process.stdout });
let stopping = false;
async function stop() { if (stopping) return; stopping = true; input.close(); await proxy.stop(); await server.stop(); await provider.stop(); }
input.on('line', line => {
  if (line === 'sair') void stop();
  else if (line === 'success' || line === 'interpret-error' || line === 'narrate-error') { provider.state.mode = line; console.log(`Modo: ${line}`); }
  else if (/^delay=\d{1,5}$/.test(line)) { provider.state.delay = Number(line.split('=')[1]); console.log(`Atraso local: ${provider.state.delay}ms`); }
  else if (['pass', 'drop-response', 'invalid-response', 'http-400', 'http-404', 'http-500', 'http-502', 'http-503'].includes(line)) { proxy.state.mode = line as ProxyMode; console.log(`Proxy: ${line}`); }
  else if (/^post-delay=\d{1,5}$/.test(line)) { proxy.state.postDelay = Number(line.split('=')[1]); console.log(`Atraso da resposta POST: ${proxy.state.postDelay}ms`); }
  else if (line === 'get-error' || line === 'get-ok') { proxy.state.failGet = line === 'get-error'; console.log(`Falha GET: ${proxy.state.failGet}`); }
  else if (line === 'stats') console.log(JSON.stringify({ chamadasProvedor: provider.state.calls, requisicoes: proxy.state.requests }));
});
process.once('SIGINT', () => void stop());
process.once('SIGTERM', () => void stop());
