export function localeFormatPlugin() {
  return {
    name: 'bettex-locale-format',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('/src/') || !/\.tsx?$/.test(id) || /\/(?:i18n|PageMetadata)\.tsx?$/.test(id) || !/['"]pt-BR['"]/.test(code)) return;
      return { code: `import { getFormatLocale as __formatLocale } from '@/lib/i18n';\n${code.replace(/(['"])pt-BR\1/g, '__formatLocale()')}`, map: null };
    },
  };
}