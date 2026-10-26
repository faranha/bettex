"""Generate current PT/EN/ES materials from approved data; no legacy forecasts."""
import json
import re
import textwrap
import shutil
import subprocess
from html import escape
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

app = Path(__file__).resolve().parents[1]
lib = app / "src/lib"
out = app / "public/downloads"
out.mkdir(parents=True, exist_ok=True)
materials = json.loads((lib / "documentation-materials.json").read_text())
consistency = json.loads((lib / "documentation-consistency.json").read_text())
materials["sections"].extend(consistency["sections"])
catalogue = json.loads((lib / "locales/translations.json").read_text())
catalogue.update(json.loads((lib / "locales/documentation-synthesis.json").read_text()))
catalogue.update(json.loads((lib / "locales/documentation-architecture.json").read_text()))
# Reuse the same documentation-only nomenclature as the site, including archived
# downloads. Node is already required by the build; there is no duplicated rule set.
editorial = subprocess.run(
    ["node", "--input-type=module", "-e", """
import { documentationAgentTerminology as terms } from './src/lib/documentation-agent-terminology.ts';
import { intelligenceCopy, intelligenceTranslations } from './src/lib/documentation-intelligence.ts';
import { businessIntelligence, businessRules, businessTranslations } from './src/lib/documentation-business.ts';
let input = ''; for await (const part of process.stdin) input += part;
const catalog = { ...JSON.parse(input), ...intelligenceTranslations, ...businessTranslations };
for (const [key, entry] of Object.entries(catalog)) {
  for (const lang of ['pt', 'en', 'es']) {
    if (entry[lang]) entry[lang] = terms(entry[lang], lang);
  }
  if (!entry.pt) entry.pt = terms(key, 'pt');
}
console.log(JSON.stringify({ catalog, copy: intelligenceCopy, business: { intelligence: businessIntelligence, rules: businessRules } }));
"""],
    input=json.dumps(catalogue), text=True, capture_output=True, check=True, cwd=app,
)
editorial = json.loads(editorial.stdout)
catalogue = editorial["catalog"]
agent_copy = editorial["copy"]
business = editorial["business"]
# These are the same current-scope passages rendered on the site, not a second
# independent financial rule source. Retain the existing download structure.
materials["sections"].insert(0, {
    "title": "Escopo atual e desenvolvimento da IA",
    "paragraphs": [
        business["intelligence"]["agP1"][0],
        business["intelligence"]["agP2"][0],
        business["intelligence"]["baseline"][0],
        business["rules"]["cap"][0],
        business["rules"]["openEconomics"][0],
    ],
})
materials["sections"].insert(0, {
    "title": agent_copy["agentDefinitionTitle"],
    "paragraphs": [agent_copy["agentDefinition"], agent_copy["subagentDefinition"]],
})
materials["sections"].insert(1, {
    "title": agent_copy["governanceTitle"],
    "paragraphs": [agent_copy["governanceDocumentation"]],
})
ns = "http://schemas.openxmlformats.org"

