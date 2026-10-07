const adjectives = ["Bright", "Cosmic", "Golden", "Lunar", "Swift", "Quiet", "Solar", "Happy"];
const animals = ["Falcon", "Otter", "Panda", "Lynx", "Tiger", "Fox", "Raven", "Dolphin"];

/** Generates an alias from random entropy, never from a person's identity. */
export function generateNickname(entropy: string): string {
  const hex = entropy.replace(/-/g, "").toLowerCase();
  if (!/^[a-f0-9]{32}$/.test(hex)) throw new Error("invalid_nickname_entropy");
  return `${adjectives[parseInt(hex.slice(0, 2), 16) % adjectives.length]}${animals[parseInt(hex.slice(2, 4), 16) % animals.length]}-${hex.slice(-10)}`;
}

/** Backfills legacy profiles without replacing an alias the owner has chosen. */
export function ensureProfileNickname(profile: { nickname?: string | null }, entropy: () => string): string {
  if (!profile.nickname?.trim()) profile.nickname = generateNickname(entropy());
  return profile.nickname;
}
