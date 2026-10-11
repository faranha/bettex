import type { DemoDashboard } from '@workspace/api-client-react';
import { activityPage, archivePage, historyDashboard, historyEntries, historyPage } from './history-demo-data';

let cache: { source: DemoDashboard; d: DemoDashboard; entries: ReturnType<typeof historyEntries> } | null = null;

/** Local read-only answers for the original History queries. Nothing leaves the browser. */
export function localHistoryRoute(path: string, q: URLSearchParams, dashboard: DemoDashboard): Response | null {
  if (!/^\/api\/demo\/(?:history|rounds|treasury\/activity)$/.test(path) && path !== '/api/treasury/history') return null;
  if (!cache || cache.source !== dashboard) { const d = historyDashboard(dashboard); cache = { source: dashboard, d, entries: historyEntries(d) }; }
  if (path.endsWith('/rounds')) return Response.json(archivePage(cache.d, q));
  if (path.endsWith('/activity')) return Response.json(activityPage(cache.d, q));
  return Response.json(historyPage(cache.entries, q));
}
