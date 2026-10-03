"""Export the preparatory entity memorandum, without external dependencies."""
from pathlib import Path
from html import escape
from zipfile import ZipFile, ZIP_DEFLATED
import re

ROOT = Path(__file__).resolve().parent.parent
source = (ROOT / "research/bettex-entidade-unica.md").read_text()
out = ROOT / "artifacts/bettex-site/public/downloads"
out.mkdir(parents=True, exist_ok=True)

def inline(s):
    s = escape(s)
    s = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2">\1</a>', s)
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)

html_blocks = []
paragraphs = []
for line in source.splitlines():
    if not line.strip():
        continue
    match = re.match(r"^(#{1,3}) (.*)$", line)
    if match:
        level, text = len(match[1]), match[2]
        html_blocks.append(f"<h{level}>{inline(text)}</h{level}>")
        paragraphs.append((f"Heading{level}", text))
    elif line.startswith("- "):
        html_blocks.append(f'<p class="item">• {inline(line[2:])}</p>')
        paragraphs.append(("Normal", "• " + line[2:]))
    else:
        html_blocks.append(f"<p>{inline(line)}</p>")
        paragraphs.append(("Normal", line))

css = """
*{box-sizing:border-box}body{margin:0;background:#f3f4f7;color:#182039;font:16px/1.65 Arial,sans-serif}
main{max-width:920px;margin:40px auto;background:white;padding:52px 64px;border-top:6px solid #3155ee}
.eyebrow{color:#3155ee;font-size:12px;font-weight:bold;letter-spacing:1.6px}
h1{font-size:32px;line-height:1.2;letter-spacing:-.6px;margin:18px 0 26px}
h2{font-size:23px;margin:40px 0 16px;border-bottom:1px solid #dde1ea;padding-bottom:10px}
h3{font-size:18px;margin:25px 0 12px}p{margin:12px 0}p.item{padding-left:18px;text-indent:-18px;margin:7px 0}
a{color:#254bd8;overflow-wrap:anywhere}strong{font-weight:700}
footer{border-top:1px solid #dde1ea;margin-top:36px;padding-top:16px;color:#566174;font-size:12px}
@media(max-width:650px){main{margin:0;padding:28px 22px}h1{font-size:27px}h2{font-size:21px}}
@page{size:A4;margin:18mm 18mm 20mm}
@media print{body{background:white;font-size:10.5pt;line-height:1.45}main{max-width:none;margin:0;padding:0;border:0}
h1{font-size:24pt}h2{font-size:15pt;margin:22px 0 12px}h3{font-size:12pt}
h1,h2,h3{break-after:avoid}p{orphans:3;widows:3}a{color:#182039}}
"""
html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BETTEX — estruturação da entidade única</title><style>' + css + '</style></head><body><main><div class="eyebrow">BETTEX · ESTRUTURA JURÍDICA PREPARATÓRIA</div>' + "\n".join(html_blocks) + '<footer>Documento de trabalho · Consulta em 3 de outubro de 2026 · Sem país escolhido ou autorização de operação.</footer></main></body></html>'
(out / "bettex-entidade-unica.html").write_text(html)

# Minimal editable OOXML: no macros, external media, or hidden document metadata.
def xmltext(s):
    return escape(s, quote=True)

def runs(text):
    text = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r"\1 (\2)", text)
    parts = re.split(r"(\*\*.*?\*\*)", text)
    return "".join(
        '<w:r>' + ('<w:rPr><w:b/></w:rPr>' if part.startswith("**") else '') +
        '<w:t xml:space="preserve">' + xmltext(part[2:-2] if part.startswith("**") else part) + '</w:t></w:r>'
        for part in parts if part
    )

body = "".join(f'<w:p><w:pPr><w:pStyle w:val="{style}"/></w:pPr>{runs(text)}</w:p>' for style, text in paragraphs)
styles = """<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:spacing w:after="120" w:line="320" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/><w:lang w:val="pt-BR"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="240"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="182039"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="160"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="3155EE"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="Heading 3"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="180" w:after="100"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style></w:styles>"""
document = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + body + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1020" w:right="1020" w:bottom="1134" w:left="1020"/></w:sectPr></w:body></w:document>'
with ZipFile(out / "bettex-entidade-unica.docx", "w", ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>')
    z.writestr("_rels/.rels", '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
    z.writestr("word/document.xml", document)
    z.writestr("word/styles.xml", styles)
    z.writestr("word/_rels/document.xml.rels", '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>')
print(out / "bettex-entidade-unica.html")
print(out / "bettex-entidade-unica.docx")