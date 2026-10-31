-- Immutable source snapshots, separately mutable activations, append-only transitions.
CREATE TABLE IF NOT EXISTS trading_policy_versions (
  id text PRIMARY KEY,
  environment text NOT NULL CHECK (environment IN ('development','production')),
  record jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS trading_policy_versions_environment ON trading_policy_versions(environment,created_at DESC);
CREATE TABLE IF NOT EXISTS trading_policy_control (
  environment text PRIMARY KEY CHECK (environment IN ('development','production')),
  state jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS trading_policy_changes (
  id text PRIMARY KEY,
  environment text NOT NULL CHECK (environment IN ('development','production')),
  record jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS trading_policy_changes_environment ON trading_policy_changes(environment,created_at DESC);
CREATE OR REPLACE FUNCTION trading_policy_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'policy_published_record_immutable';
END $$;
DROP TRIGGER IF EXISTS trading_policy_version_immutable ON trading_policy_versions;
CREATE TRIGGER trading_policy_version_immutable BEFORE UPDATE OR DELETE ON trading_policy_versions
  FOR EACH ROW EXECUTE FUNCTION trading_policy_immutable();
DROP TRIGGER IF EXISTS trading_policy_change_immutable ON trading_policy_changes;
CREATE TRIGGER trading_policy_change_immutable BEFORE UPDATE OR DELETE ON trading_policy_changes
  FOR EACH ROW EXECUTE FUNCTION trading_policy_immutable();
