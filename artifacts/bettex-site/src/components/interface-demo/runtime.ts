import fixture from './fixture.json';
import type { DemoDashboard } from '@workspace/api-client-react';
import { localHistoryRoute } from './history-demo-api';
import { completeDemoData } from './complete-demo-data';

export const INTERFACE_DEMO = true;
export const NOTICE_EVENT = 'bettex-interface-demo-notice';
export const openDemoNotice = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(NOTICE_EVENT));
};
export function interfaceDemoPath(path: string) {
  return /\/(?:app|demo|sign-in|sign-up)(?:\/|$)/.test(path);
}
const openedAt = Date.now();
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

let historySource: DemoDashboard | null = null;

/** Fail closed: legacy mounted query/mutation paths cannot reach real APIs. */
export function installVisualDemoTransport() {
  if (typeof window === 'undefined') return;
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, window.location.href);
    if (!interfaceDemoPath(window.location.pathname)) return realFetch(input, init);
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    if (!['GET', 'HEAD'].includes(method)) {
      openDemoNotice();
      return Response.json({ error: 'interface_demo_only' }, { status: 403 });
    }
    const staticAsset = /\.(?:js|mjs|css|svg|png|jpe?g|webp|gif|ico|woff2?|ttf|map)$/i.test(url.pathname);
    if (staticAsset && !url.pathname.includes('/api/') && url.origin === window.location.origin) return realFetch(input, init);
    const path = url.pathname.slice(url.pathname.indexOf('/api/'));
    if (path === '/api/demo/dashboard') return Response.json(visualDashboard());
    if (path === '/api/account/session') return Response.json({ account: null });
    const local = localHistoryRoute(path, url.searchParams, historySource ??= visualDashboard());
    if (local) return local;
    // No other mounted visual page uses RPC, accounts or operational read endpoints.
    return Response.json({ error: 'not_available_in_interface_demo' }, { status: 410 });
  };
}

/** Read-only local History controls (filters, downloads of the displayed sample source) are not operations. */
export function isLocalReadControl(element: Element): boolean {
  if (element.hasAttribute('data-demo-action')) return false;
  if (!element.closest('[data-demo-local]') && !element.hasAttribute('data-demo-local')) return false;
  return !(element instanceof HTMLAnchorElement && /^https?:/i.test(element.getAttribute('href') ?? '') && !element.href.startsWith(window.location.origin));
}

export function isOperationalControl(element: Element): boolean {
  if (element.hasAttribute('data-demo-action')) return true;
  const id = element.getAttribute('data-testid') ?? '';
  if (/(?:help|info)/i.test(id)) return false;
  if (/^(?:demo-(?:add|out|swap)|button-earnings-transfer|button-double2x|lottery-participation|button-export|reset-demo|account-menu-logout)/.test(id)) return true;
  const label = `${element.getAttribute('aria-label') ?? ''} ${element.getAttribute('title') ?? ''} ${element.textContent ?? ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/\bdouble\s*2?x?\b|\b2x\b/i.test(label)) return true;
  if (/\b(?:exportar|export|descargar|download|baixar|gerar|generate|generar|salvar|save|guardar|enviar|send|enviar|comprar|buy|purchase|retirar|withdraw|depositar|deposit|converter|convert|convertir|transferir|transfer|participar|join|aprovar|approve|aprobar|rejeitar|reject|rechazar|executar|execute|ejecutar|registrar|register|cancelar ordem|cancel order|cerrar posicion|close position)\b/i.test(label)) return true;
  if (element instanceof HTMLAnchorElement) {
    if (element.hasAttribute('download') || element.href.includes('/api/')) return true;
    if (/arbiscan|etherscan|testnet|sepolia|walletconnect/i.test(element.href)) return true;
  }
  return false;
}
