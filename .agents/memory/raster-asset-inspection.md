---
name: Raster asset inspection
description: Visual authenticity and transparency checks, plus font-free raster comparisons.
---

When removing a held prop from a character, reconstruct the space between the limb and torso as real transparency; deleting the prop can expose the original solid silhouette underneath.

**Why:** Removing a football left a blue shirt-colored area between a bent arm and the torso. A preview on white initially hid that the negative space was still filled.

**How to apply:** Inspect the inner arm and hand contours, not just the missing object. Verify alpha inside the opening and opaque pixels on the neighboring garment, then check the character in the actual page.

When verifying high-density responsive images, check the selected resource and its decoded pixel dimensions, not only the element's `naturalWidth`.

**Why:** Width-descriptor `srcset` applies density correction to intrinsic dimensions, so a correctly selected high-resolution file can report a smaller `naturalWidth` and produce a false failure.

**How to apply:** Confirm `currentSrc`, then decode that resource without responsive descriptors or inspect its bitmap dimensions. Test the actual device pixel ratio.

For temporary contact sheets, avoid depending on Python Pillow or ImageMagick montage's default font; use font-free ImageMagick or FFmpeg composition instead.

**Why:** Pillow was unavailable here, and montage failed to resolve a font even without requesting visible labels. A font-free composition worked.

**How to apply:** When comparing multiple generated raster assets, compose them in `/tmp` against a contrasting background rather than installing a package only for visual inspection.

Use screenshots of the real demo UI for device screens in generated marketing
art, with a localized screen for each supported language.

**Why:** Generated phone screens invented labels and balances, including
untranslated or meaningless text. Real screenshots preserve the product's
visual identity and avoid confusing an invented interface with the app.

**How to apply:** Preserve the established character and natural gesture;
replace only the device display, respecting perspective and hand occlusion.
Keep large intermediates out of Git and deploy only optimized artwork.

Do not assume generated images have the aspect ratio requested in the prompt.

**Why:** Four images requested as wide landscape compositions were returned as square images. Prompt wording is not a reliable output-dimension contract.

**How to apply:** Inspect actual dimensions before laying out the images. Preserve their meaningful subjects with an appropriate frame or deliberate crop rather than forcing an assumed ratio.

Confirm actual alpha before repeating background removal because a thumbnail looks opaque.

**Why:** A removed-background preview appeared to retain the source backdrop, but channel inspection and background-pixel sampling confirmed transparent pixels. The cutout rendered correctly over the application's background.

**How to apply:** Inspect opacity and representative background pixels with ImageMagick, then view the image over a contrasting background or in the app. Do not infer transparency from a thumbnail alone.

Check graphics-tool version compatibility before using older transparency commands, and do not treat output-file existence as success.

**Why:** ImageMagick 7 rejected an older flood-fill drawing primitive but still left an opaque PNG output. A later successful inspection command also masked the conversion failure in the shell's final status.

**How to apply:** Use syntax supported by the installed major version, stop shell pipelines on conversion errors, and verify real alpha before integrating the result.

Visually verify the identity of logos returned by image search; do not trust a result's title or filename as proof of authenticity.

**Why:** A result labeled as a football club crest actually contained a generic dragon shield with a baked-in checkerboard background. Another source provided the recognizable club mark with genuine transparency.

**How to apply:** Inspect the actual downloaded image before integrating it, compare it with the expected brand identity, and verify alpha. Prefer identifiable source assets over decorative or generated-looking search matches.