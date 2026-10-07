import { useSyncExternalStore } from 'react';

// This grants access to the presentation only. APIs authenticate real accounts separately.
const KEY = 'bettex.app.demo-active';
const EVENT = 'bettex-app-session';
function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}
export function startAppSession() {
  sessionStorage.setItem(KEY, 'true');
  window.dispatchEvent(new Event(EVENT));
}
export function endAppSession() {
  sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}
export function useAppSession() {
  return useSyncExternalStore(subscribe, () => sessionStorage.getItem(KEY) === 'true', () => false);
}
