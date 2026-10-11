"""Check the published narrative and every current localized download."""
from html.parser import HTMLParser
from pathlib import Path
from zipfile import ZipFile
import re
import xml.etree.ElementTree as ET


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attributes):
        if tag in ("script", "style"):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = max(0, self.skip - 1)

    def handle_data(self, text):
        if not self.skip:
            self.parts.append(text)


def visible_html(source):
    parser = VisibleText()
    parser.feed(source)
    return " ".join(parser.parts)


fiscal = re.compile(
    r"\b(?:tributos?|tributação|tributári[oa]s?|impostos?|fiscal|fiscais|"
    r"tax|taxes|taxation|withholding|impuestos?|tributaci[oó]n|retenciones fiscales)\b",
    re.I,
)
corporate = re.compile(
    r"empresa privada a constituir|Entidade em etapa posterior|A entidade será avaliada|"
    r"company to be incorporated|empresa por constituir|"
    r"(?:constituição|formalização).{0,100}(?:etapa posterior|prioridades imediatas|curto prazo)",
    re.I,
)


def check(path, text):
    assert not fiscal.search(text), f"{path}: discarded fiscal narrative"
    assert not corporate.search(text), f"{path}: discarded company formation"


app = Path(__file__).resolve().parent.parent
routes = (
    "", "pitch", "documentacao", "en", "en/pitch", "en/documentation",
    "es", "es/pitch", "es/documentacion",
)
for route in routes:
    path = app / "dist/public" / route / "index.html"
    check(path, visible_html(path.read_text()))

count = 0
for stem in (
    "bettex-documentacao", "bettex-entidade-unica",
    "bettex-tokenomics", "bettex-taxas-fundacao",
):
    for path in (app / "public/downloads").glob(stem + "*"):
        if path.suffix == ".html":
            text = visible_html(path.read_text())
        elif path.suffix == ".md":
            text = path.read_text()
        elif path.suffix == ".pdf":
            # The maintained exporter uses uncompressed WinAnsi PDF streams.
            text = path.read_bytes().decode("cp1252")
        elif path.suffix in (".docx", ".xlsx"):
            with ZipFile(path) as archive:
                text = " ".join(
                    " ".join(ET.fromstring(archive.read(name)).itertext())
                    for name in archive.namelist() if name.endswith(".xml")
                )
        else:
            continue
        check(path, text)
        count += 1
assert count == 30, f"Expected all 30 localized documentation downloads, found {count}"
print(f"DeFi narrative: {len(routes)} rendered routes and {count} downloads checked; no fiscal or corporate formation model.")
