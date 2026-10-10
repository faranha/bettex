"""Verify public positioning and byte-identical compatibility downloads."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "artifacts/bettex-site"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.text = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i] == tag:
                del self.stack[i:]
                break

    def handle_data(self, text):
        if not any(tag in {"script", "style", "svg"} for tag in self.stack):
            self.text.append(text)


forbidden = {
    "pt": [
        r"liderança da empresa BETTEX", r"Identidade empresarial",
        r"Empresa comercial a constituir", r"Formalização da empresa",
    ],
    "en": [
        r"BETTEX company leadership", r"Business identity",
        r"Commercial company to be incorporated", r"Company formalization",
    ],
    "es": [
        r"liderazgo de la empresa BETTEX", r"Identidad empresarial",
        r"Empresa comercial por constituir", r"Formalización de la empresa",
    ],
}
routes = {
    "pt": ["index.html", "pitch.html", "documentacao.html"],
    "en": ["en/index.html", "en/pitch.html", "en/documentation.html"],
    "es": ["es/index.html", "es/pitch.html", "es/documentacion.html"],
}
results = {"public_routes": [], "compatibility_downloads": []}
for language, files in routes.items():
    for file in files:
        path = APP / "dist/public" / file
        if not path.is_file():
            raise FileNotFoundError(path)
        parser = Text()
        parser.feed(path.read_text())
        text = " ".join(" ".join(parser.text).split())
        assert "DeFi" in text, f"{file}: product positioning missing"
        for pattern in forbidden[language]:
            assert not re.search(pattern, text, re.I), f"{file}: obsolete institution: {pattern}"
        results["public_routes"].append({"language": language, "file": file, "verified": True})
    suffix = "" if language == "pt" else f"-{language}"
    for ext in ("md", "html", "docx", "pdf"):
        old = APP / "public/downloads" / f"bettex-entidade-unica{suffix}.{ext}"
        new = APP / "public/downloads" / f"bettex-documentacao{suffix}.{ext}"
        assert old.is_file() and new.is_file(), f"Missing download: {old.name}/{new.name}"
        assert old.read_bytes() == new.read_bytes(), f"Divergent compatible download: {old.name}"
        results["compatibility_downloads"].append({"old": old.name, "new": new.name, "identical": True})
    old = APP / "public/downloads" / f"bettex-taxas-fundacao{suffix}.xlsx"
    new = APP / "public/downloads" / f"bettex-tokenomics{suffix}.xlsx"
    assert old.read_bytes() == new.read_bytes(), f"Divergent workbook: {old.name}"
    results["compatibility_downloads"].append({"old": old.name, "new": new.name, "identical": True})

output = ROOT / "generated-artifacts/editorial-revision/public-verification.json"
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
print(f'Editorial revision: {len(results["public_routes"])} public routes and {len(results["compatibility_downloads"])} compatible downloads verified.')
