/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';
import { businessRules } from '@/lib/documentation-business';

export function DocumentationBusinessRules({ rules }: { rules: (keyof typeof businessRules)[] }) {
  const locale = useLocale();
  const language = locale === 'en' ? 1 : locale === 'es' ? 2 : 0;
  return <div className="whitepaper__prose" data-documentation-business>
    {rules.map(rule => <p key={rule} data-business-rule={rule}>{businessRules[rule][language]}</p>)}
  </div>;
}

export function DocumentationMarketFocus() {
  const locale = useLocale();
  const language = locale === 'en' ? 1 : locale === 'es' ? 2 : 0;
  const rows = [
    [businessRules.focusCryptoLabel, businessRules.focusCrypto],
    [businessRules.focusPatternsLabel, businessRules.focusPatterns],
    [businessRules.focusDecisionsLabel, businessRules.focusDecisions],
    [businessRules.focusDevelopmentLabel, businessRules.focusDevelopment],
  ];
  return <ul className="whitepaper__hero-markets" data-documentation-market-focus>
    {rows.map(([label, body]) => <li key={label[0]}><strong>{label[language]}</strong>{' '}{body[language]}</li>)}
  </ul>;
}
