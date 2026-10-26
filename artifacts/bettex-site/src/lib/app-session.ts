import { useSyncExternalStore } from 'react';

// This grants access to the presentation only. APIs authenticate real accounts separately.
let active = false;
const listeners = new Set<() => void>();
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}
export function startAppSession() {
  active = true;
  listeners.forEach(callback => callback());
}
export function endAppSession() {
  active = false;
  listeners.forEach(callback => callback());
}
// A browser may restore an old document from its back/forward cache without
// re-running this module. Leaving/restoring it must not restore demo access.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', endAppSession);
  window.addEventListener('pageshow', event => {
    if (event.persisted) endAppSession();
  });
}
export const appSessionSnapshot = () => active;
export function useAppSession() {
  return useSyncExternalStore(subscribe, appSessionSnapshot, () => false);
}
