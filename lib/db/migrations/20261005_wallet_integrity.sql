-- Additive migration. Invalid pre-existing rows STOP the migration; never delete.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('bettex:wallet-integrity:20261005'));
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='personal_wallet_owner_fk'
    AND connamespace=current_schema()::regnamespace) THEN
    ALTER TABLE personal_test_wallets ADD CONSTRAINT personal_wallet_owner_fk
      FOREIGN KEY(account_id) REFERENCES test_accounts(id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='personal_vault_owner_fk'
    AND connamespace=current_schema()::regnamespace) THEN
    ALTER TABLE personal_test_vaults ADD CONSTRAINT personal_vault_owner_fk
      FOREIGN KEY(account_id) REFERENCES test_accounts(id) NOT VALID;
  END IF;
END $$;
ALTER TABLE personal_test_wallets VALIDATE CONSTRAINT personal_wallet_owner_fk;
ALTER TABLE personal_test_vaults VALIDATE CONSTRAINT personal_vault_owner_fk;
COMMIT;
