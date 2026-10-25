import { registerMessage, t, useLocale } from '@/lib/i18n';

/** Trilingual helper for Pitch-only copy: pt, en, es. */
export function useX() {
  useLocale();
  return (pt: string, en: string, es: string) => {
    registerMessage(pt, en, es);
    return t(pt);
  };
}
