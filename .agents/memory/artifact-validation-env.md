---
name: Artifact validation environment
description: Required runtime context for manual build commands outside managed workflows.
---

Manual shell builds do not automatically inherit the environment supplied to managed artifact workflows. Supply required artifact-scoped values only for the validation command.

**Why:** A manual Vite build failed on missing PORT while the managed development workflow was healthy. Loading the configuration also required BASE_PATH.

**How to apply:** Use the artifact's verified routing and port context for manual builds. Do not persist project-wide PORT or BASE_PATH values just to make a shell check pass, since different artifacts have their own runtime context.

A managed workflow can report a port conflict while an older instance of the same artifact's development server is still running.

**Why:** The failed workflow had attempted to start a second server on the port already held by an older instance.

**How to apply:** Verify the process command and working directory before stopping only the stale instance, then restart the existing managed workflow. Do not change the artifact port or create a duplicate workflow to avoid the conflict.