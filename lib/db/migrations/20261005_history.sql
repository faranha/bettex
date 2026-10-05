BEGIN;
CREATE TABLE IF NOT EXISTS history_events (
 id text PRIMARY KEY, sequence bigserial NOT NULL UNIQUE, subject text NOT NULL, visibility text NOT NULL,
 correlation_id text NOT NULL, category text NOT NULL, kind text NOT NULL, state text NOT NULL, actor text NOT NULL,
 environment text NOT NULL, chain_id integer, epoch text, asset text, wallet text, transaction_hash text,
 block_hash text, block_number integer, log_index integer, occurred_at timestamptz NOT NULL,
 requested_at timestamptz, processed_at timestamptz NOT NULL DEFAULT now(), reconstructed boolean NOT NULL DEFAULT false,
 source text NOT NULL, parent_id text, data jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS history_subject_page ON history_events(subject,occurred_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS history_correlation ON history_events(subject,correlation_id);
CREATE INDEX IF NOT EXISTS history_parent ON history_events(parent_id);
CREATE TABLE IF NOT EXISTS history_coverage(id text PRIMARY KEY,started_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS test_account_permissions(
 account_id text NOT NULL REFERENCES test_accounts(id),permission text NOT NULL,PRIMARY KEY(account_id,permission)
);
CREATE OR REPLACE FUNCTION history_reject_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'history_append_only'; END;
$$;
DROP TRIGGER IF EXISTS history_append_only ON history_events;
CREATE TRIGGER history_append_only BEFORE UPDATE OR DELETE ON history_events
 FOR EACH ROW EXECUTE FUNCTION history_reject_mutation();
INSERT INTO history_coverage(id) VALUES('recording-start') ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION history_permission_change() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target text; permission_name text; corr text; event_id text; event_time timestamptz;
BEGIN
  IF TG_OP='UPDATE' AND NEW.account_id=OLD.account_id AND NEW.permission=OLD.permission THEN RETURN NULL; END IF;
  target := CASE WHEN TG_OP='DELETE' THEN OLD.account_id ELSE NEW.account_id END;
  permission_name := CASE WHEN TG_OP='DELETE' THEN OLD.permission ELSE NEW.permission END;
  event_time := clock_timestamp();
  corr := 'permission:'||txid_current()::text||':'||target||':'||permission_name||':'||TG_OP||':'||event_time::text;
  event_id := encode(sha256(convert_to(corr,'UTF8')),'hex');
  INSERT INTO history_events(id,subject,visibility,correlation_id,category,kind,state,actor,environment,occurred_at,source,data)
  VALUES(event_id,'native:'||target,'private',corr,'activity','admin_permission_changed','confirmed','admin','account_test',event_time,'permission_admin',
    jsonb_build_object('permission',permission_name,'change',TG_OP,'authority','database_administration'));
  INSERT INTO history_events(id,subject,visibility,correlation_id,category,kind,state,actor,environment,occurred_at,source,data)
  VALUES(encode(sha256(convert_to(corr||':admin','UTF8')),'hex'),'treasury:permissions','admin',corr,'activity','admin_permission_changed','confirmed',
    'admin','account_test',event_time,'permission_admin',jsonb_build_object('permission',permission_name,'change',TG_OP,'target',target,'authority','database_administration'));
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS history_permission_change ON test_account_permissions;
CREATE TRIGGER history_permission_change AFTER INSERT OR UPDATE OR DELETE ON test_account_permissions
 FOR EACH ROW EXECUTE FUNCTION history_permission_change();
COMMIT;
