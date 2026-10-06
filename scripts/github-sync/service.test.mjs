import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { context, synchronize, status, acquire, pause, watch } from './service.mjs';
import { git, inspect, inspectIndex, safeRemote, requireNonPublicRemote } from './guard.mjs';

function fixture(t, options = {}) {
  const directory = mkdtempSync(path.join(tmpdir(), 'bettex-sync-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const root = path.join(directory, 'work'), bare = path.join(directory, 'remote.git');
  mkdirSync(root);
  git(directory, ['init', '--bare', bare]);
  git(root, ['init', '-b', 'development/bettex']);
  git(root, ['config', 'user.name', 'Synchronization test']);
  git(root, ['config', 'user.email', 'fixture@invalid.test']);
  writeFileSync(path.join(root, '.gitignore'), '*.log\n.env\n');
  writeFileSync(path.join(root, 'README.md'), '# Isolated test repository\n');
  git(root, ['add', '-A']); git(root, ['commit', '-m', 'Create isolated synchronization fixture']);
  git(root, ['remote', 'add', 'origin', bare]);
  return { root, bare, directory, ctx: context(root, { allowLocalRemote: true,
    checkCommand: [process.execPath, '-e', 'process.exit(0)'], ...options }) };
}
const sync = (ctx, options = {}) => synchronize(ctx, { stableDelayMs: 20, ...options });
test('official documentation build sections are source, not generated output; safety checks remain active', t => {
  const { root } = fixture(t);
  const docs = 'docs/reference/starknet/upstream/build';
  mkdirSync(path.join(root, docs), { recursive: true });
  writeFileSync(path.join(root, docs, 'guide.mdx'), '# Public authoring reference\n');
  const buildDefinition = 'docs/reference/starknet/upstream/archive/cairozero/hello-cairozero';
  mkdirSync(path.join(root, buildDefinition), { recursive: true });
  writeFileSync(path.join(root, buildDefinition, 'BUILD'), '# Public source build definition\n');
  git(root, ['add', '-A']);
  assert.deepEqual(inspectIndex(root), []);
  const fake = 'ghp_' + 'a'.repeat(36);
  writeFileSync(path.join(root, docs, 'unsafe.md'), fake);
  mkdirSync(path.join(root, docs, 'node_modules'), { recursive: true });
  writeFileSync(path.join(root, docs, 'node_modules', 'unsafe.md'), '# Not source\n');
  mkdirSync(path.join(root, 'artifacts/example/build'), { recursive: true });
  writeFileSync(path.join(root, 'artifacts/example/build', 'output.md'), '# Generated\n');
  git(root, ['add', '-A']);
  // Global Git ignores must not hide intentionally unsafe fixture entries.
  git(root, ['add', '-f', `${docs}/node_modules/unsafe.md`, 'artifacts/example/build/output.md']);
  const findings = inspectIndex(root);
  assert.ok(findings.some(item => item.category === 'provider-token' && item.path.endsWith('/unsafe.md')));
  assert.ok(findings.some(item => item.category === 'excluded-file' && item.path.includes('/node_modules/')));
  assert.ok(findings.some(item => item.category === 'excluded-file' && item.path === 'artifacts/example/build/output.md'));
  assert.ok(!JSON.stringify(findings).includes(fake));
});
test('creates, pushes and verifies checkpoints; unchanged files never create empty commits', async t => {
  const { root, bare, ctx } = fixture(t);
  writeFileSync(path.join(root, 'feature.txt'), 'Harmless development feature\n');
  const first = await sync(ctx, { message: 'Document harmless development feature' });
  assert.equal(first.phase, 'synchronized');
  assert.equal(first.lastPushCommit, git(bare, ['rev-parse', 'refs/heads/development/bettex']).trim());
  const count = git(root, ['rev-list', '--count', 'HEAD']).trim();
  assert.equal((await sync(ctx)).phase, 'up-to-date');
  assert.equal(git(root, ['rev-list', '--count', 'HEAD']).trim(), count);
  const info = status(ctx);
  assert.equal(info.commitsAwaitingPush, 0);
  assert.equal(info.localChangesPending, false);
  assert.ok(info.lastPushAt);
});
test('the task and background triggers share one lock', async t => {
  const { root, ctx } = fixture(t);
  writeFileSync(path.join(root, 'feature.txt'), 'Coordinated change\n');
  const first = sync(ctx, { stableDelayMs: 80 });
  assert.equal((await sync(ctx)).phase, 'busy');
  assert.equal((await first).phase, 'synchronized');
});
test('failed push retains the local commit, records bounded retry, then recovers', async t => {
  const { root, bare, ctx } = fixture(t, { retryBaseSeconds: 1, retryMaxSeconds: 2 });
  writeFileSync(path.join(bare, 'hooks/pre-receive'), '#!/bin/sh\nexit 1\n', { mode: 0o755 });
  writeFileSync(path.join(root, 'feature.txt'), 'Pending recovery\n');
  const failed = await sync(ctx);
  assert.equal(failed.phase, 'retrying');
  assert.ok(failed.lastCommit);
  assert.ok(failed.nextRetryAt);
  assert.equal(git(root, ['show', 'HEAD:feature.txt']), 'Pending recovery\n');
  rmSync(path.join(bare, 'hooks/pre-receive'));
  assert.equal((await sync(context(root, ctx.config))).phase, 'synchronized');
  assert.equal(status(ctx).commitsAwaitingPush, 0);
});
test('startup synchronization pushes an already-created pending commit', async t => {
  const { root, ctx } = fixture(t);
  git(root, ['push', 'origin', 'HEAD:refs/heads/development/bettex']);
  writeFileSync(path.join(root, 'recovered.txt'), 'Startup recovery\n');
  git(root, ['add', '-A']); git(root, ['commit', '-m', 'Prepare pending development work']);
  assert.equal((await sync(context(root, ctx.config))).phase, 'synchronized');
});
test('changed writes defer checkpoint creation without losing files', async t => {
  const { root, ctx } = fixture(t);
  writeFileSync(path.join(root, 'feature.txt'), 'Partial');
  const pending = sync(ctx, { stableDelayMs: 150 });
  await new Promise(resolve => setTimeout(resolve, 25));
  writeFileSync(path.join(root, 'feature.txt'), 'Completed write\n');
  assert.equal((await pending).phase, 'waiting-for-stable-writes');
  assert.equal(readFileSync(path.join(root, 'feature.txt'), 'utf8'), 'Completed write\n');
  assert.equal((await sync(ctx)).phase, 'synchronized');
});
test('failed checks restore the index, retain work and do not push', async t => {
  const { root, ctx } = fixture(t, { checkCommand: [process.execPath, '-e', 'process.exit(1)'] });
  writeFileSync(path.join(root, 'feature.txt'), 'Unpublished work\n');
  assert.equal((await sync(ctx)).phase, 'retrying');
  assert.equal(git(root, ['diff', '--cached', '--name-only']).trim(), '');
  assert.equal(readFileSync(path.join(root, 'feature.txt'), 'utf8'), 'Unpublished work\n');
  assert.equal(git(root, ['rev-list', '--count', 'HEAD']).trim(), '1');
});
test('secrets and excluded files block checkpoints without printing their values', async t => {
  const { root, ctx } = fixture(t);
  const fake = 'ghp_' + 'a'.repeat(36);
  writeFileSync(path.join(root, 'unsafe.txt'), `Do not publish: ${fake}\n`);
  const result = await sync(ctx);
  assert.equal(result.phase, 'retrying');
  assert.ok(result.findings.some(item => item.category === 'provider-token'));
  assert.ok(!JSON.stringify(result).includes(fake));
  assert.equal(git(root, ['diff', '--cached', '--name-only']).trim(), '');
  rmSync(path.join(root, 'unsafe.txt'));
  mkdirSync(path.join(root, 'dist')); writeFileSync(path.join(root, 'dist/bundle.js'), 'generated output');
  const excluded = await sync(ctx);
  assert.ok(excluded.findings.some(item => item.category === 'excluded-file'));
});
test('user staging, production branches and intentional pauses remain untouched', async t => {
  const { root, ctx } = fixture(t);
  writeFileSync(path.join(root, 'staged.txt'), 'User-controlled staging\n');
  git(root, ['add', 'staged.txt']);
  assert.equal((await sync(ctx)).phase, 'blocked-index');
  assert.equal(git(root, ['diff', '--cached', '--name-only']).trim(), 'staged.txt');
  git(root, ['reset', '--mixed', 'HEAD']);
  pause(ctx, true);
  assert.equal((await sync(ctx)).phase, 'paused');
  pause(ctx, false);
  git(root, ['switch', '-c', 'main']);
  assert.equal((await sync(ctx)).phase, 'blocked-branch');
  assert.equal(readFileSync(path.join(root, 'staged.txt'), 'utf8'), 'User-controlled staging\n');
});
test('safe remote fast-forward is allowed; divergence is never overwritten', async t => {
  const { root, bare, directory, ctx } = fixture(t);
  assert.equal((await sync(ctx)).phase, 'synchronized');
  const other = path.join(directory, 'other');
  git(directory, ['clone', '-b', 'development/bettex', bare, other]);
  git(other, ['config', 'user.name', 'Other test developer']);
  git(other, ['config', 'user.email', 'other@invalid.test']);
  writeFileSync(path.join(other, 'remote.txt'), 'Remote update\n');
  git(other, ['add', '-A']); git(other, ['commit', '-m', 'Document remote development work']); git(other, ['push']);
  assert.equal((await sync(ctx)).phase, 'up-to-date');
  assert.equal(readFileSync(path.join(root, 'remote.txt'), 'utf8'), 'Remote update\n');
  writeFileSync(path.join(root, 'local.txt'), 'Local branch work\n');
  git(root, ['add', '-A']); git(root, ['commit', '-m', 'Document local branch work']);
  writeFileSync(path.join(other, 'second.txt'), 'Second remote update\n');
  git(other, ['add', '-A']); git(other, ['commit', '-m', 'Document second remote update']); git(other, ['push']);
  const before = git(root, ['rev-parse', 'HEAD']).trim();
  assert.equal((await sync(ctx)).phase, 'conflict');
  assert.equal(git(root, ['rev-parse', 'HEAD']).trim(), before);
  // Explicit human recovery with an ordinary merge; automation resumes afterwards.
  git(root, ['merge', '--no-edit', 'origin/development/bettex']);
  assert.equal((await sync(ctx)).phase, 'synchronized');
});
test('missing connection stays pending; unsafe remotes and raw credentials are rejected', async t => {
  const { root, ctx } = fixture(t);
  git(root, ['remote', 'remove', 'origin']);
  assert.equal((await sync(ctx)).phase, 'pending-connection');
  const unsafeUrl = ['https://', 'user', ':', 'credential', '@github.com/example/project.git'].join('');
  assert.throws(() => safeRemote(unsafeUrl));
  assert.throws(() => safeRemote('git://gitsafe:5418/backup.git'));
  assert.equal(safeRemote('https://github.com/example/private-project.git'), 'https://github.com/example/private-project.git');
  const value = 'ghp_' + 'x'.repeat(36);
  assert.equal(inspect(value, 'fixture').length, 1);
  assert.ok(!JSON.stringify(inspect(value, 'fixture')).includes(value));
  const release = acquire(ctx); assert.ok(release); assert.equal(acquire(ctx), null); release();
});
test('watcher recovers on startup and automatically pushes stable outside-task changes', async t => {
  const { root, bare, ctx } = fixture(t, { pollSeconds: 0.05, debounceSeconds: 0.15 });
  const running = watch(ctx);
  const waitUntil = async predicate => {
    const deadline = Date.now() + 8_000;
    while (!predicate()) {
      if (Date.now() > deadline) throw new Error('Automatic watcher checkpoint did not arrive.');
      await new Promise(resolve => setTimeout(resolve, 40));
    }
  };
  try {
    await waitUntil(() => Boolean(status(ctx).lastPushCommit));
    assert.equal(status(ctx).running, true);
    const initial = status(ctx).lastPushCommit;
    writeFileSync(path.join(root, 'outside-task.txt'), 'An incomplete write');
    await new Promise(resolve => setTimeout(resolve, 60));
    writeFileSync(path.join(root, 'outside-task.txt'), 'Completed outside-task change\n');
    await waitUntil(() => status(ctx).lastPushCommit !== initial);
    assert.equal(git(bare, ['show', 'refs/heads/development/bettex:outside-task.txt']), 'Completed outside-task change\n');
    const count = git(root, ['rev-list', '--count', 'HEAD']).trim();
    await new Promise(resolve => setTimeout(resolve, 250));
    assert.equal(git(root, ['rev-list', '--count', 'HEAD']).trim(), count);
  } finally {
    process.emit('SIGTERM');
    await running;
  }
  assert.equal(status(ctx).running, false);
});
test('removed secrets in reachable history still block upload', async t => {
  const { root, ctx } = fixture(t);
  writeFileSync(path.join(root, 'historic.txt'), 'ghp_' + 'z'.repeat(36));
  git(root, ['add', '-A']); git(root, ['commit', '-m', 'Create an unsafe isolated historical fixture']);
  rmSync(path.join(root, 'historic.txt'));
  git(root, ['add', '-A']); git(root, ['commit', '-m', 'Remove unsafe historical fixture']);
  const result = await sync(ctx);
  assert.equal(result.phase, 'retrying');
  assert.ok(result.findings.some(item => item.path === 'historic.txt' && item.object));
  assert.equal(git(root, ['ls-remote', '--heads', 'origin']).trim(), '');
});
test('concurrent external staging during checks is preserved, never reset', async t => {
  const { root, ctx } = fixture(t, {
    checkCommand: [process.execPath, '-e',
      "require('node:fs').writeFileSync('external.txt','External developer work\\n');require('node:child_process').execFileSync('git',['add','external.txt']);"],
  });
  writeFileSync(path.join(root, 'feature.txt'), 'Synchronization-owned work\n');
  await sync(ctx);
  assert.equal(status(ctx).phase, 'blocked-index');
  assert.ok(git(root, ['diff', '--cached', '--name-only']).includes('external.txt'));
  assert.equal(readFileSync(path.join(root, 'external.txt'), 'utf8'), 'External developer work\n');
});
test('commit-message secrets are refused before creating a checkpoint', async t => {
  const { root, ctx } = fixture(t);
  writeFileSync(path.join(root, 'safe.txt'), 'Harmless work\n');
  const result = await sync(ctx, { message: 'Unsafe summary ghp_' + 'a'.repeat(36) });
  assert.equal(result.phase, 'retrying');
  assert.ok(result.findings.some(item => item.path === '(proposed commit message)'));
  assert.equal(git(root, ['rev-list', '--count', 'HEAD']).trim(), '1');
});
test('public repositories and unavailable privacy checks fail closed without credentials', async () => {
  const url = 'https://github.com/example/private-project.git';
  const response = (status, privateValue) => async (_url, options) => {
    assert.equal(options.headers.Authorization, undefined);
    return { status, json: async () => ({ private: privateValue }) };
  };
  await requireNonPublicRemote(url, response(404));
  await assert.rejects(requireNonPublicRemote(url, response(200, false)), /public-repository/);
  await assert.rejects(requireNonPublicRemote(url, response(403)), /privacy-check/);
});
test('explicit public upload authorization permits only the exact repository and all supported URL forms', async () => {
  const unused = async () => { throw new Error('No privacy API request is needed for an explicitly authorized public repository.'); };
  for (const url of ['https://github.com/example/approved.git', 'git@github.com:example/approved.git',
    'ssh://git@github.com/example/approved.git']) {
    await requireNonPublicRemote(url, unused, 'example/approved');
  }
  await assert.rejects(requireNonPublicRemote('https://github.com/example/other.git',
    async () => ({ status: 200, json: async () => ({ private: false }) }), 'example/approved'), /public-repository/);
});
