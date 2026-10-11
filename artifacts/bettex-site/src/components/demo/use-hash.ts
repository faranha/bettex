import { useEffect, useState } from 'react';

export const DEMO_ANCHOR_EVENT = 'bettex:demo-anchor';
/** Current location hash, kept live across pushState, popstate and hashchange. */
export function useHash(): string {
  const [hash, setHash] = useState(() => typeof window === 'undefined' ? '' : window.location.hash);
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    const types = ['pushState', 'replaceState', 'popstate', 'hashchange'];
    types.forEach(t => window.addEventListener(t, sync)); sync();
    return () => types.forEach(t => window.removeEventListener(t, sync));
  }, []);
  return hash;
}
export const requestAnchor = (id: string) => window.dispatchEvent(new CustomEvent(DEMO_ANCHOR_EVENT, { detail: id }));
