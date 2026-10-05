import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { stat, readFile, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const publicRoot = path.resolve(import.meta.dirname, '../dist/public');
const officialOrigin = 'https://bettex.ai';
const legacyHost = 'bettex.replit.app';
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.pdf': 'application/pdf', '.mp4': 'video/mp4',
  '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.glb': 'model/gltf-binary',
};

export function createSiteServer(root = publicRoot) {
  const index = existsSync(path.join(root, 'index.html')) ? readFileSync(path.join(root, 'index.html'), 'utf8') : '';
  const inlineHashes = [...index.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(([, script]) => `'sha256-${createHash('sha256').update(script).digest('base64')}'`).join(' ');
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // Deployment CSP: no arbitrary base URLs, plugins or inline event handlers.
    // Clerk's proxy is same-origin; hosted Clerk and Turnstile remain explicit.
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "base-uri 'none'",
      "object-src 'none'",
      `script-src 'self' ${inlineHashes} https://*.clerk.accounts.dev https://*.clerk.com https://clerk.bettex.ai https://challenges.cloudflare.com`,
      "script-src-attr 'none'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.bettex.ai https://challenges.cloudflare.com",
      "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
      "frame-ancestors 'self'",
      "form-action 'self'",
    ].join('; '));
    try {
      // Replit's proxy can forward the visitor's original host in this header.
      const hosts = [req.headers.host, req.headers['x-forwarded-host']]
        .map(value => String(value ?? '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, ''));
      if (hosts.includes(legacyHost)) {
        res.writeHead(301, {
          Location: officialOrigin + (req.url?.startsWith('/') ? req.url : '/'),
          'Cache-Control': 'no-store',
        });
        res.end();
        return;
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { Allow: 'GET, HEAD' });
        res.end();
        return;
      }
      const url = new URL(req.url ?? '/', 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      // Dedicated app pages must also open directly and after a reload.
      const appPage = pathname.match(/^\/(?:(en|es)\/)?demo\/(central|saldo|balance|tesouraria|treasury|tesoreria|minha-conta|account|mi-cuenta)\/?$/)
        || pathname.match(/^\/(?:(en|es)\/)?demo\/(minha-conta|account|mi-cuenta)\/.+$/);
      if (appPage) {
        const language = appPage[1] || 'pt';
        const title = appPage[2] === 'central'
          ? { pt: 'Central da IA', en: 'AI Center', es: 'Central de IA' }[language]
          : ['minha-conta', 'account', 'mi-cuenta'].includes(appPage[2])
            ? { pt: 'Minha conta', en: 'My account', es: 'Mi cuenta' }[language]
            : ['saldo', 'balance'].includes(appPage[2])
              ? { pt: 'Saldo e histórico', en: 'Balance and history', es: 'Saldo e historial' }[language]
            : { pt: 'Tesouraria', en: 'Treasury', es: 'Tesorería' }[language];
        const shell = path.join(root, language === 'pt' ? 'demo/index.html' : `${language}/demo/index.html`);
        const html = (await readFile(shell, 'utf8'))
          .replace(/<title>[^<]*<\/title>/i, `<title>${title} | BETTEX</title>`)
          .replace(/<h1([^>]*)>[^<]*<\/h1>/i, `<h1$1>${title}</h1>`)
          .replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,nofollow">')
          .replace(/(<link\s+rel=["']canonical["']\s+href=["'])[^"']+/, `$1${officialOrigin}${pathname.replace(/\/?$/, '/')}`);
        res.writeHead(200, { 'Content-Type': mime['.html'], 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
        res.end(req.method === 'HEAD' ? undefined : html);
        return;
      }
      // Clerk's embedded flows have callback/verification subpaths. Serve their
      // app shell explicitly, without turning missing public pages into a SPA.
      if (/^\/(?:(?:en|es)\/)?sign-(?:in|up)(?:\/|$)/.test(pathname)) {
        const html = (await readFile(path.join(root, 'index.html'), 'utf8'))
          .replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,nofollow">');
        res.writeHead(200, { 'Content-Type': mime['.html'], 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
        res.end(html);
        return;
      }
      if (pathname.split('/').some(segment => segment === '..')) {
        res.writeHead(400); res.end('Endereço inválido'); return;
      }
      if (pathname.split('/').some(segment => segment.startsWith('.'))
        || /\.(?:map|sql|dump|backup|key|pem|env)(?:\/|$)/i.test(pathname)) {
        res.writeHead(404); res.end(); return;
      }
      let file = path.resolve(root, `.${pathname}`);
      if (file !== root && !file.startsWith(root + path.sep)) {
        res.writeHead(400);
        res.end('Endereço inválido');
        return;
      }
      let info = await stat(file).catch(error => {
        if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null;
        throw error;
      });
      if (info) {
        const resolved = await realpath(file), resolvedRoot = await realpath(root);
        if (resolved !== resolvedRoot && !resolved.startsWith(resolvedRoot + path.sep)) {
          res.writeHead(404); res.end(); return;
        }
      }
      if (info?.isDirectory()) {
        if (!pathname.endsWith('/')) {
          res.writeHead(301, { Location: url.pathname + '/' + url.search });
          res.end();
          return;
        }
        file = path.join(file, 'index.html');
        info = await stat(file).catch(error => {
          if (error.code === 'ENOENT') return null;
          throw error;
        });
      }
      if (!info?.isFile()) {
        const body = await readFile(path.join(root, '404.html'));
        res.writeHead(404, { 'Content-Type': mime['.html'], 'Content-Length': body.length, 'Cache-Control': 'no-cache' });
        res.end(req.method === 'HEAD' ? undefined : body);
        return;
      }
      const headers = {
        'Content-Type': mime[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
        'Content-Length': info.size,
        'Cache-Control': path.extname(file) === '.html' ? 'no-cache'
          : pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        'Accept-Ranges': 'bytes',
      };
      let start = 0;
      let end = info.size - 1;
      let status = 200;
      if (req.headers.range && req.method === 'GET') {
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (range && (range[1] || range[2])) {
          start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
          end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
          if (start > end || start >= info.size || !Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
            res.writeHead(416, { 'Content-Range': `bytes */${info.size}` });
            res.end();
            return;
          }
          status = 206;
          headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
          headers['Content-Length'] = end - start + 1;
        }
      }
      res.writeHead(status, headers);
      if (req.method === 'HEAD' || info.size === 0) { res.end(); return; }
      const stream = createReadStream(file, { start, end });
      stream.on('error', error => res.destroy(error));
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    } catch (error) {
      if (error instanceof URIError) { res.writeHead(400); res.end('Endereço inválido'); return; }
      console.error('Static server request failed:', error);
      if (!res.headersSent) res.writeHead(500);
      res.end();
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('A valid PORT is required');
  if (!existsSync(path.join(publicRoot, 'index.html'))) throw new Error('Build the site before starting the production server');
  createSiteServer().listen(port, '0.0.0.0', () => console.log(`BETTEX production server listening on ${port}`));
}