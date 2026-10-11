// Named AI crawlers only: do not block generic "bot", Googlebot, Bingbot,
// social-link previews, or normal browsers. User-Agent can be impersonated;
// this is a targeted restriction, not a guarantee against copying.
export const AI_HTTP_AGENTS = Object.freeze([
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User', 'CCBot',
  'meta-externalagent', 'meta-externalfetcher',
]);

// These opt-out tokens do not have separate HTTP User-Agents.
// Blocking Googlebot or Applebot instead would also block ordinary search.
export const AI_ROBOTS_TOKENS = Object.freeze([
  ...AI_HTTP_AGENTS, 'Google-Extended', 'Applebot-Extended',
]);

const agentPattern = new RegExp(
  `(?:^|[^a-z0-9_-])(?:${AI_HTTP_AGENTS.join('|')})(?=$|[^a-z0-9_-])`, 'i',
);

export function isRestrictedAiAgent(userAgent) {
  return typeof userAgent === 'string' && agentPattern.test(userAgent);
}

export function robotsPolicy(origin) {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /social-preview.html',
    '',
    '# Restrict known AI training, search and user-directed fetch agents.',
    '# Googlebot, Bingbot and ordinary search remain permitted.',
    ...AI_ROBOTS_TOKENS.map(agent => `User-agent: ${agent}`),
    'Disallow: /',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');
}

/** Return true only when the request has been answered with a denial. */
export function restrictAiCrawler(req, res, robotsPath = '/robots.txt') {
  // Normal responses must also vary: a browser's cached asset must not become
  // the response for a denied agent. Never publicly cache the 403 itself.
  const vary = String(res.getHeader('Vary') ?? '').split(',').map(v => v.trim()).filter(Boolean);
  if (!vary.some(v => v.toLowerCase() === 'user-agent')) vary.push('User-Agent');
  res.setHeader('Vary', vary.join(', '));

  // Crawlers must be able to read the opt-out, including user-directed agents
  // whose operators may not honor robots.txt for other URLs.
  const pathname = (req.url ?? '/').split('?')[0];
  if (pathname === robotsPath && (req.method === 'GET' || req.method === 'HEAD')) return false;
  if (!isRestrictedAiAgent(req.headers['user-agent'])) return false;
  res.writeHead(403, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex, nofollow',
  });
  res.end(req.method === 'HEAD' ? undefined : 'Acesso automatizado por IA restrito.\n');
  return true;
}
