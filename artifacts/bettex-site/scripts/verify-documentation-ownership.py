"""Ensure the approved ownership migration preserves original rules, links and assets."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import subprocess
from documentation_audit_html import documentation_html


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
    # User-authorized business terminology only; keep the immutable fixture intact.
    terminology_baseline = json.loads(subprocess.run(
        ['node', '--input-type=module', '-e', """
import { documentationOrderTerminology } from './src/lib/documentation-order-terminology.ts';
let raw = ''; for await (const chunk of process.stdin) raw += chunk;
const baseline = JSON.parse(raw);
for (const [route, document] of Object.entries(baseline)) {
  const language = route.startsWith('/en/') ? 'en' : route.startsWith('/es/') ? 'es' : 'pt';
  document.paragraphs = document.paragraphs.map(text => documentationOrderTerminology(text, language));
}
console.log(JSON.stringify(baseline));
"""], cwd=app, input=json.dumps(baseline), text=True, capture_output=True, check=True).stdout)
    # These standalone reading prompts were removed at the creator's request.
    # Identify their positions in the original PT baseline so the same nine
    # prompt-only paragraphs are excluded in all three aligned locales.
    relocated_reading_prompts = {
        'Entender a tokenomics',
        'Ver as alternativas Starknet e Arbitrum, ativos e carteiras.',
        'Apuração e liquidação dos resultados · Recompra e queima',
        'Controles de risco',
        'Financiamento: origem e destino dos recursos',
        'Consultar alternativas de sustentabilidade.',
        'Ver regras de loteria e Double 2X',
    }
    reading_prompt_slots = {
        index for index, paragraph in enumerate(baseline['/documentacao']['paragraphs'])
        if paragraph in relocated_reading_prompts
    }
    assert len(reading_prompt_slots) == 9, 'Reading prompt baseline changed'
    # Opening portraits were intentionally removed; contextual illustrations
    # within the chapter content remain protected by the original baseline.
    removed_opening_portraits = {
        '/agents/bettex-intelligence-brain.webp',
        '/agents/predix-serious.webp',
        '/agents/tradix-serious.webp',
        '/agents/sportix-serious.webp',
        '/agents/bettix-serious.webp',
    }
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
    # Only restore the original grammar of inline fragments. Whole-paragraph
    # summaries, source references, economic rules and unrelated copy stay guarded.
    continuity_pairs = json.loads(subprocess.run(
        ['node', '--input-type=module', '-e', """
