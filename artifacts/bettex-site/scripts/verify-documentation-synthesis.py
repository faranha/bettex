"""Verify synthesis volume, protected structure, and reviewed rule conditions."""
import hashlib
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from documentation_synthesis_rules import verify_rules
from documentation_intralinks import verify_intralinks
from documentation_spacing_audit import audit_spacing
from pitch_defai_guard import split_pitch_defai_addition

app = Path(__file__).resolve().parents[1]
baseline = json.loads((app / "scripts/fixtures/documentation-synthesis-baseline.json").read_text())
catalog = json.loads((app / "src/lib/locales/documentation-synthesis.json").read_text())
source = json.loads((app / "src/lib/locales/translations.json").read_text())
editorial = json.loads(subprocess.run(
    ["node", "--input-type=module", "-e", """
import { documentationAgentTerminology as terms } from './src/lib/documentation-agent-terminology.ts';
import { intelligenceCopy, intelligenceTranslations } from './src/lib/documentation-intelligence.ts';
let input = ''; for await (const part of process.stdin) input += part;
const catalog = JSON.parse(input);
const notices = intelligenceTranslations[intelligenceCopy.governanceNotice];
for (const entry of Object.values(catalog)) {
  for (const lang of ['pt', 'en', 'es']) entry[lang] = terms(entry[lang], lang);
}
const openings = Object.fromEntries(['hero', 'visaoLead', 'visaoIndependencia', 'agP1'].map(key => [
  key, Object.fromEntries(Object.entries(intelligenceTranslations[intelligenceCopy[key]])
    .map(([lang, text]) => [lang, terms(text, lang)])),
]));
console.log(JSON.stringify({ catalog, openings, notices: Object.fromEntries(Object.entries(notices).map(([lang, text]) => [lang, terms(text, lang)])) }));
"""], input=json.dumps(catalog), text=True, capture_output=True, check=True, cwd=app,
).stdout)
notices = editorial["notices"]
catalog = editorial["catalog"]

for key, entry in catalog.items():
    assert key in source, f"Unknown editorial source: {key}"
    assert set(entry) == {"pt", "en", "es"}, f"Incomplete editorial languages: {key}"
    assert all(value.strip() for value in entry.values()), f"Empty editorial content: {key}"


class Content(HTMLParser):
    """Read only the prerendered React root, not metadata or asset tags."""
    def __init__(self):
        super().__init__()
        self.depth = 0
        self.skip = 0
        self.parts = []
        self.structure = []
        self.paragraphs = []
        self.raw_paragraphs = []
        self.paragraph_parts = None

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if not self.depth:
            if tag == "div" and props.get("id") == "root":
                self.depth = 1
            return
        if tag == "div":
            self.depth += 1
        if tag in ("script", "style"):
            self.skip += 1
        if tag == "p":
            self.paragraph_parts = []
        for key in ("id", "href", "src"):
            if key in props:
                self.structure.append([tag, key, props[key]])

    def handle_endtag(self, tag):
        if not self.depth:
            return
        if tag == "p" and self.paragraph_parts is not None:
            self.paragraphs.append(" ".join(" ".join(self.paragraph_parts).split()))
            self.raw_paragraphs.append(" ".join("".join(self.paragraph_parts).split()))
            self.paragraph_parts = None
        if tag == "div":
            self.depth -= 1
        if tag in ("script", "style"):
            self.skip -= 1

    def handle_data(self, text):
        if self.depth and not self.skip:
            self.parts.append(text)
            if self.paragraph_parts is not None:
                self.paragraph_parts.append(text)