def xlsx(path, sheets):
    def cell(value, row, col):
        name = ""
        while col:
            col, rem = divmod(col - 1, 26)
            name = chr(65 + rem) + name
        ref = f'{name}{row}'
        if isinstance(value, (int, float)):
            return f'<c r="{ref}"><v>{value}</v></c>'
        return f'<c r="{ref}" t="inlineStr"><is><t>{escape(str(value))}</t></is></c>'
    with ZipFile(path, "w", ZIP_DEFLATED) as z:
        types = [f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' for i in range(1, len(sheets)+1)]
        z.writestr("[Content_Types].xml", f'<Types xmlns="{ns}/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>{"".join(types)}</Types>')
        z.writestr("_rels/.rels", f'<Relationships xmlns="{ns}/package/2006/relationships"><Relationship Id="rId1" Type="{ns}/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
        sheetnames = "".join(f'<sheet name="{escape(name, quote=True)}" sheetId="{i}" r:id="rId{i}"/>' for i, (name, _) in enumerate(sheets, 1))
        z.writestr("xl/workbook.xml", f'<workbook xmlns="{ns}/spreadsheetml/2006/main" xmlns:r="{ns}/officeDocument/2006/relationships"><sheets>{sheetnames}</sheets></workbook>')
        z.writestr("xl/_rels/workbook.xml.rels", f'<Relationships xmlns="{ns}/package/2006/relationships">{"".join(f"""<Relationship Id="rId{i}" Type="{ns}/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>""" for i in range(1,len(sheets)+1))}</Relationships>')
        for i, (_, rows) in enumerate(sheets, 1):
            data = "".join(f'<row r="{r}">{"".join(cell(v,r,c) for c,v in enumerate(row,1))}</row>' for r, row in enumerate(rows, 1))
            z.writestr(f"xl/worksheets/sheet{i}.xml", f'<worksheet xmlns="{ns}/spreadsheetml/2006/main"><sheetData>{data}</sheetData></worksheet>')

def pdf(path, paragraphs):
    # Unicode source maps to PDF's standard WinAnsi font; replace only uncommon
    # symbols that Helvetica cannot represent, never monetary digits or rules.
    lines = []
    for text in paragraphs:
        text = text.replace("×", " x ").replace("÷", " / ").replace("→", " -> ").replace("−", "-")
        lines.extend(textwrap.wrap(text, width=95) or [""])
        lines.append("")
    objects = [b"", b"", b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"]
    kids = []
    for start in range(0, len(lines), 48):
        page_id, stream_id = len(objects)+1, len(objects)+2
        kids.append(f"{page_id} 0 R")
        commands = ["BT /F1 10 Tf 14 TL 48 790 Td"]
        for line in lines[start:start+48]:
            escaped = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
            commands.append(f"({escaped}) Tj T*")
        stream = ("\n".join(commands) + "\nET").encode("cp1252", errors="replace")
        objects.extend([f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents {stream_id} 0 R >>'.encode(), b'<< /Length '+str(len(stream)).encode()+b' >>\nstream\n'+stream+b'\nendstream'])
    objects[0] = b"<< /Type /Catalog /Pages 2 0 R >>"
    objects[1] = f'<< /Type /Pages /Count {len(kids)} /Kids [{" ".join(kids)}] >>'.encode()
    data = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for i, obj in enumerate(objects, 1):
        offsets.append(len(data)); data.extend(f"{i} 0 obj\n".encode()+obj+b"\nendobj\n")
    xref = len(data)
    data.extend(f"xref\n0 {len(objects)+1}\n0000000000 65535 f \n".encode())
    data.extend("".join(f"{offset:010} 00000 n \n" for offset in offsets[1:]).encode())
    data.extend(f"trailer << /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF".encode())
    path.write_bytes(data)

def docx(path, paragraphs, lang):
    body = "".join(f'<w:p><w:r><w:t xml:space="preserve">{escape(p)}</w:t></w:r></w:p>' for p in paragraphs)
    with ZipFile(path, "w", ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", f'<Types xmlns="{ns}/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')
        z.writestr("_rels/.rels", f'<Relationships xmlns="{ns}/package/2006/relationships"><Relationship Id="rId1" Type="{ns}/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
        z.writestr("word/document.xml", f'<w:document xmlns:w="{ns}/wordprocessingml/2006/main"><w:body>{body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1020" w:right="1020" w:bottom="1134" w:left="1020"/></w:sectPr></w:body></w:document>')

vesting = []
for month in range(1, 25):
    cumulative_groups = 50_000_000 * month // 24
    groups = cumulative_groups - 50_000_000 * (month - 1) // 24
    vesting.append([month, groups*11, groups*4, groups*3, groups*18, cumulative_groups*11, cumulative_groups*4, cumulative_groups*3, cumulative_groups*18])
assert vesting[-1][5:] == [550_000_000, 200_000_000, 150_000_000, 900_000_000]

for lang in ("pt", "en", "es"):
    def t(text):
        if lang == "pt": return catalogue.get(text, {}).get("pt", text)
        if text not in catalogue or not catalogue[text].get(lang): raise ValueError(f"Missing material translation: {lang}: {text}")
        return catalogue[text][lang]
    suffix = "" if lang == "pt" else f"-{lang}"
    title = "BETTEX — " + t("Demo e prova de conceito")
    scope = t("Resumo das regras e administração. Os capítulos, desenhos e referências técnicas completos estão na documentação do site. Este arquivo não comprova implantação ou operação financeira.")
    documentation_url = {
        "pt": "https://bettex.ai/documentacao",
        "en": "https://bettex.ai/en/documentation",
        "es": "https://bettex.ai/es/documentacion",
    }[lang]
    poc_scope = t("Esta documentação acompanha o demo e a prova de conceito da BETTEX. Registra a arquitetura e suas regras iniciais como ponto de partida; não certifica operação financeira nem uma versão ALFA já entregue.")
    next_scope = t("O próximo passo é documentar a versão ALFA, depois de consultar a comunidade e testar a receptividade do demo. O retorno dessa etapa orientará a definição da próxima versão.")
    paragraphs = [title, poc_scope, next_scope, scope, documentation_url]
    blocks = [f"<h1>{escape(title)}</h1>", f"<p>{escape(poc_scope)}</p>", f"<p>{escape(next_scope)}</p>", f"<p>{escape(scope)}</p>", f'<p><a href="{documentation_url}">{documentation_url}</a></p>']
    for section in materials["sections"]:
        paragraphs.append(t(section["title"]))
        blocks.append(f'<h2>{escape(t(section["title"]))}</h2>')
        for p in section["paragraphs"]:
            paragraphs.append(t(p)); blocks.append(f"<p>{escape(t(p))}</p>")
    pitch_link = materials["pitchLink"]
    pitch_href = pitch_link["href"] if lang == "pt" else pitch_link["href"].replace("/pitch", f"/{lang}/pitch", 1)
    paragraphs.append(f'{t(pitch_link["label"])}: {pitch_href}')
    blocks.append(f'<p><a href="{escape(pitch_href, quote=True)}">{escape(t(pitch_link["label"]))}</a></p>')
    stem = out / f"bettex-entidade-unica{suffix}"
    stem.with_suffix(".md").write_text("\n\n".join(paragraphs))
    stem.with_suffix(".html").write_text(f'<!doctype html><html lang="{lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)}</title><style>body{{font:16px/1.7 Arial;color:#13204f;background:#f4f1e8;max-width:900px;margin:auto;padding:32px}}h2{{margin-top:36px}}a{{color:#2b59ff}}</style><body>{"".join(blocks)}</body></html>')
    docx(stem.with_suffix(".docx"), paragraphs, lang)
    pdf(stem.with_suffix(".pdf"), paragraphs)
    labels = materials["workbook"]
    c = {v:t(v) for v in labels["columns"]}
    # Operating funding remains undefined: do not export a service-revenue proposal.
    network_notes = [[t("A BETTEX não cobra taxas de serviço. Transações reais podem exigir custos externos da rede, que não são receita da comunidade.")]]
    sheets = [(t("Custos de rede"),network_notes),(t(labels["vesting"]),[[c[x] for x in labels["columns"][4:]]] + vesting),(t(labels["rules"]),[[p] for p in paragraphs])]
    xlsx(out / f"bettex-taxas-fundacao{suffix}.xlsx", sheets)
    # Keep distributed legacy URLs while offering neutral names for the same
    # current content. Never rewrite the historical research workbook.
    neutral = out / f"bettex-documentacao{suffix}"
    for extension in (".md", ".html", ".docx", ".pdf"):
        shutil.copyfile(stem.with_suffix(extension), neutral.with_suffix(extension))
    shutil.copyfile(out / f"bettex-taxas-fundacao{suffix}.xlsx",
                    out / f"bettex-tokenomics{suffix}.xlsx")
    print(f"Exported {lang}: current DeFi/AI documentation and tokenomics, compatible legacy URLs, 24-month vesting; initial mint separate.")

# Explicitly excluded research download, not an application source.
for file in out.glob("bettex-publico-oportunidade*.md"):
    file.unlink()