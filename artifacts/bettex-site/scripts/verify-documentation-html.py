"""Audit only documentation, not the separately maintained Pitch/home/demo."""
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree

app = Path(__file__).resolve().parents[1]
class Documentation(HTMLParser):
    def __init__(self):
        super().__init__(); self.stack=[]; self.ids=[]; self.hashes=[]; self.text=[]; self.diagrams=[]; self.chapters=[]
        self.original_flows=set(); self.illustrations=[]; self.agent_count=0
    def handle_starttag(self, tag, attrs):
        props=dict(attrs); self.stack.append((tag,props))
        if props.get('id'): self.ids.append(props['id'])
        if tag=='a' and props.get('href','').startswith('#'): self.hashes.append(props['href'][1:])
        if tag=='article' and 'whitepaper__chapter' in props.get('class',''): self.chapters.append(props['id'])
        if tag=='section' and 'doc-agent' in props.get('class','').split(): self.agent_count+=1
        if tag=='figure' and {'ba','ds','wd'}.intersection(props.get('class','').split()):
            self.diagrams.append(props.get('id') or props.get('data-testid',''))
            assert not any(t=='details' for t,_ in self.stack), f"Hidden diagram: {props}"
        test_id=props.get('data-testid','')
        if tag=='figure' and test_id.startswith('diagram-bettex-flow-'):
            self.original_flows.add(test_id)
        if tag=='img' and any(folder in props.get('src','') for folder in ('/agents/','/app/','/technology/')):
            self.illustrations.append(props['src'])
            assert 'alt' in props, f"Missing image alt attribute: {props['src']}"
        if tag in ('img','input','br','hr','meta','link'): self.stack.pop()
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i][0]==tag: self.stack=self.stack[:i]; break
    def handle_data(self, text):
        if not any(t in ('style','script') for t,_ in self.stack): self.text.append(text)

obsolete=[r'quatro posições',r'cinco pessoas',r'50% para a tesouraria e 50% para capital',r'reserva defensiva mínima inicial de 50%',r'destino.{0,50}pendente de confirmação',r'Sustentar a operação',r'Mercado grande não é demanda comprovada',r'mês 9',r'four paid positions',r'five people',r'four salaried',r'cinco personas',r'cuatro puestos remunerados']
for lang, file in [('pt','documentacao.html'),('en','en/documentation.html'),('es','es/documentacion.html')]:
    html=(app/'dist/public'/file).read_text()
    start=re.search(r'<section\b[^>]*\bid="documentacao"[^>]*>',html).start()
    # The whitepaper fills the section before the shared footer.
    shared_footer=re.search(r'<footer\b[^>]*\bid="rodape"[^>]*>',html)
    p=Documentation(); p.feed(html[start:shared_footer.start()] if shared_footer else html[start:])
    duplicates=[id for id,n in Counter(p.ids).items() if n>1]
    assert not duplicates, f"{lang}: duplicate ids {duplicates}"
    assert len(p.chapters)==14, f"{lang}: chapter count"
    assert p.chapters[2]=='documentacao-adequacao-legal', f"{lang}: missing legal compliance chapter"
    for anchor in ('documentacao-investigacao-tecnico-legal', 'documentacao-disponibilidade-territorial', 'documentacao-revisao-juridica'):
        assert anchor in p.ids, f"{lang}: missing legal compliance subsection {anchor}"
    required_flows={f'diagram-bettex-flow-{number}' for number in range(1,9)}
    assert required_flows <= p.original_flows, f"{lang}: missing original drawings {required_flows-p.original_flows}"
    assert 8 <= len(p.diagrams) <= 12, f"{lang}: keep essential drawings without diagram overload ({len(p.diagrams)})"
    assert len(p.illustrations)>=6, f"{lang}: missing contextual illustrations"
    assert len(set(p.illustrations))>=6, f"{lang}: illustrations should not repeat one image throughout"
    missing=sorted(set(p.hashes)-set(p.ids))
    assert not missing, f"{lang}: broken documentation links {missing}"
    text=' '.join(p.text)
    for pattern in obsolete: assert not re.search(pattern,text,re.I), f"{lang}: obsolete {pattern}"
    assert p.agent_count==8, f"{lang}: missing agent explanations"
    print(f"{lang}: 14 chapters, {len(p.diagrams)} essential diagrams, {len(p.illustrations)} illustrations, original drawings preserved, unique ids and {len(p.hashes)} valid internal links.")
expected_workbooks = {
    "": ["Taxas", "Vesting", "Regras"],
    "-en": ["Fees", "Vesting", "Rules"],
    "-es": ["Tasas", "Vesting", "Reglas"],
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
print('Downloads: three localized worksheets for fees, vesting and rules; no old cash-flow simulation.')