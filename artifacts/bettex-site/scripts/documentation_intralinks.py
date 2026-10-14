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

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
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

    def handle_endtag(self, tag):
        if tag == "a":
            self.anchor_depth = max(0, self.anchor_depth - 1)


def verify_intralinks(output):
    for route in ("documentacao", "en/documentation", "es/documentacion"):
        page = References()
        page.feed(documentation_html(output.parents[1], '/' + route))
        missing = {target for target in page.targets if not target.startswith("#") or target[1:] not in page.ids}
        assert not missing, f"/{route}: broken documentation references: {sorted(missing)}"
        assert not page.nested, f"/{route}: nested hyperlinks"
        assert page.closed_indices and all(page.closed_indices), f"/{route}: chapter indices must start collapsed"
        assert len(page.targets) >= 80, f"/{route}: cross-references missing"
        assert "#title-documentacao-carteira-bettex" in page.targets, f"/{route}: wallet reference must reach its details, not repeat the Features opening"
        print(f"/{route}: {len(page.targets)} internal references, all destinations present, no nested links")


if __name__ == "__main__":
    verify_intralinks(Path(__file__).resolve().parents[1] / "dist/public")
