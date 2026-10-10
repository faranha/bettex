"""Measure principal documentation consistently, excluding marked references."""
import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class Copy(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.principal = []
        self.reference = []
        self.chapters = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "article" and "whitepaper__chapter" in attrs.get("class", "").split():
            self.chapters.append(attrs.get("id"))
        if tag not in VOID:
            self.stack.append((tag, attrs))

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def handle_data(self, text):
        if not any("whitepaper__chapter" in attrs.get("class", "").split() for _, attrs in self.stack):
            return
        if any(tag in {"script", "style", "svg"} for tag, _ in self.stack):
            return
        reference = any(
            "data-documentation-reference" in attrs
            or "whitepaper__technical" in attrs.get("class", "").split()
            for _, attrs in self.stack
        )
        (self.reference if reference else self.principal).append(text)


def measure():
    result = {}
    for lang, file in (("pt", "documentacao.html"), ("en", "en/documentation.html"), ("es", "es/documentacion.html")):
        path = ROOT / "artifacts/bettex-site/dist/public" / file
        if not path.is_file():
            raise FileNotFoundError(path)
        parser = Copy()
        parser.feed(path.read_text())
        result[lang] = {
            "chapters": len(parser.chapters),
            "principal_words": len(re.findall(r"\S+", " ".join(parser.principal))),
            "reference_words": len(re.findall(r"\S+", " ".join(parser.reference))),
            "method": "All chapter text, irrespective of selection; excludes SVG, script/style and marked technical reference.",
        }
    return result


if __name__ == "__main__":
    args = argparse.ArgumentParser()
    args.add_argument("--output", type=Path, required=True)
    target = args.parse_args().output
    target.parent.mkdir(parents=True, exist_ok=True)
    results = measure()
    target.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(results, ensure_ascii=False, indent=2))
