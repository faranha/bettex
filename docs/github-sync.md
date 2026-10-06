# Coordinated GitHub synchronization

## Current activation state

**Automatic synchronization implemented locally; activation pending authenticated Git transport.**

The creator explicitly authorized upload to public `faranha/bettex`, without
changing its visibility or `main`. The repository-specific
`authorizedPublicRepository` configuration permits this destination only.
Other public repositories remain blocked. The GitHub API connection is healthy,
but native Git push authentication is not configured; the connector also denied
temporary deploy-key creation. No upload has been verified.

Readiness check on 2026-10-06: a development-branch push dry run was rejected
with an authentication error. The watcher is intentionally paused while the
creator connects native Git transport; do not resume it before authorization.
Official Starknet documentation sections named `build` are retained source,
not compiled output. Their content and history still pass through the same
secret, file-size and excluded-path checks.

During initial implementation, the repository had only Replit internal
backup/task remotes and no authorized GitHub connection. The creator has now
selected `https://github.com/faranha/bettex.git` as credential-free `origin`.
The configured development branch is `development/bettex`. Existing history is
preserved. No repository was made public, no production branch was merged, and
no deployment was initiated.

Replit's [Git pane documentation](https://docs.replit.com/features/workspace-tools/git-interface)
describes staging, committing and pushing manually. Shell operations updating
the Git pane do not mean uncommitted workspace changes are automatically
uploaded to GitHub. This service implements the required automation separately.

## Mechanism

`scripts/github-sync/cli.mjs` drives one service shared by task completion and
the watcher. Both use an atomic operation lock inside Git metadata. A separate
daemon lock prevents duplicate watchers. Git metadata holds status and bounded,
sanitized logs, never tracked files.

- Startup attempts recovery of pending changes and unpushed commits.
- The watcher polls every 10 seconds and waits for 90 seconds without changes.
- A second content-fingerprint check detects in-progress writes.
- Existing user staging is not commandeered.
- Only the configured development branch can be checkpointed or pushed.
- Anonymous GitHub visibility checks reject public repositories and fail closed
  on service/rate-limit errors. An anonymous 404 is accepted only together with
  the authenticated Git fetch proving repository access; no API token is sent.
- The creator may explicitly authorize one public owner/repository through
  `authorizedPublicRepository`. This is an exact-match exception, not a global
  public-upload bypass; changing the destination requires separate authorization.
- The full staged index is checked for secret patterns, excluded artifacts,
  symlinks/nested repositories, and oversized files.
- Reachable Git history is scanned before a push, including secrets removed
  from current files. Successful history checks are reused only along verified ancestry.
- `pnpm sync:check` must pass before creating a checkpoint.
- Files and index must remain unchanged during checks; otherwise the checkpoint
  is deferred. Logs and status cannot trigger the watcher.
- Concurrent external staging is preserved. If ownership becomes ambiguous,
  the index remains intact and requires an explicit review before resuming.
- Task commits use the English task summary. Fallback commits identify the
  affected product domains and changed-file count.
- Remote refs are fetched before and after checks. Clean, safe updates can
  fast-forward. Dirty remote-ahead state and divergence stop the affected run.
- Pushes target only the development branch and never use force.
- `ls-remote` must advertise the exact resulting commit before success is recorded.
- Failed pushes retain the local commit. Failures retry from 15 seconds, doubling
  up to 900 seconds. Invalid authorization requires reconnection; the service
  does not invent credentials or bypass repository policy.
- Conflict checks recur automatically. Once a developer resolves the conflict,
  the next eligible run resumes.

`github-sync.config.json` contains non-secret configuration. Do not replace the
checks with a successful no-op. `allowLocalRemote` is an isolated-test option,
not evidence of GitHub activation.

## Activation: exact external steps

1. Connect GitHub through Replit's supported connection flow.
2. Supply an existing **private** repository URL or choose private repository
   creation. Public upload requires explicit creator authorization for the exact
   destination. Keep the license/asset ownership review separate from visibility.
3. Authorize Git transport with Replit's Git provider credential manager, SSH
   agent, or Git Credential Manager. An API-only connection is not proof that
   command-line Git can push. Grant repository contents read/write and the
   permissions required to update workflow files; respect branch protections.
4. Configure a credential-free remote and the development branch:

   ```sh
   git remote add origin https://github.com/OWNER/PRIVATE-REPOSITORY.git
   git switch development/bettex
   git config user.name "YOUR GIT AUTHOR NAME"
   git config user.email "YOUR PRIVATE GIT COMMIT EMAIL"
   git ls-remote --heads origin
   pnpm sync:once -- "Prepare BETTEX for technical review and coordinated synchronization"
   pnpm sync:status
   ```

   If `origin` already exists, inspect it instead of overwriting it. Credentials
   must not appear in the URL. Git author identity is deliberately not guessed
   or replaced by automation.

5. Once credentials work, resume the paused watcher and synchronize:

   ```sh
   pnpm sync:resume
   pnpm sync:once -- "Prepare BETTEX for GitHub review"
   pnpm sync:status
   ```

6. Verify `lastPushCommit` against the real GitHub branch and confirm Actions
   runs. Only then describe automatic synchronization as active.

Before the first upload, review retained historic uploads and asset provenance.
The pattern scan is not an exhaustive privacy or rights audit. History is not
rewritten automatically. If a real secret is discovered, revoke/rotate it first,
identify the affected path/category/commit without publishing its value, and
coordinate any history remediation with collaborators.

## Operations

```sh
pnpm sync:watch       # foreground watcher; managed by the github-sync workflow
pnpm sync:once -- "English task completion summary"
pnpm sync:status
pnpm sync:pause       # intentional pause persists across watcher restarts
pnpm sync:resume
pnpm sync:test        # isolated local remotes, no production credentials
```

In Replit, start/stop/restart the `github-sync` workflow using workflow controls.
Outside Replit, run the watcher under your process manager or `dev:local`.
Stop a foreground watcher with Ctrl-C; it releases the daemon lock. A stale
dead-process lock is recovered only after a grace period.

Status shows repository, configured/current branch, watcher activity, pause,
pending files, commits awaiting push (null until a remote ref is known),
last checkpoint/push, latest sanitized error, findings and next retry.
It does not contact GitHub by itself; run synchronization to refresh remote state.

## Conflict recovery

Use `git status`, inspect `git log --left-right HEAD...origin/development/bettex`,
and preserve local files before making a recovery decision. Resolve a merge or
rebase explicitly under the team's branching policy. Automation does not stash,
choose resolutions, rebase, discard files, or overwrite another developer.
Finish/unstage user-owned staging intentionally before resuming.

## Execution limitation

A paused or inactive workspace cannot run a local process. The watcher has
**no always-on guarantee** when the workspace stops. Start it with the workspace
and complete `sync:once` at the end of every AI task. Startup recovery and retry
preserve work; they do not eliminate the need for workspace execution time.

The local regression suite exercises real Git commits/pushes against temporary
bare repositories, including failure and divergence. That is not a verified push
to the user's GitHub repository.
