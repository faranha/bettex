import { randomUUID } from "node:crypto";
import { db, demoAccounts, profileAvatars } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import type { Response } from "express";
import type { AccountState } from "./demo-state";

// Profile pictures are stored in the application's own Postgres database
// (table profile_avatars). No external object storage or platform sidecar.
export const AVATAR_LIMIT = 5 * 1024 * 1024;
export const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
const OBJECT_PREFIX = "/objects/uploads/";
const OBJECT_PATH = /^\/objects\/uploads\/([a-f0-9-]{36})$/;

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

function avatarId(objectPath: string) {
  const id = OBJECT_PATH.exec(objectPath)?.[1];
  if (!id || !validAvatarId(id)) throw new ProfileAvatarError("invalid_avatar");
  return id;
}

/**
 * Creates a one-shot upload target. The upload URL is a same-origin API path whose
 * random id acts as the capability (like a short-lived signed URL); it is only
 * accepted while the owner's 15 minute upload permit for that exact path exists.
 */
export function createAvatarUpload() {
  const id = randomUUID();
  return { uploadURL: `/api/demo/profile/avatar/upload/${id}`, objectPath: `${OBJECT_PREFIX}${id}` };
}

/** Stores the uploaded bytes for a pending permit. The picture stays private until the profile is saved. */
export async function storeAvatarUpload(id: string, declaredType: string | undefined, bytes: Buffer) {
  if (!validAvatarId(id) || !Buffer.isBuffer(bytes)) throw new ProfileAvatarError("invalid_avatar");
  const objectPath = `${OBJECT_PREFIX}${id}`;
  const [row] = await db.select({ id: demoAccounts.id, state: demoAccounts.state }).from(demoAccounts)
    .where(sql`${demoAccounts.state}->'avatarUpload'->>'objectPath' = ${objectPath}`).limit(1);
  const permit = (row?.state as AccountState | undefined)?.avatarUpload;
  const type = avatarType(bytes);
  if (!row || !permit || permit.objectPath !== objectPath || permit.expiresAt < Date.now()
    || bytes.length !== permit.size || bytes.length > AVATAR_LIMIT
    || type !== permit.contentType || declaredType?.split(";")[0]?.trim().toLowerCase() !== type) {
    throw new ProfileAvatarError("invalid_avatar");
  }
  const inserted = await db.insert(profileAvatars)
    .values({ id, owner: `demo:${row.id}`, contentType: type, size: bytes.length, data: bytes, isPublic: false })
    .onConflictDoNothing().returning({ id: profileAvatars.id });
  if (!inserted.length) throw new ProfileAvatarError("invalid_avatar");
}

export async function validateProfileAvatar(owner: string, objectPath: string) {
  const id = avatarId(objectPath);
  const [row] = await db.select({ state: demoAccounts.state }).from(demoAccounts).where(eq(demoAccounts.id, owner.slice(5)));
  const state = row?.state as AccountState | undefined;
  if (state?.profile.avatarPath === objectPath) return;
  const permit = state?.avatarUpload;
  if (!permit || permit.objectPath !== objectPath || permit.expiresAt < Date.now()) throw new ProfileAvatarError("invalid_avatar");
  const [file] = await db.select({ owner: profileAvatars.owner, size: profileAvatars.size, contentType: profileAvatars.contentType, data: profileAvatars.data })
    .from(profileAvatars).where(eq(profileAvatars.id, id));
  if (!file || file.owner !== owner) throw new ProfileAvatarError("invalid_avatar");
  const type = avatarType(file.data);
  if (file.size !== permit.size || file.data.length !== file.size || file.size > AVATAR_LIMIT || type !== permit.contentType || file.contentType !== type) {
    await db.delete(profileAvatars).where(eq(profileAvatars.id, id));
    throw new ProfileAvatarError("invalid_avatar");
  }
  await db.update(profileAvatars).set({ isPublic: true }).where(and(eq(profileAvatars.id, id), eq(profileAvatars.owner, owner)));
}

export async function serveProfileAvatar(id: string, res: Response) {
  const [file] = await db.select({ contentType: profileAvatars.contentType, size: profileAvatars.size, data: profileAvatars.data })
    .from(profileAvatars).where(and(eq(profileAvatars.id, id), eq(profileAvatars.isPublic, true)));
  if (!file || !AVATAR_TYPES.includes(file.contentType as typeof AVATAR_TYPES[number]) || file.size > AVATAR_LIMIT) {
    res.sendStatus(404); return;
  }
  res.set({
    "Content-Type": file.contentType,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
    "Cache-Control": "private, max-age=60",
    "Content-Disposition": 'inline; filename="profile-picture"',
  });
  res.end(file.data);
}

export async function removeProfileAvatar(objectPath: string, owner: string) {
  const id = OBJECT_PATH.exec(objectPath)?.[1];
  if (!id) return;
  await db.delete(profileAvatars).where(and(eq(profileAvatars.id, id), eq(profileAvatars.owner, owner)));
}
