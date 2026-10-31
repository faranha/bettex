# Development and clean-clone execution

## Supported toolchain

Use Node 24 (at least 24.12; `.node-version` pins the recommended patch),
pnpm 10.26.1, Python 3.13 with `xlsxwriter==3.2.9`, PostgreSQL 16, and Git.
The existing dependency overrides target Linux x64. Linux is the verified
clean-clone platform; macOS/Windows native-binary compatibility is not claimed.
Python handles editorial checks and localized downloadable spreadsheets, not
financial execution.

```sh
corepack enable
pnpm install --frozen-lockfile
python -m pip install "xlsxwriter==3.2.9"
cp .env.example .env
```

Populate `.env` privately using your credential manager. Do not paste values in
issues, commits or agent conversations. Never use a production database for
development or CI. The blank template intentionally does not contain usable
credentials.

## Database

The current visual demo does not initialize the operational database. This
section is for preserved reference infrastructure, not a prerequisite for viewing
`/app`. Do not prepare or migrate an existing database during repository cleanup.

Provision a new empty development PostgreSQL database and set `DATABASE_URL`.
On a new clone only:

```sh
node --env-file=.env --run db:prepare
```

`db:prepare` applies the current Drizzle schema to that database. Review the
proposed schema changes; this is not authorization to migrate an existing live
database. Runtime-owned contexts also have idempotent schema initialization.
The SQL migration files under `lib/db/migrations/` document historical changes;
their dedicated migration scripts must only be used after reviewing applicability.
Do not run `push-force` on a shared database.

## Local development

```sh
pnpm dev:local
```

This launches the API on `API_PORT` (8080 by default) and Vite on `SITE_PORT`
(5173). Vite's opt-in local proxy keeps `/api` requests on the browser's
origin. The launcher sets development mode and pauses financial execution; it
does not start or fund any EVM.

Open the site and select **Open demo**. `/app` is visual in development and
production; preserved account adapters are not available in the current app.

The former local and public runtime scripts are explicitly disabled. Do not
remove their safety throws or start/fund a chain to view the demo.
Library tests create their own isolated EVM without activating the runtime.
See [testnet scope](testnets/README.md).

## Production

Production is deployed by Vercel from `main`; see
[Vercel deployment](deployment-vercel.md).

## Checks and builds

```sh
pnpm quality:current
PORT=5173 BASE_PATH=/ pnpm build
pnpm --filter @workspace/api-spec codegen
```

`quality:current` includes lint, known-secret patterns including history, dependency
policy, architectural boundaries, technical-reference tests, generated API
contracts, TypeScript, backend/domain models, visual API isolation, local-EVM
contract tests, frontend builds/localization and static-server tests.
The full `quality` reference profile retains historical HTTP/database integration
checks whose operational prerequisites are disabled. It is not claimed green.
See [profiles and limitations](testing.md). Contract tests run an isolated local EVM.

Code generation must not leave changes in generated API files after a clean CI
run. Do not hand-edit those clients. CI builds and tests only; it does not push
Git changes, deploy, or send real transactions.
