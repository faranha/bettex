-- Additive agent evidence/decisions only. No privileges, balance changes or financial ledger replacement.
CREATE TABLE IF NOT EXISTS agents_alpha_records (
  id text PRIMARY KEY,
  record jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS agents_alpha_source (
  id text PRIMARY KEY,
  status jsonb NOT NULL
);
