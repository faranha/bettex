# Vercel deployment

`bettex.ai` is deployed on Vercel from the `main` branch of `faranha/bettex`.
The deployment reproduces the previous production runtime exactly: the same
prerendered site, the same `artifacts/bettex-site/scripts/serve.mjs` server
(routes, redirects, security headers, cache rules, robots/sitemap) and the
same Express app for `/api`.

## Project settings

| Setting | Value |
| --- | --- |
| Framework preset | Other (`"framework": null` in `vercel.json`) |
| Root directory | repository root (`./`) |
| Install command | `npm install -g pnpm@10.26.1 && pnpm install --frozen-lockfile` |
| Build command | `pnpm run build:vercel` |
| Output | `.vercel/output` (Build Output API v3, detected automatically) |
| Node.js | 24.x (from `engines.node`; functions use `nodejs24.x`) |
| Production branch | `main` |
| Environment variables | none required |

`vercel.json` already pins the framework, install and build commands.

## What the build does

`scripts/vercel/build.sh`:

1. Selects Python 3.12+ (stdlib only) for the editorial gates, installing a
   managed interpreter with `uv` only if the image has none.
2. Runs `pnpm --filter @workspace/bettex-site run build:vercel`: every gate of
   the normal site build except the three Chromium-rendered checks
   (documentation navigation, HTML and synthesis), which run in GitHub Actions
   through the full `build` script.
3. Runs `scripts/vercel/build-output.mjs`, which writes:
   - `functions/index.func`: `serve.mjs` with its static `dist/public` bundle;
   - `functions/api.func`: the Express app bundled with esbuild;
   - `config.json`: `/api` and `/api/*` to the API, everything else to the site.

Responses with a public `Cache-Control` and status 200 are mirrored to
`Vercel-CDN-Cache-Control`, so hashed assets and static files are served from
Vercel's edge cache. HTML stays `no-cache`, as before.

Any `*.vercel.app` host receives `X-Robots-Tag: noindex`; the custom domain
keeps the original robots headers.

## Optional environment variables

| Name | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | AI translation of new Polymarket titles for pt/es. When unset, the demo shows the English title (no error). |
| `OPENAI_BASE_URL` | Alternate OpenAI-compatible endpoint (default `https://api.openai.com/v1`). |

The current public demo does not use a database, Clerk or session secrets.

## Local reproduction

```sh
pnpm install --frozen-lockfile
pnpm run build:vercel
ls .vercel/output/functions
```
