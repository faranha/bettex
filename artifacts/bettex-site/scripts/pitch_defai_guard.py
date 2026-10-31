"""Isolate the authorized Pitch addition without relaxing existing-page checks."""
from html.parser import HTMLParser


def split_pitch_defai_addition(html):
    """Return unchanged surrounding HTML and the single, complete DeFAI block."""
    offsets = [0]
    for line in html.splitlines(keepends=True):
        offsets.append(offsets[-1] + len(line))

    class Finder(HTMLParser):
        def __init__(self):
            super().__init__()
            self.depth = 0
            self.start = None
            self.bounds = []

        def position(self):
            line, column = self.getpos()
            return offsets[line - 1] + column

        def handle_starttag(self, tag, attrs):
            if tag != "div":
                return
            if self.depth:
                self.depth += 1
            elif dict(attrs).get("data-testid") == "pitch-defai-vision":
                self.start = self.position()
                self.depth = 1

        def handle_endtag(self, tag):
            if tag == "div" and self.depth:
                self.depth -= 1
                if not self.depth:
                    end = html.index(">", self.position()) + 1
                    self.bounds.append((self.start, end))

    parser = Finder()
    parser.feed(html)
    assert not parser.depth, "Unclosed Pitch DeFAI addition"
    assert len(parser.bounds) == 1, "Expected exactly one Pitch DeFAI addition"
    start, end = parser.bounds[0]
    return html[:start] + html[end:], html[start:end]
