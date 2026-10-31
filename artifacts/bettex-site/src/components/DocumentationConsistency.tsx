import policy from '@/lib/documentation-consistency.json';
import { t } from '@/lib/i18n';

type Area = 'settlement' | 'economics' | 'games' | 'identity';

/** Shared policy text is also included in the localized downloadable summary. */
export function DocumentationConsistency({ area }: { area: Area }) {
  return <>{policy.sections.filter(section => section.area === area).map(section =>
    <section key={section.id} id={section.id} data-documentation-policy={area}>
      <h4 className="whitepaper__subhead">{t(section.title)}</h4>
      <div className="whitepaper__prose">
        {section.paragraphs.map(paragraph => <p key={paragraph}>{t(paragraph)}</p>)}
      </div>
    </section>
  )}</>;
}
