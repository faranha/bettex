import assert from 'node:assert/strict';

const retiredChapterIds = [
  'documentacao-subagente-esportes',
  'documentacao-subagente-previsoes',
  'documentacao-subagente-igaming',
];

/** Check the complete rendered document, including closed technical references. */
export function assertDocumentationProductScope({ text, ids, locale }) {
  assert.ok(text.length > 1000, `${locale}: missing complete documentation`);
  for (const id of retiredChapterIds) {
    assert.ok(!ids.includes(id), `${locale}: retired chapter ${id}`);
  }
  const obsolete = text.match(/\biGaming\b|\besportes\b|\bsports\b|\bdeportes\b|\bcassinos?\b|\bcasinos?\b|surebet|bonus hunting|Polymarket|BETTEX\s+Bank|quatro mercados|four markets|cuatro mercados/i);
  assert.ok(!obsolete,
    `${locale}: obsolete trading market or offering: ${obsolete
      ? text.slice(Math.max(0, obsolete.index - 100), obsolete.index + 200) : ''}`);
  for (const id of [
    'documentacao-agentes', 'documentacao-subagente-cripto',
    'documentacao-subagente-risco', 'documentacao-subagente-tesouraria',
    'documentacao-subagente-governanca', 'documentacao-staking',
    'documentacao-loteria', 'documentacao-double-2x', 'documentacao-roadmap',
  ]) {
    assert.ok(ids.includes(id), `${locale}: current product content missing: ${id}`);
  }
}
