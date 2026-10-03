/** Compatibility entry point: validates current documentation, not old forecasts. */
const { execFileSync } = require('node:child_process');
const { resolve } = require('node:path');
for (const script of ['check-documentation.mjs', 'check-profit-allocation.mjs', 'check-round-policy.mjs']) {
  execFileSync(process.execPath, [resolve(__dirname, '../artifacts/bettex-site/scripts', script)], { stdio: 'inherit' });
}