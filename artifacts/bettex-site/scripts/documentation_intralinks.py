"""Validate the explicitly authored documentation cross-references."""
from html.parser import HTMLParser
from pathlib import Path
from documentation_audit_html import documentation_html


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.targets = []
        self.anchor_depth = 0
        self.nested = False
        self.closed_indices = []
        self.link_labels = []
        self.current_label = None
        self.related_blocks = 0

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if "data-documentation-related-section" in props:
            self.related_blocks += 1
        if "whitepaper__chapter-menu-children" in props.get("class", "").split():
            self.closed_indices.append("hidden" in props)
        if props.get("data-testid", "").startswith("toggle-chapter-"):
            self.closed_indices.append(props.get("aria-expanded") == "false")
        if props.get("id"):
            self.ids.add(props["id"])
        if tag == "a":
            self.anchor_depth += 1
            self.nested |= self.anchor_depth > 1
            if "data-documentation-intralink" in props:
                self.targets.append(props.get("href", ""))
                self.current_label = []

    def handle_data(self, data):
        if self.current_label is not None:
            self.current_label.append(data)

    def handle_endtag(self, tag):
        if tag == "a":
            if self.current_label is not None:
                self.link_labels.append("".join(self.current_label).strip().casefold())
                self.current_label = None
            self.anchor_depth = max(0, self.anchor_depth - 1)


def verify_intralinks(output):
    for route in ("documentacao", "en/documentation", "es/documentacion"):
        page = References()
        page.feed(documentation_html(output.parents[1], '/' + route))
        missing = {target for target in page.targets if not target.startswith("#") or target[1:] not in page.ids}
        assert not missing, f"/{route}: broken documentation references: {sorted(missing)}"
        assert not page.nested, f"/{route}: nested hyperlinks"
        assert page.related_blocks == 0, f"/{route}: related-reading blocks must be removed from every section"
        assert page.closed_indices and all(page.closed_indices), f"/{route}: chapter indices must start collapsed"
        # Relevance, not a minimum count: the creator removed generic word links.
        required = {
            "#documentacao-conceito-defi", "#documentacao-conceito-defai",
            "#documentacao-conceito-tokens", "#documentacao-staking",
            "#documentacao-vesting",
        }
        assert required <= set(page.targets), f"/{route}: missing basic references: {sorted(required - set(page.targets))}"
        unsupported = {
            "alfa", "demo", "prova de conceito", "proof of concept", "prueba de concepto",
            "blockchain", "contratos inteligentes", "smart contracts",
            "agente", "agent", "inteligência artificial", "artificial intelligence", "inteligencia artificial",
        }
        assert not unsupported.intersection(page.link_labels), f"/{route}: generic terms must not link to related topics: {sorted(unsupported.intersection(page.link_labels))}"
        assert "title-documentacao-carteira-bettex" in page.ids, f"/{route}: wallet details must remain available after removing suggested links"
        print(f"/{route}: {len(page.targets)} internal references, all destinations present, no nested links")


if __name__ == "__main__":
    verify_intralinks(Path(__file__).resolve().parents[1] / "dist/public")
