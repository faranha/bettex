import { createHash } from "node:crypto";

export function demoTabIdentity(value: unknown, authenticated = false): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) throw new Error("invalid_demo_tab_session");
  // Signed-in demos cannot claim or expose the anonymous tab's data.
  return createHash("sha256").update(`${authenticated ? "authenticated" : "anonymous"}-demo-tab:${value}`).digest("hex");
}
