"""Verify synthesis volume, protected structure, and reviewed rule conditions."""
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
from documentation_synthesis_rules import verify_rules

app = Path(__file__).resolve().parents[1]
baseline = json.loads((app / "scripts/fixtures/documentation-synthesis-baseline.json").read_text())
catalog = json.loads((app / "src/lib/locales/documentation-synthesis.json").read_text())
source = json.loads((app / "src/lib/locales/translations.json").read_text())

for key, entry in catalog.items():
    assert key in source, f"Unknown editorial source: {key}"
    assert set(entry) == {"pt", "en", "es"}, f"Incomplete editorial languages: {key}"
    assert all(value.strip() for value in entry.values()), f"Empty editorial content: {key}"


class Content(HTMLParser):
    """Read only the prerendered React root, not metadata or asset tags."""
    def __init__(self):
        super().__init__()
        self.depth = 0
        self.skip = 0
        self.parts = []
        self.structure = []
        self.paragraphs = []
        self.paragraph_parts = None

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if not self.depth:
            if tag == "div" and props.get("id") == "root":
                self.depth = 1
            return
        if tag == "div":
            self.depth += 1
        if tag in ("script", "style"):
            self.skip += 1
        if tag == "p":
            self.paragraph_parts = []
        for key in ("id", "href", "src"):
            if key in props:
                self.structure.append([tag, key, props[key]])

    def handle_endtag(self, tag):
        if not self.depth:
            return
        if tag == "p" and self.paragraph_parts is not None:
            self.paragraphs.append(" ".join(" ".join(self.paragraph_parts).split()))
            self.paragraph_parts = None
        if tag == "div":
            self.depth -= 1
        if tag in ("script", "style"):
            self.skip -= 1

    def handle_data(self, text):
        if self.depth and not self.skip:
            self.parts.append(text)
            if self.paragraph_parts is not None:
                self.paragraph_parts.append(text)


digest = lambda value: hashlib.sha256(value.encode()).hexdigest()
for route, expected in baseline["routes"].items():
    file = app / "dist/public" / route.strip("/") / "index.html"
    page = Content()
    page.feed(file.read_text())
    text = " ".join(" ".join(page.parts).split())
    assert text, f"Empty rendered content: {route}"
    structure = json.dumps(page.structure, ensure_ascii=False, separators=(",", ":"))
    assert digest(structure) == expected["structureSha256"], f"Removed or changed block/link/image: {route}"
    if "textSha256" in expected:
        assert digest(text) == expected["textSha256"], f"Approved page text changed: {route}"
        print(f"{route}: approved text unchanged")
    else:
        # The creator explicitly removed download options, not archived files.
        assert "documentation-downloads" not in file.read_text(), f"Download controls restored: {route}"
        assert not any(key == "href" and value.startswith("/downloads/")
                       for _, key, value in page.structure), f"Download links restored: {route}"
        language = "en" if route.startswith("/en/") else "es" if route.startswith("/es/") else "pt"
        verify_rules(page.paragraphs, language, "site")
        suffix = "" if language == "pt" else f"-{language}"
        download = app / f"public/downloads/bettex-documentacao{suffix}.md"
        verify_rules(download.read_text().splitlines(), language, "download")
        count = len(text.split())
        reduction = 100 * (1 - count / expected["words"])
        if route == "/documentacao":
            assert 32.8 <= reduction <= 33.2, f"Portuguese reduction outside one-third target: {reduction:.2f}%"
        else:
            assert 29 <= reduction <= 37, f"Localized synthesis drift: {route}: {reduction:.2f}%"
        print(f"{route}: {expected['words']} → {count} words ({reduction:.2f}% reduction); reviewed rule conditions, anchors, links and images verified")

print("Documentation synthesis: reviewed original conditions verified on rendered pages and downloads; homepage/Pitch protected in PT/EN/ES. Automated checks complement semantic review.")
