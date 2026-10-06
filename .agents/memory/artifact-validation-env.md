---
name: Artifact validation environment
description: Required runtime context for manual build commands outside managed workflows.
---

Manual shell builds do not automatically inherit the environment supplied to managed artifact workflows. Supply required artifact-scoped values only for the validation command.

**Why:** A manual Vite build failed on missing PORT while the managed development workflow was healthy. Loading the configuration also required BASE_PATH.

**How to apply:** Use the artifact's verified routing and port context for manual builds. Do not persist project-wide PORT or BASE_PATH values just to make a shell check pass, since different artifacts have their own runtime context.

Internal loopback-only RPC helpers may become ready while a workflow's port-wait check still times out. Keep them console workflows without public-port readiness rather than exposing an unlocked development signer.

**Why:** The local EVM answered internal requests but the managed port check did not recognize its loopback listener.

**How to apply:** Check helper readiness internally; never bind an unlocked development RPC to all interfaces merely to satisfy preview detection.

A managed workflow can report a port conflict while an older instance of the same artifact's development server is still running.

**Why:** The failed workflow had attempted to start a second server on the port already held by an older instance.

**How to apply:** Verify the process command and working directory before stopping only the stale instance, then restart the existing managed workflow. Do not change the artifact port or create a duplicate workflow to avoid the conflict.

TypeScript project references can retain previously emitted declarations after a shared schema changes.

**Why:** A new schema field was present in source but consumer typechecking continued to reject it until the referenced library was rebuilt.

**How to apply:** Rebuild affected referenced libraries before checking their consumers. A consumer's standalone no-emit check does not regenerate dependency declarations.

An opaque diagnostic-client failure does not establish a production HTTP failure or outage.

**Why:** A diagnostic runner reported only failed requests while an independent HTTP client reached the same deployment. Swallowed exceptions hid whether the request had even reached the server.

**How to apply:** Preserve safe error classifications and distinguish missing response from actual HTTP status. Confirm with an independent HTTP client and deployment logs before changing production code; do not weaken TLS or CSP to make a probe work.