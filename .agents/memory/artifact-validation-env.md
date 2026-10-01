---
name: Artifact validation environment
description: Required runtime context for manual build commands outside managed workflows.
---

Manual shell builds do not automatically inherit the environment supplied to managed artifact workflows. Supply required artifact-scoped values only for the validation command.

**Why:** A manual Vite build failed on missing PORT while the managed development workflow was healthy. Loading the configuration also required BASE_PATH.

**How to apply:** Use the artifact's verified routing and port context for manual builds. Do not persist project-wide PORT or BASE_PATH values just to make a shell check pass, since different artifacts have their own runtime context.