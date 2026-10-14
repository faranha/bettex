/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';

/** Qualify only the named technology, not the surrounding project or rules. */
export function DocumentationTechnologyCondition({ name, prefix = false }: { name: string; prefix?: boolean }) {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  return <span data-documentation-technology-condition={name}>
    {prefix
      ? x('Caso utilizada, ', 'If used, ', 'Si se utiliza, ')
      : x(' (caso utilizada)', ' (if used)', ' (si se utiliza)')}
  </span>;
}
