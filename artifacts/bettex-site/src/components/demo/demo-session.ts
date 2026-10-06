import type { DemoProfile } from '@workspace/api-client-react';

/** Presentation-only test session. Never an authentication/authorization credential. */
export function isDemoSession(profile: DemoProfile): boolean {
  return profile.authenticated !== true && (profile.provider === 'anonymous' || profile.provider === undefined);
}
