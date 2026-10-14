import { renderToString } from 'react-dom/server';
import App from './App';
import { DocumentationRenderContext } from './components/DocumentationRenderContext';
import { ErrorBoundary } from './components/error-boundary';
import { setLocale, setTranslationPath, localeFromPath, observedMessages, missingMessages, setTranslationAudit } from './lib/i18n';

export function render(path: string, options: { fullDocumentation?: boolean } = {}) {
  setTranslationPath(path);
  setLocale(localeFromPath(path));
  return renderToString(<DocumentationRenderContext.Provider value={!!options.fullDocumentation}><ErrorBoundary><App ssrPath={path} /></ErrorBoundary></DocumentationRenderContext.Provider>);
}
export { observedMessages, missingMessages, setTranslationAudit };