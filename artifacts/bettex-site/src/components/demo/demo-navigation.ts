export type DemoView = 'home' | 'central' | 'wallet' | 'treasury' | 'account' | 'simulation';
export type DemoAccountTab = 'profile' | 'wallets' | 'operations' | 'security' | 'history';
export function demoAccountTab(path: string, search = ''): DemoAccountTab {
  const tabs: DemoAccountTab[] = ['profile', 'wallets', 'operations', 'security', 'history'];
  const detail = path.match(/\/(?:app|demo)\/(?:minha-conta|account|mi-cuenta)\/([^/]+)/)?.[1];
  const query = new URLSearchParams(search).get('tab');
  return tabs.includes(detail as DemoAccountTab) ? detail as DemoAccountTab
    : tabs.includes(query as DemoAccountTab) ? query as DemoAccountTab : 'profile';
}
type Language = 'pt' | 'en' | 'es';
const index = { pt: 0, en: 1, es: 2 };
const labels = {
  home: ['Meu painel', 'My dashboard', 'Mi panel'],
  central: ['Central da IA', 'AI Center', 'Central de IA'],
  wallet: ['Saldo e histórico', 'Balance and history', 'Saldo e historial'],
  treasury: ['Tesouraria', 'Treasury', 'Tesorería'],
  simulation: ['Simulação', 'Simulation', 'Simulación'],
  account: ['Minha conta', 'My account', 'Mi cuenta'],
};
export function demoView(path: string): DemoView | undefined {
  const normalized = path.replace(/^\/app(?=\/|$)/, '/demo').replace(/\/+$/, '');
  if (normalized === '/demo') return 'home';
  if (normalized === '/demo/central') return 'central';
  if (['/demo/saldo', '/demo/balance'].includes(normalized)) return 'wallet';
  if (['/demo/tesouraria', '/demo/treasury', '/demo/tesoreria'].includes(normalized)) return 'treasury';
  if (['/demo/simulacao', '/demo/simulation', '/demo/simulacion'].includes(normalized)) return 'simulation';
  if (/^\/demo\/(?:minha-conta|account|mi-cuenta)(?:\/.*)?$/.test(normalized)) return 'account';
  return undefined;
}
export function demoPath(view: DemoView, language: Language) {
  if (view === 'home') return '/app';
  if (view === 'central') return '/app/central';
  if (view === 'wallet') return ['/app/saldo', '/app/balance', '/app/saldo'][index[language]];
  if (view === 'simulation') return ['/app/simulacao', '/app/simulation', '/app/simulacion'][index[language]];
  if (view === 'account') return ['/app/minha-conta', '/app/account', '/app/mi-cuenta'][index[language]];
  return ['/app/tesouraria', '/app/treasury', '/app/tesoreria'][index[language]];
}
export function demoLabel(view: DemoView, language: Language) {
  return labels[view][index[language]];
}
export function demoPageTitle(view: DemoView, language: Language) {
  return `${demoLabel(view, language)} | BETTEX`;
}