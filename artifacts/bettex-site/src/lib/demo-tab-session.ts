// This random capability is for emulated demo data only, never authentication.
const KEY = 'bettex.demo.tab-session';
let pending: Promise<string> | null = null;
let release: (() => void) | undefined;
let channel: BroadcastChannel | undefined;

function freshToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
}

async function claim(candidate: string): Promise<string> {
  if (navigator.locks) {
    return new Promise<string>((resolve, reject) => {
      void navigator.locks.request(`bettex-demo:${candidate}`, { ifAvailable: true }, async lock => {
        if (!lock) { resolve(claim(freshToken())); return; }
        sessionStorage.setItem(KEY, candidate);
        resolve(candidate);
        await new Promise<void>(done => { release = done; });
      }).catch(reject);
    });
  }
  if (typeof BroadcastChannel === 'undefined') throw new Error('demo_tab_isolation_unavailable');
  const nonce = crypto.randomUUID();
  let collision = false, owned = false;
  channel = new BroadcastChannel('bettex-demo-tab-ownership');
  channel.onmessage = ({ data }) => {
    if (data?.token !== candidate || data.nonce === nonce) return;
    if (data.kind === 'probe' && (owned || nonce < data.nonce)) {
      channel?.postMessage({ kind: 'owned', token: candidate, nonce, recipient: data.nonce });
    }
    if (data.kind === 'owned' && data.recipient === nonce) collision = true;
  };
  channel.postMessage({ kind: 'probe', token: candidate, nonce });
  await new Promise(done => setTimeout(done, 200));
  if (collision) { channel.close(); return claim(freshToken()); }
  owned = true;
  sessionStorage.setItem(KEY, candidate);
  return candidate;
}

export function demoTabToken(): Promise<string> {
  if (!pending) {
    pending = Promise.resolve().then(() => {
      const saved = sessionStorage.getItem(KEY);
      return claim(saved && /^[a-f0-9]{64}$/.test(saved) ? saved : freshToken());
    });
    const attempt = pending;
    // A temporary storage/lock rejection must not poison every later request.
    // Retry the normal ownership check; never fall back to another tab's cookie
    // or rotate an already-saved capability just to hide an initialization error.
    void attempt.catch(() => {
      if (pending === attempt) pending = null;
    });
  }
  return pending;
}

export async function demoTabRequestHeaders(url: string) {
  const path = new URL(url, window.location.origin).pathname;
  return /(?:^|\/)api\/demo(?:\/|$)/.test(path)
    ? { 'X-Bettex-Demo-Session': await demoTabToken() } : null;
}

export async function restartDemoTabSession() {
  const oldRelease = release, oldChannel = channel;
  try {
    const next = await claim(freshToken());
    pending = Promise.resolve(next);
    oldRelease?.();
    oldChannel?.close();
  } catch (error) {
    if (channel !== oldChannel) channel?.close();
    channel = oldChannel;
    release = oldRelease;
    throw error;
  }
}
