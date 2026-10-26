import test from 'node:test';
import assert from 'node:assert/strict';
import { assertDocumentationProductScope } from './documentation-product-scope.mjs';

const current = {
  locale: 'pt',
  text: 'Trading cripto. Previsões de preço, risco e tesouraria. Burn Lottery e Double 2X são jogos internos. '.repeat(15),
  ids: [
    'documentacao-agentes', 'documentacao-subagente-cripto',
    'documentacao-subagente-risco', 'documentacao-subagente-tesouraria',
    'documentacao-subagente-governanca', 'documentacao-staking',
    'documentacao-loteria', 'documentacao-double-2x', 'documentacao-roadmap',
  ],
};
test('preserves support subagents, price inferences and internal games', () => {
  assert.doesNotThrow(() => assertDocumentationProductScope(current));
});
test('rejects obsolete chapters, even when their heading is not rendered', () => {
  assert.throws(() => assertDocumentationProductScope({
    ...current, ids: [...current.ids, 'documentacao-subagente-previsoes'],
  }), /retired chapter/);
});
test('rejects stale markets in all locales and inside technical references', () => {
  for (const text of ['Sports subagent', 'Subagente de Esportes', 'Subagente de Deportes',
    'iGaming', 'surebet', 'bonus hunting', 'Polymarket', 'BETTEX Bank']) {
    assert.throws(() => assertDocumentationProductScope({ ...current, text: current.text + text }),
      /obsolete trading market/);
  }
});
test('does not pass by deleting the document or current economic features', () => {
  assert.throws(() => assertDocumentationProductScope({ ...current, text: '' }), /missing complete/);
  assert.throws(() => assertDocumentationProductScope({
    ...current, ids: current.ids.filter(id => id !== 'documentacao-staking'),
  }), /current product content missing/);
});
