// Deployment-only headers layered on top of the unchanged production handlers.
// - *.vercel.app aliases are never indexed (bettex.ai keeps its own policy).
// - Public 200 responses are also cached at the Vercel edge; the browser-facing
//   Cache-Control header stays exactly as the production server set it.
const hostOf = req => String(req.headers['x-forwarded-host'] ?? req.headers.host ?? '')
  .split(',')[0].trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');

const headerFrom = (res, args, name) => {
  const object = args.find((value, index) => index > 0 && value && typeof value === 'object' && !Array.isArray(value));
  const entry = object && Object.entries(object).find(([key]) => key.toLowerCase() === name);
  return String(entry?.[1] ?? res.getHeader(name) ?? '');
};

export function withDeploymentHeaders(handler) {
  return (req, res) => {
    const preview = hostOf(req).endsWith('.vercel.app');
    const writeHead = res.writeHead;
    res.writeHead = function (...args) {
      if (preview && !/\bnoindex\b/i.test(headerFrom(res, args, 'x-robots-tag'))) {
        const object = args.find((value, index) => index > 0 && value && typeof value === 'object' && !Array.isArray(value));
        if (object) for (const key of Object.keys(object)) if (key.toLowerCase() === 'x-robots-tag') delete object[key];
        res.setHeader('X-Robots-Tag', 'noindex');
      }
      const cacheControl = headerFrom(res, args, 'cache-control');
      if (Number(args[0]) === 200 && /^public\b/.test(cacheControl) && !req.headers.range) {
        res.setHeader('Vercel-CDN-Cache-Control', cacheControl);
      }
      return writeHead.apply(this, args);
    };
    return handler(req, res);
  };
}
