#!/usr/bin/env bash
# Restore a BETTEX PostgreSQL custom-format dump (pg_dump -Fc) into Neon or any
# PostgreSQL 16+ database. The dump is NEVER stored in this repository.
#
# Usage:
#   DATABASE_URL='<neon-direct-connection-string>' \
#     scripts/neon/restore.sh /path/to/bettex-prod.dump [--clean]
#
# Requires pg_restore/psql 16+. Use Neon's DIRECT (non -pooler) connection
# string; pg_restore is not compatible with PgBouncer transaction pooling.
set -euo pipefail

dump="${1:-}"
mode="${2:-}"
if [ -z "$dump" ] || [ ! -f "$dump" ]; then
  echo "usage: DATABASE_URL=... $0 <file.dump> [--clean]" >&2
  exit 64
fi
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required (Neon direct connection string)." >&2
  exit 64
fi
case "$DATABASE_URL" in
  *-pooler.*) echo "Use the direct Neon host, not the -pooler host." >&2; exit 64 ;;
esac

if [ -f "$dump.sha256" ] || [ -f "$(dirname "$dump")/SHA256SUMS" ]; then
  if [ -f "$(dirname "$dump")/SHA256SUMS" ]; then
    (cd "$(dirname "$dump")" && grep " $(basename "$dump")\$" SHA256SUMS | sha256sum -c -)
  else
    sha256sum -c "$dump.sha256"
  fi
fi

pg_restore --list "$dump" >/dev/null   # validates the archive before connecting

args=(--no-owner --no-privileges --exit-on-error --single-transaction --dbname "$DATABASE_URL")
if [ "$mode" = "--clean" ]; then
  args=(--clean --if-exists "${args[@]}")
fi

echo "Restoring $(basename "$dump") ..."
pg_restore "${args[@]}" "$dump"

psql "$DATABASE_URL" -X -q -c 'ANALYZE;'
echo "Row counts per table after restore:"
psql "$DATABASE_URL" -X -A -t -c "
  SELECT schemaname || '.' || relname || ' ' || n_live_tup
  FROM pg_stat_user_tables ORDER BY schemaname, relname;" || true
echo "Done."
