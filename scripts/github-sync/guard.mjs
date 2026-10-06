import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { createHash } from 'node:crypto';

const rules = [
  ['private-key-block', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['provider-token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk_(?:live|test)_[A-Za-z0-9]{16,}|sk-[A-Za-z0-9_-]{24,}|AKIA[A-Z0-9]{16})\b/g],
  ['credential-url', /(?:https?|postgres(?:ql)?|mongodb(?:\+srv)?):\/\/[^/\s:"'<>]+:[^@\s"'<>]{6,}@/g],
  ['literal-private-material', /\b(?:privateKey|private_key|seedPhrase|mnemonic)\b\s*[:=]\s*['"](?:0x)?[a-fA-F0-9]{64}['"]/g],
  ['literal-secret', /\b(?:SESSION_SECRET|CLERK_SECRET_KEY|[A-Z_]*API_KEY|PRIVATE_KEY)\b["']?\s*[:=]\s*["'][A-Za-z0-9_$/+=.-]{20,}["']/g],
];
const forbidden = /(?:^|\/)(?:node_modules|dist|build|coverage|__pycache__|\.cache|\.local|\.config|\.conversation|\.pythonlibs|backups)(?:\/|$)|(?:^|\/)\.env(?:\.|$)|\.(?:log|dump|backup|sqlite3?|pem|key|pyc|tsbuildinfo)$/i;
export function excludedFile(file) {
  // Starknet's official documentation calls its authoring section "build".
  // Remove only that segment from exclusion matching; all other safety rules
  // and full content/history scans still apply to these retained references.
  const documentation = /^docs\/reference\/starknet\/(?:upstream|published\/pages)\/build\/.+\.(?:md|mdx)$/i.test(file)
    || file === 'docs/reference/starknet/upstream/build/mintify_files.zip'
    || file === 'docs/reference/starknet/upstream/archive/cairozero/hello-cairozero/BUILD';
  const candidate = documentation
    ? file.replace('/build/', '/documentation-section/').replace(/\/BUILD$/, '/build-definition') : file;
  return forbidden.test(candidate) && path.basename(file) !== '.env.example';
}
export function git(root, args, options = {}) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', timeout: 45_000,
    maxBuffer: 30 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' }, ...options });
}
export function inspect(data, label) {
  const findings = [];
  // Exact public Robinhood documentation sample already reviewed by check-secrets.py.
  const publicExample = createHash('sha256').update(data).digest('hex') ===
    'e6196a5762d8bac4df0532efe003316bea53d411526af03caa57cbf244344543';
  for (const [category, expression] of rules) {
    if (publicExample && category === 'literal-secret') continue;
    expression.lastIndex = 0;
    let match;
    while ((match = expression.exec(data))) {
      findings.push({ path: label, line: data.slice(0, match.index).split('\n').length, category });
    }
  }
  return findings;
}
export function inspectIndex(root) {
  const findings = [];
  const files = git(root, ['ls-files', '-s', '-z']).split('\0').filter(Boolean);
  const blobs = new Map();
  for (const entry of files) {
    const [header, file] = entry.split('\t');
    const [mode, oid, stage] = header.split(' ');
    if (stage !== '0') throw new Error('Unresolved index conflicts; resolve them before synchronization.');
    if (excludedFile(file)) findings.push({ path: file, category: 'excluded-file' });
    if (mode === '120000' || mode === '160000') {
      findings.push({ path: file, category: 'symlink-or-nested-repository-review-required' });
      continue;
    }
    // Scan the complete index, not just the patch: the initial push also publishes history.
    if (!blobs.has(oid)) blobs.set(oid, file);
  }
  for (const [oid, file] of blobs) {
    const size = Number(git(root, ['cat-file', '-s', oid]));
    if (size > 20 * 1024 * 1024) {
      findings.push({ path: file, category: 'large-file-review-required' });
      continue;
    }
    const buffer = git(root, ['cat-file', 'blob', oid], { encoding: null });
    // Binary assets are not converted to text. Review their provenance separately.
    if (!buffer.subarray(0, 8192).includes(0)) findings.push(...inspect(buffer.toString('utf8'), file));
  }
  return findings;
}
export function inspectHistory(root, previouslyCheckedCommit) {
  const selectors = ['rev-list', '--objects', 'HEAD'];
  if (previouslyCheckedCommit) {
    try {
      git(root, ['merge-base', '--is-ancestor', previouslyCheckedCommit, 'HEAD']);
      selectors.push(`^${previouslyCheckedCommit}`);
    } catch { /* Rewritten ancestry requires a full history review. */ }
  }
  const objects = git(root, selectors).trim().split('\n').filter(Boolean).map(line => {
    const space = line.indexOf(' ');
    return { oid: space < 0 ? line : line.slice(0, space), file: space < 0 ? '(history object)' : line.slice(space + 1) };
  });
  if (!objects.length) return [];
  const metadata = git(root, ['cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'],
    { input: objects.map(item => item.oid).join('\n') + '\n', stdio: ['pipe', 'pipe', 'pipe'] }).trim().split('\n');
  const findings = [], batches = [];
  let batch = [], bytes = 0;
  for (let i = 0; i < metadata.length; i++) {
    const [, type, rawSize] = metadata[i].split(' ');
    if (type !== 'blob' && type !== 'commit') continue;
    const size = Number(rawSize);
    if (size > 20 * 1024 * 1024) {
      findings.push({ path: objects[i].file, object: objects[i].oid, category: 'large-historical-file-review-required' });
      continue;
    }
    if (bytes + size > 20 * 1024 * 1024 && batch.length) { batches.push(batch); batch = []; bytes = 0; }
    batch.push(objects[i]); bytes += size;
  }
  if (batch.length) batches.push(batch);
  for (const items of batches) {
    const buffer = git(root, ['cat-file', '--batch'], { input: items.map(item => item.oid).join('\n') + '\n',
      encoding: null, stdio: ['pipe', 'pipe', 'pipe'] });
    let offset = 0;
    for (const item of items) {
      const newline = buffer.indexOf(10, offset);
      const size = Number(buffer.subarray(offset, newline).toString('ascii').split(' ')[2]);
      const body = buffer.subarray(newline + 1, newline + 1 + size);
      offset = newline + 1 + size + 1;
      if (!body.subarray(0, 8192).includes(0)) {
        findings.push(...inspect(body.toString('utf8'), item.file).map(finding => ({ ...finding, object: item.oid })));
      }
    }
  }
  return findings;
}
export function safeRemote(url, allowLocal = false) {
  if (allowLocal && (url.startsWith('/') || url.startsWith('file://'))) return url;
  if (/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(?:\.git)?$/.test(url) ||
      /^git@github\.com:[\w.-]+\/[\w.-]+(?:\.git)?$/.test(url) ||
      /^ssh:\/\/git@github\.com\/[\w.-]+\/[\w.-]+(?:\.git)?$/.test(url)) return url;
  throw new Error('Remote must be a credential-free GitHub URL. Replit internal remotes are not GitHub.');
}
export async function requireNonPublicRemote(url, fetcher = fetch, authorizedPublicRepository) {
  safeRemote(url);
  const normalized = url.replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/^ssh:\/\/git@github\.com\//, 'https://github.com/');
  const repository = new URL(normalized).pathname.replace(/\.git$/, '');
  // An explicit owner/repository authorization is not a global public-upload bypass.
  if (authorizedPublicRepository === repository.slice(1)) return;
  const response = await fetcher(`https://api.github.com/repos${repository}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'BETTEX-development-sync' },
    signal: AbortSignal.timeout(10_000), redirect: 'error',
  });
  // Anonymous 404 is not proof the repository exists. The authenticated Git
  // fetch must also succeed before staging/pushing. No API credential is sent.
  if (response.status === 404) return;
  if (response.status === 200 && (await response.json()).private === true) return;
  if (response.status === 200) throw new Error('public-repository');
  throw new Error('privacy-check');
}
