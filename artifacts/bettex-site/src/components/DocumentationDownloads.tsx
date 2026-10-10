import { useLocale } from '@/lib/i18n';

const formats = ['pdf', 'docx', 'html', 'md'] as const;

/** Compact links to the exported documentation files, matching the active language. */
export function DocumentationDownloads({ label, summaryLabel, tableLabel }: { label: string; summaryLabel: string; tableLabel: string }) {
  const locale = useLocale();
  const suffix = locale === 'en' ? '-en' : locale === 'es' ? '-es' : '';
  const base = `${import.meta.env.BASE_URL}downloads/`;
  return <div className="whitepaper__prose" data-testid="documentation-downloads" data-i18n="translated">
    <p><strong>{label}</strong>: {summaryLabel}{' '}
      {formats.map((f, i) => <span key={f}>{i > 0 ? ' · ' : ''}<a href={`${base}bettex-documentacao${suffix}.${f}`} download>{f.toUpperCase()}</a></span>)}
      {' · '}{tableLabel}: <a href={`${base}bettex-tokenomics${suffix}.xlsx`} download>XLSX</a></p>
  </div>;
}
