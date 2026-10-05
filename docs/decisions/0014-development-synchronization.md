# Coordinated development synchronization and clean-clone execution

## Context

Private GitHub technical review requires reproducible execution and actual
automatic upload, not a manual Git-pane recommendation or GitHub Actions
confused with a local file watcher. Existing domain architecture, economics,
history and financial authorization remain unchanged.

## Decision

Use a development-only Node/Git service with one shared operation lock for task
completion and background fallback. Keep it outside financial domains and the
customer interface. Store operational state/logs under Git metadata. Check
staged files and reachable history; checkpoint only stable checked changes;
fetch, refuse divergence, push without force and verify the advertised commit.
Preserve concurrent staging and local work on failure.

GitHub authorization/private repository selection are external prerequisites.
Internal Replit remotes never count as GitHub. An inactive workspace cannot
provide always-on synchronization.

The creator subsequently authorized public upload to `faranha/bettex`, leaving
its visibility and `main` unchanged. An exact owner/repository configuration
allows this destination; other public destinations retain the default rejection.

Provide a Linux clean-clone launcher with explicit ports and an opt-in Vite API
proxy only outside Replit. Retain Replit's existing artifact routing.
Development without Clerk keys may use existing native test-account
authentication; production installs Clerk unconditionally and fails closed.
No mock identity is invented. Execution remains paused and no EVM is started
by the launcher.

## Alternatives and consequences

- Manual Git alone fails the automatic-fallback requirement.
- Independent commit/push scripts risk overlapping index and history changes.
- Auto-stash/rebase/force push would conceal conflicts and risk losing work.
- GitHub Actions cannot observe uncommitted edits in an inactive workspace.
- An additional public Git-control API would unnecessarily expose permissions.

Keep Linux as the currently verified platform; do not promise native macOS or
Windows support while existing platform-specific dependency overrides remain.
Grant review distinguishes local engineering evidence from public-testnet,
real-provider, independent-audit and production evidence.

## Verification and migration criteria

Isolated real Git remotes cover automatic detection/push, remote verification,
no-op behavior, coordinated triggers, failed pushes, recovery, secret history,
staging ownership and conflict resolution. Clean-copy installation/build/startup
uses a separate temporary PostgreSQL cluster without production credentials.
Only a verified push to the actual authorized GitHub remote activates
the operational synchronization claim.
