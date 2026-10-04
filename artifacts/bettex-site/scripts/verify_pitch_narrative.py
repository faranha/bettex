"""Focused editorial guard for prerendered Pitch HTML, not the homepage.

This is a regression check, not a general grammar/tone classifier. Keep the
exceptions structural: attributed founder quotes and navigation controls.
"""
import re
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path


@dataclass
class Element:
    tag: str
    attrs: dict
    children: list = field(default_factory=list)

    def has_class(self, name):
        return name in self.attrs.get("class", "").split()


class PitchHTML(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
            "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Element("document", {})
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Element(tag, dict(attrs))
        self.stack[-1].children.append(node)
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def descendants(node):
    yield node
    for child in node.children:
        if isinstance(child, Element):
            yield from descendants(child)


def text_of(node, *, navigation=False, ancestors=()):
    if node.tag in {"script", "style", "svg"}:
        return ""
    # Do not exempt arbitrary blockquotes or the founder's whole section.
    if node.tag == "blockquote" and any(
        parent.tag == "figure" and parent.has_class("fp")
        and any(child.tag == "figcaption" and "Fred Azevedo" in text_of(child)
                for child in descendants(parent))
        for parent in ancestors
    ):
        return ""
    if not navigation and (
        node.tag in {"nav", "button"}
        or (node.tag == "a" and node.has_class("tap"))
    ):
        return ""
    result = "".join(
        child if isinstance(child, str)
        else text_of(child, navigation=navigation, ancestors=(*ancestors, node))
        for child in node.children
    )
    # Inline markup can split a pronoun; block elements separate sentences.
    if node.tag in {"p", "div", "section", "h1", "h2", "h3", "li", "a",
                    "header", "footer", "figure", "figcaption", "blockquote"}:
        result = f" {result} "
    return re.sub(r"\s+", " ", result).strip() if node.tag == "main" else result


RULES = {
    "pt": {
        "direct": r"\b(?:voc[eê]s?|teu|tua|teus|tuas)\b",
        "invite": r"\b(?:pare de apostar|deixe de apostar|comece a investir|"
                  r"invista(?: agora)?|troque (?:as )?apostas por investimentos)\b",
        "audience": r"\bapostador brasileiro\b",
        "participation": r"\bo usuário participa\b",
        "brazil": r"\b(?:brasil|brasileiro)\b",
        "market": r"\bapostas\b",
    },
    "en": {
        "direct": r"\b(?:you|your|yours|yourself|yourselves)\b",
        "invite": r"\b(?:stop betting|quit betting|start investing|"
                  r"invest now|swap betting for investing)\b",
        "audience": r"\bbrazilian bettors?\b",
        "participation": r"\bthe user participates\b",
        "brazil": r"\b(?:brazil|brazilian)\b",
        "market": r"\bbetting\b",
    },
    "es": {
        "direct": r"\b(?:tú|tu|tus|usted|ustedes|vosotros|vosotras|vuestro|vuestra)\b",
        "invite": r"\b(?:deja de apostar|deje de apostar|empieza a invertir|"
                  r"empiece a invertir|comienza a invertir|comience a invertir|"
                  r"invierte(?: ahora)?|invierta(?: ahora)?)\b",
        "audience": r"\bapostador brasileño\b",
        "participation": r"\bel usuario participa\b",
        "brazil": r"\b(?:brasil|brasileño)\b",
        "market": r"\bapuestas\b",
    },
}


def audit_pitch(html, language):
    parser = PitchHTML()
    parser.feed(html)
    mains = [node for node in descendants(parser.root)
             if node.tag == "main" and node.has_class("pitch")]
    if len(mains) != 1:
        return [f"{language}/pitch: expected exactly one main.pitch"]
    main = mains[0]
    rules = RULES[language]
    failures = []
    narrative = text_of(main)
    match = re.search(rules["direct"], narrative, re.I)
    if match:
        failures.append(f"{language}/pitch: direct reader address '{match.group()}'")
    if not re.search(rules["participation"], narrative, re.I):
        failures.append(f"{language}/pitch: missing third-person user participation")
    covers = [node for node in descendants(main) if node.has_class("cover")]
    audiences = [node for node in descendants(main)
                 if node.attrs.get("id") == "publico-pitch"]
    for name, nodes in (("cover", covers), ("publico-pitch", audiences)):
        if len(nodes) != 1:
            failures.append(f"{language}/pitch: missing or duplicate {name}")
            continue
        text = text_of(nodes[0])
        if name == "cover":
            if not re.search(rules["audience"], text, re.I):
                failures.append(f"{language}/pitch/{name}: missing Brazilian bettor description")
            match = re.search(rules["invite"], text_of(nodes[0], navigation=True), re.I)
            if match:
                failures.append(f"{language}/pitch/cover: direct betting/investing invitation '{match.group()}'")
        else:
            for rule in ("brazil", "market"):
                if not re.search(rules[rule], text, re.I):
                    failures.append(f"{language}/pitch/publico-pitch: missing {rule} audience")
    return failures


def verify_pitch_files(output):
    failures = []
    for language, path in (("pt", "pitch.html"), ("en", "en/pitch.html"),
                           ("es", "es/pitch.html")):
        file = Path(output) / path
        if not file.is_file():
            failures.append(f"{language}/pitch: missing rendered file {file}")
        else:
            failures.extend(audit_pitch(file.read_text(encoding="utf-8"), language))
    if failures:
        raise ValueError("Pitch narrative regression:\n" + "\n".join(failures))
    print("Pitch narrative: PT/EN/ES describe the Brazilian bettor in third person; no direct cover invitations.")


if __name__ == "__main__":
    verify_pitch_files(Path(__file__).resolve().parents[1] / "dist/public")