import { isDocumentationContinuation, preserveDocumentationSpacing } from './src/lib/documentation-prose.ts';
import { roundTerminology } from './src/lib/round-terminology.ts';
import { documentationAgentTerminology as terms } from './src/lib/documentation-agent-terminology.ts';
let raw = ''; for await (const chunk of process.stdin) raw += chunk;
const { editorial, canonical } = JSON.parse(raw), pairs = {pt: [], en: [], es: []};
for (const [source, entry] of Object.entries(editorial)) {
  if (!isDocumentationContinuation(source) || !canonical[source]) continue;
  for (const lang of ['pt', 'en', 'es']) {
    if (!entry[lang]) continue;
    const clean = text => terms(roundTerminology(preserveDocumentationSpacing(source, text), lang), lang).replace(/\\s+/g, ' ').trim();
    const before = clean(entry[lang]);
    const after = clean(lang === 'pt' ? canonical[source].pt ?? source : canonical[source][lang]);
    if (before !== after && before.length > 20) pairs[lang].push([before, after]);
  }
}
console.log(JSON.stringify(pairs));
"""], cwd=app, input=json.dumps({
            'editorial': json.loads((app / 'src/lib/locales/documentation-synthesis.json').read_text()),
            'canonical': {**json.loads((app / 'src/lib/locales/translations.json').read_text()), **english_sources},
        }), text=True, capture_output=True, check=True).stdout)
    metadata = set(old_eyebrows)
    for text in old_subtitles:
        metadata.add(text)
        metadata.update(catalogue.get(text, {}).values())
    for key, translations in {**catalogue, **english_sources}.items():
        if translations.get('pt') in old_subtitles:
            metadata.add(key)
            metadata.update(translations.values())
    for route, original in baseline.items():
        html = documentation_html(app, route)
        # The creator explicitly qualified named technology adoption. Only
        # these additive inline qualifiers are excluded from the old prose comparison.
        qualifier_pattern = re.compile(r'<span\b(?=[^>]*data-documentation-technology-condition)[^>]*>([^<]*)</span>')
        language = 'en' if route.startswith('/en/') else 'es' if route.startswith('/es/') else 'pt'
        allowed_qualifiers = {
            'pt': {' (caso utilizada)', 'Caso utilizada, '},
            'en': {' (if used)', 'If used, '},
            'es': {' (si se utiliza)', 'Si se utiliza, '},
        }[language]
        qualifiers = qualifier_pattern.findall(html)
        assert qualifiers and all(text in allowed_qualifiers for text in qualifiers), \
            f'{route}: only approved localized technology qualifiers may be excluded'
        html = qualifier_pattern.sub('', html)
        # The creator clarified who selects opportunities, preserving every
        # evaluation criterion and the recorded rationale in the original rule.
        old_decision = {
            'pt': 'IA compara alternativas, escolhe a vantajosa segundo retorno, custos, liquidez, exposição e risco. Registra critérios e motivos.',
            'en': 'AI compares alternatives, chooses the advantageous one based on return, costs, liquidity, exposure, and risk. Registers criteria and reasons.',
            'es': 'La IA compara alternativas, elige la ventajosa según retorno, costos, liquidez, exposición y riesgo. Registra criterios y motivos.',
        }[language]
        new_decision = 'O agente BETTEX compara as alternativas e seleciona a melhor oportunidade segundo retorno esperado, custos, liquidez, exposição e risco. Registra os critérios e o motivo da escolha.'
        if language != 'pt':
            new_decision = catalogue[new_decision][language]
        assert html.count(new_decision) == 1, f'{route}: opportunity selection must explicitly belong to the BETTEX agent'
        current = DocumentationContent()
        current.feed(html)
        missing_ids = set(original['ids']) - set(current.ids)
        assert not missing_ids, f'{route}: original deep links lost: {sorted(missing_ids)}'
        # The creator explicitly removed the duplicate on-page directory and
        # its "back to index" control. This is navigation, not a body reference;
        # keep its bookmark ID. The subsequently removed "Related topics"
        # footers were the last suggested links to these three destinations.
        # Their content and bookmark IDs must remain; all other links stay protected.
        removed_reading_links = {'#documentacao-controles', '#documentacao-loteria', '#documentacao-rede'}
        assert all(target[1:] in current.ids for target in removed_reading_links), f'{route}: content behind removed reading suggestions must remain'
        missing_links = set(original['links']) - set(current.links) - {'#documentacao-indice'} - removed_reading_links
        assert not missing_links, f'{route}: original references lost: {sorted(missing_links)}'
        assert removed_opening_portraits <= set(original['images']), f'{route}: opening portrait baseline drift'
        assert not removed_opening_portraits & set(current.images), f'{route}: removed opening portraits restored'
        assert not (set(original['images']) - removed_opening_portraits) - set(current.images), f'{route}: contextual illustrations lost'
        # Precisely scoped copy corrections approved after the ownership snapshot.
        # Keep the immutable baseline and all other paragraphs protected.
        connections_intro = 'Os subagentes coletam oportunidades e analisam alternativas segundo retorno esperado, custos, liquidez, exposição e risco. O agente BETTEX compara as propostas, seleciona a melhor oportunidade e registra os critérios e os motivos da decisão. Define o investimento dentro da parcela investível autorizada e envia a ordem somente após aprovação independente de risco. O registro público acompanha toda a rodada: oportunidades coletadas, selecionadas e descartadas, motivos da decisão, valores investidos e estados das transações.'
        # Replace only the explicitly approved, drawing-referential paragraph.
        approved_proposals = {
            'O desenho 7 apresenta os subagentes, as conexões e a execução automática. O desenho 8 Subagentes analisam oportunidades com critérios de risco e retorno. IA registra decisões e envia ordens após aprovação independente. Rodada completa é público.':
                connections_intro,
            'THE design 7 presents subagents, connections, and automatic execution. The design 8 Subagents analyze opportunities with risk and return criteria. AI records decisions and sends orders after independent approval. The full round is public.':
                catalogue[connections_intro]['en'],
            'EL diseño 7 presenta los subagentes, las conexiones y la ejecución automática. El diseño 8 Los subagentes analizan oportunidades con criterios de riesgo y retorno. La IA registra decisiones y envía órdenes tras aprobación independiente. La ronda completa es público.':
                catalogue[connections_intro]['es'],
            old_decision: new_decision,
            'A proposta da BETTEX é transformar apostadores em investidores, com estratégias de mercado, automação por IA e gestão de risco.':
                'A proposta da BETTEX é transformar apostadores em investidores por meio de um projeto DeFAI',
            "BETTEX's proposal is to turn bettors into investors through market strategies, AI automation and risk management.":
                "BETTEX's proposal is to turn bettors into investors through a DeFAI project",
            'La propuesta de BETTEX es transformar a los apostadores en inversores, con estrategias de mercado, automatización mediante IA y gestión del riesgo.':
                'La propuesta de BETTEX es transformar a los apostadores en inversores mediante un proyecto DeFAI',
        }
        def approved_copy(paragraph):
            if paragraph in approved_proposals:
                return approved_proposals[paragraph]
            for prefix, sports in (
                ('DeFi para DeFi AI (DeFAI). A BETTEX busca desenvolver', 'esportes (surebet)'),
                ('From DeFi to DeFi AI (DeFAI). BETTEX aims to develop', 'sports (surebet)'),
                ('De DeFi a DeFi AI (DeFAI). BETTEX busca desarrollar', 'deportes (surebet)'),
                ('O agente BETTEX é a inteligência de orquestração de um sistema descentralizado.', 'esportes (surebet)'),
                ('The BETTEX agent is the orchestration intelligence of a decentralized system.', 'sports (surebet)'),
                ('El agente BETTEX es la inteligencia de orquestación de un sistema descentralizado.', 'deportes (surebet)'),
            ):
                if paragraph.startswith(prefix):
                    updated = paragraph.replace('esports', sports)
                    # Linked standalone terms use their existing locale translation.
                    # Scope this to the Spanish opening, not normative body copy.
                    if prefix.startswith('De DeFi a DeFi AI'):
                        updated = updated.replace('predictions (mercados de predicción)', 'predicciones (mercados de predicción)')
                    return updated
            return paragraph
        assert len(original['paragraphs']) == len(baseline['/documentacao']['paragraphs']), f'{route}: localized baseline alignment changed'
        def coherent_copy(paragraph):
            # Normalize business-order terminology only when the complete,
            # independently rendered paragraph confirms that change. A glossary
            # definition of generic request idempotency is not an investment order.
            term_pairs = dict(zip(original['paragraphs'], terminology_baseline[route]['paragraphs']))
            for candidate in (term_pairs.get(paragraph, paragraph), paragraph):
                updated = candidate
                for before, after in sorted(continuity_pairs[language], key=lambda pair: -len(pair[0])):
                    join = ' ' if before[:1] in '.,;:!?' and after[:1].isalpha() else ''
                    updated = updated.replace(before, join + after)
                updated = ' '.join(updated.split())
                if language == 'pt':
                    updated = updated.replace('todo a rodada', 'toda a rodada')
                if language == 'es':
                    updated = updated.replace('todo la ronda', 'toda la ronda')
                if updated.startswith(('A Robinhood ', 'A Robinhood Crypto Trading API ', 'A Allora ')):
                    updated = updated[2:]
                if updated in current.paragraphs:
                    return updated
            # Do not infer changes to standalone paragraphs. The independently
            # restored canonical composition must actually appear in the page.
            return paragraph
        expected = Counter(coherent_copy(approved_copy(p)) for index, p in enumerate(original['paragraphs'])
                           if index not in reading_prompt_slots and p not in metadata)
        # Explicitly authorized removal: the illustrative demo walkthrough only.
        # Retain the immutable baseline and protect all other product paragraphs.
        language = 'en' if route.startswith('/en/') else 'es' if route.startswith('/es/') else 'pt'
        removed_demo_prefixes = {
            'pt': ('Caso ilustrativo:', '1. Entrar e conhecer as carteiras',
                   '2. Participar de uma rodada', '3. Acompanhar a Central da IA',
                   '4. Entender o resultado', '5. Consultar e decidir', 'O demo é exclusivamente visual:'),
            'en': ('Illustrative case:', '1. Enter and explore the wallets',
                   '2. Participate in a round', '3. Follow the AI Center',
                   '4. Understand the result', '5. Review and decide', 'The demo is visual only:'),
            'es': ('Caso ilustrativo:', '1. Entrar y conocer las carteras',
                   '2. Participar en una ronda', '3. Seguir la Central de IA',
                   '4. Entender el resultado', '5. Consultar y decidir', 'El demo es exclusivamente visual:'),
        }
        for prefix in removed_demo_prefixes[language]:
            removed = [paragraph for paragraph in expected if paragraph.startswith(prefix)]
            assert len(removed) == 1, f'{route}: demo-removal exception must match one original paragraph: {prefix}'
            expected[removed[0]] -= 1
        missing = expected - Counter(current.paragraphs)
        assert not missing, f'{route}: original baseline paragraphs lost: {list(missing.items())[:8]}'
        assert 'documentation-poc-scope' in html, f'{route}: missing explicit POC scope'
        for marker in ('documentacao-subagente-risco', 'documentacao-subagente-tesouraria', 'documentacao-subagente-governanca', 'documentacao-carteira-bettex', 'documentacao-carteira-usdc'):
            assert marker in current.ids, f'{route}: missing owner {marker}'
        print(f'{route}: original paragraphs, IDs, links and contextual images preserved; opening portraits absent; POC and owners verified.')


if __name__ == '__main__':
    verify()
