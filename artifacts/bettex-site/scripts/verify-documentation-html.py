import runpy
from pathlib import Path as NarrativePath

runpy.run_path(str(NarrativePath(__file__).with_name("verify-defi-narrative.py")))
runpy.run_path(str(NarrativePath(__file__).with_name("verify-agent-requirement-ownership.py")), run_name="__main__")
"""Audit compact documentation, retained references and localized downloads."""
import json
import re
from collections import Counter
from documentation_chapter_audit import expected_chapters, verify_chapters
from html.parser import HTMLParser
from documentation_audit_html import documentation_html
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree

app = Path(__file__).resolve().parents[1]
canonical_chapters = expected_chapters(app)
class HeadingAudit(HTMLParser):
    """Catch duplicated section headings, including wrapper/child duplicates."""
    def __init__(self):
        super().__init__()
        self.current = None
        self.headings = []
    def handle_starttag(self, tag, attrs):
        if tag in ('h2', 'h3', 'h4'):
            self.current = (tag, dict(attrs).get('id', ''), [])
    def handle_data(self, data):
        if self.current is not None:
            self.current[2].append(data)
    def handle_endtag(self, tag):
        if self.current is not None and tag == self.current[0]:
            _, anchor, parts = self.current
            text = re.sub(r'^\s*(?:\d+[.\s]*)+', '', ''.join(parts))
            self.headings.append((anchor, ' '.join(text.split()).casefold()))
            self.current = None

class Documentation(HTMLParser):
    def __init__(self):
        super().__init__(); self.stack=[]; self.ids=[]; self.hashes=[]; self.text=[]; self.diagrams=[]; self.chapters=[]
        self.original_flows=set(); self.illustrations=[]; self.agent_count=0
        self.main_text=[]; self.main_diagrams=[]; self.reference_count=0
        self.section_headers=0; self.opening=None
    def handle_starttag(self, tag, attrs):
        props=dict(attrs); self.stack.append((tag,props))
        if tag == 'header' and 'whitepaper__chapter-head' in props.get('class','').split():
            containers=[(t,a) for t,a in self.stack if t in ('details','summary')]
            specialist=any(t=='article' and a.get('id') in (
                'documentacao-especialista-btc', 'documentacao-especialista-eth',
                'documentacao-especialista-sol') for t,a in self.stack)
            # Main openings stay outside accordions. Only the three specialists
            # belong inside their explicit, subordinate specializations group.
            assert not containers or specialist and all(
                t=='details' and a.get('id')=='documentacao-especializacoes-cripto'
                for t,a in containers), "Section titles must not be inside unrelated collapsible containers"
            self.section_headers += 1
            self.opening=[]
        in_reference=any('data-documentation-reference' in a for _,a in self.stack)
        if 'data-documentation-reference' in props: self.reference_count+=1
        if props.get('id'): self.ids.append(props['id'])
        if tag=='a' and props.get('href','').startswith('#'): self.hashes.append(props['href'][1:])
        if tag=='article' and 'whitepaper__chapter' in props.get('class',''): self.chapters.append(props['id'])
        if tag=='section' and 'doc-agent' in props.get('class','').split(): self.agent_count+=1
        if tag=='figure' and {'ba','ds','wd'}.intersection(props.get('class','').split()):
            self.diagrams.append(props.get('id') or props.get('data-testid',''))
            if not in_reference:
                self.main_diagrams.append(props.get('id') or props.get('data-testid',''))
        test_id=props.get('data-testid','')
        if tag=='figure' and test_id.startswith('diagram-bettex-flow-'):
            self.original_flows.add(test_id)
        if tag=='img' and any(folder in props.get('src','') for folder in ('/agents/','/app/','/technology/')):
            self.illustrations.append(props['src'])
            assert 'alt' in props, f"Missing image alt attribute: {props['src']}"
        if tag in ('img','input','br','hr','meta','link'): self.stack.pop()
    def handle_endtag(self, tag):
        if tag == 'header' and self.opening is not None:
            assert ''.join(self.opening).strip(), "Every section opening needs a visible description before its subsections"
            self.opening=None
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i][0]==tag: self.stack=self.stack[:i]; break
    def handle_data(self, text):
        if self.opening is not None and any(t == 'p' for t,_ in self.stack):
            self.opening.append(text)
        if not any(t in ('style','script') for t,_ in self.stack):
            self.text.append(text)
            if not any('data-documentation-reference' in a for _,a in self.stack):
                self.main_text.append(text)

