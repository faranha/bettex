---
name: Development banner in navigation checks
description: An injected preview banner can obstruct sticky navigation and produce false failures.
---

When testing public navigation through the development domain, dismiss Replit's development banner before interacting with sticky controls, including after reloads.

**Why:** The injected banner covered the sticky hamburger after scrolling. Playwright's automatic scroll-to-control returned to the top to expose it, while physical pointer input hit the banner instead of the app. These were preview-host effects, not failures of BETTEX's menu.

**How to apply:** Check the actual hit-tested element when a sticky control fails or clicking unexpectedly resets the scroll. Dismiss the platform banner through its close button; do not modify the site's navigation to compensate for it.
