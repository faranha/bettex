"""Catch translated catalogues that were bypassed by rendered React content."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

root = Path(__file__).resolve().parent.parent
messages = json.loads((root / "src/lib/locales/translations.json").read_text())

class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.text = []
    def handle_starttag(self, tag, attrs):
        if tag in ("style", "script"):
            self.skip += 1
    def handle_endtag(self, tag):
        if tag in ("style", "script"):
            self.skip -= 1
    def handle_data(self, text):
        if not self.skip and text.strip():
            self.text.append(re.sub(r"\s+", " ", text).strip())

failures = []
for language, documentation in (("en", "documentation"), ("es", "documentacion")):
    for page in ("index", "pitch", documentation, "demo"):
        file = root / "dist/public" / language / f"{page}.html"
        parser = VisibleText()
        parser.feed(file.read_text())
        untranslated = sorted({
            text for text in parser.text
            if text not in ("Português", "English", "Español")
            and len(text) > 3 and text in messages
            and messages[text][language] != text
        })
        if untranslated:
            failures.append(f"{language}/{page}: {untranslated[:12]}")
if failures:
    raise ValueError("Rendered content bypassed localization:\n" + "\n".join(failures))
print("Rendered localization: all 8 EN/ES pages contain no untranslated source messages.")