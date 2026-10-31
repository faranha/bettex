// Portable clean-clone launcher for local development.
import { spawn } from 'node:child_process';
if (process.env.NODE_ENV === 'production') throw new Error('Development launcher is forbidden in production.');
if (!process.env.DATABASE_URL) throw new Error('Configure a fresh development DATABASE_URL before starting the API.');
const children = [];
const launch = (args, extra) => {
  const child = spawn('pnpm', args, { stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development', BETTEX_EXECUTION_PAUSED: 'true', ...extra } });
  children.push(child);
  child.on('exit', code => { if (code) { for (const other of children) other.kill('SIGTERM'); process.exitCode = code; } });
};
launch(['--filter', '@workspace/api-server', 'run', 'dev'], { PORT: process.env.API_PORT || '8080' });
launch(['--filter', '@workspace/bettex-site', 'run', 'dev'], {
  PORT: process.env.SITE_PORT || '5173', BASE_PATH: process.env.BASE_PATH || '/',
  BETTEX_LOCAL_API_PROXY: `http://127.0.0.1:${process.env.API_PORT || '8080'}`,
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { for (const child of children) child.kill(signal); });
