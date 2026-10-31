import { spawnSync } from 'node:child_process';

const result = spawnSync('pnpm', ['audit', '--json'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
let report;
try { report = JSON.parse(result.stdout); } catch {
  console.error('Dependency audit unavailable; security gate fails closed.');
  process.exit(1);
}
if (report.error || !report.advisories) {
  console.error('Dependency audit did not return a valid advisory report.');
  process.exit(1);
}
let blocked = 0;
for (const advisory of Object.values(report.advisories)) {
  if (!['critical', 'high'].includes(advisory.severity)) continue;
  // GHSA-mrhx-c7xc-m3w5 is fixed only in zod 4.6.6 (zod@4 is overridden to it in
  // pnpm-workspace.yaml). The 3.x line has no patched release; the workspace uses
  // the classic zod 3 API (never zod/v4) and API JSON bodies are capped at 64kb.
  // Expiring exception ONLY while every finding is a 3.x copy; any 4.x copy below
  // 4.6.6 stays blocked.
  const versions = (advisory.findings || []).map(finding => finding.version);
  const acceptedZod3 = advisory.github_advisory_id === 'GHSA-mrhx-c7xc-m3w5'
    && advisory.module_name === 'zod' && versions.length > 0 && versions.every(v => v.startsWith('3.'))
    && new Date() < new Date('2027-01-31T00:00:00Z');
  // The braces exception (GHSA-vfj7-8cjw-p6xm) was removed: no vulnerable braces
  // copy remains in the dependency tree, so it would now be blocked again.
  const accepted = acceptedZod3;
  const note = 'reviewed, zod 3.x has no patched release; expires 2027-01-31';
  console.log(`${advisory.severity}: ${advisory.module_name}: ${advisory.github_advisory_id}: ${accepted ? note : 'BLOCKED'}`);
  if (!accepted) blocked++;
}
console.log(`Dependency audit: ${blocked} unaccepted critical/high advisories.`);
process.exit(blocked ? 1 : 0);
