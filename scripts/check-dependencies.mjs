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
  // No upstream fix (confirmed official GHSA). Patterns are developer-owned.
  // Expiring exception ONLY for this advisory, not for braces as a whole.
  const accepted = advisory.github_advisory_id === 'GHSA-vfj7-8cjw-p6xm'
    && advisory.module_name === 'braces' && new Date() < new Date('2026-11-05T00:00:00Z');
  console.log(`${advisory.severity}: ${advisory.module_name}: ${advisory.github_advisory_id}: ${accepted ? 'reviewed, non-user-controlled patterns; expires 2026-11-05' : 'BLOCKED'}`);
  if (!accepted) blocked++;
}
console.log(`Dependency audit: ${blocked} unaccepted critical/high advisories.`);
process.exit(blocked ? 1 : 0);
