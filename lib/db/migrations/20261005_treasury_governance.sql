-- Additive, no grants or modification of existing accounts/capital.
CREATE TABLE IF NOT EXISTS treasury_governance_control (
 epoch text PRIMARY KEY, asset text NOT NULL, treasury text NOT NULL, policy jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS treasury_governance_versions (
 epoch text NOT NULL, version integer NOT NULL, policy jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(epoch,version)
);
CREATE TABLE IF NOT EXISTS treasury_governance_proposals (
 id text PRIMARY KEY, epoch text NOT NULL, proposal jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS treasury_allocation_reservations (
 id text PRIMARY KEY, epoch text NOT NULL, units text NOT NULL CHECK(units ~ '^[1-9][0-9]*$'),
 state text NOT NULL CHECK(state IN('held','spent','released')), day bigint NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
