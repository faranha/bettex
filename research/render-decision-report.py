"""Generate numbered references and validate the decision report's evidence."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parent.parent
registry = json.loads((root / "research/sources.json").read_text())
draft = (root / "research/bettex-jurisdicao-decisao.draft.md").read_text()
keys = list(dict.fromkeys(re.findall(r"\[@([\w-]+)\]", draft)))
assert len(keys) >= 25, f"Insufficient deep-research sources: {len(keys)}"
urls = set()
for key in keys:
    source = registry[key]
    assert source["url"].startswith(("https://", "http://")), key
    evidence = root / source["evidence"]
    assert evidence.is_file(), f"Missing evidence: {key}"
    assert source["url"].rstrip("/") in evidence.read_text(), f"Provenance mismatch: {key}"
    assert source["tier"] in (1, 2, 3), key
    assert source["url"].rstrip("/") not in urls, key
    urls.add(source["url"].rstrip("/"))

numbers = {key: i + 1 for i, key in enumerate(keys)}
report = re.sub(
    r"\[@([\w-]+)\]",
    lambda m: f'[[{numbers[m[1]]}]]({registry[m[1]]["url"]})',
    draft,
).replace("__SOURCE_COUNT__", str(len(keys)))
report += "\n\n## Fontes\n\n"
report += (
    "Numeração por primeira aparição. Tier 1: fonte oficial ou primária; "
    "termos/documentação de plataforma não equivalem a lei. Tier 2: análise "
    "jurídica/institucional. Tier 3: comunicação promocional ou fonte de apoio. "
    "Uma fonte histórica, parcial ou limitada a snippet não certifica a lei "
    "consolidada em outubro/2026. Alegações específicas de um contrato ou "
    "anúncio são atribuídas à respectiva fonte, não tratadas como regra universal.\n\n"
)
for key in keys:
    s = registry[key]
    report += (
        f'{numbers[key]}. [{s["title"]}]({s["url"]}) — {s["date"]}; '
        f'Tier {s["tier"]}. Evidência: {s.get("quality", "ver registro")}.\n'
    )
assert not re.search(r"\[@|__SOURCE_COUNT__|\[need source\]|TBD", report)
destination = root / "research/bettex-jurisdicao-decisao.md"
destination.write_text(report)
print(json.dumps({
    "file": str(destination.relative_to(root)),
    "sources": len(keys),
    "words": len(report.split()),
    "tiers": {str(t): sum(registry[k]["tier"] == t for k in keys) for t in (1, 2, 3)},
    "evidenceVerified": True,
}, ensure_ascii=False))