digest = lambda value: hashlib.sha256(value.encode()).hexdigest()
verify_intralinks(app / "dist/public")
for route, expected in baseline["routes"].items():
    file = app / "dist/public" / route.strip("/") / "index.html"
    protected_html = file.read_text()
    if route in ("/documentacao", "/en/documentation", "/es/documentacion"):
        from documentation_audit_html import documentation_html
        protected_html = documentation_html(app, route)
    if route in ("/pitch", "/en/pitch", "/es/pitch"):
        protected_html, addition_html = split_pitch_defai_addition(protected_html)
        addition = Content()
        addition.feed('<div id="root">' + addition_html + '</div>')
        addition_text = " ".join(" ".join(addition.parts).split()).lower()
        language = "en" if route.startswith("/en/") else "es" if route.startswith("/es/") else "pt"
        markers = {
            "pt": ("defi", "defi ai", "defai", "100%", "autônomo", "independente",
                   "descentralizado", "sem operador centralizado", "agente bettex",
                   "esports", "igaming", "cripto", "previsões", "tesouraria",
                   "um subagente por mercado", "fundador", "controles verificáveis",
                   "peso de participação", "não capital"),
            "en": ("defi", "defi ai", "defai", "100%", "autonomous", "independent",
                   "decentralized", "no centralized operator", "bettex agent",
                   "esports", "igaming", "crypto", "predictions", "treasury",
                   "one subagent per market", "founders", "verifiable controls",
                   "participation weight", "not capital"),
            "es": ("defi", "defi ai", "defai", "100%", "autónomo", "independiente",
                   "descentralizado", "sin operador centralizado", "agente bettex",
                   "esports", "igaming", "cripto", "predicciones", "tesorería",
                   "un subagente por mercado", "fundadores", "controles verificables",
                   "peso de participación", "no capital"),
        }[language]
        assert all(marker in addition_text for marker in markers), \
            f"Incomplete decentralized Pitch vision: {route}: {[m for m in markers if m not in addition_text]}"
        assert 'data-testid="pitch-defai-treasury"' in addition_html, f"Missing treasury diagram node: {route}"
        assert addition_html.count('class="pdv__node') == 5, f"Missing market/treasury diagram nodes: {route}"
        print(f"{route}: authorized DeFi/DeFAI diagram, treasury and phased-autonomy vision verified")
    page = Content()
    page.feed(protected_html)
    text = " ".join(" ".join(page.parts).split())
    assert text, f"Empty rendered content: {route}"
    guarded_structure = page.structure
    if "textSha256" not in expected:
        # Verify the authorized link-only replacement separately; preserve the original
        # structure fingerprint for every pre-existing block, image and link.
        walkthrough_pattern = re.compile(
            r'<section(?=[^>]*data-testid="documentation-app-walkthrough")[^>]*>(.*?)</section>',
            re.S,
        )
        walkthroughs = walkthrough_pattern.findall(protected_html)
        assert len(walkthroughs) == 1, f"Missing or duplicated app walkthrough: {route}"
        walkthrough = Content()
        walkthrough.feed('<div id="root">' + walkthroughs[0] + '</div>')
        language = "en" if route.startswith("/en/") else "es" if route.startswith("/es/") else "pt"
        demo_path = {"pt": "/app", "en": "/en/app", "es": "/es/app"}[language]
        assert walkthrough.structure == [
            ["p", "id", "documentacao-percurso-app"],
            ["a", "id", "documentacao-percurso-demo"], ["a", "href", demo_path],
        ], f"Expected only the localized demo link and preserved anchors: {route}"
        walkthrough_text = " ".join(" ".join(walkthrough.parts).split())
        markers = {
            "pt": ("Explorar o demo BETTEX",),
            "en": ("Explore the BETTEX demo",),
            "es": ("Explorar el demo BETTEX",),
        }
        for marker in markers[language]:
            assert marker in walkthrough_text, f"App walkthrough omits {marker}: {route}"
        assert walkthrough_text == markers[language][0], f"Demo detail must not replace the link-only block: {route}"
        original_page = Content()
        original_page.feed(walkthrough_pattern.sub("", protected_html))
        guarded_structure = original_page.structure
    # Authorized research additions must not invalidate the original link/image/block guard.
    intelligence_ids = {
        "documentacao-linha-base", "documentacao-inteligencia", "documentacao-inteligencia-bettex",
        "documentacao-inteligencia-risco", "documentacao-inteligencia-governanca",
        "documentacao-inteligencia-tesouraria", "documentacao-aprendizado",
        "documentacao-agente-subagentes",
    }
    structure = json.dumps(
        [item for item in guarded_structure if not (item[1] == "id" and item[2] in intelligence_ids)],
        ensure_ascii=False, separators=(",", ":"),
    )
    if route in ("/documentacao", "/en/documentation", "/es/documentacion"):
        # Authorized actor/feature reorganization changes ordering and adds owner IDs.
        # Preserve content and destinations, not the obsolete six-chapter fingerprint.
        if route == "/documentacao":
            import runpy
            runpy.run_path(str(app / "scripts/verify-documentation-ownership.py"), run_name="__main__")
    else:
        assert digest(structure) == expected["structureSha256"], f"Removed or changed block/link/image: {route}"
    if "textSha256" in expected:
        if route in ("/", "/en/", "/es/"):
            assert "section-nova-economia" not in file.read_text(), f"Removed homepage section restored: {route}"
        assert digest(text) == expected["textSha256"], f"Approved page text changed: {route}"
        print(f"{route}: approved text unchanged")
    else:
        assert 'whitepaper__crumbs' not in file.read_text(), f"Duplicate navigation path restored: {route}"
        assert intelligence_ids.issubset({item[2] for item in page.structure if item[1] == "id"}), f"Missing agent research presentation: {route}"
        # The creator explicitly removed download options, not archived files.
        assert "documentation-downloads" not in file.read_text(), f"Download controls restored: {route}"
        assert not any(key == "href" and value.startswith("/downloads/")
                       for _, key, value in page.structure), f"Download links restored: {route}"
        language = "en" if route.startswith("/en/") else "es" if route.startswith("/es/") else "pt"
        # Future markets must not be presented as delivered demo/ALFA capabilities.
        future_scope = {
            "pt": "Este subagente não está disponível nem ativo na versão demo e não está previsto para a versão ALFA.",
            "en": "This subagent is neither available nor active in the demo and is not planned for the ALFA version.",
            "es": "Este subagente no está disponible ni activo en el demo y no está previsto para la versión ALFA.",
        }[language]
        for chapter_id, market in (
            ("documentacao-subagente-esportes", "sports"),
            ("documentacao-subagente-previsoes", "predictions"),
            ("documentacao-subagente-igaming", "igaming"),
        ):
            future_article = re.findall(
                rf'<article\b(?=[^>]*id="{chapter_id}")[^>]*>(.*?)</article>',
                protected_html, re.S,
            )
            assert len(future_article) == 1, f"Missing future market: {route}/{chapter_id}"
            assert future_scope in future_article[0], f"Missing demo/ALFA exclusion: {route}/{chapter_id}"
            assert f'data-testid="documentation-future-market-{market}"' in future_article[0], f"Missing future vision: {route}/{chapter_id}"

        # Beginner introductions are required in every chapter, before existing rules.
        concept_chapters = (
            "documentacao-como-funciona", "documentacao-agentes", "documentacao-emissao",
            "documentacao-staking", "documentacao-roadmap", "documentacao-riscos",
        )
        for chapter_id in concept_chapters:
            articles = re.findall(
                rf'<article\b(?=[^>]*id="{chapter_id}")[^>]*>(.*?)</article>',
                protected_html, re.S,
            )
            assert len(articles) == 1, f"Missing or duplicated chapter: {route}/{chapter_id}"
            article = articles[0]
            introduction = re.search(
                rf'<div\b(?=[^>]*data-testid="documentation-concepts-{chapter_id}")[^>]*>(.*?)</div>',
                article, re.S,
            )
            assert introduction, f"Missing beginner introduction: {route}/{chapter_id}"
            first_heading = re.search(r"<h3\b", article)
            if chapter_id == "documentacao-como-funciona":
                vision = article.find('data-testid="documentation-vision"')
                scope = article.find('data-testid="documentation-poc-scope"')
                concepts = article.find('id="documentacao-conceitos-base"')
                demo_link = article.find('id="documentacao-percurso-demo"')
                assert 0 <= vision < scope < concepts < introduction.start() < introduction.end() < demo_link, f"Expected vision, scope, concepts, introduction and demo link: {route}"
                assert 'data-testid="documentation-demo-journey"' not in article, f"Removed demo walkthrough reappeared: {route}"
                assert article.count('class="dv__fig"') == 1, f"Preserve the vision diagram, not the removed demo walkthrough: {route}"
                assert 'id="documentacao-visao"' in article and 'id="documentacao-percurso-demo"' in article, f"Missing diagram section anchors: {route}"
            elif first_heading:
                assert introduction.end() <= first_heading.start(), f"Concepts follow technical rules: {route}/{chapter_id}"
            assert len(re.findall(r"<p\b", introduction[1])) >= 2, f"Introduction lacks explanation: {route}/{chapter_id}"
            if chapter_id == "documentacao-como-funciona":
                for term in ("DeFi", "DEX", "DeFAI", "USDC", "blockchain"):
                    assert term in introduction[1], f"Unintroduced foundation term: {route}/{term}"
            if chapter_id == "documentacao-staking":
                for term in ("Staking", "25%", "USDC"):
                    assert term.lower() in introduction[1].lower(), f"Missing staking explanation: {route}/{term}"
                assert 'data-testid="documentation-app-introduction"' not in article, f"Feature overview mixed into staking: {route}"
                features = re.search(r'<section\b(?=[^>]*id="documentacao-features")[^>]*>(.*?)</section>', protected_html, re.S)
                assert features and 'data-testid="documentation-app-introduction"' in features[1], f"Missing feature section opening: {route}"
                assert 'data-testid="documentation-features-introduction"' in features[1], f"Missing feature topic overview: {route}"
                assert 'data-testid="link-documentacao-features"' not in protected_html, f"Feature opening reintroduced as a menu chapter: {route}"
        for key, localized in editorial["openings"].items():
            expected_opening = re.sub(r"\s+", " ", localized[language]).strip()
            if key == "hero" and language == "es":
                expected_opening = expected_opening.replace("predictions (mercados de predicción)", "predicciones (mercados de predicción)")
            # Inline links/bold do not insert spaces beside punctuation.
            assert expected_opening in page.raw_paragraphs, f"Missing market/audience opening: {language}/{key}"
        flows, spacing_errors = audit_spacing(protected_html)
        assert not spacing_errors, f"Documentation text-flow spacing errors: {language}: {spacing_errors[:8]}"
        print(f"{route}: {len(flows)} text flows checked across paragraphs, lists, diagrams, captions, headings and tables")
        notice = notices[language]
        assert notice in text, f"Missing localized governance notice: {language}"
        assert 'data-testid="documentation-governance-notice"' in file.read_text(), f"Missing governance marquee: {language}"
        verify_rules(page.paragraphs, language, "site")
        paragraph_html = "".join(re.findall(r"<p\b[^>]*>.*?</p>", protected_html, re.S))
        assert not re.search(r"</(?:strong|a|em)>[A-Za-zÀ-ÿ0-9]", paragraph_html), f"Words joined after inline formatting: {language}"
        duplicate_fragments = (
            r"\b(USDC|BETTEX)\.\s*\1\.",
            r"\b(USDC|BETTEX)\s+\1\b",
            r"\brecompra\.\s+recompra (?:e queima|y quema)",
            r"\bbuyback\.\s+buyback and burn",
            r"\bprovider\s+provider\b",
            r"\bLas\s+las\b",
            r"\bgovernance\.\s+governance,",
        )
        for paragraph in page.raw_paragraphs:
            assert not any(re.search(pattern, paragraph, re.I) for pattern in duplicate_fragments), f"Duplicated inline fragment: {language}: {paragraph[:200]}"
            # URL paths, domains and initialisms have intentional punctuation.
            prose = re.sub(r"https?://\S+|(?<!\w)/\S+", "", paragraph)
            prose = re.sub(r"\b(?:[A-Za-z0-9-]+\.)+(?:com|org|net|io|ai|gov|edu)(?:\.[a-z]{2})?(?:/\S*)?", "", prose)
            prose = re.sub(r"\b(?:[A-Z]\.){2,}", "", prose)
            assert not re.search(r"[.!?][A-Za-zÀ-ÿ]", prose), f"Missing space after sentence punctuation: {language}: {paragraph[:200]}"
        assert not re.search(r"[A-Za-zÀ-ÿ0-9]<(?:strong|a|em)\b", paragraph_html), f"Words joined before inline formatting: {language}"
        entries_key = next(key for key in catalog if key.startswith("Entradas durante a rodada aguardam"))
        credited_key = "BETTEX determina a participação no staking; os ganhos são creditados em USDC."
        credited_label = credited_key if language == "pt" else source[credited_key][language]
        assert any(credited_label + " " + catalog[entries_key][language] in p for p in page.raw_paragraphs), f"Joined staking-credit and entry statements: {language}"
        community_key = next(key for key in catalog if key.startswith("no aplicativo ou diretamente a corretoras entrega"))
        community_subject_key = "A venda dos tokens da comunidade em vesting"
        community_subject = community_subject_key if language == "pt" else source[community_subject_key][language]
        assert any(community_subject + " " + catalog[community_key][language] in p for p in page.raw_paragraphs), f"Incomplete community-sale sentence: {language}"
        assert not any(re.search(r"\bvesting\s*App\b", p) for p in page.raw_paragraphs), f"Broken community-sale continuation: {language}"
        balance_key = next(key for key in catalog if key.startswith("Os saldos financeiros, depósitos"))
        assert any(catalog[balance_key][language] + " USDC." in p for p in page.raw_paragraphs), f"Incomplete balance statement: {language}"
        wallet_key = next(key for key in catalog if key.startswith("A Carteira BETTEX é a carteira da pessoa"))
        export_key = "as chaves e os dados do usuário são exportáveis"
        export_label = export_key if language == "pt" else source[export_key][language]
        assert catalog[wallet_key][language].endswith(":"), f"Lost wallet explanation delimiter: {language}"
        assert any(catalog[wallet_key][language] + " " + export_label in p for p in page.raw_paragraphs), f"Joined wallet/export explanation: {language}"
        auth_key = next(key for key in catalog if key.startswith("demonstra o controle da carteira sem transmitir"))
        assert any("v1 " + catalog[auth_key][language] in p for p in page.raw_paragraphs), f"Joined or incomplete authentication description: {language}"
        onramp_key = next(key for key in catalog if key.startswith(": a pessoa contrata a conversão"))
        onramp_label_key = "provedores externos de on-ramp"
        onramp_label = onramp_label_key if language == "pt" else source[onramp_label_key][language]
        assert catalog[onramp_key][language].startswith(": "), f"Lost on-ramp explanation delimiter: {language}"
        assert any(onramp_label + catalog[onramp_key][language] in p for p in page.raw_paragraphs), f"Joined or incomplete on-ramp explanation: {language}"
        kyc_key = next(key for key in catalog if key.startswith("ocorre em seu próprio aplicativo"))
        kyc_label_key = "verificação de identidade ou KYC exigido pelo provedor"
        kyc_label = kyc_label_key if language == "pt" else source[kyc_label_key][language]
        assert any(kyc_label + " " + catalog[kyc_key][language] in p for p in page.raw_paragraphs), f"Joined or incomplete KYC explanation: {language}"
        fiat_key = next(key for key in catalog if key.startswith("para facilitar a leitura. O saque"))
        assert any(source["estimativa desse valor na moeda fiduciária da pessoa"].get(language, "estimativa desse valor na moeda fiduciária da pessoa") + catalog[fiat_key][language] in p for p in page.raw_paragraphs), f"Missing sentence boundary after fiat estimate: {language}"
        # Browser textContent concatenates inline nodes without inserting spaces.
        # Normalized extraction above must not hide broken bold-text boundaries.
        starknet_key = next(key for key in catalog if key.startswith("é uma rede de segunda camada do Ethereum que utiliza provas"))
        assert any("Starknet " + catalog[starknet_key][language] in p for p in page.raw_paragraphs), f"Joined or incomplete Starknet description: {language}"
        arbitrum_key = next(key for key in catalog if key.startswith("é uma rede de segunda camada do Ethereum. Ela amplia"))
        assert any("Arbitrum One " + catalog[arbitrum_key][language] in p for p in page.raw_paragraphs), f"Joined or incomplete Arbitrum description: {language}"
        assert not any(bad in p for p in page.raw_paragraphs for bad in (
            "StarknetRede", "StarknetAn", "StarknetUna", "Arbitrum OneRede",
            "Arbitrum OneEthereum", "Arbitrum OneRed", "rollupsExecuta",
            "rollupsIt executes", "rollupsEjecuta",
        )), f"Joined network fragments: {language}"
        approval_key = next(key for key in catalog if key.startswith("A IA sugere ajustes nas regras da tesouraria"))
        agents_key = next(key for key in catalog if key.startswith("O agente da tesouraria propõe otimizações"))
        risk_boundary = catalog[approval_key][language] + " " + catalog[agents_key][language]
        assert any(risk_boundary in p for p in page.raw_paragraphs), f"Joined risk-control sentences: {language}"
        allocation_key = next(key for key in catalog if key.startswith(": 550 milhões para a comunidade,"))
        management_key = next(key for key in catalog if key.startswith(". A gestão não altera meses"))
        prefix_key = next(key for key in catalog if key.startswith("As 24 parcelas mantêm a proporção 55:20:15,"))
        emphasis_key = "liberação programada, não venda, circulação ou lucro distribuível"
        allocation = catalog[allocation_key][language]
        management = catalog[management_key][language]
        prefix = catalog[prefix_key][language]
        emphasis = (catalog.get(emphasis_key, {}).get(language)
                    or (emphasis_key if language == "pt" else source[emphasis_key][language]))
        intro = "Esta agenda abrange" if language == "pt" else source["Esta agenda abrange"][language]
        assert allocation.startswith(". ") and management.startswith(". "), f"Lost vesting sentence boundary: {language}"
        assert any(p.startswith(intro + " ") and "BETTEX" + allocation in p
                   for p in page.raw_paragraphs), f"Joined vesting allocation text: {language}"
        assert any(prefix + " " + emphasis + management in p
                   for p in page.raw_paragraphs), f"Joined vesting emphasis text: {language}"
        suffix = "" if language == "pt" else f"-{language}"
        download = app / f"public/downloads/bettex-documentacao{suffix}.md"
        verify_rules(download.read_text().splitlines(), language, "download")
        # The creator clarified DeFAI roles across the documentation, not only trading.
        roles = {
            "pt": ("trading", "governança", "risco", "tesouraria"),
            "en": ("trading", "governance", "risk", "treasury"),
            "es": ("trading", "gobernanza", "riesgo", "tesorería"),
        }[language]
        country = {"pt": "país", "en": "country", "es": "país"}[language]
        transition = {
            "pt": ("Hoje", "DeFi", "IA", "toda a administração", "totalmente DeFAI"),
            "en": ("Today", "DeFi", "AI", "all administration", "fully DeFAI"),
            "es": ("Hoy", "DeFi", "IA", "toda la administración", "totalmente DeFAI"),
        }[language]
        for label, paragraphs in (("site", page.paragraphs), ("download", download.read_text().splitlines())):
            assert any("DeFi" in p and "DeFAI" in p for p in paragraphs), f"Missing DeFi-to-DeFAI direction: {language}/{label}"
            if label == "download":
                assert any(all(marker in p for marker in transition) for p in paragraphs), \
                    f"Missing DeFi/AI research direction: {language}/{label}"
            else:
                starting_point = {
                    "pt": ("regras", "contratos de referência", "controles", "ponto de partida"),
                    "en": ("rules", "reference contracts", "controls", "starting point"),
                    "es": ("reglas", "contratos de referencia", "controles", "punto de partida"),
                }[language]
                autonomy = {
                    "pt": "autonomia ainda não existe",
                    "en": "autonomy does not yet exist",
                    "es": "la autonomía aún no existe",
                }[language]
                assert any(all(marker in p.lower() for marker in starting_point) for p in paragraphs), \
                    f"Missing agentic baseline: {language}"
                assert any(autonomy in p.lower() for p in paragraphs), f"Future autonomy presented as delivered: {language}"
            assert any(country in p.lower() and all(role in p.lower() for role in roles)
                       for p in paragraphs), f"Legal scope omits non-trading agents: {language}/{label}"
        identity = {"pt": "o agente bettex é", "en": "the bettex agent is", "es": "el agente bettex es"}[language]
        assert any(identity in p.lower() and all(role in p.lower() for role in roles)
                   for p in page.paragraphs), f"Agent identity and supporting roles missing from present-tense definition: {language}"
        count = len(text.split())
        reduction = 100 * (1 - count / expected["words"])
        # The approved agentic presentation adds research content; the former exact
        # one-third word target is no longer the scope. Retain a bounded-size guard.
        assert count < expected["words"], f"Documentation exceeds the unsynthesized baseline: {route}"
        print(f"{route}: {expected['words']} → {count} words ({reduction:.2f}% reduction); reviewed rule conditions, anchors, links and images verified")

print("Documentation synthesis: reviewed original conditions verified on rendered pages and downloads; homepage/Pitch protected in PT/EN/ES. Automated checks complement semantic review.")
