import { context, status, synchronize, watch, pause } from './service.mjs';
try {
  const ctx = context();
  const [command = 'status', ...args] = process.argv.slice(2);
  if (command === 'watch') await watch(ctx);
  else if (command === 'status') console.log(JSON.stringify(status(ctx), null, 2));
  else if (command === 'pause' || command === 'resume') console.log(JSON.stringify(pause(ctx, command === 'pause'), null, 2));
  else if (command === 'once') {
    const result = await synchronize(ctx, { message: args.join(' ') || undefined });
    console.log(JSON.stringify(result, null, 2));
    if (!['synchronized', 'up-to-date'].includes(result.phase)) process.exitCode = 1;
  } else throw new Error('Use status, once [English task summary], watch, pause or resume.');
} catch {
  console.error('Synchronization could not start. Check Git checkout and github-sync.config.json; sensitive command output was suppressed.');
  process.exitCode = 1;
}
