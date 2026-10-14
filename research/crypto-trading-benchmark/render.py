"""Render citations deterministically from the research source registry."""
from pathlib import Path
import json
import os
import re

ROOT = Path(__file__).resolve().parents[2]
AREA = ROOT / "research/crypto-trading-benchmark"
registry = json.loads((AREA / "sources.json").read_text())
sources = registry["sources"]
by_key = {source["key"]: source for source in sources}
assert len(by_key) == len(sources), "Duplicate source keys"
assert len({source["url"] for source in sources}) == len(sources), "Duplicate URLs"

for source in sources:
    assert re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", source["key"])
    assert source["url"].startswith("https://")
    assert (ROOT / source["evidencePath"]).is_file(), source["evidencePath"]


def render(draft_name: str, output: Path, minimum_sources: int) -> dict:
    draft = (AREA / draft_name).read_text()
    ordered = []

    def citation(match):
        key = match.group(1)
        if key not in by_key:
            raise ValueError(f"Unregistered citation: {key}")
        if key not in ordered:
            ordered.append(key)
        return f"[[{ordered.index(key) + 1}]]({by_key[key]['url']})"

    text = re.sub(r"\[@([a-z0-9-]+)\]", citation, draft)
    assert len(ordered) >= minimum_sources, len(ordered)
    lines = text.splitlines()
    lines.insert(2, f"**Fontes citadas:** {len(ordered)}  ")
    text = "\n".join(lines).rstrip() + "\n\n## Fontes citadas\n\n"
    for number, key in enumerate(ordered, 1):
        source = by_key[key]
        evidence = "página arquivada" if source["evidenceType"] == "fetched" else "excerto arquivado"
        evidence_path = Path(os.path.relpath(
            ROOT / source["evidencePath"], output.parent
        )).as_posix()
        text += (
            f"{number}. [{source['title']}]({source['url']}) — "
            f"Publicação/atualização: {source['publishedDate']}; Tier {source['tier']}; "
            f"[{evidence}]({evidence_path}). Consulta: 14/10/2026.\n"
        )
    assert not re.search(r"\[@|\bTBD\b|\[need source\]", text)
    output.write_text(text)
    return {"path": str(output.relative_to(ROOT)), "citedSources": len(ordered)}


if __name__ == "__main__":
    results = [
        render("report-draft.md", AREA / "report.md", 25),
        render("bettex-synthesis-draft.md", ROOT / "docs/trading-market-benchmark.md", 15),
    ]
    print(json.dumps(results, ensure_ascii=False, indent=2))
