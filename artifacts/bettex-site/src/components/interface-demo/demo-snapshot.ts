import fixture from './fixture.json';
import type { DemoDashboard } from '@workspace/api-client-react';
import { completeDemoData } from './complete-demo-data';

const openedAt = Date.now();
/** Pure local projection shared by every demo surface; independent copies, no transport dependency. */
export function visualDashboard(): DemoDashboard {
  const delta = openedAt - fixture.capturedAt;
  const shift = (v: unknown): unknown => {
    if (typeof v === 'string' && /^\d{4}-\d\d-\d\dT/.test(v)) return new Date(Date.parse(v) + delta).toISOString();
    if (Array.isArray(v)) return v.map(shift);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, value]) => [k, shift(value)]));
    return v;
  };
  return completeDemoData(shift(fixture.dashboard) as DemoDashboard);
}
