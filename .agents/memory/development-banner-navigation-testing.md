---
name: Sticky navigation test artifacts
description: Preview banners and automatic locator scrolling can produce false mobile-menu failures.
---

When testing public navigation through the development domain, dismiss Replit's development banner before interacting with sticky controls, including after reloads.

**Why:** The injected banner covered the sticky hamburger after scrolling. Playwright's automatic scroll-to-control returned to the top to expose it, while physical pointer input hit the banner instead of the app. These were preview-host effects, not failures of BETTEX's menu.

**How to apply:** Check the actual hit-tested element when a sticky control fails or clicking unexpectedly resets the scroll. Dismiss the platform banner through its close button; do not modify the site's navigation to compensate for it.

An automated locator click can initiate scrolling before pointerdown even without a visible preview banner. A before/after scroll comparison alone does not prove the menu moved the page.

**Why:** A reported dropdown-opening jump occurred before the trigger received pointerdown. Opening the same visible trigger by coordinates preserved scroll position, article, document height and header geometry; dropdown focus used `preventScroll`.

**How to apply:** Compare real pointer/coordinate input with locator input and trace pointerdown, focus and scroll timing. Diagnose the actual event causing movement before changing navigation or scroll-lock behavior.
