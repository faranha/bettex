"""Audit only documentation, not the separately maintained Pitch/home/demo."""
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from zipfile import ZipFile

app = Path(__file__).resolve().parents[1]
class Documentation(HTMLParser):
    def __init__(self):
        super().__init__(); self.stack=[]; self.ids=[]; self.hashes=[]; self.text=[]; self.diagrams=[]; self.chapters=[]
    def handle_starttag(self, tag, attrs):
        props=dict(attrs); self.stack.append((tag,props))
        if props.get('id'): self.ids.append(props['id'])
        if tag=='a' and props.get('href','').startswith('#'): self.hashes.append(props['href'][1:])
        if tag=='article' and 'whitepaper__chapter' in props.get('class',''): self.chapters.append(props['id'])
        if tag=='figure':
            self.diagrams.append(props.get('id',''))
            assert not any(t=='details' for t,_ in self.stack), f"Hidden diagram: {props}"
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
    assert len(p.chapters)==13, f"{lang}: chapter count"
    assert len(p.diagrams)>=25, f"{lang}: missing educational schemes"
    missing=sorted(set(p.hashes)-set(p.ids))
    assert not missing, f"{lang}: broken documentation links {missing}"
    text=' '.join(p.text)
    for pattern in obsolete: assert not re.search(pattern,text,re.I), f"{lang}: obsolete {pattern}"
    assert html.count('class="doc-agent"')==8
    print(f"{lang}: 13 chapters, {len(p.diagrams)} visible schemes, unique ids and {len(p.hashes)} valid internal links.")
for file in (app/'public/downloads').glob('bettex-*.xlsx'):
    with ZipFile(file) as z:
        assert len([n for n in z.namelist() if n.startswith('xl/worksheets/')])==4
        raw=' '.join(z.read(n).decode() for n in z.namelist() if n.endswith('.xml'))
        for pattern in obsolete: assert not re.search(pattern,raw,re.I), f"{file}: obsolete material"
print('Downloads: current pilot, fees, rules and vesting; no old cash-flow simulation.')