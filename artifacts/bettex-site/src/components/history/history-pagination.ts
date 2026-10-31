import type { HistoryPage } from '@workspace/api-client-react';
import { walletHistoryRow } from './wallet-history-model.ts';

/** Complete server-owned archive. Never return a partial export on paging failure. */
export async function collectWalletHistory(fetchPage: (cursor?: string) => Promise<HistoryPage>) {
  const items: HistoryPage['items'] = [], ids = new Set<string>(), cursors = new Set<string>();
  let syncUnavailable = false;
  let cursor: string | undefined;
  for (let page = 0; page < 1000; page++) {
    const result = await fetchPage(cursor);
    // A successful response still contains the saved archive when live sync is down.
    // Preserve its warning without discarding records or inferring new confirmations.
    syncUnavailable ||= result.syncState === 'unavailable';
    for (const entry of result.items) if (!ids.has(entry.id)) { ids.add(entry.id); items.push(entry); }
    if (!result.nextCursor) return {
      rows: items.map(walletHistoryRow).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)),
      syncUnavailable,
    };
    if (cursors.has(result.nextCursor)) throw new Error('history_cursor_repeated');
    cursors.add(result.nextCursor); cursor = result.nextCursor;
  }
  throw new Error('history_too_large');
}
