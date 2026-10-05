export type HistoryInput = {
  key: string; subject: string; visibility?: "private" | "admin";
  correlationId: string; category: "financial" | "activity" | "automatic" | "technical";
  kind: string; state: string; actor: "user" | "admin" | "system" | "contract" | "agent";
  environment: "account_test" | "local_evm" | "simulation" | "testnet" | "production";
  chainId?: number | null; epoch?: string; asset?: string; wallet?: string;
  transactionHash?: string; blockHash?: string; blockNumber?: number; logIndex?: number;
  occurredAt?: Date; requestedAt?: Date; reconstructed?: boolean; source: string; parentId?: string;
  data?: Record<string, unknown>;
};
const forbidden = /password|private.?key|mnemonic|seed|session|cookie|csrf|ciphertext|backup.?content|authorization|(^|_)token($|_)/i;
export function safeHistoryData(data: Record<string, unknown> = {}) {
  const inspect = (value: unknown, depth: number): void => {
    if (depth > 5) throw new Error("history_invalid_data");
    if (typeof value === "number") throw new Error("history_requires_exact_strings");
    if (typeof value === "string" && (value.length > 1000 || /^0x[a-f0-9]{64}$/i.test(value) && Object.keys(data).some(k => forbidden.test(k)))) throw new Error("history_invalid_data");
    if (Array.isArray(value)) { if (value.length > 30) throw new Error("history_invalid_data"); value.forEach(v => inspect(v, depth + 1)); }
    else if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) {
      if (forbidden.test(key)) throw new Error("history_secret_field");
      if (/(Units|Wei)$/.test(key) && (typeof child !== "string" || !/^-?\d+$/.test(child))) throw new Error("history_requires_integer_units");
      inspect(child, depth + 1);
    }
  };
  inspect(data, 0); return data;
}
/** Exact conversion of an existing simulation's decimal representation; never money arithmetic. */
export function decimalUnits(value: string, decimals: number) {
  if (!/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(value)) throw new Error("invalid_decimal");
  const [coefficient, exponent = "0"] = value.toLowerCase().split("e");
  const negative = coefficient!.startsWith("-"), [whole, fraction = ""] = coefficient!.replace("-", "").split(".");
  const shift = decimals + Number(exponent) - fraction.length;
  const digits = BigInt(`${whole}${fraction}`);
  if (shift < 0 && digits % (10n ** BigInt(-shift)) !== 0n) throw new Error("unsupported_source_precision");
  const units = shift >= 0 ? digits * 10n ** BigInt(shift) : digits / 10n ** BigInt(-shift);
  return String(negative ? -units : units);
}
