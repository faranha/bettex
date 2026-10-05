---
name: GitHub publication authorization
description: Creator's repository visibility and upload authorization decision.
---

The creator selected `faranha/bettex` and requested it remain public.
After initially declining upload, the creator explicitly instructed: “upload.”

**Why:** The creator revised the upload instruction after being told that
uploading would make the prepared development branch and its contents public.

**How to apply:** Preserve public visibility. Upload the prepared development
branch to this specifically authorized repository, without changing `main`,
force pushing, or deploying production. Do not generalize this authorization
to other public repositories.

The connected GitHub App can read repository metadata, but command-line Git
authentication is separate. Its deploy-key creation request was rejected even
though repository metadata reported admin/push permissions.

**Why:** Those permission fields describe the user's repository role, not proof
of the connector token's administration permissions or native Git credentials.

**How to apply:** Verify effective transport permissions with a credential-safe
Git dry run. Do not reauthorize a healthy API connector merely to repair missing
native Git credentials; use Replit's Git-provider connection flow.
