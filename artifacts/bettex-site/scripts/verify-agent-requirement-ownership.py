"""Verify the rendered location of agent requirements in every language."""
from html.parser import HTMLParser
from pathlib import Path
from documentation_audit_html import documentation_html

owners = {
    'documentacao-agentes': [
        'documentacao-integridade-pedido', 'documentacao-propostas-coordenadas',
        'documentacao-validade-cotacoes', 'documentacao-condicoes-execucao',
        'documentacao-continuacao-proposta', 'documentacao-ordens-incertas',
        'documentacao-respostas-fora-de-ordem',
    ],
    'documentacao-subagente-risco': [
        'documentacao-base-investivel', 'documentacao-precisao-risco',
        'documentacao-recuperacao-risco',
    ],
    'documentacao-subagente-tesouraria': [
        'documentacao-reserva-ordens', 'documentacao-custos-autorizados',
        'documentacao-valores-transito', 'documentacao-seguranca-fundos',
    ],
    'documentacao-subagente-governanca': [
        'documentacao-governanca', 'documentacao-adequacao',
        'documentacao-adequacao-legal',
    ],
    'documentacao-subagente-cripto': [
        'documentacao-baseline-cripto', 'documentacao-allora-fluxo',
        'documentacao-conexoes-cripto',
    ],
}

retired_targets = [
    f'documentacao-{prefix}-{market}'
    for prefix in ('subagente', 'baseline', 'conexoes')
    for market in ('esportes', 'previsoes', 'igaming')
]

class Ownership(HTMLParser):
    void = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
            'link', 'meta', 'param', 'source', 'track', 'wbr'}

    def __init__(self):
        super().__init__()
        self.stack = []
        self.targets = {}
        self.duplicate_agent_headings = []

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        chapter = next((p['id'] for t, p in reversed(self.stack)
                        if t == 'article' and 'whitepaper__chapter' in p.get('class', '').split()), None)
        if props.get('id'):
            self.targets.setdefault(props['id'], []).append(chapter)
        if tag in ('h3', 'h4') and 'doc-agent__head' in props.get('class', '').split() and chapter:
            self.duplicate_agent_headings.append(chapter)
        if tag not in self.void:
            self.stack.append((tag, props))

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break


def verify():
    app = Path(__file__).resolve().parents[1]
    for route in ('documentacao', 'en/documentation', 'es/documentacion'):
        audit = Ownership()
        audit.feed(documentation_html(app, '/' + route))
        assert not audit.duplicate_agent_headings, f'{route}: agent names repeated as child headings'
        for target in retired_targets:
            assert target not in audit.targets, f'{route}: retired market remains: {target}'
        for owner, targets in owners.items():
            for target in targets:
                assert audit.targets.get(target) == [owner], (
                    f'{route}: {target} must occur exactly once inside {owner}, got {audit.targets.get(target)}')
        print(f'{route}: no repeated agent headings; technical requirements belong to their responsible agents.')


if __name__ == '__main__':
    verify()
