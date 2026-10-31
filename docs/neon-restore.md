# Neon database restore

The current public site and `/app` demo **do not read a database**: the API
mounts only `GET /api/healthz`, `GET /api/demo/polymarket` and
`GET /api/account/session` (always `{"account":null}`), and every other route
answers `410`/`403` through the interface-demo guard. A database is only needed
if preserved operational modules are reactivated later.

Database backups are private and are **never** committed to this repository.

## Restore a backup into Neon

1. Create a Neon project (PostgreSQL 16 or newer) and a database, e.g. `bettex`.
2. Copy the **direct** connection string (host without `-pooler`) with
   `sslmode=require`.
3. With PostgreSQL 16+ client tools installed:

   ```sh
   DATABASE_URL='<neon-direct-connection-string>' \
     scripts/neon/restore.sh /path/to/bettex-prod.dump
   ```

   Add `--clean` to replace existing objects. The script checks `SHA256SUMS`
   next to the dump when present, validates the archive, restores in a single
   transaction without owners/privileges, runs `ANALYZE` and prints row counts.

## Environment variables

| Name | Where | Value |
| --- | --- | --- |
| `DATABASE_URL` | local shell for the restore | Neon direct connection string |
| `DATABASE_URL` | Vercel (only if DB features are reactivated) | Neon pooled connection string (`-pooler` host) |

Never print or commit connection strings.
