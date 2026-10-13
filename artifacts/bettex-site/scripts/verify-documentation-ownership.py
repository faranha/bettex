"""Ensure the approved ownership migration preserves original rules, links and assets."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json
import subprocess


class DocumentationContent(HTMLParser):
    void = {'img', 'input', 'br', 'hr', 'source', 'meta', 'link', 'path', 'circle', 'rect', 'line', 'polygon', 'polyline'}

    def __init__(self):
        super().__init__()
        self.depth = 0
        self.paragraph = None
        self.paragraphs = []
        self.ids, self.links, self.images = [], [], []

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if props.get('id') == 'documentacao':
            self.depth = 1
        elif self.depth and tag not in self.void:
            self.depth += 1
        if not self.depth:
            return
        if props.get('id'):
            self.ids.append(props['id'])
        if tag == 'a' and props.get('href'):
            self.links.append(props['href'])
        if tag == 'img':
            self.images.append(props.get('src'))
        if tag == 'p':
            self.paragraph = []

    def handle_data(self, data):
        if self.depth and self.paragraph is not None:
            self.paragraph.append(data)

    def handle_endtag(self, tag):
        if self.depth and tag == 'p' and self.paragraph is not None:
            self.paragraphs.append(' '.join(''.join(self.paragraph).split()))
            self.paragraph = None
        if self.depth and tag not in self.void:
            self.depth -= 1


def verify():
    app = Path(__file__).resolve().parents[1]
    baseline = json.loads((app / 'scripts/documentation-ownership-baseline.json').read_text())
    # Only the old eyebrow is replaced: the user explicitly changed this document's stage.
    old_eyebrows = {'VISÃO, ARQUITETURA E REGRAS', 'VISION, ARCHITECTURE AND RULES', 'VISIÓN, ARQUITECTURA Y REGLAS'}
    # The six old chapter descriptions are navigation metadata, replaced by the
    # new responsibility-specific descriptions. No normative body paragraph is exempt.
    old_subtitles = [
        'Esta documentação é a linha de base para evoluir de DeFi para DeFAI.',
        'Inferência, colaboração e aprendizado a partir de uma base inicial.',
        'DeFAI e DEX: finanças e inteligência artificial descentralizadas, com o token da própria comunidade.',
        'Como o saldo de BETTEX no aplicativo permite participar dos lucros do protocolo, quando houver distribuição.',
        'Seis marcos, da preparação à gestão crescente por IA.',
        'Administração inicial, evolução para gestão por IA, controles e riscos materiais.',
    ]
    catalogue = json.loads((app / 'src/lib/locales/translations.json').read_text())
    catalogue.update(json.loads((app / 'src/lib/locales/documentation-synthesis.json').read_text()))
    catalogue.update(json.loads(subprocess.check_output(
        ['node', '--input-type=module', '-e',
         "import {intelligenceTranslations} from './src/lib/documentation-intelligence.ts'; console.log(JSON.stringify(intelligenceTranslations));"],
        cwd=app, text=True)))
    english_sources = json.loads((app / 'src/lib/locales/english-source-messages.json').read_text())
    metadata = set(old_eyebrows)
    for text in old_subtitles:
        metadata.add(text)
        metadata.update(catalogue.get(text, {}).values())
    for key, translations in {**catalogue, **english_sources}.items():
        if translations.get('pt') in old_subtitles:
            metadata.add(key)
            metadata.update(translations.values())
    for route, original in baseline.items():
        html = (app / 'dist/public' / route.strip('/') / 'index.html').read_text()
        current = DocumentationContent()
        current.feed(html)
        missing_ids = set(original['ids']) - set(current.ids)
        assert not missing_ids, f'{route}: original deep links lost: {sorted(missing_ids)}'
        assert not set(original['links']) - set(current.links), f'{route}: original references lost'
        assert not set(original['images']) - set(current.images), f'{route}: original illustrations lost'
        expected = Counter(p for p in original['paragraphs'] if p not in metadata)
        missing = expected - Counter(current.paragraphs)
        assert not missing, f'{route}: original baseline paragraphs lost: {list(missing.items())[:8]}'
        assert 'documentation-poc-scope' in html, f'{route}: missing explicit POC scope'
        for marker in ('documentacao-subagente-risco', 'documentacao-subagente-tesouraria', 'documentacao-subagente-governanca', 'documentacao-carteira-bettex', 'documentacao-carteira-usdc'):
            assert marker in current.ids, f'{route}: missing owner {marker}'
        print(f'{route}: original paragraphs, IDs, links and images preserved; POC and owners verified.')


if __name__ == '__main__':
    verify()
