"""Merge decision-research metadata, verifying actual saved source provenance."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
registry_path = root / "research/sources.json"
registry = json.loads(registry_path.read_text())
by_url = {v["url"].rstrip("/"): k for k, v in registry.items()}
snapshots = {}
for p in (root / "research/sources").glob("*.md"):
    head = p.read_text()[:1200]
    match = re.search(r"^Source: (https?://\S+)", head, re.M)
    if match:
        snapshots.setdefault(match[1].rstrip("/"), []).append(p)

mapping = {}
unverified = []
for metadata_path in sorted((root / "research").glob("decision-*-source-metadata.json")):
    slug = metadata_path.name.removesuffix("-source-metadata.json")
    for index, source in enumerate(json.loads(metadata_path.read_text())["sources"], 1):
        url = source["url"].rstrip("/")
        if not url.startswith(("https://", "http://")):
            unverified.append(url)
            continue
        evidence = root / source["evidence"]
        candidates = snapshots.get(url, [])
        if not evidence.is_file() or url not in evidence.read_text():
            if candidates:
                evidence = max(candidates, key=lambda p: p.stat().st_size)
            else:
                for fallback in (
                    root / f"research/sources/{slug}-snippets.md",
                    root / "research/sources/decision-onshore-territorial-snippets.md",
                ):
                    if fallback.is_file() and url in fallback.read_text():
                        evidence = fallback
                        break
        if not evidence.is_file() or url not in evidence.read_text():
            unverified.append(url)
            continue
        source["evidence"] = str(evidence.relative_to(root))
        source["date"] = source["date"] or "Sem data; consultado 03/10/2026"
        if "snippet" in evidence.name:
            source["quality"] = "Trecho de busca; não é leitura integral"
        if url == "https://polymarket.com/tos":
            source["quality"] = "Página parcial com bloqueio e link ao documento de termos"
        if url not in by_url:
            key = f"{slug}-{index:02}"
            while key in registry:
                key += "-new"
            registry[key] = source
            by_url[url] = key
        mapping[url] = by_url[url]

# Parent-research sources have verified provenance, without inferred metadata.
parents = [
    ("decision-svg-guidelines", "decision-parent-svg-guidelines.md", "SVG FSA — Guidelines for Virtual Asset Businesses", "18/11/2025; arquivo publicado em janeiro/2026", 1, "Integral"),
    ("decision-svg-vaba", "decision-parent-svg-vaba.md", "SVG — Virtual Asset Business Act 2022", "2022; início confirmado em 31/05/2025", 1, "Integral"),
    ("decision-svg-faq", "decision-parent-svg-faq.md", "SVG FSA — Virtual Asset Businesses e FAQ", "Página vigente consultada 03/10/2026", 1, "Integral"),
    ("decision-bvi-pif-guidelines", "decision-parent-bvi-fund-guidelines.md", "FSC — Private Investment Funds Regime Guidelines", "2019; referência histórica ao regime", 1, "Integral"),
    ("decision-bvi-appleby", "decision-parent-appleby2026.md", "Appleby — Guide to Blockchain & Crypto-Assets in BVI 2026", "17/07/2026", 2, "Integral"),
    ("decision-sbobet-full", "decision-parent-sbobet-full.md", "SBOBET — Terms and Conditions, cláusula 3.12", "Sem data; consultado 03/10/2026", 1, "Integral; contrato de um operador"),
    ("decision-poly-tos", "decision-parent-polymarket-embedded-tos.md", "Polymarket International — Terms of Use, documento ligado pelo site oficial", "11/08/2026", 1, "Integral; documento público incorporado na página oficial"),
    ("decision-bvi-fee-order", "decision-parent-bvi-fees-order2022.md", "BVI Business Companies — Amendment of Schedule 1 (No. 2) Order 2022", "2022; vigência em 01/01/2023", 1, "Integral; tarifa-base histórica, não certificação de consolidação 2026"),
    ("decision-bvi-bca", "decision-parent-bca2020.md", "BVI Business Companies Act — edição revisada 2020", "01/01/2020; fonte histórica", 1, "Parcial; trechos de incorporação recuperados, tabela completa não recuperada"),
    ("decision-bvi-gaming2021", "decision-parent-ogier-gaming2021.md", "Ogier — Gaming and betting controls in BVI", "29/10/2021; análise histórica", 2, "Parcial; seções relevantes recuperadas"),
    ("decision-duckdice-terms", "decision-parent-duckdice-terms.md", "DuckDice — Terms of Use", "Sem data; consultado 03/10/2026", 1, "Integral; contrato, não validação independente de licença"),
    ("decision-duckdice-api", "decision-parent-duckdice-api.md", "DuckDice — Developers Bot API", "Sem data; consultado 03/10/2026", 1, "Integral; capacidade técnica não equivale a aceitação corporativa"),
]
for key, filename, title, date, tier, quality in parents:
    evidence = root / "research/sources" / filename
    text = evidence.read_text()
    url = re.search(r"^Source: (https?://\S+)", text, re.M)[1]
    normalized = url.rstrip("/")
    if normalized not in by_url:
        registry[key] = dict(title=title, url=url, date=date, tier=tier,
                             evidence=str(evidence.relative_to(root)), quality=quality)
        by_url[normalized] = key
    mapping[normalized] = by_url[normalized]

# Announcements are primary statements of the issuer, but promotional support
# rather than binding provider terms or independent regulatory evidence.
for key in ("decision-operation-11", "decision-operation-12"):
    if key in registry:
        registry[key]["tier"] = 3
        registry[key]["quality"] += "; anúncio próprio, não contrato ou aceite BETTEX"

registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n")
(root / "research/decision-citation-map.json").write_text(
    json.dumps(mapping, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"registryCount": len(registry), "decisionURLs": len(mapping),
                  "skippedUnverified": unverified}, ensure_ascii=False))
for url, key in mapping.items():
    print(f"{key}\t{url}")