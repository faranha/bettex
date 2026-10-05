"""Non-executing normalization and index discovery; original bytes remain untouched."""
from html import unescape
from html.parser import HTMLParser
import json
import ast
import re
from urllib.parse import urljoin, urlsplit
import xml.etree.ElementTree as ET

from network import CONFIG, canonical


class HTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.text, self.links, self.title = [], [], []
        self.skip = 0
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag in ("script", "style", "svg", "noscript"):
            self.skip += 1
        if tag == "title":
            self.in_title = True
        if tag in ("a", "link") and attributes.get("href"):
            self.links.append(attributes["href"])
        if tag in ("p", "div", "br", "h1", "h2", "h3", "li", "pre", "tr"):
            self.text.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "svg", "noscript"):
            self.skip = max(0, self.skip - 1)
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title.append(data)
        if not self.skip:
            self.text.append(data)


def normalize(raw, media_type, url):
    value = raw.decode("utf-8", "replace")
    title = urlsplit(url).path.strip("/").split("/")[-1] or urlsplit(url).hostname
    links = []
    if "html" in media_type or value.lstrip().lower().startswith(("<!doctype html", "<html")):
        parser = HTML()
        parser.feed(value)
        title = "".join(parser.title).strip() or title
        links = parser.links
        text = "\n".join(line.strip() for line in "".join(parser.text).splitlines() if line.strip())
        # Robinhood ReDoc ships the official OpenAPI specification in a script object.
        # Parse JSON only; never eval JavaScript or run embedded commands.
        for match in re.finditer(r"(?:__redoc_state(?:__)?|__swagger_spec)\s*=\s*(\{)", value):
            try:
                state, _ = json.JSONDecoder().raw_decode(value[match.start(1):])
                specification = state.get("spec", {}).get("data", state)
                if isinstance(specification, dict) and ("openapi" in specification or "swagger" in specification):
                    text += "\n\nOfficial embedded OpenAPI:\n" + json.dumps(specification, indent=2, ensure_ascii=False)
            except (ValueError, TypeError, AttributeError):
                pass
    else:
        text = value
        heading = re.search(r"^#\s+(.+)", value, re.M)
        if heading:
            title = heading.group(1).strip()
        links.extend(re.findall(r"\]\(([^)\s]+)", value))
        links.extend(re.findall(r"<(https://[^>\s]+)>", value))
    # Discover specifications referenced by docs (not arbitrary JS/assets).
    links.extend(re.findall(r'''["'(](https?://[^\s"'<>)]*|/[^\s"'<>)]*\.(?:yaml|yml|json))''', value))
    links.extend(re.findall(r"(?:^|\s)(/(?:api-spec|openapi|swagger)/[^\s)\]]+\.(?:yaml|yml|json))", value, re.M))
    links = [urljoin(url, unescape(link).rstrip("\\")) for link in links]
    return title, text.replace("\r\n", "\n"), list(dict.fromkeys(links))


def next_documentation_scripts(raw, url):
    """Only hashed page modules explicitly referenced by the official HTML."""
    if urlsplit(url).hostname != "docs.robinhood.com":
        return []
    return [urljoin(url, path) for path in re.findall(r'<script[^>]+src="([^"]+)"', raw.decode("utf8", "replace"))
            if re.match(r"/_next/static/chunks/pages/(?:crypto/(?:connect|trading)|index)-[a-f0-9]+\.js$", path)]


def literal_openapi(raw):
    """Decode published string literals as data. No JS execution or eval of expressions."""
    value = raw.decode("utf8", "replace")
    specs = []
    for match in re.finditer(r"""JSON\.parse\(((?:'(?:\\.|[^'\\])*')|(?:"(?:\\.|[^"\\])*"))\)""", value):
        try:
            literal = ast.literal_eval(match.group(1))  # string constant only, not an executable expression
            data = json.loads(literal)
            if isinstance(data, dict) and ("openapi" in data or "swagger" in data):
                specs.append(data)
        except (ValueError, SyntaxError, TypeError):
            continue
    return specs


def scope(platform, url):
    parts = urlsplit(url)
    host, path = parts.hostname or "", parts.path
    config = CONFIG[platform]
    if host not in config["hosts"]:
        return False, "external_domain_not_validated"
    if re.search(r"/(?:zh|zh-cn|zh-tw|pt|pt-br|es|fr|de|ja|ko|ru|ar|it|tr|uk|vi|id|hi|pl|cs|nl|fa|th|sv|ro|hu|bn)(?:/|$)", path, re.I):
        return False, "duplicate_language"
    if re.search(r"/(?:blog|forum|news|careers|pricing|cdn-cgi|_next|assets|static|images|hosted-pdfs|category)(?:/|$)", path):
        return False, "non_documentation_or_asset"
    if re.search(r"\.(?:png|jpg|webp|gif|svg|pdf|zip|js|css|woff|ico|mp4)$", path):
        return False, "non_text_asset"
    if host == "ethereum.org" and not any(path.startswith(prefix) for prefix in config["paths"]):
        return False, "outside_developer_scope"
    if host in ("eips.ethereum.org", "ercs.ethereum.org") and url not in config.get("standards", []):
        return False, "standard_not_selected_for_project"
    return True, None


def sitemap_links(raw):
    try:
        root = ET.fromstring(raw)
        return [(item.text, root.tag.endswith("sitemapindex")) for item in root.iter() if item.tag.endswith("}loc") and item.text]
    except ET.ParseError:
        return []


def index_pages(text, base):
    return [(unescape(title.strip()), canonical(urljoin(base, link)))
            for title, link in re.findall(r"^\s*-\s*\[([^\]]+)\]\(([^)\s]+)\)", text, re.M)]


def bundle_pages(text, index, base):
    """Split published exports without inventing page URLs; ambiguous titles stay pending."""
    explicit = list(re.finditer(r"^# ([^\n]+)\nSource:\s*(https://\S+)\s*\n", text, re.M))
    if explicit:
        return [(m.group(1), canonical(m.group(2)), text[m.start():explicit[i + 1].start() if i + 1 < len(explicit) else len(text)])
                for i, m in enumerate(explicit)]
    lookup = {}
    for title, url in index:
        lookup.setdefault(title.casefold(), []).append(url)
    start = text.find("# Full Documentation Content")
    body = text[start:] if start >= 0 else text
    candidates, fenced = [], False
    position = 0
    for line in body.splitlines(True):
        if line.startswith(("```", "~~~")):
            fenced = not fenced
        if not fenced and line.startswith("# "):
            title = line[2:].strip()
            urls = lookup.get(title.casefold(), [])
            candidates.append((position, title, urls[0] if len(set(urls)) == 1 else None))
        position += len(line)
    return [(title, url, body[position:candidates[i + 1][0] if i + 1 < len(candidates) else len(body)])
            for i, (position, title, url) in enumerate(candidates) if url]


def repository_links(platform, links):
    owners = {owner.lower() for owner in CONFIG[platform]["owners"]}
    result = set()
    for link in links:
        match = re.match(r"https://github\.com/([^/]+)/([^/?#]+)", link)
        if match and match.group(1).lower() in owners:
            result.add(match.group(1) + "/" + match.group(2).removesuffix(".git"))
    return sorted(result)
