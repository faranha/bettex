/** Bound reads only; never abort or replay a financial mutation on a deadline. */
export async function readDouble2xWithDeadline<T>(
  read: (signal: AbortSignal) => Promise<T>, signal: AbortSignal, timeoutMs = 12000,
): Promise<T> {
  const controller = new AbortController();
  let stop!: () => void;
  let timer!: ReturnType<typeof setTimeout>;
  const interrupted = new Promise<never>((_, reject) => {
    stop = () => { controller.abort(signal.reason); reject(signal.reason ?? new Error('double2x_read_aborted')); };
    timer = setTimeout(() => { controller.abort(); reject(new Error('double2x_read_timeout')); }, timeoutMs);
  });
  if (signal.aborted) stop();
  else signal.addEventListener('abort', stop, { once: true });
  try {
    if (signal.aborted) return await interrupted;
    return await Promise.race([read(controller.signal), interrupted]);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', stop);
  }
}