obsolete=[r'quatro posições',r'cinco pessoas',r'50% para a tesouraria e 50% para capital',r'reserva defensiva mínima inicial de 50%',r'destino.{0,50}pendente de confirmação',r'Mercado grande não é demanda comprovada',r'mês 9',r'four paid positions',r'five people',r'four salaried',r'cinco personas',r'cuatro puestos remunerados']
alias_source=(app/'src/lib/documentation-aliases.ts').read_text()
aliases=dict(re.findall(r"['\"](documentacao-[^'\"]+)['\"]\s*:\s*['\"]([^'\"]+)['\"]",alias_source))
for lang, file in [('pt','documentacao.html'),('en','en/documentation.html'),('es','es/documentacion.html')]:
    initial=(app/'dist/public'/file).read_text()
    initial_page=Documentation(); initial_page.feed(initial)
    assert initial_page.chapters == ['documentacao-como-funciona'], f"{lang}: initial page must load Vision only"
    assert 'data-testid="documentation-next"' in initial, f"{lang}: initial section needs a next-section footer link"
    assert 'data-testid="documentation-previous"' not in initial, f"{lang}: Vision has no previous section"
    html=documentation_html(app, '/' + file.removesuffix('/index.html'))
    start=re.search(r'<section\b[^>]*\bid="documentacao"[^>]*>',html).start()
    # The whitepaper fills the section before the shared footer.
    shared_footer=re.search(r'<footer\b[^>]*\bid="rodape"[^>]*>',html)
    p=Documentation(); p.feed(html[start:shared_footer.start()] if shared_footer else html[start:])
    headings=HeadingAudit()
    headings.feed(html[start:shared_footer.start()] if shared_footer else html[start:])
    for previous, current in zip(headings.headings, headings.headings[1:]):
        assert not (previous[1] and previous[1] == current[1]), f"{lang}: repeated consecutive heading {current}"
    duplicates=[id for id,n in Counter(p.ids).items() if n>1]
    assert not duplicates, f"{lang}: duplicate ids {duplicates}"
    verify_chapters(p.chapters, canonical_chapters, lang)
    assert p.section_headers == len(p.chapters) + 2, f"{lang}: every chapter plus Subagents and Features needs a standalone opening"
    assert 'documentacao-features' in p.ids, f"{lang}: features introduction must remain accessible"
    assert p.chapters[-1]=='documentacao-roadmap', f"{lang}: roadmap last"
    for owner in ('risco', 'tesouraria', 'governanca', 'cripto', 'esportes', 'previsoes', 'igaming'):
        assert f'documentacao-subagente-{owner}' in p.chapters, f"{lang}: missing actor {owner}"
    assert p.chapters[0]=='documentacao-como-funciona', f"{lang}: vision first"
    assert 'documentacao-entidade' not in p.chapters, f"{lang}: institutional structure must not remain a principal chapter"
    assert p.reference_count, f"{lang}: technical reference must remain accessible"
    for anchor in ('documentacao-investigacao-tecnico-legal', 'documentacao-disponibilidade-territorial', 'documentacao-revisao-juridica'):
        assert anchor in p.ids, f"{lang}: missing legal compliance subsection {anchor}"
    required_flows={f'diagram-bettex-flow-{number}' for number in (3,6)}
    assert required_flows <= p.original_flows, f"{lang}: missing original drawings {required_flows-p.original_flows}"
    assert len(p.diagrams)>=2, f"{lang}: preserve economic/staking drawings"
    assert len(p.main_diagrams)<=12, f"{lang}: avoid diagram overload in the compact principal reading"
    assert len(p.illustrations)>=1, f"{lang}: preserve relevant contextual imagery"
    missing=sorted(id for id in set(p.hashes) if id not in p.ids and aliases.get(id) not in p.ids)
    assert not missing, f"{lang}: broken documentation links {missing}"
    for old_id,new_id in aliases.items():
        assert new_id in p.ids, f"{lang}: alias {old_id} has missing destination {new_id}"
    text=' '.join(p.text)
    assert not re.search(r'<h[1-6][^>]*>\s*Sustentar a operação\s*</h[1-6]>', html, re.I), f"{lang}: obsolete operating plan heading"
    for pattern in obsolete: assert not re.search(pattern,text,re.I), f"{lang}: obsolete {pattern}"
    principal=' '.join(p.main_text)
    assert 'DeFi' in principal, f"{lang}: missing product positioning"
    for pattern in (r'liderança da empresa BETTEX', r'company to be incorporated', r'empresa a ser constituída', r'empresa por constituir'):
        assert not re.search(pattern,principal,re.I), f"{lang}: obsolete institutional structure"
    print(f"{lang}: {len(p.chapters)} actor/feature chapters, {len(p.main_diagrams)} principal drawings, local references, unique ids and {len(p.hashes)} valid internal links.")
expected_workbooks = {
    "": ["Custos de rede", "Vesting", "Regras"],
    "-en": ["Network costs", "Vesting", "Rules"],
    "-es": ["Costos de red", "Vesting", "Reglas"],
}
for suffix, expected_sheets in expected_workbooks.items():
    file = app/'public/downloads'/f'bettex-taxas-fundacao{suffix}.xlsx'
    with ZipFile(file) as z:
        workbook = ElementTree.fromstring(z.read('xl/workbook.xml'))
        sheets = workbook.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheet')
        names = [sheet.attrib['name'] for sheet in sheets]
        assert names == expected_sheets, f"{file}: expected {expected_sheets}, found {names}"
        worksheet_files = [n for n in z.namelist() if re.fullmatch(r'xl/worksheets/sheet\d+\.xml', n)]
        assert len(worksheet_files) == len(expected_sheets), f"{file}: missing or unexpected worksheet files"
        raw=' '.join(z.read(n).decode() for n in z.namelist() if n.endswith('.xml'))
        for pattern in obsolete: assert not re.search(pattern,raw,re.I), f"{file}: obsolete material"
        alternative = ' '.join(ElementTree.fromstring(z.read('xl/worksheets/sheet1.xml')).itertext())
        assert re.search(r'custos externos da rede|external network costs|costos externos de la red', alternative, re.I), f"{file}: missing external network-cost disclosure"
        assert re.search(r'não cobra taxas de serviço|does not charge service fees|no cobra (?:comisiones|tarifas) de servicio', alternative, re.I), f"{file}: missing community no-service-fee rule"
        assert not re.search(r'contribuição por serviços|service contribution|contribución por servicios|Em avaliação', alternative, re.I), f"{file}: operating-funding proposal reintroduced"
        assert '<v>2.5</v>' not in alternative, f"{file}: fixed fee reintroduced"
        assert 'Tarifa confirmada' not in raw, f"{file}: confirmed fee reintroduced"
print('Downloads: network-cost notes only, unchanged vesting and rules; no operating-funding proposal or old cash-flow simulation.')