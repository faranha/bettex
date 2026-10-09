import { build } from 'esbuild';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Build-time fixture generation only: no database, RPC, user data or API calls.
const dir = await mkdtemp(join(tmpdir(), 'bettex-interface-'));
try {
  const outfile = join(dir, 'fixture.mjs');
  await build({ stdin: { contents: `
    import { seedEngine, seedAccount, dashboard } from '../api-server/src/lib/demo-state.ts';
    import { ensureScheduledStory } from '../api-server/src/lib/scheduled-demo-story.ts';
    import { prepareScheduledAccount } from '../api-server/src/lib/scheduled-demo-account.ts';
    import { ensureDemoLottery } from '../api-server/src/lib/demo-lottery.ts';
    import { ensureLotteryEntries } from '../api-server/src/lib/demo-lottery-entries.ts';
    const now = Date.UTC(2026, 9, 9, 22);
    const engine = seedEngine(now), account = seedAccount(now);
    ensureScheduledStory(engine, now); prepareScheduledAccount(account, now);
    ensureDemoLottery(engine, now);
    account.lotteryConsent = { participating: true, confirmedAt: new Date(now).toISOString() };
    ensureLotteryEntries(engine, account, now);
    const d = dashboard(account, engine, now);
    d.profile = { ...d.profile, accountId: 'interface-demo', name: 'Demo', nickname: 'Demo',
      authenticated: false, provider: 'demo', email: null, avatarUrl: null };
    export default { capturedAt: now, dashboard: d };
  `, resolveDir: resolve(import.meta.dirname, '..'), loader: 'ts' },
    bundle: true, platform: 'node', format: 'esm', outfile });
  const { default: fixture } = await import(pathToFileURL(outfile).href);
  await writeFile(resolve(import.meta.dirname, '../src/components/interface-demo/fixture.json'), JSON.stringify(fixture));
  console.log('Generated visual fixture without network or account access.');
} finally { await rm(dir, { recursive: true, force: true }); }
