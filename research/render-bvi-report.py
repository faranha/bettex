"""Render verified research citations without changing existing registry records."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parent.parent
registry = json.loads((root / "research/sources.json").read_text())
draft = (root / "research/bettex-bvi-investigacao-profunda.draft.md").read_text()
keys = list(dict.fromkeys(re.findall(r"\[@([a-zA-Z0-9_-]+)\]", draft)))
assert len(keys) >= 25, f"Deep research requires 25 sources, found {len(keys)}"
urls = set()
for key in keys:
    record = registry[key]
    assert record["url"].startswith("https://"), key
    assert (root / record["evidence"]).is_file(), f"Missing evidence: {key}"
    assert record["tier"] in (1, 2, 3), key
    url = record["url"].rstrip("/")
    assert url not in urls, f"Duplicate cited URL: {url}"
    urls.add(url)

numbers = {key: i + 1 for i, key in enumerate(keys)}
report = re.sub(
    r"\[@([a-zA-Z0-9_-]+)\]",
    lambda match: f'[[{numbers[match[1]]}]]({registry[match[1]]["url"]})',
    draft,
).replace("__SOURCE_COUNT__", str(len(keys)))
report += "\n\n## Fontes\n\n"
report += (
    "Numeradas por primeira aparição. Tier 1: fonte oficial/primária "
    "(documentação de plataforma não equivale a lei); Tier 2: análise jurídica "
    "profissional; Tier 3: fonte opinativa/promocional. Evidência limitada "
    "a trecho de busca é indicada, assim como referências históricas.\n\n"
)
for key in keys:
    source = registry[key]
    report += (
        f'{numbers[key]}. [{source["title"]}]({source["url"]}) — '
        f'{source["date"]}; Tier {source["tier"]}. '
        f'Evidência: {source.get("quality", "ver registro de pesquisa")}.\n'
    )
assert not re.search(r"\[@|__SOURCE_COUNT__|\[need source\]|TBD", report)
destination = root / "research/bettex-bvi-investigacao-profunda.md"
destination.write_text(report)
print(json.dumps({
    "report": str(destination.relative_to(root)),
    "sources": len(keys),
    "words": len(report.split()),
    "tier1": sum(registry[k]["tier"] == 1 for k in keys),
    "tier2": sum(registry[k]["tier"] == 2 for k in keys),
    "tier3": sum(registry[k]["tier"] == 3 for k in keys),
    "evidenceVerified": True,
}, ensure_ascii=False))