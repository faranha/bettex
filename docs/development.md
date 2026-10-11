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

## Outside Replit

```sh
pnpm dev:local
```

This launches the API on `API_PORT` (8080 by default), Vite on `SITE_PORT`
(5173), and the coordinated sync watcher. Vite's opt-in local proxy keeps
`/api` requests on the browser's origin. It is disabled in Replit, whose existing
artifact proxy owns routing. The launcher sets development mode and pauses
financial execution; it does not start or fund any EVM.

Before starting the launcher, run `pnpm sync:pause` while preparing the final
GitHub integration. Its watcher must not upload changes before owner review.
Open the site and select **Open demo**. `/app` is visual in development and
production; preserved account adapters are not available in the current app.

## In Replit

Use the existing managed workflows `artifacts/api-server: API Server` and
`artifacts/bettex-site: web`. They supply separate ports and artifact base paths.
The separate `github-sync` console workflow runs the watcher while the workspace
is running. It has no customer-facing interface or HTTP port.

The former local and public runtime scripts are explicitly disabled. Do not
remove their safety throws or start/fund a chain to view the demo.
Library tests create their own isolated EVM without activating the runtime.
See [testnet scope](testnets/README.md).

## Checks and builds

```sh
pnpm sync:check
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
run. Do not hand-edit those clients. CI builds and tests only; it does not invoke
`sync:once`, push Git changes, deploy, or send real transactions.

## End of every AI task

**During final repository preparation, do not run the sending commands below.**
Leave the watcher paused; final integration is controlled by the owner.
The following describes the previously authorized normal synchronization workflow,
not authorization to upload this preparation.

Run appropriate checks and then:

```sh
pnpm sync:once -- "Describe the completed development change in English"
pnpm sync:status
```

A nonzero synchronization exit means the task is **not synchronized**. Report
the phase and recovery action. A local commit alone is not proof of a push.
See [github-sync.md](github-sync.md) for activation and conflicts.
