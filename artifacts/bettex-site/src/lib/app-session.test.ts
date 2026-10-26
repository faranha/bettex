import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appSessionSnapshot, startAppSession, endAppSession } from './app-session.ts';

test('demo entry is explicit and logout clears the document-local session', () => {
  endAppSession();
  assert.equal(appSessionSnapshot(), false);
  startAppSession();
  assert.equal(appSessionSnapshot(), true);
  // SPA navigation reuses this module and retains the current presentation.
  assert.equal(appSessionSnapshot(), true);
  endAppSession();
  assert.equal(appSessionSnapshot(), false);
});

test('a new document/module starts signed out even after another document entered', async () => {
  startAppSession();
  const freshDocument = await import(new URL(`./app-session.ts?document=${Date.now()}`, import.meta.url).href);
  assert.equal(freshDocument.appSessionSnapshot(), false);
  assert.equal(appSessionSnapshot(), true);
  endAppSession();
});

test('back/forward cache restoration and leaving a document end demo access', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const browser = new EventTarget();
  Object.defineProperty(globalThis, 'window', { value: browser, configurable: true });
  try {
    const document = await import(new URL(`./app-session.ts?bfcache=${Date.now()}`, import.meta.url).href);
    document.startAppSession();
    browser.dispatchEvent(new Event('pagehide'));
    assert.equal(document.appSessionSnapshot(), false);
    document.startAppSession();
    const restore = new Event('pageshow');
    Object.defineProperty(restore, 'persisted', { value: true });
    browser.dispatchEvent(restore);
    assert.equal(document.appSessionSnapshot(), false);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
