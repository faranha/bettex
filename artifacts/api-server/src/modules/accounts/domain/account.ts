export const NO_RECOVERY_NOTICE_VERSION = "personal-wallets-no-recovery-2026-10-05";
export const canUsePersonalTestAccounts = (environment: string | undefined) => environment === "development";
export class AccountFailure extends Error {
  constructor(public readonly code: string, public readonly status = 400) { super(code); }
}
export function normalizedEmail(value: unknown): string {
  if (typeof value !== "string") throw new AccountFailure("invalid_email");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AccountFailure("invalid_email");
  return email;
}
export function checkedName(value: unknown): string {
  if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > 60) {
    throw new AccountFailure("invalid_name");
  }
  return value.trim();
}
export function checkedPassword(value: unknown, creating = false): string {
  if (typeof value !== "string" || !value.length || value.length > 128 || (creating && value.length < 12)) {
    throw new AccountFailure("invalid_password");
  }
  return value;
}
