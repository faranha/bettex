import type { AnchorHTMLAttributes } from 'react';
import { localizedUrl, t, useLocale } from '@/lib/i18n';

/** Public demo entry, respecting both the artifact base path and selected language. */
export function DemoAppLink({ children, className = '', ...props }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const locale = useLocale();
  const appPath = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/app`;
  return <a {...props} href={localizedUrl(appPath, locale)} className={`${className} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`} aria-label={props['aria-label'] ?? t('Abrir o demo')}>{children ?? t('Abrir o demo')}</a>;
}
