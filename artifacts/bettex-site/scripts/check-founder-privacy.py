"""Prevent the reserved founder identity from returning to public materials."""
import re
import json
from pathlib import Path
from zipfile import ZipFile

app = Path(__file__).resolve().parents[1]
given = "Fre" + "d"
family = "Aze" + "vedo"
identity = re.compile(
    given + r"[\s_-]*" + family + r"|"
    + given + family + r"85|SOS\s*(?:Jogador|Jugador)|Player\s+SOS",
    re.I,
)
failures = []
founder = json.loads((app / "src/lib/growth-strategy.json").read_text())["founder"]
if set(founder) - {"biography", "bettexEarnings"}:
    failures.append("Founder presentation must contain only anonymous biography and token earnings rules.")
text_extensions = {".tsx", ".ts", ".js", ".mjs", ".json", ".html", ".md", ".css", ".svg", ".map"}
for root in (app / "src", app / "public", app / "dist"):
    if not root.exists():
        continue
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if identity.search(path.name):
            failures.append(str(path.relative_to(app)))
        if path.suffix in text_extensions or path.suffix == ".pdf":
            content = path.read_bytes().decode("utf-8", errors="ignore")
        elif path.suffix in {".docx", ".xlsx"}:
            with ZipFile(path) as archive:
                content = "\n".join(archive.read(n).decode("utf-8", errors="ignore")
                                    for n in archive.namelist() if n.endswith(".xml"))
        else:
            continue
        if identity.search(content):
            failures.append(str(path.relative_to(app)))
if failures:
    raise SystemExit("Founder identity in public materials:\n" + "\n".join(sorted(set(failures))))
print("Founder privacy: source, translations, exports and build contain no personal identity.")
