CREATE TABLE IF NOT EXISTS local_chain_journal (
  id text PRIMARY KEY,epoch text NOT NULL,asset text NOT NULL,decimals integer NOT NULL,
  transaction_hash text NOT NULL,block_number integer NOT NULL,block_hash text NOT NULL,
  log_index integer NOT NULL,event_time bigint NOT NULL,legs jsonb NOT NULL,
  reverses text REFERENCES local_chain_journal(id),created_at timestamptz NOT NULL DEFAULT now()
);
