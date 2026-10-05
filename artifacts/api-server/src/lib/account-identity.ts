import { clerkClient, getAuth } from "@clerk/express";
import type { Request } from "express";
import type { AccountIdentity } from "./demo-store";
import { personalAccountIdentity } from "../modules/accounts/infrastructure/session-identity";

type VerifiedProfile = Required<Pick<AccountIdentity, "name" | "email" | "memberSince">> & Pick<AccountIdentity, "userId" | "nativeAccountId">;
const cache = new Map<string, { profile: VerifiedProfile; expires: number }>();

export async function verifiedAccount(req: Request): Promise<VerifiedProfile | undefined> {
  const sessionToken = req.headers.cookie?.split(";").map(value => value.trim())
    .find(value => value.startsWith("bettex_test_session="))?.slice("bettex_test_session=".length) ?? "";
  const personal = await personalAccountIdentity(sessionToken);
  if (personal) return { nativeAccountId: personal.id, name: personal.displayName, email: personal.email, memberSince: personal.acceptedAt.toISOString() };
  const { userId } = getAuth(req);
  if (!userId) return undefined;
  const saved = cache.get(userId);
  if (req.method === "GET" && saved && saved.expires > Date.now()) return saved.profile;
  const user = await clerkClient.users.getUser(userId);
  const email = user.emailAddresses.find(value => value.id === user.primaryEmailAddressId);
  if (!email || email.verification?.status !== "verified") throw new Error("email_verification_required");
  if (user.banned || user.locked) throw new Error("account_unavailable");
  const profile = {
    userId,
    name: (user.fullName?.trim() || user.username || email.emailAddress.split("@")[0]!).slice(0, 60),
    email: email.emailAddress,
    memberSince: new Date(user.createdAt).toISOString(),
  };
  if (cache.size > 1000) for (const [id, entry] of cache) if (entry.expires < Date.now()) cache.delete(id);
  cache.set(userId, { profile, expires: Date.now() + 5000 });
  return profile;
}

export async function updateAccountName(req: Request, name: string) {
  if ((await verifiedAccount(req))?.nativeAccountId) throw new Error("native_profile_command_required");
  const { userId } = getAuth(req);
  if (userId) {
    await verifiedAccount(req);
    await clerkClient.users.updateUser(userId, { firstName: name.trim(), lastName: "" });
    cache.delete(userId);
  }
}