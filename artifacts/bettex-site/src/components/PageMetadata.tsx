import { useEffect } from 'react';
import { useLocation } from 'wouter';
import seo from '@/lib/site-seo.json';
import { localizedUrl, t, useLocale } from '@/lib/i18n';
import { demoView, demoPageTitle } from '@/components/demo/demo-navigation';

export function PageMetadata() {
  const [location] = useLocation();
  const language = useLocale();
  useEffect(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const key = ['/documentation', '/documentacion'].includes(location) ? '/documentacao' : location.replace(/\/$/, '') || '/';
    const view = demoView(location);
    const page = seo.pages[(view ? '/app' : key) as keyof typeof seo.pages];
    const title = view && view !== 'home' ? demoPageTitle(view, language) : t(page?.title ?? 'Página não encontrada | BETTEX');
    const description = page ? t(page.description) : t('A página solicitada não foi encontrada.');
    const path = localizedUrl(`${base}${page ? key : location}`);
    const canonicalPath = (route: string) => route === '/' ? '/' : `${route.replace(/\/+$/, '')}/`;
    const url = `${seo.origin}${canonicalPath(path.slice(base.length))}`;
    const image = `${seo.origin}/social/${page?.image ?? 'home'}${language === 'pt' ? '' : `-${language}`}.jpg`;
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : language;
    document.title = title;
    const fields = [
      ['name', 'description', description], ['property', 'og:title', title], ['property', 'og:description', description],
      ['name', 'twitter:title', title], ['name', 'twitter:description', description],
      ['name', 'robots', page?.index ? 'index, follow' : 'noindex, follow'],
      ['property', 'og:url', url], ['property', 'og:image', image], ['property', 'og:image:alt', title],
      ['property', 'og:locale', { pt: 'pt_BR', en: 'en_US', es: 'es_ES' }[language]],
      ['name', 'twitter:image', image], ['name', 'twitter:image:alt', title],
    ];
    fields.forEach(([attribute, keyName, content]) => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${keyName}"]`);
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, keyName); document.head.appendChild(element); }
      element.content = content;
    });
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = url;
    document.head.querySelectorAll('link[hreflang]').forEach(link => link.remove());
    if (page) for (const lang of ['pt', 'en', 'es', 'x-default'] as const) {
      const link = document.createElement('link'); link.rel = 'alternate'; link.hreflang = lang === 'pt' ? 'pt-BR' : lang;
      link.href = `${seo.origin}${canonicalPath(localizedUrl(`${base}${key}`, lang === 'x-default' ? 'pt' : lang).slice(base.length))}`;
      document.head.appendChild(link);
    }
    const structured = document.querySelector<HTMLScriptElement>('#site-jsonld');
    if (structured) structured.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url, inLanguage: language === 'pt' ? 'pt-BR' : language, isPartOf: { '@type': 'WebSite', name: 'BETTEX', url: `${seo.origin}${localizedUrl(`${base}/`).slice(base.length)}` } });
  }, [location, language]);
  return null;
}