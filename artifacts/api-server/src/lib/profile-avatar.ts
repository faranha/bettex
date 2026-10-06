import { db, demoAccounts } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Response } from "express";
import type { AccountState } from "./demo-state";
import { ObjectStorageService } from "./objectStorage";
import { getObjectAclPolicy, setObjectAclPolicy } from "./objectAcl";

export const AVATAR_LIMIT = 5 * 1024 * 1024;
export const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const avatarStorage = new ObjectStorageService();

export class ProfileAvatarError extends Error {}

export function avatarType(bytes: Buffer): string | null {
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export function validAvatarId(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(value);
}

export async function validateProfileAvatar(owner: string, objectPath: string) {
  if (!/^\/objects\/uploads\/[a-f0-9-]{36}$/.test(objectPath)) throw new ProfileAvatarError("invalid_avatar");
  const [row] = await db.select({ state: demoAccounts.state }).from(demoAccounts).where(eq(demoAccounts.id, owner.slice(5)));
  const state = row?.state as AccountState | undefined;
  if (state?.profile.avatarPath === objectPath) return;
  const permit = state?.avatarUpload;
  if (!permit || permit.objectPath !== objectPath || permit.expiresAt < Date.now()) throw new ProfileAvatarError("invalid_avatar");
  const file = await avatarStorage.getObjectEntityFile(objectPath);
  const [metadata] = await file.getMetadata();
  if (Number(metadata.size) !== permit.size || Number(metadata.size) > AVATAR_LIMIT) {
    await file.delete({ ignoreNotFound: true });
    throw new ProfileAvatarError("invalid_avatar");
  }
  const [bytes] = await file.download();
  const type = avatarType(bytes);
  if (type !== permit.contentType || metadata.contentType !== type) {
    await file.delete({ ignoreNotFound: true });
    throw new ProfileAvatarError("invalid_avatar");
  }
  await setObjectAclPolicy(file, { owner, visibility: "public" });
}

export async function serveProfileAvatar(id: string, res: Response) {
  const file = await avatarStorage.getObjectEntityFile(`/objects/uploads/${id}`);
  const acl = await getObjectAclPolicy(file);
  if (acl?.visibility !== "public") { res.sendStatus(404); return; }
  const [metadata] = await file.getMetadata();
  if (!AVATAR_TYPES.includes(metadata.contentType as typeof AVATAR_TYPES[number]) || Number(metadata.size) > AVATAR_LIMIT) {
    res.sendStatus(404); return;
  }
  res.set({
    "Content-Type": metadata.contentType!,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
    "Cache-Control": "private, max-age=60",
    "Content-Disposition": 'inline; filename="profile-picture"',
  });
  file.createReadStream().on("error", () => {
    if (!res.headersSent) res.sendStatus(404);
    else res.destroy();
  }).pipe(res);
}

export async function removeProfileAvatar(objectPath: string, owner: string) {
  const file = await avatarStorage.getObjectEntityFile(objectPath);
  const acl = await getObjectAclPolicy(file);
  if (acl?.owner === owner) await file.delete({ ignoreNotFound: true });
}
