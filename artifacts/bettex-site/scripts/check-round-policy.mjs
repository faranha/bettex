import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (path) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), 'utf8');
const messages = JSON.parse(read('src/lib/locales/source.json'));
const translations = JSON.parse(read('src/lib/locales/translations.json'));
const projectRules = read('../../replit.md').split('\n');
const forbidden = [
  /rodada da liberação/iu,
  /lucro realizado líquido acumulado/iu,
  /resultado realizado líquido acumulado ainda não considerado/iu,
  /conserva o peso do período em que ela esteve elegível/iu,
  /preserva o peso do período elegível anterior à saída/iu,
  /participantes novos podem receber lucros anteriores/iu,
  /a preservação do peso anterior à saída vale/iu,
  /o complemento permanece pendente/iu,
  /déficit.*(?:compensado|compensação).*antes de novas distribuições/iu,
  /lucro apenas retido usa rodada/iu,
  /a liberação exige nova verificação/iu,
  /preservando os direitos e valores pendentes/iu,
  /preservam-se o direito, a rodada, os pesos/iu,
  /nem cancela o crédito, nem autoriza reenvio/iu,
  /se um erro exigir complemento após a distribuição/iu,
];

for (const message of new Set([...messages, ...Object.keys(translations), ...projectRules])) {
  for (const pattern of forbidden) {
    assert(!pattern.test(message), `Obsolete distribution rule: ${message.slice(0, 240)}`);
  }
}

const roundPolicy = read('src/lib/distribution-round-policy.ts');
assert(roundPolicy.includes('paga ou não paga'));
assert(roundPolicy.includes('não resta crédito de distribuição a pagar, saldo residual do beneficiário ou obrigação de complemento'));
assert(roundPolicy.includes('sem crédito ao staking nem liberação futura'));
assert(roundPolicy.includes('Recursos incertos não são considerados recuperados'));
const withdrawal = read('src/lib/staking-withdrawal-policy.ts');
assert(withdrawal.includes('Todo o peso acumulado da rodada é zerado, não apenas o da quantidade retirada'));
assert(withdrawal.includes('não recupera créditos cancelados'));
const rounding = read('src/lib/staking-rounding-policy.ts');
assert(rounding.includes('retornam à tesouraria'));
assert(rounding.includes('Não se acumulam para rodadas futuras'));
const staking = read('src/components/StakingDistribution.tsx');
assert(staking.includes('sem saída de BETTEX'));
assert(staking.includes('nenhum deles conserva crédito ou peso para outra rodada'));
assert(staking.includes('<StakingSchematic />'));
assert(staking.includes('<BettexFlow figure="3" />'));
assert(staking.includes('<BettexFlow figure="6" />'));
console.log(`Independent-round policy: ${messages.length} current messages and the translation catalog checked; no historical weight, retained-profit release, residual credits or future top-ups.`);