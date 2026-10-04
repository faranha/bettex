import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { stat, readFile } from 'node:fs/promises';
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
  return createServer(async (req, res) => {
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