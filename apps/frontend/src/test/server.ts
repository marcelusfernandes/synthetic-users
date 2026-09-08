import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

export async function startServer() {
  const dir = await mkdtemp(resolve(tmpdir(), 'phb-front-test-'));
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(PHB_|ANTHROPIC_|OPENROUTER_)/.test(k)));
  // npm executa os testes em apps/frontend; jsdom reescreve import.meta.url para HTTP.
  const proc = spawn('python3', ['-m', 'app.server', '--porta', '0', '--dados', dir], { cwd: resolve(process.cwd(), '../..'), env, stdio: ['ignore', 'pipe', 'pipe'] });
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
