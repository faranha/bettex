/** Retry temporary transport failures, never authorization or malformed requests. */
export function shouldRetryWalletHistory(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (error instanceof Error && /^history_/.test(error.message)) return false;
  const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : undefined;
  return status === undefined || status === 408 || status === 429 || (status >= 500 && status <= 599);
}
