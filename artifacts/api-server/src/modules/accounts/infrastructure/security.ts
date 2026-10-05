import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { AccountFailure } from "../domain/account";

export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export const randomToken = () => randomBytes(32).toString("hex");
const options = { N: 131072, r: 8, p: 1, maxmem: 192 * 1024 * 1024 };
function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, 32, options,
    (error, key) => error ? reject(error) : resolve(key)));
}
export async function passwordHash(password: string) {
  const salt = randomBytes(32).toString("hex");
  const result = await derive(password, salt);
  return `scrypt:131072:8:1:${salt}:${result.toString("hex")}`;
}
export async function passwordMatches(password: string, encoded: string) {
  const parts = encoded.split(":");
  if (parts.length !== 6 || parts.slice(0, 4).join(":") !== "scrypt:131072:8:1"
    || !/^[a-f0-9]{64}$/.test(parts[4]!) || !/^[a-f0-9]{64}$/.test(parts[5]!)) return false;
  const result = await derive(password, parts[4]!);
  return timingSafeEqual(result, Buffer.from(parts[5]!, "hex"));
}
export async function requirePassword(password: string, hash: string) {
  if (!await passwordMatches(password, hash)) throw new AccountFailure("invalid_credentials", 401);
}
