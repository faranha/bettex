"""Audit real inline text flows, including lists, captions and table cells."""
import re
from html.parser import HTMLParser

BLOCKS = {
    "div", "p", "section", "article", "main", "aside", "header", "footer",
    "nav", "ul", "ol", "li", "dl", "dt", "dd", "figure", "figcaption",
    "blockquote", "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    "h1", "h2", "h3", "h4", "h5", "h6", "details", "summary",
}
SKIP = {"script", "style", "code", "pre", "svg"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr"}
LETTERS = "A-Za-zÀ-ÿ"
PROSE = {"p", "li", "dt", "dd", "figcaption", "blockquote", "td", "th"}


def prose_only(text):
    text = re.sub(r"https?://\S+|(?<!\w)/\S+", "", text)
    text = re.sub(
        r"\b(?:[A-Za-z0-9-]+\.)+(?:com|org|net|io|ai|gov|edu)"
        r"(?:\.[a-z]{2})?(?:/\S*)?", "", text)
    return re.sub(r"\b(?:[A-Z]\.){2,}", "", text)


class TextFlows(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.layouts = []
        self.segments = []
        self.parts = []
        self.inline_boundaries = []
        self.boundaries = []

    def flush(self):
        text = "".join(self.parts)
        if text.strip():
            self.segments.append(text)
            for offset in self.inline_boundaries:
                if 0 < offset < len(text):
                    self.boundaries.append((text[offset - 1:offset + 1], text))
        self.parts = []
        self.inline_boundaries = []

    def handle_starttag(self, tag, attrs):
        if tag in BLOCKS or tag in SKIP or tag in ("br", "hr"):
            self.flush()
        # Standalone card labels, badges and navigation links have CSS layout
        # separation. Word-boundary checks apply to actual prose containers.
        parent = next((item for item in reversed(self.stack) if item in BLOCKS), None)
        in_prose = parent in PROSE and not (parent in {"li", "figcaption"} and any(self.layouts))
        if tag in ("strong", "em", "a", "b", "i") and in_prose:
            self.inline_boundaries.append(sum(map(len, self.parts)))
        if tag not in VOID:
            self.stack.append(tag)
            props = dict(attrs)
            self.layouts.append(
                props.get("role") == "img"
                or bool(re.search(r"(?:^|\s)(?:wp-facts|ba-|ds(?:[-_]|\s|$))", props.get("class", ""))))

    def handle_endtag(self, tag):
        if tag in BLOCKS or tag in SKIP:
            self.flush()
        parent = next((item for item in reversed(self.stack) if item in BLOCKS), None)
        in_prose = parent in PROSE and not (parent in {"li", "figcaption"} and any(self.layouts))
        if tag in ("strong", "em", "a", "b", "i") and in_prose:
            self.inline_boundaries.append(sum(map(len, self.parts)))
        if tag in self.stack:
            index = len(self.stack) - 1 - self.stack[::-1].index(tag)
            del self.stack[index:]
            del self.layouts[index:]

    def handle_data(self, text):
        if not any(tag in SKIP for tag in self.stack):
            self.parts.append(text)


def audit_spacing(markup):
    parser = TextFlows()
    parser.feed(markup)
    parser.flush()
    errors = []
    for text in parser.segments:
        match = re.search(rf"[.,;:!?][{LETTERS}]", prose_only(text))
        if match:
            errors.append(("sentence", " ".join(text.split())))
        # Spaces alone do not make joined fragments grammatically continuous.
        if re.search(
            r"(?:casas de apostas\s+Expansões futuras"
            r"|betting houses\s+Future expansions"
            r"|casas de apuestas\s+Las expansiones futuras"
            r"|,\s+Trilha pública contém"
            r"|,\s+The public trail"
            r"|são Parâmetros iniciais|are Initial parameters|son Los parámetros iniciales"
            r"|contam Exposição|count Exposure|cuentan La exposición"
            r"|API de trading e o CLOB\s+Permitem\b"
            r"|Trading API and CLOB\s+(?:They allow|Allow)\b"
            r"|API de trading y el CLOB\s+Permiten\b"
            r"|todo a rodada|todo la ronda"
            r"|dia UTC da realização comprovada\.\s+dia UTC da realização comprovada)"
            , text):
            errors.append(("continuity", " ".join(text.split())))
    for pair, text in parser.boundaries:
        if re.fullmatch(rf"[{LETTERS}0-9][{LETTERS}0-9]", pair):
            errors.append(("inline", " ".join(text.split())))
    return parser.segments, list(dict.fromkeys(errors))
