import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

export async function startServer(options: { providerUrl?: string; frontend?: boolean } = {}) {
  const dir = await mkdtemp(resolve(tmpdir(), 'phb-front-test-'));
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(PHB_|ANTHROPIC_|OPENROUTER_)/.test(k)));
  if (options.providerUrl) {
    if (!/^http:\/\/127\.0\.0\.1:\d+\//.test(options.providerUrl)) throw new Error('O provedor de teste deve ser HTTP em loopback.');
    Object.assign(env, { PHB_LLM_PROVIDER: 'anthropic', ANTHROPIC_API_KEY: 'local-test-only', PHB_MODEL: 'provedor-local-emulado', PHB_LLM_URL: options.providerUrl });
  }
  // npm executa os testes em apps/frontend; jsdom reescreve import.meta.url para HTTP.
  const args = ['-m', 'app.server', '--porta', '0', '--dados', dir];
  if (options.frontend) args.push('--frontend', 'apps/frontend/dist');
  const proc = spawn('python3', args, { cwd: resolve(process.cwd(), '../..'), env, stdio: ['ignore', 'pipe', 'pipe'] });
  const stop = async () => { if (proc.exitCode === null) { proc.kill(); await new Promise<void>(r => proc.once('exit', () => r())); } await rm(dir, { recursive: true, force: true }); };
  try {
    const base = await new Promise<string>((ok, fail) => {
      let output = '', errors = '';
      const deadline = setTimeout(() => fail(new Error(`Servidor não iniciou: ${errors}`)), 8000);
      proc.stderr.on('data', b => { errors += b.toString(); });
      proc.once('error', e => { clearTimeout(deadline); fail(e); });
      proc.once('exit', () => { clearTimeout(deadline); fail(new Error(`Servidor encerrou: ${errors}`)); });
      proc.stdout.on('data', b => { output += b.toString(); if (output.includes('\n')) { clearTimeout(deadline); try { ok(`http://127.0.0.1:${JSON.parse(output.split('\n')[0]).porta}`); } catch (e) { fail(e); } } });
    });
    return { base, dir, stop };
  } catch (e) { await stop(); throw e; }
}
