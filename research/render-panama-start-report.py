"""Render citations and verify provenance of this focused research report."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parent.parent
registry = json.loads((root / "research/sources.json").read_text())
draft = (root / "research/bettex-panama-inicio-licenciamento.draft.md").read_text()
keys = list(dict.fromkeys(re.findall(r"\[@([\w-]+)\]", draft)))
assert len(keys) >= 15, f"Insufficient Standard sources: {len(keys)}"
urls = set()
for key in keys:
    source = registry[key]
    assert source["url"].startswith(("https://", "http://")), key
    assert source["tier"] in (1, 2, 3), key
    for path in [source["evidence"], *source.get("supplementalEvidence", [])]:
        evidence = root / path
        assert evidence.is_file(), (key, path)
        assert source["url"].rstrip("/") in evidence.read_text(), (key, path)
    assert source["url"].rstrip("/") not in urls, key
    urls.add(source["url"].rstrip("/"))
numbers = {key: i + 1 for i, key in enumerate(keys)}
report = re.sub(
    r"\[@([\w-]+)\]",
    lambda m: f'[[{numbers[m[1]]}]]({registry[m[1]]["url"]})',
    draft,
).replace("__SOURCE_COUNT__", str(len(keys)))
report += "\n\n## Fontes e qualidade da evidência\n\n"
report += ("Numeração por primeira aparição. Tier 1: fonte oficial/primária; "
           "Tier 2: análise jurídica/institucional; Tier 3: apoio/promocional. "
           "Documento antigo, texto de trabalho, captura parcial ou trecho de "
           "busca não certifica vigência integral em outubro de 2026. "
           "Página do regulamento e anexo são duas referências, mas a mesma "
           "família documental; não representam confirmação independente.\n\n")
for key in keys:
    s = registry[key]
    report += (f'{numbers[key]}. [{s["title"]}]({s["url"]}) — {s["date"]}; '
               f'Tier {s["tier"]}. {s.get("quality", "ver registro")}.')
    if s.get("supplementalEvidence"):
        report += " Evidência complementada nesta rodada."
    report += "\n"
assert not re.search(r"\[@|__SOURCE_COUNT__|\[need source\]|TBD", report)
destination = root / "research/bettex-panama-inicio-licenciamento.md"
destination.write_text(report)
print(json.dumps(dict(file=str(destination.relative_to(root)), sources=len(keys),
                      words=len(report.split()), evidenceVerified=True),
                 ensure_ascii=False))