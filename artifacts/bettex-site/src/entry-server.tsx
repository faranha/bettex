import { renderToString } from 'react-dom/server';
import App from './App';
import { ErrorBoundary } from './components/error-boundary';
import { setLocale, setTranslationPath, localeFromPath, observedMessages, missingMessages, setTranslationAudit } from './lib/i18n';

export function render(path: string) {
  setTranslationPath(path);
  setLocale(localeFromPath(path));
  return renderToString(<ErrorBoundary><App ssrPath={path} /></ErrorBoundary>);
}
export { observedMessages, missingMessages, setTranslationAudit };