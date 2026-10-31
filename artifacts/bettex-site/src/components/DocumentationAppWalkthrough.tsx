/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';
import { DemoAppLink } from './DemoAppLink';

/** Keep the existing chapter slot and deep links, without a demo walkthrough. */
export function DocumentationAppWalkthrough() {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  const label = x('Explorar o demo BETTEX', 'Explore the BETTEX demo', 'Explorar el demo BETTEX');
  return <section className="whitepaper__prose" data-i18n="translated" data-testid="documentation-app-walkthrough">
    <p id="documentacao-percurso-app">
      <DemoAppLink id="documentacao-percurso-demo" data-i18n="translated" aria-label={label}>{label}</DemoAppLink>
    </p>
  </section>;
}
