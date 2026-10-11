import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { robotsPolicy, restrictAiCrawler } from './crawler-policy.mjs';
import { pageSchema } from '../src/lib/seo-schema.ts';
import { demoView, demoPageTitle, demoPath } from '../src/components/demo/demo-navigation.ts';

export const seo = JSON.parse(readFileSync(new URL('../src/lib/site-seo.json', import.meta.url), 'utf8'));
const messages = JSON.parse(readFileSync(new URL('../src/lib/locales/translations.json', import.meta.url), 'utf8'));
export const languages = ['pt', 'en', 'es'];
export function localizedPath(page, language) {
  if (language === 'pt') return page;
  return `/${language}${page === '/' ? '/' : page === '/documentacao' ? language === 'en' ? '/documentation' : '/documentacion' : page}`;
}
export const routes = Object.fromEntries(languages.flatMap(language => Object.entries(seo.pages).map(([page, data]) => [localizedPath(page, language), { ...data, page, language }])));
export function routeData(pathname) {
  const path = pathname === '/en' || pathname === '/es' ? `${pathname}/` : pathname.replace(/\/+$/, '') || '/';
  const direct = routes[pathname] ?? routes[path];
  if (direct) return direct;
  const language = path.match(/^\/(en|es)(?:\/|$)/)?.[1] ?? 'pt';
  const local = path.replace(/^\/(?:en|es)(?=\/)/, '');
  const view = local.startsWith('/app/') ? demoView(local) ?? (/^\/app\/(?:simulacao|simulation|simulacion)$/.test(local) ? 'home' : undefined) : undefined;
  return view ? { ...routes[localizedPath('/app', language)], appTitle: demoPageTitle(view, language), appPath: path } : undefined;
}
export const htmlFile = route => route === '/' ? 'index.html' : `${route.replace(/^\//, '').replace(/\/$/, '')}.html`;
// The public static host serves directory indexes and redirects to a final
// trailing slash. Canonicals and sitemap entries must use that final URL.
export const canonicalPath = route => route === '/' ? '/' : `${route.replace(/\/+$/, '')}/`;
function translated(text, language) {
  if (language === 'pt') return text;
  if (!messages[text]?.[language]) throw new Error(`Missing ${language} SEO translation: ${text}`);
  return messages[text][language];
}
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export function metadata(path, overrides = {}) {
  const record = routeData(path);
  const language = record?.language ?? (/^\/en(?:\/|$)/.test(path) ? 'en' : /^\/es(?:\/|$)/.test(path) ? 'es' : 'pt');
  const fallback = { pt: ['Página não encontrada | BETTEX','A página solicitada não foi encontrada.'], en: ['Page not found | BETTEX','The requested page could not be found.'], es: ['Página no encontrada | BETTEX','No se encontró la página solicitada.'] };
  const page = record ? { ...record, title: record.appTitle ?? translated(record.title, language), description: translated(record.description, language), imageAlt: translated(record.imageAlt, language) } : { title: fallback[language][0], description: fallback[language][1], image: seo.pages['/'].image, imageAlt: fallback[language][0], index: false };
  if (overrides.title) page.title = overrides.title;
  if (record) path = record.appPath ?? localizedPath(record.page, language);
  const url = `${seo.origin}${canonicalPath(path)}`;
  const image = `${seo.origin}/social/${page.image}${language === 'pt' ? '' : `-${language}`}.jpg`;
  const meta = (key, value, property = false) => `<meta ${property ? 'property' : 'name'}="${key}" content="${escape(value)}">`;
  const view = record?.appPath ? demoView(record.appPath.replace(/^\/(?:en|es)(?=\/)/, '')) : undefined;
  const alternatePath = lang => view ? demoPath(view, lang) : localizedPath(record.page, lang);
  const alternates = record ? languages.map(lang => `<link rel="alternate" hreflang="${lang === 'pt' ? 'pt-BR' : lang}" href="${seo.origin}${canonicalPath(alternatePath(lang))}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${seo.origin}${canonicalPath(alternatePath('pt'))}">` : '';
  const schema = pageSchema({ ...page, url, homeUrl: `${seo.origin}${canonicalPath(localizedPath('/', language))}`, image, language });
  return `<title>${escape(page.title)}</title>
<link rel="canonical" href="${escape(url)}">
${alternates}
${meta('description', page.description)}
${meta('robots', page.index ? 'index, follow' : 'noindex, follow')}
${meta('og:title', page.title, true)}
${meta('og:description', page.description, true)}
${meta('og:url', url, true)}
${meta('og:type', 'website', true)}
${meta('og:site_name', 'BETTEX', true)}
${meta('og:locale', { pt: 'pt_BR', en: 'en_US', es: 'es_ES' }[language], true)}
${languages.filter(lang => lang !== language).map(lang => meta('og:locale:alternate', { pt: 'pt_BR', en: 'en_US', es: 'es_ES' }[lang], true)).join('\n')}
${meta('og:image', image, true)}
${meta('og:image:secure_url', image, true)}
${meta('og:image:width', '1200', true)}
${meta('og:image:height', '630', true)}
${meta('og:image:type', 'image/jpeg', true)}
${meta('og:image:alt', page.imageAlt, true)}
${meta('twitter:card', 'summary_large_image')}
${meta('twitter:title', page.title)}
${meta('twitter:description', page.description)}
${meta('twitter:image', image)}
${meta('twitter:image:alt', page.imageAlt)}
<script id="site-jsonld" type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`;
}
export function withMetadata(html, path, overrides) {
  return html.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, `<!-- SEO:START -->${metadata(path, overrides)}<!-- SEO:END -->`);
}
export function discovery() {
  const urls = Object.entries(routes).filter(([, page]) => page.index).map(([path, page]) => `<url><loc>${escape(`${seo.origin}${canonicalPath(path)}`)}</loc>${languages.map(lang => `<xhtml:link rel="alternate" hreflang="${lang === 'pt' ? 'pt-BR' : lang}" href="${seo.origin}${canonicalPath(localizedPath(page.page, lang))}"/>`).join('')}</url>`).join('\n');
  return {
    robots: robotsPolicy(seo.origin),
    sitemap: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>\n`,
  };
}
export function seoPlugin(base) {
  const prefix = base.replace(/\/$/, '');
  function redirectTrailingSlash(req, res) {
    const [pathname, query] = (req.url ?? '').split('?');
    const route = pathname.replace(prefix, '').replace(/\/+$/, '') || '/';
    if (pathname.endsWith('/') && route !== '/' && routes[route]) {
      res.statusCode = 301;
      res.setHeader('Location', `${prefix}${route}${query ? `?${query}` : ''}`);
      res.end();
      return true;
    }
    return false;
  }
  return {
    name: 'bettex-seo',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const path = (context.path.replace(prefix, '').replace(/\/+$/, '') || '/');
        return withMetadata(html, path);
      },
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (restrictAiCrawler(req, res, `${prefix}/robots.txt`)) return;
        if (redirectTrailingSlash(req, res)) return;
        const path = (req.url ?? '').split('?')[0].replace(prefix, '');
        if (path !== '/robots.txt' && path !== '/sitemap.xml') return next();
        const files = discovery();
        res.setHeader('Content-Type', path === '/robots.txt' ? 'text/plain; charset=utf-8' : 'application/xml; charset=utf-8');
        res.end(path === '/robots.txt' ? files.robots : files.sitemap);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (restrictAiCrawler(req, res, `${prefix}/robots.txt`)) return;
        if (redirectTrailingSlash(req, res)) return;
        let route;
        try { route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(prefix, '') || '/'; }
        catch { res.statusCode = 400; res.end('Endereço inválido'); return; }
        const root = path.resolve(server.config.root, server.config.build.outDir);
        if (routeData(route)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          const data = routeData(route);
          res.end(readFileSync(path.join(root, htmlFile(localizedPath(data.page, data.language)))));
          return;
        }
        const requested = path.resolve(root, `.${route}`);
        if (requested.startsWith(`${root}${path.sep}`) && existsSync(requested)) return next();
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(readFileSync(path.join(root, '404.html')));
      });
    },
  };
}