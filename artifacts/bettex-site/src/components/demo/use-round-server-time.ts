import { useEffect, useRef, useState } from 'react';
import { roundServerTime, syncRoundClock, type RoundClockAnchor } from './staking-clock';

/** Advance server time locally between polls, without accepting a backward reading. */
export function useRoundServerTime(serverNow: string | undefined, roundKey: string | null) {
  const [, setN] = useState(0);
  const anchor = useRef<{ round: string | null; reading: RoundClockAnchor | null }>({ round: null, reading: null });
  const sn = serverNow ? Date.parse(serverNow) : NaN;
  useEffect(() => {
    if (!Number.isFinite(sn)) return;
    const previous = anchor.current.round === roundKey ? anchor.current.reading : null;
    anchor.current = { round: roundKey, reading: syncRoundClock(previous, sn, performance.now()) };
  }, [sn, roundKey]);
  useEffect(() => {
    const interval = window.setInterval(() => setN(k => k + 1), 100);
    return () => window.clearInterval(interval);
  }, []);
  return anchor.current.reading
    ? roundServerTime(anchor.current.reading, performance.now())
    : Number.isFinite(sn) ? sn : Date.now();
}
