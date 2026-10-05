CREATE TABLE IF NOT EXISTS local_test_rounds (
  id text PRIMARY KEY, epoch text NOT NULL, starts_at bigint NOT NULL, ends_at bigint NOT NULL,
  snapshot_block integer, snapshot_hash text, plan jsonb, UNIQUE(epoch,starts_at)
);
ALTER TABLE local_test_rounds ADD COLUMN IF NOT EXISTS buyback_state text NOT NULL DEFAULT 'not_started';
ALTER TABLE local_test_rounds ADD COLUMN IF NOT EXISTS buyback_hash text;
CREATE TABLE IF NOT EXISTS local_test_payouts (
  round_id text NOT NULL REFERENCES local_test_rounds(id),
  account_id text NOT NULL REFERENCES test_accounts(id),
  wallet text NOT NULL, units text NOT NULL CHECK(units ~ '^[0-9]+$'),
  operation_id text NOT NULL UNIQUE, state text NOT NULL DEFAULT 'pending',
  transaction_hash text, PRIMARY KEY(round_id,account_id)
);
