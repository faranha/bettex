"""Generate localized workbooks without changing numbers or financial formulas."""
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from html import escape, unescape
from pathlib import Path

root = Path(__file__).resolve().parent.parent
messages = json.loads((root / "src/lib/locales/translations.json").read_text())
folder = root / "public/downloads"
source = folder / "bettex-taxas-fundacao.xlsx"
for language in ("en", "es"):
    def translate(text):
        if text in messages:
            return messages[text][language]
        key = re.sub(r"\s+", " ", text).strip()
        if key in messages:
            return messages[key][language]
        if re.search(r"[A-Za-zÀ-ÿ]", text):
            raise ValueError(f"Missing {language} workbook translation: {text}")
        return text

    with zipfile.ZipFile(source) as archive:
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        names = {}
        for sheet in workbook.iter():
            if sheet.tag.endswith("}sheet"):
                original = sheet.attrib["name"]
                names[original] = translate(original)[:31]
        if len(set(names.values())) != len(names):
            raise ValueError("Duplicate translated worksheet names")
        with zipfile.ZipFile(folder / f"bettex-taxas-fundacao-{language}.xlsx", "w", zipfile.ZIP_DEFLATED) as target:
            for member in archive.infolist():
                data = archive.read(member.filename)
                if member.filename.startswith("xl/") and member.filename.endswith(".xml"):
                    # Keep original namespace declarations and Excel extension
                    # metadata; reserializing XML can invalidate mc:Ignorable.
                    xml = data.decode("utf-8")
                    xml = re.sub(r'<((?:[\w.-]+:)?t)\b([^>]*)>(.*?)</\1>', lambda m: f'<{m[1]}{m[2]}>{escape(translate(unescape(m[3])), quote=False)}</{m[1]}>', xml, flags=re.S)
                    xml = re.sub(r'(<(?:[\w.-]+:)?sheet\b[^>]*\bname=")([^"]*)(")', lambda m: m[1] + escape(names[unescape(m[2])], quote=True) + m[3], xml)
                    def formula(match):
                        value = unescape(match[3])
                        for original, translated in names.items():
                            value = value.replace(f"'{original}'!", f"'{translated}'!").replace(f"{original}!", f"'{translated}'!")
                        return f"<{match[1]}{match[2]}>{escape(value, quote=False)}</{match[1]}>"
                    xml = re.sub(r'<((?:[\w.-]+:)?(?:f|definedName))\b([^>]*)>(.*?)</\1>', formula, xml, flags=re.S)
                    ET.fromstring(xml)
                    data = xml.encode("utf-8")
                target.writestr(member, data)
    print(f"Localized {language} workbook, {len(names)} worksheets; financial values preserved.")