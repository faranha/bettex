import { useSyncExternalStore } from 'react';
import catalogue from './locales/translations.json';
import englishSourceMessages from './locales/english-source-messages.json';
import documentationSynthesis from './locales/documentation-synthesis.json';
import { roundTerminology } from './round-terminology';
import { preserveDocumentationSpacing } from './documentation-prose';

export type Locale = 'pt' | 'en' | 'es';
type Translation = { en: string; es: string; pt?: string };
// Editorial equivalents retain the full source text and its technical rules.
// Only documentation-specific keys are included; approved pages are unchanged.
const messages = { ...catalogue, ...englishSourceMessages, ...documentationSynthesis } as Record<string, Translation>;
const listeners = new Set<() => void>();
let locale: Locale = typeof window === 'undefined' ? 'pt' : localeFromPath(window.location.pathname);
export const observedMessages = new Set<string>();
export const missingMessages = new Set<string>();
let translationAudit = false;
export function setTranslationAudit(enabled: boolean) { translationAudit = enabled; }
export const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
export const locales: Locale[] = ['pt', 'en', 'es'];
export const formatLocales = { pt: 'pt-BR', en: 'en', es: 'es' } as const;
export const getLocale = () => locale;
export const getFormatLocale = () => formatLocales[locale];
export function localeFromPath(path: string): Locale {
  return /(?:^|\/)en(?:\/|$)/.test(path) ? 'en' : /(?:^|\/)es(?:\/|$)/.test(path) ? 'es' : 'pt';
}
export function setLocale(next: Locale) {
  locale = next;
  listeners.forEach(listener => listener());
}
export function useLocale() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, getLocale, getLocale);
}
const folded = new Map(Object.keys(messages).map(key => [key.toLocaleLowerCase(), key]));
const translatedValues = {
  en: new Set(Object.values(messages).flatMap(value => [normalize(value.en), normalize(roundTerminology(value.en, 'en'))])),
  es: new Set(Object.values(messages).flatMap(value => [normalize(value.es), normalize(roundTerminology(value.es, 'es'))])),
};
const patterns = Object.keys(messages).filter(key => /\{\d+\}/.test(key)).map(key => ({
  key,
  regex: new RegExp('^' + key.split(/(\{\d+\})/).map(part => /^\{\d+\}$/.test(part) ? '(.+?)' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('') + '$'),
}));
const unchanged = /^(?:[\d\s.,%+\-–—×÷=:$€£/()[\]<>→·•…]+|BETTEX|USDC|USD|BRL|ETH|BTC|ARB|API|MCP|HTTP|HTTPS|JSON|CSV|PDF|XLSX|English|Español|Português)$/;
const ptOverrides: Record<string, string> = { Close: 'Fechar', Loading: 'Carregando', 'Loading...': 'Carregando...', Previous: 'Anterior', Next: 'Próximo' };
export function t(text: string): string {
  return roundTerminology(translateMessage(text), locale);
}
function translateMessage(text: string): string {
  const key = normalize(text);
  if (!key || (unchanged.test(key) && (!/\d/.test(key) || !messages[key] || locale === 'pt')) || /^https?:\/\//.test(key)) return text;
  observedMessages.add(key);
  if (locale === 'pt') {
    const result = messages[key]?.pt ?? ptOverrides[key] ?? text;
    // Documentation fragments also appear in diagram footers and custom blocks,
    // outside the prose containers handled by the JSX runtime.
    return Object.hasOwn(documentationSynthesis, key) ? preserveDocumentationSpacing(text, result) : result;
  }
  if (translatedValues[locale].has(key)) return text;
  const source = messages[key] ? key : folded.get(key.toLocaleLowerCase());
  let result = source ? messages[source][locale] : undefined;
  if (!result) {
    for (const pattern of patterns) {
      const match = key.match(pattern.regex);
      if (match) { result = messages[pattern.key][locale].replace(/\{(\d+)\}/g, (_, index: string) => match[Number(index) + 1] ?? ''); break; }
    }
  }
  // Technical identifiers and amounts are language-independent, not prose.
  if (!result && (!/[A-Za-zÀ-ÿ]/.test(key) || /^(?:0x[a-f\d]+|[-−]?(?:US\$|R\$)\s?[\d.,]+|[A-Z]{1,6}[/-][A-Z\d]{1,6}|[A-Z]{1,4}\s?[\d.,]+|[-−]?[\d.,]+\s?(?:BETTEX|USDC|ETH|USD|BRL|US\$|R\$)|[a-z\d_]+(?:[.:/_-][a-z\d_]+)+)$/i.test(key))) return text;
  if (!result) {
    missingMessages.add(key);
    if (translationAudit) return text;
    throw new Error(`Missing ${locale} translation: ${key}`);
  }
  if (source && key === key.toUpperCase() && key !== key.toLowerCase()) result = result.toLocaleUpperCase(formatLocales[locale]);
  return (text.match(/^\s+/)?.[0] ?? '') + result + (text.match(/\s+$/)?.[0] ?? '');
}
export function localizedUrl(href: string, next: Locale = locale): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!href.startsWith('/') || href.startsWith('//') || (base && !href.startsWith(`${base}/`))) return href;
  const relative = href.slice(base.length);
  const [pathname] = relative.split(/[?#]/);
  const suffix = relative.slice(pathname.length);
  const clean = pathname.replace(/^\/(?:en|es)(?=\/|$)/, '').replace(/\/$/, '') || '/';
  const canonical = clean.replace(/^\/demo(?=\/|$)/, '/app');
  const page = canonical === '/documentation' || canonical === '/documentacion' ? '/documentacao' :
    ['/app/simulacao', '/app/simulation', '/app/simulacion'].includes(canonical) ? '/app' : canonical;
  if (!['/', '/pitch', '/documentacao', '/app'].includes(page) && !page.startsWith('/app/')) {
    if (next !== 'pt' && page === '/downloads/bettex-taxas-fundacao.xlsx') return `${base}/downloads/bettex-taxas-fundacao-${next}.xlsx${suffix}`;
    if (next !== 'pt' && /^\/downloads\/bettex-entidade-unica\.(pdf|docx|html|md)$/.test(page)) return `${base}${page.replace(/\.([a-z]+)$/, `-${next}.$1`)}${suffix}`;
    return href;
  }
  const translated = page === '/documentacao' ? next === 'en' ? '/documentation' : next === 'es' ? '/documentacion' : page : page;
  return `${base}${next === 'pt' ? '' : `/${next}`}${translated}${suffix}`;
}
export function changeLocale(next: Locale) {
  try { localStorage.setItem('bettex.locale', next); } catch { /* URL remains authoritative without storage. */ }
  window.location.assign(localizedUrl(window.location.pathname + window.location.search + window.location.hash, next));
}