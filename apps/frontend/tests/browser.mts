// Harness local de QA. Nunca carrega dados reais ou envia chamadas a provedores externos.
import { createInterface } from 'node:readline';
import { startProvider } from './provider.ts';
import { startServer } from './server.ts';

const provider = await startProvider();
const server = await startServer({ providerUrl: provider.url, frontend: true });
console.log(JSON.stringify({ pagina: `${server.base}/produto/`, dados: server.dir, provedor: 'HTTP local emulado' }));
console.log('Comandos: success, interpret-error, narrate-error, delay=1000, sair.');
const input = createInterface({ input: process.stdin, output: process.stdout });
let stopping = false;
async function stop() { if (stopping) return; stopping = true; input.close(); await server.stop(); await provider.stop(); }
input.on('line', line => {
  if (line === 'sair') void stop();
  else if (line === 'success' || line === 'interpret-error' || line === 'narrate-error') { provider.state.mode = line; console.log(`Modo: ${line}`); }
  else if (/^delay=\d{1,5}$/.test(line)) { provider.state.delay = Number(line.split('=')[1]); console.log(`Atraso local: ${provider.state.delay}ms`); }
});
process.once('SIGINT', () => void stop());
process.once('SIGTERM', () => void stop());
