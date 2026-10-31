import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';
import seo from './lib/site-seo.json';
import { localeFromPath, setLocale } from './lib/i18n';
import { setRequestHeadersGetter } from '@workspace/api-client-react';
import { demoTabToken, demoTabRequestHeaders } from './lib/demo-tab-session';

// Claim early so a duplicated tab cannot inherit another live tab's demo.
void demoTabToken().catch(() => { /* Demo requests expose storage/isolation errors. */ });
setRequestHeadersGetter(demoTabRequestHeaders);

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
// Saved-language redirects run in the document head before its first paint.
// The URL is authoritative here; first-time visitors stay in Portuguese.

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
