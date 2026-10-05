import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';
import seo from './lib/site-seo.json';
import { localeFromPath, localizedUrl, setLocale } from './lib/i18n';

// Static hosts may use a directory index or a physical .html file.
// Normalize before mounting so Wouter and canonical metadata stay consistent.
const prefix = import.meta.env.BASE_URL.replace(/\/$/, '');
const pathname = window.location.pathname;
const relative = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
const normalized = relative.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
const canonicalPath = normalized === '/index' ? '/' : normalized;
if ((canonicalPath in seo.pages || /^\/(?:en|es)(?:\/(?:pitch|demo|documentation|documentacion))?$/.test(canonicalPath)) && relative !== canonicalPath) {
  window.history.replaceState(window.history.state, '', `${prefix}${canonicalPath}${window.location.search}${window.location.hash}`);
}
setLocale(localeFromPath(window.location.pathname));
document.documentElement.lang = localeFromPath(window.location.pathname) === 'pt' ? 'pt-BR' : localeFromPath(window.location.pathname);
// Keep legacy Portuguese URLs and saved language choices. First-time visitors
// enter the English version; localization identifiers and translations stay intact.
if (!/^\/(?:en|es)(?:\/|$)/.test(canonicalPath)) {
  const currentUrl = `${prefix}${canonicalPath}${window.location.search}${window.location.hash}`;
  const redirect = (language: 'en' | 'es') => {
    const destination = localizedUrl(currentUrl, language);
    if (destination !== currentUrl) window.location.replace(destination);
  };
  try {
    const preferred = localStorage.getItem('bettex.locale') ?? 'en';
    if (preferred === 'en' || preferred === 'es') redirect(preferred);
  } catch {
    redirect('en');
  }
}

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
