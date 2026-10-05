export type DemoView = 'home' | 'central' | 'wallet' | 'treasury' | 'account';
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
  const normalized = path.replace(/\/+$/, '');
  if (normalized === '/demo') return 'home';
  if (normalized === '/demo/central') return 'central';
  if (['/demo/saldo', '/demo/balance'].includes(normalized)) return 'wallet';
  if (['/demo/tesouraria', '/demo/treasury', '/demo/tesoreria'].includes(normalized)) return 'treasury';
  if (/^\/demo\/(?:minha-conta|account|mi-cuenta)(?:\/.*)?$/.test(normalized)) return 'account';
  return undefined;
}
export function demoPath(view: DemoView, language: Language) {
  if (view === 'home') return '/demo';
  if (view === 'central') return '/demo/central';
  if (view === 'wallet') return ['/demo/saldo', '/demo/balance', '/demo/saldo'][index[language]];
  if (view === 'account') return ['/demo/minha-conta', '/demo/account', '/demo/mi-cuenta'][index[language]];
  return ['/demo/tesouraria', '/demo/treasury', '/demo/tesoreria'][index[language]];
}
export function demoLabel(view: DemoView, language: Language) {
  return labels[view][index[language]];
}
export function demoPageTitle(view: DemoView, language: Language) {
  return `${demoLabel(view, language)} | BETTEX`;
}