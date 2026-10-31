// Illustrative independence scenario, not a measured joint audience.
// The crypto survey covers age 16+ and past/current investment;
// applying that share to the betting scenario is an explicit proxy.
const bettingMillions = 40;
const cryptoMillions = 29;
const cryptoShare = 0.172;
const overlapMillions = bettingMillions * cryptoShare;

export const audienceScenario = {
  bettingMillions,
  cryptoMillions,
  cryptoShare,
  overlapMillions,
  combinedMillions: bettingMillions + cryptoMillions - overlapMillions,
  // Fazenda/SIGAP via Folha: 43.8m people who had bet by Aug. 2026,
  // not monthly active bettors. The scenario retains a rounded 40m base.
  bettingSourceUrl: 'https://c-level.folha.uol.com.br/negocios/2026/09/numero-de-brasileiros-inscritos-em-bets-aumenta-752-em-8-meses-e-receita-dos-sites-sobe-59.shtml',
  cryptoSourceUrl: 'https://valor.globo.com/financas/criptomoedas/noticia/2026/08/18/cripto-supera-aes-e-cdb-em-alcance-entre-brasileiros-diz-pesquisa.ghtml',
} as const;

// Circle areas and their lens scale to the same hypothetical set sizes.
const bettingRadius = 150;
const cryptoRadius = bettingRadius * Math.sqrt(cryptoMillions / bettingMillions);
const targetArea = Math.PI * bettingRadius ** 2 * overlapMillions / bettingMillions;
function intersectionArea(distance: number) {
  const a = bettingRadius;
  const b = cryptoRadius;
  const angleA = Math.acos((distance ** 2 + a ** 2 - b ** 2) / (2 * distance * a));
  const angleB = Math.acos((distance ** 2 + b ** 2 - a ** 2) / (2 * distance * b));
  const lens = Math.sqrt((-distance + a + b) * (distance + a - b) * (distance - a + b) * (distance + a + b));
  return a ** 2 * angleA + b ** 2 * angleB - lens / 2;
}
let low = Math.abs(bettingRadius - cryptoRadius);
let high = bettingRadius + cryptoRadius;
for (let i = 0; i < 50; i++) {
  const middle = (low + high) / 2;
  if (intersectionArea(middle) > targetArea) low = middle;
  else high = middle;
}
const distance = (low + high) / 2;
export const audienceGeometry = {
  bettingRadius,
  cryptoRadius,
  bettingX: 185,
  cryptoX: 185 + distance,
  overlapX: (185 + bettingRadius + 185 + distance - cryptoRadius) / 2,
  overlapArea: intersectionArea(distance),
  targetArea,
} as const;