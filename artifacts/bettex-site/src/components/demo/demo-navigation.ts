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
  home: ['Carteiras', 'Wallets', 'Carteras'],
  central: ['Central da IA', 'AI Center', 'Central de IA'],
  wallet: ['Histórico', 'History', 'Historial'],
  treasury: ['Tesouraria', 'Treasury', 'Tesorería'],
  account: ['Perfil', 'Profile', 'Perfil'],
};
export function demoView(path: string): DemoView | undefined {
  const normalized = path.replace(/^\/app(?=\/|$)/, '/demo').replace(/\/+$/, '');
  if (['/demo', '/demo/carteiras', '/demo/wallets', '/demo/carteras'].includes(normalized)) return 'home';
  if (normalized === '/demo/central') return 'central';
  if (['/demo/historico', '/demo/history', '/demo/historial', '/demo/saldo', '/demo/balance'].includes(normalized)) return 'wallet';
  if (['/demo/tesouraria', '/demo/treasury', '/demo/tesoreria'].includes(normalized)) return 'treasury';
  if (/^\/demo\/(?:minha-conta|account|mi-cuenta)(?:\/.*)?$/.test(normalized)) return 'account';
  return undefined;
}
export function demoPath(view: DemoView, language: Language): string {
  if (view === 'home') return '/app';
  if (view === 'central') return '/app/central';
  if (view === 'wallet') return ['/app/historico', '/app/history', '/app/historial'][index[language]];
  if (view === 'account') return ['/app/minha-conta', '/app/account', '/app/mi-cuenta'][index[language]];
  return ['/app/tesouraria', '/app/treasury', '/app/tesoreria'][index[language]];
}
/** Keep old bookmarks and wallet filters while moving finance out of Profile. */
export function demoRedirect(path: string, language: Language, search = '', hash = ''): string | null {
  const normalized = path.replace(/^\/(?:en|es)(?=\/)/, '').replace(/^\/demo(?=\/|$)/, '/app').replace(/\/+$/, '');
  const query = new URLSearchParams(search);
  let destination: string | undefined;
  if (/^\/app\/(?:minha-conta|account|mi-cuenta)(?:\/|$)/.test(normalized)) {
    const requested = normalized.match(/\/(?:minha-conta|account|mi-cuenta)\/([^/]+)/)?.[1] ?? query.get('tab');
    if (requested === 'wallets' || requested === 'operations') destination = demoPath('home', language);
    else if (requested === 'history') destination = demoPath('wallet', language);
    else if (requested === 'policies') destination = demoPath('treasury', language);
    else if (requested === 'profile' || requested === 'security') destination = demoPath('account', language);
    if (destination) query.delete('tab');
    if (requested === 'policies') query.set('tab', 'policies');
  } else if (['/app/carteiras', '/app/wallets', '/app/carteras'].includes(normalized) || isRemovedSimulationPath(normalized)) {
    destination = demoPath('home', language);
  } else if (demoView(normalized) === 'wallet' && normalized !== demoPath('wallet', language)) {
    destination = demoPath('wallet', language);
  }
  return destination ? `${destination}${query.size ? `?${query}` : ''}${hash}` : null;
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