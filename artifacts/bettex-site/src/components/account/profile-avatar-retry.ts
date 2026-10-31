/** Bounded recovery for transient image failures, including preview restarts. */
export function avatarRetryPlan(defaultSrc: string, attempt: number, nonce: number) {
  const delays = [1000, 3000];
  const delayMs = delays[attempt];
  if (delayMs === undefined) return null;
  const separator = defaultSrc.includes('?') ? '&' : '?';
  return { delayMs, src: `${defaultSrc}${separator}avatar_retry=${nonce}-${attempt + 1}` };
}
