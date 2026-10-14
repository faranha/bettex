"""Prepare responsive Pitch delivery assets; keep large masters outside Git."""
from pathlib import Path
import hashlib
import json
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[3]
WORK = ROOT / "generated-artifacts/pitch-high-resolution"
PUBLIC = ROOT / "artifacts/bettex-site/public"
OUTPUT = PUBLIC / "pitch-heroes-hd"
MANIFEST = ROOT / "artifacts/bettex-site/src/lib/pitch-hero-media.generated.json"
WIDTHS = [960, 1920, 2560, 4096]
GENERATED = [
    "pitch-brazil-community",
    "pitch-token-participation",
    "pitch-product-development",
    "pitch-economy-separation",
]
NATIVE = ["pitch-online-community", "pitch-startup-team"]


def prepare():
    WORK.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    cv2.setNumThreads(4)
    sr = cv2.dnn_superres.DnnSuperResImpl_create()
    sr.readModel(str(WORK / "FSRCNN_x4.pb"))
    sr.setModel("fsrcnn", 4)
    manifest = {}
    masters = []
    previous = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}

    def save(original, image, method, widths=WIDTHS):
        stem = Path(original).stem
        # Content-addressed delivery filenames also invalidate old CDN caches.
        master_digest = hashlib.sha256(image.tobytes()).hexdigest()[:12]
        digest = hashlib.sha256((master_digest + "-webp90-max1mb").encode()).hexdigest()[:12]
        master = WORK / f"{stem}-{master_digest}-master.png"
        if not master.exists() and not cv2.imwrite(str(master), image):
            raise RuntimeError(f"Could not save master: {stem}")
        masters.append(str(master.relative_to(ROOT)))
        sources = []
        for width in widths:
            assert width <= image.shape[1], (stem, width, image.shape)
            height = round(width * image.shape[0] / image.shape[1])
            resized = cv2.resize(image, (width, height), interpolation=cv2.INTER_AREA)
            filename = f"{stem}-{digest}-w{width}.webp"
            target = OUTPUT / filename
            encoded = None
            for quality in [90, 86, 82, 78, 74]:
                success, candidate = cv2.imencode(
                    ".webp", resized, [cv2.IMWRITE_WEBP_QUALITY, quality],
                )
                if success:
                    encoded = candidate
                    if len(candidate) < 1024 * 1024:
                        break
            if encoded is None or len(encoded) >= 1024 * 1024:
                raise RuntimeError(f"Could not save delivery asset: {filename}")
            target.write_bytes(encoded.tobytes())
            sources.append({"path": f"pitch-heroes-hd/{filename}", "width": width})
        manifest[original] = {
            "method": method,
            "masterWidth": image.shape[1],
            "masterHeight": image.shape[0],
            "sources": sources,
        }
        print(stem, image.shape[1], image.shape[0], method, flush=True)

    for name in GENERATED:
        image = cv2.imread(str(ROOT / f"attached_assets/generated_images/{name}.jpg"))
        if image is None:
            raise RuntimeError(f"Missing illustration master: {name}")
        save(f"pitch-illustrations/{name}.webp", sr.upsample(image), "fsrcnn-super-resolution")

    for name in NATIVE:
        image = cv2.imread(str(WORK / f"{name}.jpg"))
        if image is None or image.shape[1] < 4096:
            raise RuntimeError(f"A native full-resolution source is required: {name}")
        save(f"pitch-illustrations/{name}.webp", image, "native-photograph")

    name = "urban-poverty-sao-paulo-2024"
    original = cv2.imread(str(PUBLIC / f"pitch-future/{name}.jpg"))
    native = cv2.imread(str(WORK / f"{name}.jpg"))
    if native is None or native.shape[1] < 4096:
        raise RuntimeError("The original Agência Brasil photograph is required")
    # Recover the existing editorial crop, not a new scene or AI recreation.
    scale = native.shape[1] / original.shape[1]
    preview = cv2.resize(native, (original.shape[1], round(native.shape[0] / scale)))
    matches = cv2.matchTemplate(
        cv2.cvtColor(preview, cv2.COLOR_BGR2GRAY),
        cv2.cvtColor(original, cv2.COLOR_BGR2GRAY),
        cv2.TM_CCOEFF_NORMED,
    )
    _, correlation, _, location = cv2.minMaxLoc(matches)
    if correlation < .9:
        raise RuntimeError(f"Photograph does not match the existing crop: {correlation}")
    top = round(location[1] * scale)
    height = round(original.shape[0] * scale)
    cropped = native[top:top + height, :, :]
    save(f"pitch-future/{name}.jpg", cropped, "native-photograph")
    print("Agência Brasil crop correlation:", round(correlation, 4), flush=True)

    for locale in ["pt", "en", "es"]:
        name = f"pitch-hero-app-cutout-{locale}"
        source = cv2.imread(str(PUBLIC / f"{name}.webp"), cv2.IMREAD_UNCHANGED)
        if source is None or source.shape[2] != 4:
            raise RuntimeError(f"Transparent localized character is required: {locale}")
        rgb = sr.upsample(source[:, :, :3])
        alpha = cv2.resize(
            source[:, :, 3], (rgb.shape[1], rgb.shape[0]),
            interpolation=cv2.INTER_LANCZOS4,
        )
        rgba = np.dstack((rgb, alpha))
        save(f"{name}.webp", rgba, "fsrcnn-super-resolution", [344, 688, 1376])

    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")
    (WORK / "masters.json").write_text(json.dumps(masters, indent=2) + "\n")
    current = {source["path"] for entry in manifest.values() for source in entry["sources"]}
    for entry in previous.values():
        for source in entry["sources"]:
            obsolete = (PUBLIC / source["path"]).resolve()
            if source["path"] not in current and obsolete.parent == OUTPUT.resolve():
                obsolete.unlink(missing_ok=True)


if __name__ == "__main__":
    prepare()
