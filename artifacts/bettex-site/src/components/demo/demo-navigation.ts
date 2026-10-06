export type DemoView = 'home' | 'central' | 'wallet' | 'treasury' | 'account';
export type DemoAccountTab = 'profile' | 'wallets' | 'history';
export function demoAccountTab(path: string, search = ''): DemoAccountTab {
  const tabs: DemoAccountTab[] = ['profile', 'wallets', 'history'];
  const detail = path.match(/\/(?:app|demo)\/(?:minha-conta|account|mi-cuenta)\/([^/]+)/)?.[1];
  const query = new URLSearchParams(search).get('tab');
  const requested = detail ?? query;
  if (requested === 'operations') return 'wallets';
  if (requested === 'security') return 'profile';
  return tabs.includes(requested as DemoAccountTab) ? requested as DemoAccountTab : 'profile';
}
type Language = 'pt' | 'en' | 'es';
const index = { pt: 0, en: 1, es: 2 };
const labels = {
  home: ['Meu painel', 'My dashboard', 'Mi panel'],
  central: ['Central da IA', 'AI Center', 'Central de IA'],
  wallet: ['Saldo e histórico', 'Balance and history', 'Saldo e historial'],
  treasury: ['Tesouraria', 'Treasury', 'Tesorería'],
  account: ['Minha conta', 'My account', 'Mi cuenta'],
};
export function demoView(path: string): DemoView | undefined {
  const normalized = path.replace(/^\/app(?=\/|$)/, '/demo').replace(/\/+$/, '');
  if (normalized === '/demo') return 'home';
  if (normalized === '/demo/central') return 'central';
  if (['/demo/saldo', '/demo/balance'].includes(normalized)) return 'wallet';
  if (['/demo/tesouraria', '/demo/treasury', '/demo/tesoreria'].includes(normalized)) return 'treasury';
  if (/^\/demo\/(?:minha-conta|account|mi-cuenta)(?:\/.*)?$/.test(normalized)) return 'account';
  return undefined;
}
export function demoPath(view: DemoView, language: Language): string {
  if (view === 'home') return '/app';
  if (view === 'central') return '/app/central';
  if (view === 'wallet') return `${demoPath('account', language)}/history`;
  if (view === 'account') return ['/app/minha-conta', '/app/account', '/app/mi-cuenta'][index[language]];
  return ['/app/tesouraria', '/app/treasury', '/app/tesoreria'][index[language]];
}
export function demoLabel(view: DemoView, language: Language) {
  return labels[view][index[language]];
}
export function demoPageTitle(view: DemoView, language: Language) {
  return `${demoLabel(view, language)} | BETTEX`;
}
/** Old bookmarks redirect to the dashboard; there is no Simulation product area. */
export function isRemovedSimulationPath(path: string) {
  return /^\/(?:(?:en|es)\/)?(?:app|demo)\/(?:simulacao|simulation|simulacion)\/?$/.test(path);
}