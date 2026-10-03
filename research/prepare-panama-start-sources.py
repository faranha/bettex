"""Register verified Panama start/licensing evidence without duplicate URLs."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
rp = root / "research/sources.json"
registry = json.loads(rp.read_text())
by_url = {s["url"].rstrip("/"): k for k, s in registry.items()}
mapping = {}
overrides = {
    "pa-start-parent-acuerdo-full": ("SMV — Texto Único do Acuerdo 5-2004", "23/07/2004; texto único disponibilizado na página atualizada em 22/01/2025", 1),
    "pa-start-parent-licence2026": ("SMV — Resolução 79-26: licença de administrador de investimentos", "17/03/2026", 1),
    "pa-start-other-02": ("JCJ — Resolução 11: jogos pela Internet", "06/03/2020; anteriores às alterações de 2026", 1),
    "pa-start-other-01": ("Chambers — Blockchain & Crypto-Assets 2026, Panamá: Trends and Developments", "11/06/2026", 2),
    "pa-start-token-02": ("Chambers — Fintech 2026, Panamá", "31/03/2026", 2),
}
for p in sorted((root / "research/sources").glob("pa-start-*.md")):
    text = p.read_text()
    match = re.search(r"^Source: (https?://\S+)", text, re.M)
    if not match or re.search(r"^Title: .*404", text, re.M):
        continue
    url = match[1].rstrip("/")
    title_match = re.search(r"^Title: (.*)", text, re.M)
    title = title_match[1].strip() if title_match else p.stem
    date = "Data de publicação não identificada; consultado 03/10/2026"
    tier = 2 if "chambers.com" in url else 1
    title, date, tier = overrides.get(p.stem, (title, date, tier))
    quality = "Parcial" if "Truncated:" in text[:1000] else "Integral"
    if url not in by_url:
        key = p.stem
        registry[key] = dict(title=title, url=url, date=date, tier=tier,
                             quality=quality, evidence=str(p.relative_to(root)))
        by_url[url] = key
    else:
        key = by_url[url]
        original = registry[key]["evidence"]
        if original != str(p.relative_to(root)):
            extras = registry[key].setdefault("supplementalEvidence", [])
            if str(p.relative_to(root)) not in extras:
                extras.append(str(p.relative_to(root)))
    mapping[p.stem] = by_url[url]

snippets = [
    ("pa-emprende", "Panamá Emprende — fundamento legal", "https://www.panamaemprende.gob.pa/legal", "Sem data; consultado 03/10/2026", 1, "pa-start-formation-snippets.md"),
    ("pa-ley5", "Lei 5 de 2007 — Aviso de Operação", "https://www.gacetaoficial.gob.pa/pdfTemp/25709/2494.pdf", "11/01/2007; referência histórica", 1, "pa-start-formation-snippets.md"),
    ("pa-ley32", "Lei 32 de 1927 — sociedades anônimas, reprodução OAS", "https://www.oas.org/juridico/spanish/mesicic3_pan_ley32.pdf", "1927; reprodução histórica, não consolidação 2026", 1, "pa-start-formation-snippets.md"),
    ("pa-forum2026", "La Estrella — debate sobre Lei de Ativos Digitais", "https://www.laestrella.com.pa/economia/mercado-de-capitales-debate-ley-de-activos-digitales-en-panama-HI23094030", "09/06/2026", 2, "pa-start-landscape-snippets.md"),
]
for key, title, url, date, tier, filename in snippets:
    evidence = root / "research/sources" / filename
    if not evidence.is_file() or url not in evidence.read_text():
        continue
    if url not in by_url:
        registry[key] = dict(title=title, url=url, date=date, tier=tier,
                             evidence=str(evidence.relative_to(root)),
                             quality="Trecho de busca; não leitura integral")
        by_url[url] = key
    mapping[key] = by_url[url]

rp.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n")
(root / "research/pa-start-citation-map.json").write_text(
    json.dumps(mapping, ensure_ascii=False, indent=2) + "\n")
for name, key in mapping.items():
    print(name, "=>", key, registry[key]["url"])