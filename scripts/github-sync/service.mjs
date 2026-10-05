import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, rmSync, statSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { git, inspect, inspectIndex, inspectHistory, safeRemote, requireNonPublicRemote } from './guard.mjs';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export function context(root = process.cwd(), overrides = {}) {
  root = path.resolve(root);
  const defaults = { remote: 'origin', branch: 'development/bettex', debounceSeconds: 90,
    pollSeconds: 10, retryBaseSeconds: 15, retryMaxSeconds: 900, checkCommand: ['pnpm', 'sync:check'] };
  const file = path.join(root, 'github-sync.config.json');
  const config = { ...defaults, ...(existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}), ...overrides };
  if (!/^[\w.-]+$/.test(config.remote) || !/^development\/[\w./-]+$/.test(config.branch)) {
    throw new Error('Use a named remote and a development/* branch; production branches are never synchronization targets.');
  }
  for (const key of ['debounceSeconds', 'pollSeconds', 'retryBaseSeconds', 'retryMaxSeconds']) {
    if (!Number.isFinite(config[key]) || config[key] <= 0) throw new Error(`Invalid synchronization setting: ${key}`);
  }
  const directory = path.resolve(root, git(root, ['rev-parse', '--git-common-dir']).trim(), 'bettex-sync');
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  return { root, config, directory };
}
function state(ctx) {
  try { return JSON.parse(readFileSync(path.join(ctx.directory, 'state.json'), 'utf8')); } catch { return {}; }
}
function save(ctx, update) {
  const next = { ...state(ctx), ...update };
  const temp = path.join(ctx.directory, `state-${process.pid}.tmp`);
  writeFileSync(temp, JSON.stringify(next, null, 2), { mode: 0o600 });
  renameSync(temp, path.join(ctx.directory, 'state.json'));
  return next;
}
function log(ctx, message) {
  const file = path.join(ctx.directory, 'events.log');
  if (existsSync(file) && statSync(file).size > 512_000) renameSync(file, `${file}.previous`);
  // Never log command stderr, URLs supplied by errors, environment values or diff content.
  appendFileSync(file, `${new Date().toISOString()} ${message}\n`, { mode: 0o600 });
}
function alive(pid) {
  if (!Number.isInteger(pid)) return false;
  try { process.kill(pid, 0); return true; } catch (error) { return error.code === 'EPERM'; }
}
export function acquire(ctx, name = 'operation.lock') {
  const lock = path.join(ctx.directory, name);
  try { mkdirSync(lock); } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    let owner;
    try { owner = JSON.parse(readFileSync(path.join(lock, 'owner.json'), 'utf8')); } catch {}
    // A process may be between mkdir and writing its owner; do not steal a fresh lock.
    if (alive(owner?.pid) || Date.now() - statSync(lock).mtimeMs < 30_000) return null;
    rmSync(lock, { recursive: true, force: true });
    try { mkdirSync(lock); } catch { return null; }
  }
  writeFileSync(path.join(lock, 'owner.json'), JSON.stringify({ pid: process.pid }), { mode: 0o600 });
  return () => rmSync(lock, { recursive: true, force: true });
}
export function fingerprint(ctx) {
  const hash = createHash('sha256');
  const files = git(ctx.root, ['ls-files', '-c', '-o', '--exclude-standard', '-z']).split('\0').filter(Boolean).sort();
  for (const file of new Set(files)) {
    hash.update(file);
    try { hash.update(readFileSync(path.join(ctx.root, file))); } catch { hash.update('missing'); }
  }
  hash.update(git(ctx.root, ['status', '--porcelain=v1', '-z']));
  return hash.digest('hex');
}
function remote(ctx) {
  const url = git(ctx.root, ['remote', 'get-url', ctx.config.remote]).trim();
  return safeRemote(url, ctx.config.allowLocalRemote === true);
}
function ref(ctx) { return `refs/remotes/${ctx.config.remote}/${ctx.config.branch}`; }
function tip(ctx, name) {
  try { return git(ctx.root, ['rev-parse', '--verify', name]).trim(); } catch { return null; }
}
function counts(ctx) {
  if (!tip(ctx, ref(ctx))) return { ahead: null, behind: null };
  const [ahead, behind] = git(ctx.root, ['rev-list', '--left-right', '--count', `HEAD...${ref(ctx)}`]).trim().split(/\s+/).map(Number);
  return { ahead, behind };
}
export function status(ctx) {
  let repository = null;
  try { repository = remote(ctx); } catch {}
  let running = false;
  try { running = alive(JSON.parse(readFileSync(path.join(ctx.directory, 'daemon.lock/owner.json'), 'utf8')).pid); } catch {}
  return { ...state(ctx), repository, branch: ctx.config.branch,
    currentBranch: git(ctx.root, ['branch', '--show-current']).trim(),
    running, paused: existsSync(path.join(ctx.directory, 'paused')),
    localChangesPending: Boolean(git(ctx.root, ['status', '--porcelain=v1']).trim()),
    commitsAwaitingPush: counts(ctx).ahead,
    lastPushCommit: state(ctx).lastPushCommit ?? null,
    lastPushAt: state(ctx).lastPushAt ?? null,
    error: state(ctx).error ?? null,
    nextRetryAt: state(ctx).nextRetryAt ?? null,
    activation: !repository ? 'pending GitHub connection' : ctx.config.allowLocalRemote
      ? 'isolated local test; not GitHub activation'
      : ['synchronized', 'up-to-date'].includes(state(ctx).phase) && !existsSync(path.join(ctx.directory, 'paused'))
        && state(ctx).lastVerifiedRepository === repository && state(ctx).lastVerifiedCommit === tip(ctx, 'HEAD')
        ? 'active; remote commit verified' : 'remote-configured; verified push required' };
}
function checkpointMessage(ctx, supplied) {
  if (supplied) {
    if (supplied.length > 150 || !/^[\x20-\x7e]+$/.test(supplied)) throw new Error('Provide a concise English task summary without secrets.');
    const findings = inspect(supplied, '(proposed commit message)');
    if (findings.length) { save(ctx, { findings }); throw new Error('guard'); }
    return supplied;
  }
  const stats = git(ctx.root, ['diff', '--cached', '--numstat']).trim().split('\n').filter(Boolean);
  const groups = [...new Set(stats.map(line => {
    const file = line.split('\t').at(-1);
    return file.startsWith('artifacts/bettex-site/') ? 'web application' :
      file.startsWith('artifacts/api-server/') ? 'API' :
      file.startsWith('lib/bettex-contracts/') ? 'test contracts' :
      file.startsWith('docs/') || file.endsWith('.md') ? 'documentation' :
      file.startsWith('scripts/') ? 'development tools' : 'workspace configuration';
  }))];
  return `Checkpoint ${groups.join(', ')} (${stats.length} changed files)`;
}
function fetchRemote(ctx) {
  // A missing development branch is allowed; fetch all advertised branch refs first.
  git(ctx.root, ['fetch', '--no-tags', ctx.config.remote, `refs/heads/*:refs/remotes/${ctx.config.remote}/*`]);
}
export async function synchronize(ctx, { message, background = false, stableDelayMs = 1500 } = {}) {
  const release = acquire(ctx);
  if (!release) return { phase: 'busy', error: 'Another coordinated synchronization is running.' };
  let ownsIndex = false;
  let ownedTree;
  try {
    if (existsSync(path.join(ctx.directory, 'paused'))) return save(ctx, { phase: 'paused' });
    if (background && state(ctx).nextRetryAt && Date.now() < Date.parse(state(ctx).nextRetryAt)) return state(ctx);
    const branch = git(ctx.root, ['branch', '--show-current']).trim();
    if (branch !== ctx.config.branch) {
      return save(ctx, { phase: 'blocked-branch', error: `Checkout ${ctx.config.branch}; current branch is not an automatic synchronization target.`, nextRetryAt: null });
    }
    try { remote(ctx); } catch {
      return save(ctx, { phase: 'pending-connection', error: 'Configure origin with a private GitHub repository and authorize a supported Git credential manager.', nextRetryAt: null });
    }
    if (git(ctx.root, ['diff', '--cached', '--name-only']).trim()) {
      return save(ctx, { phase: 'blocked-index', error: 'User-staged changes are present; finish or unstage them intentionally. They were not modified.', nextRetryAt: null });
    }
    if (!ctx.config.allowLocalRemote) await requireNonPublicRemote(remote(ctx));
    const initial = fingerprint(ctx);
    await sleep(stableDelayMs);
    if (initial !== fingerprint(ctx)) return save(ctx, { phase: 'waiting-for-stable-writes', nextRetryAt: null });
    fetchRemote(ctx);
    const { ahead, behind } = counts(ctx);
    if (behind > 0 && ahead > 0) {
      return save(ctx, { phase: 'conflict', error: `Local and remote development histories diverged. Review git log HEAD...${ref(ctx)}; resolve explicitly, then synchronization retries. No merge, rebase or force push was attempted.`, nextRetryAt: null });
    }
    let dirty = git(ctx.root, ['status', '--porcelain=v1']).trim();
    if (behind > 0) {
      if (dirty) return save(ctx, { phase: 'conflict', error: 'Remote is ahead and local files are modified. Preserve or commit your work, then explicitly update the development branch.', nextRetryAt: null });
      git(ctx.root, ['merge', '--ff-only', ref(ctx)]);
    }
    dirty = git(ctx.root, ['status', '--porcelain=v1']).trim();
    if (dirty) {
      git(ctx.root, ['add', '-A']);
      ownsIndex = true;
      ownedTree = git(ctx.root, ['write-tree']).trim();
      const findings = inspectIndex(ctx.root);
      if (findings.length) {
        save(ctx, { findings });
        throw new Error('guard');
      }
      const stagedTree = git(ctx.root, ['write-tree']).trim();
      const stableFiles = fingerprint(ctx);
      const [command, ...args] = ctx.config.checkCommand;
      const check = spawnSync(command, args, { cwd: ctx.root, timeout: 240_000,
        stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 8 * 1024 * 1024,
        env: { ...process.env, BETTEX_EXECUTION_PAUSED: 'true' } });
      if (check.status !== 0 || check.error) throw new Error('checks');
      if (existsSync(path.join(ctx.directory, 'paused'))) return save(ctx, { phase: 'paused' });
      if (stableFiles !== fingerprint(ctx) || stagedTree !== git(ctx.root, ['write-tree']).trim()) {
        return save(ctx, { phase: 'waiting-for-stable-writes', error: 'Files changed while checks ran; checkpoint deferred.', nextRetryAt: null });
      }
      if (git(ctx.root, ['diff', '--cached', '--name-only']).trim()) {
        git(ctx.root, ['commit', '-m', checkpointMessage(ctx, message)]);
        ownsIndex = false;
        save(ctx, { lastCommit: tip(ctx, 'HEAD'), lastCommitAt: new Date().toISOString() });
        log(ctx, 'checkpoint created');
      }
    } else {
      const findings = inspectIndex(ctx.root);
      if (findings.length) { save(ctx, { findings }); throw new Error('guard'); }
    }
    // Fetch again: another developer may have pushed while checks ran.
    fetchRemote(ctx);
    const latest = counts(ctx);
    if (latest.behind > 0) return save(ctx, { phase: 'conflict', error: 'Remote advanced during synchronization. Local commit retained; update the development branch explicitly.', nextRetryAt: null });
    const head = tip(ctx, 'HEAD');
    if (!ctx.config.allowLocalRemote) await requireNonPublicRemote(remote(ctx));
    const historyFindings = inspectHistory(ctx.root, state(ctx).lastHistoryCheckedCommit);
    if (historyFindings.length) { save(ctx, { findings: historyFindings }); throw new Error('guard'); }
    save(ctx, { lastHistoryCheckedCommit: head });
    if (tip(ctx, ref(ctx)) === head) {
      const advertised = git(ctx.root, ['ls-remote', '--heads', ctx.config.remote, `refs/heads/${ctx.config.branch}`]).trim().split(/\s+/)[0];
      if (advertised !== head) throw new Error('verification');
      return save(ctx, { phase: 'up-to-date', lastVerifiedCommit: head,
        lastVerifiedRepository: remote(ctx), lastRemoteVerificationAt: new Date().toISOString(),
        error: null, attempts: 0, nextRetryAt: null, findings: [] });
    }
    git(ctx.root, ['push', ctx.config.remote, `HEAD:refs/heads/${ctx.config.branch}`]);
    const advertised = git(ctx.root, ['ls-remote', '--heads', ctx.config.remote, `refs/heads/${ctx.config.branch}`]).trim().split(/\s+/)[0];
    if (advertised !== head) throw new Error('verification');
    git(ctx.root, ['update-ref', ref(ctx), head]);
    log(ctx, 'push verified on development remote');
    return save(ctx, { phase: 'synchronized', lastPushCommit: head, lastPushAt: new Date().toISOString(),
      lastVerifiedCommit: head, lastVerifiedRepository: remote(ctx), lastRemoteVerificationAt: new Date().toISOString(),
      error: null, attempts: 0, nextRetryAt: null, findings: [] });
  } catch (error) {
    const category = ['guard', 'checks', 'verification', 'public-repository', 'privacy-check'].includes(error.message) ? error.message : 'git-operation';
    const attempts = (state(ctx).attempts ?? 0) + 1;
    const delay = Math.min(ctx.config.retryMaxSeconds, ctx.config.retryBaseSeconds * 2 ** Math.min(attempts - 1, 10));
    const descriptions = {
      guard: 'Index safety check failed. Review redacted findings with sync:status; work was preserved.',
      checks: 'Checkpoint checks failed or timed out. Run pnpm sync:check to inspect the failures. No checkpoint was published.',
      verification: 'Push could not be verified against the remote. Local commit retained; retry scheduled.',
      'public-repository': 'The GitHub repository is publicly visible. Upload refused: select a private repository before retrying.',
      'privacy-check': 'GitHub privacy could not be checked (API rate limit or service failure). Upload refused until verification succeeds.',
      'git-operation': 'Git operation failed (network, authorization, repository policy or concurrent update). Local work retained. Check credential-manager access and development branch status; raw output is intentionally not logged.',
    };
    log(ctx, `synchronization failed: ${category}; retry in ${delay}s`);
    return save(ctx, { phase: 'retrying', error: descriptions[category], attempts,
      nextRetryAt: new Date(Date.now() + delay * 1000).toISOString() });
  } finally {
    try {
      if (ownsIndex) {
        if (ownedTree === git(ctx.root, ['write-tree']).trim()) git(ctx.root, ['reset', '--mixed', 'HEAD']);
        else save(ctx, { phase: 'blocked-index',
          error: 'Concurrent staging was preserved. Review the index and finish or unstage changes intentionally before retrying.', nextRetryAt: null });
      }
    } finally { release(); }
  }
}
export async function watch(ctx) {
  const release = acquire(ctx, 'daemon.lock');
  if (!release) throw new Error('The synchronization watcher is already running.');
  let stopping = false;
  const stop = () => { stopping = true; };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
  try {
    log(ctx, 'watcher started; startup recovery requested');
    await synchronize(ctx, { background: true });
    let previous = fingerprint(ctx), changedAt = Date.now();
    while (!stopping) {
      await sleep(ctx.config.pollSeconds * 1000);
      if (stopping) break;
      const next = fingerprint(ctx);
      if (next !== previous) { previous = next; changedAt = Date.now(); }
      const current = state(ctx);
      const pending = git(ctx.root, ['status', '--porcelain=v1']).trim() || counts(ctx).ahead !== 0;
      if (pending && Date.now() - changedAt >= ctx.config.debounceSeconds * 1000) {
        await synchronize(ctx, { background: true });
        previous = fingerprint(ctx);
      } else if (current.phase === 'conflict' || current.phase === 'pending-connection' || current.phase === 'blocked-branch') {
        if (Date.now() - changedAt >= ctx.config.debounceSeconds * 1000) await synchronize(ctx, { background: true });
      }
    }
  } finally {
    process.off('SIGTERM', stop); process.off('SIGINT', stop);
    log(ctx, 'watcher stopped'); release();
  }
}
export function pause(ctx, paused) {
  const file = path.join(ctx.directory, 'paused');
  if (paused) writeFileSync(file, 'Intentionally paused. Working files remain untouched.\n', { mode: 0o600 });
  else rmSync(file, { force: true });
  return save(ctx, { phase: paused ? 'paused' : 'resume-requested', nextRetryAt: null });
}
