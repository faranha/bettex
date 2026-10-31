"""Read-only repository inventory; writes only ignored, generated review assets.

Never loads runtime secrets, databases, private state, or network services.
Heuristic occurrences are candidates, not confirmed architectural findings.
"""
from __future__ import annotations

import csv
import hashlib
import html
import json
import re
import subprocess
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "generated-artifacts/decentralization-audit"
DATA = ROOT / "docs/audits/decentralization"
SCRIPT = Path(__file__).relative_to(ROOT).as_posix()
SKIP_PARTS = {".git", "node_modules", ".cache", ".local", ".config", ".conversation",
              ".pythonlibs", "generated-artifacts", "__pycache__", "test-evidence"}
SKIP_NAMES = {"pnpm-lock.yaml", "uv.lock", "tsconfig.tsbuildinfo", ".replit"}
TEXT_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts", ".cjs", ".sol",
                   ".json", ".yaml", ".yml", ".md", ".txt", ".html", ".css", ".svg",
                   ".toml", ".py", ".sh", ".csv"}
BINARY_DOCUMENTS = {".pdf", ".docx", ".xlsx", ".pptx"}
PATTERNS = {
    "institution": r"funda[cç][aã]o|foundation|empresa|company|corporat|societ[aá]|entidad[eo]|entity|institucional",
    "founder_control": r"fundador|founder|leadership|lideran[cç]a|administra[cç][aã]o|administrator|administrador",
    "governance": r"governan[cç]a|governance|aprova[cç][aã]o|approval|approver|quorum|qu[oó]rum|multisig|timelock",
    "privilege": r"onlyOwner|onlyRole|Ownable|AccessControl|permission|isAdmin|human_authority|required.*admin|OPERATOR_ONLY",
    "custody_signing": r"privateKey|private_key|signer|cust[oó]d|custod|keyEnvelope|wallet.vault|eth_sendTransaction|impersonat",
    "funding": r"caixa operacional|operating|service.?fee|contribui[cç][aã]o|dividend|financiamento|angel|investidores",
    "treasury_accounting": r"treasury|tesouraria|50.?25.?25|profit|lucro|ledger|balance|reconcil",
    "centralized_identity": r"Clerk|clerk|session|password|email.verif|login|sign.in|test_accounts|account_permissions",
    "execution_control": r"pause|paused|resume|revoke|authorize|autoriza|allowlist|authorizedRecipient|authorizedBuyer",
    "external_market": r"Robinhood|FOMO|Polymarket|Coinbase|clob|centralized|centralizad|order.?book",
    "data_ai_oracle": r"Allora|OpenAI|openai|inference|infer[eê]ncia|oracle|or[aá]culo|entropy|randomness|price.feed",
    "infrastructure": r"database|PostgreSQL|DATABASE_URL|JsonRpcProvider|RPC|object.?storage|bucket|github|hosting|deploy",
    "decentralization_claim": r"descentraliz|decentrali[sz]|permissionless|non.?custodial|DAO|\bDEX\b",
    "community": r"comunidade|community|vota[cç][aã]o|voting|delegate|delegação|proposal",
}
COMPILED = {name: re.compile(pattern, re.I) for name, pattern in PATTERNS.items()}


def layer(path: str) -> str:
    if path.startswith(("docs/reference/", "data/technical-docs/", "tools/technical-docs/")):
        return "external_reference"
    if path.startswith("docs/adr/"):
        return "historical_redirect"
    if "/dist/" in path or "/build/" in path:
        return "generated_build"
    if "/public/downloads/" in path:
        return "published_download"
    if path.startswith("artifacts/mockup-sandbox/"):
        return "design_sandbox"
    if path.startswith("research/"):
        return "research"
    if path.startswith("attached_assets/"):
        return "uploaded_or_visual_asset"
    if path.startswith(".agents/"):
        return "agent_memory"
    if "/locales/" in path:
        return "localization"
    if ".test." in path or "/test/" in path or "/scripts/" in path:
        return "test_or_tooling"
    return "first_party_source_or_policy"


def skip_reason(path: Path) -> str | None:
    rel = path.relative_to(ROOT)
    if any(part in SKIP_PARTS for part in rel.parts):
        return "dependency_cache_private_state_or_generated_audit"
    if path.name in SKIP_NAMES:
        return "dependency_lock_compiler_cache_or_workspace_env_configuration"
    if path.name.startswith(".env") or path.suffix in {".pem", ".key", ".sqlite", ".sqlite3", ".log"}:
        return "secret_or_runtime_state"
    if rel.as_posix() == SCRIPT or rel.as_posix().startswith("docs/audits/decentralization/"):
        return "audit_itself"
    if path.is_symlink():
        return "symlink_not_followed"
    return None


def extract(path: Path) -> tuple[str | None, str]:
    suffix = path.suffix.lower()
    if suffix in TEXT_EXTENSIONS or path.name in {".gitignore", ".replitignore", ".replit"}:
        if path.stat().st_size > 16_000_000:
            return None, "oversized_text_not_read"
        try:
            return path.read_text(encoding="utf-8"), "text"
        except (UnicodeError, OSError):
            return None, "non_utf8_or_unreadable"
    if suffix in {".docx", ".xlsx", ".pptx"}:
        try:
            prefixes = {".docx": ("word/document.xml",),
                        ".xlsx": ("xl/worksheets/", "xl/sharedStrings.xml", "xl/workbook.xml"),
                        ".pptx": ("ppt/slides/slide",)}[suffix]
            with ZipFile(path) as archive:
                pieces = [archive.read(name).decode("utf-8") for name in sorted(archive.namelist())
                          if name.endswith(".xml") and name.startswith(prefixes)]
            return html.unescape(re.sub(r"<[^>]+>", "\n", "\n".join(pieces))), "extracted_office_text"
        except (OSError, ValueError, KeyError):
            return None, "document_extraction_failed"
    if suffix == ".pdf":
        try:
            result = subprocess.run(["pdftotext", "-layout", str(path), "-"],
                                    capture_output=True, timeout=20, check=False)
            if result.returncode == 0:
                text = result.stdout.decode("utf-8", errors="replace")
                return text, "extracted_pdf_text" if text.strip() else "pdf_without_text_layer"
        except (OSError, subprocess.TimeoutExpired):
            pass
        return None, "pdf_extraction_failed"
    return None, "non_text_asset_not_visually_audited"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    listed = subprocess.run(["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
                            cwd=ROOT, check=True, capture_output=True).stdout.decode().split("\0")
    paths = {name for name in listed if name}
    # Generated builds are also part of the workspace, but never authoritative sources.
    for base in (ROOT / "artifacts").glob("*/dist"):
        for file in base.rglob("*"):
            if file.is_file():
                paths.add(file.relative_to(ROOT).as_posix())
    manifest, occurrences = [], []
    for name in sorted(paths):
        path = ROOT / name
        if not path.is_file():
            continue
        reason = skip_reason(path)
        if reason:
            manifest.append({"path": name, "layer": layer(name), "result": reason, "matches": 0})
            continue
        content, status = extract(path)
        count = 0
        if content is not None:
            for number, line in enumerate(content.splitlines(), 1):
                tags = [tag for tag, pattern in COMPILED.items() if pattern.search(line)]
                if tags:
                    occurrences.append({"path": name, "location": str(number), "layer": layer(name),
                                        "tags": "|".join(tags), "evidence_type": status})
                    count += 1
        name_tags = [tag for tag, pattern in COMPILED.items() if pattern.search(name)]
        if name_tags:
            occurrences.append({"path": name, "location": "filename", "layer": layer(name),
                                "tags": "|".join(name_tags), "evidence_type": "filename_only"})
            count += 1
        manifest.append({"path": name, "layer": layer(name), "result": status, "matches": count})
    findings, evidence_errors = [], []
    for source in sorted(DATA.glob("*.json")):
        for finding in json.loads(source.read_text()):
            resolved = []
            for ref in finding.pop("refs"):
                path = ROOT / ref["path"]
                if not path.is_file():
                    evidence_errors.append(f'{finding["id"]}: missing evidence {ref["path"]}')
                    continue
                text, _ = extract(path)
                if text is None:
                    evidence_errors.append(f'{finding["id"]}: unreadable evidence {ref["path"]}')
                    continue
                needle = re.compile(ref["pattern"], re.I)
                lines = [i for i, line in enumerate(text.splitlines(), 1) if needle.search(line)]
                if not lines:
                    evidence_errors.append(f'{finding["id"]}: no match for {ref["pattern"]} in {ref["path"]}')
                    continue
                resolved.append({"path": ref["path"], "lines": lines[:6], "matching_lines": len(lines)})
            finding["evidence"] = resolved
            if finding["id"] in {"P01", "P02", "P03", "P15", "P21", "P22", "P24"}:
                finding["track"] = "Estrutura institucional: revisar apresentação"
            elif finding["id"] in {"P07", "P08", "P09", "P10", "P11", "P12"}:
                finding["track"] = "Economia: compatibilizar financiamento e direitos"
            elif finding["id"] in {"P23", "D20"}:
                finding["track"] = "Histórico/derivados: distinguir de regra atual"
            elif finding["id"].startswith("C") or finding["id"] in {
                "P04", "P05", "P06", "P16", "P17", "P18", "D05", "D06", "D07", "D08", "D09", "D18", "D19"
            }:
                finding["track"] = "Administração/controles: preservar e mapear evolução por IA"
            else:
                finding["track"] = "Dependências: mapear função, responsabilidade e continuidade"
            findings.append(finding)
    if evidence_errors:
        raise ValueError("Invalid evidence anchors:\n" + "\n".join(evidence_errors))
    if len({f["id"] for f in findings}) != len(findings):
        raise ValueError("Duplicate finding IDs")
    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "revision": subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True,
                                   text=True, check=True).stdout.strip(),
        "files_in_manifest": len(manifest),
        "text_or_documents_examined": sum(m["result"] in {"text", "extracted_pdf_text", "extracted_office_text"}
                                         for m in manifest),
        "candidate_occurrences": len(occurrences),
        "files_with_candidates": sum(m["matches"] > 0 for m in manifest),
        "reviewed_findings": len(findings),
        "layers": dict(Counter(m["layer"] for m in manifest)),
        "extraction_results": dict(Counter(m["result"] for m in manifest)),
        "candidate_tags": dict(Counter(tag for o in occurrences for tag in o["tags"].split("|"))),
        "method": "Full file enumeration, heuristic candidate scan, then manual thematic findings with validated source anchors.",
        "limits": [
            "No production, database, chain-state, account, credential or external configuration inspection.",
            "Candidates are not verified centralization findings; tests and external references may be false positives.",
            "Raster images, audio and video are inventoried by filename, not exhaustively OCR-reviewed.",
            "PDF and Office references use extracted text line numbers, not original page/cell coordinates.",
            "Generated builds and historical research may differ from current source and are separately classified.",
            "Excluded dependencies, caches, private runtime state and credential files are listed in the manifest where tracked.",
        ],
    }
    for filename, rows, columns in [
        ("ocorrencias.csv", occurrences, ["path", "location", "layer", "tags", "evidence_type"]),
        ("cobertura.csv", manifest, ["path", "layer", "result", "matches"]),
    ]:
        with (OUT / filename).open("w", encoding="utf-8-sig", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=columns)
            writer.writeheader()
            writer.writerows(rows)
    (OUT / "mapa.json").write_text(json.dumps({"summary": summary, "findings": findings},
                                            ensure_ascii=False, indent=2) + "\n")
    with (OUT / "pontos-revisados.csv").open("w", encoding="utf-8-sig", newline="") as file:
        fields = ["id", "area", "track", "title", "type", "state", "observation", "relationship", "decision", "evidence"]
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        for finding in findings:
            row = dict(finding)
            row["evidence"] = " | ".join(
                f'{e["path"]}:{",".join(map(str, e["lines"]))}' for e in row["evidence"])
            writer.writerow(row)
    render(summary, findings)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


def render(summary: dict, findings: list[dict]) -> None:
    esc = html.escape
    categories = list(dict.fromkeys(f["area"] for f in findings))
    nav = "".join(f'<a href="#area-{i}">{esc(category)}</a>' for i, category in enumerate(categories))
    sections = []
    for i, category in enumerate(categories):
        cards = []
        for f in findings:
            if f["area"] != category:
                continue
            refs = "".join(f'<li><code>{esc(e["path"])}:{",".join(map(str,e["lines"]))}</code></li>'
                           for e in f["evidence"])
            cards.append(f'''<article data-search="{esc(json.dumps(f, ensure_ascii=False).lower(), quote=True)}">
<div class="meta"><b>{esc(f["id"])}</b><span>{esc(f["type"])}</span><span>{esc(f["state"])}</span></div>
<p><strong>Tratamento no levantamento:</strong> {esc(f["track"])}</p>
<h3>{esc(f["title"])}</h3><p>{esc(f["observation"])}</p>
<p><strong>Aspecto relacionado:</strong> {esc(f["relationship"])}</p>
<p><strong>Questão para planejamento posterior, não mudança aprovada:</strong> {esc(f["decision"])}</p>
<details><summary>Localização e evidências</summary><ul>{refs}</ul></details></article>''')
        sections.append(f'<section id="area-{i}"><h2>{esc(category)}</h2>{"".join(cards)}</section>')
    document = f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BETTEX — Estrutura institucional, administração e gestão por IA</title>
<style>
:root{{color-scheme:light}}*{{box-sizing:border-box}}body{{margin:0;background:#F4F1E8;color:#070B1F;font:16px/1.65 system-ui,sans-serif}}
header{{background:#070B1F;color:white;padding:42px max(24px,calc((100vw - 1120px)/2))}}
h1{{font-size:clamp(30px,4vw,48px);line-height:1.15;margin:12px 0}}header p{{color:#dce3f3;max-width:900px}}
main{{max-width:1120px;margin:auto;padding:28px 24px}}h2{{font-size:26px;margin-top:40px}}h3{{margin:10px 0;font-size:21px}}
article,.notice{{background:#fffcf5;border:1px solid #dfd7c5;border-radius:12px;padding:22px;margin:14px 0}}
.notice{{border-left:5px solid #F2B632}}.meta{{display:flex;gap:10px;flex-wrap:wrap;font-size:12px}}
.meta span,.meta b{{border-radius:20px;background:#e9edf7;padding:4px 10px}}.meta b{{background:#2B59FF;color:white}}
nav{{display:flex;flex-wrap:wrap;gap:10px}}nav a{{color:#183173;padding:6px 10px;border:1px solid #dfd7c5;border-radius:6px;text-decoration:none}}
input{{width:100%;font:inherit;padding:13px;border:1px solid #b9c1d2;border-radius:8px;margin:18px 0}}
code{{font:12px/1.6 ui-monospace,monospace;overflow-wrap:anywhere}}summary{{cursor:pointer;color:#2B59FF;font-weight:600}}
ul{{padding-left:20px}}.stats{{display:flex;gap:20px;flex-wrap:wrap}}.stats b{{display:block;color:#F2B632;font-size:28px}}
@media print{{input,nav{{display:none}}body{{background:white}}header{{padding:20px}}article{{break-inside:avoid}}details{{display:block}}}}
</style></head><body><header><small>BETTEX · INVENTÁRIO DO SISTEMA</small>
<h1>Estrutura institucional, administração e evolução por IA</h1>
<p>Inventário do repositório atual. Nenhuma alteração no aplicativo, contratos, dados, permissões ou operações.
Este documento prepara as decisões por elemento; não é um plano de migração aprovado nem uma auditoria de segurança.</p>
<div class="stats"><div><b>{summary["reviewed_findings"]}</b>pontos revisados</div>
<div><b>{summary["text_or_documents_examined"]}</b>arquivos textuais/documentos examinados</div>
<div><b>{summary["files_with_candidates"]}</b>arquivos com candidatos</div>
<div><b>{summary["candidate_occurrences"]}</b>candidatos por linha/nome de arquivo</div></div></header><main>
<div class="notice"><strong>Direção corrigida pelo criador:</strong> não constituir empresa ou fundação formal. O projeto começa administrado pelos fundadores,
com domínio sobre os contratos, e evolui para um serviço gerido por IA. Isso não exige renunciar ownership, abolir permissões administrativas,
implantar uma DAO ou submeter toda operação a votação. Várias decisões serão da comunidade; o mecanismo e o escopo ainda serão definidos.</div>
<div class="notice"><strong>Estado atual:</strong> o app é um demo visual. O servidor bloqueia as operações e não importa as rotas operacionais.
Contratos, contas de teste, aprovações, assinadores e motores financeiros encontrados no código não devem ser confundidos com operação ativa.
A gestão integral por IA é uma direção futura, não capacidade comprovada.</div>
<div class="notice"><strong>Como ler:</strong> “centralização” descreve onde há autoridade, não um defeito a eliminar; “dependência externa” significa depender de um serviço;
“controle a preservar” significa proteção necessária, não algo a remover automaticamente. As questões de planejamento são perguntas para a próxima etapa,
não propostas de eliminar administradores ou obrigar migração para DAO. “Candidato” no CSV não significa problema confirmado.
Valores, quóruns, direitos do token e percentuais não foram modificados.</div>
<h2>Cobertura e limites</h2><p>Inclui fontes, contratos, regras, rotas, esquemas de dados, testes, scripts, políticas, traduções,
downloads, pesquisa, referências e builds locais. Estado privado, credenciais, dependências instaladas e caches ficam fora da leitura.</p>
<p>PDF/DOCX/XLSX/PPTX foram examinados pela camada de texto quando disponível. Imagens raster, áudio e vídeo foram listados,
mas não revisados visualmente de forma exaustiva. Não foram consultados produção, banco de dados, estado atual da blockchain,
configurações externas ou histórico completo do Git. Esses limites não são prova de ausência de centralização fora do repositório.</p>
<p>As linhas das evidências referem-se ao snapshot deste levantamento; podem mudar após edições. As ocorrências e a cobertura completa
estão nos CSVs entregues separadamente. Referências externas e materiais históricos não devem ser reescritos como se fossem regras atuais.</p>
<h2>Áreas do inventário</h2><nav>{nav}</nav><label for="search">Pesquisar assunto, arquivo ou identificador</label>
<input id="search" type="search" placeholder="Ex.: fundador, multisig, taxas, Clerk, Polymarket…">
{"".join(sections)}
<h2>Dependências entre as próximas decisões</h2>
<ol><li>Separar instituição formal de administração técnica, domínio dos contratos e funções que passarão para IA.</li>
<li>Definir escopo das decisões comunitárias e da administração → orçamento operacional da tesouraria → apuração de resultados e direitos dos participantes.</li>
<li>Avaliar identidade e acesso → elegibilidade e antifraude → contratos de compra, staking e pagamentos, sem presumir migração para votação on-chain.</li>
<li>Preservar domínio contratual → executor e assinadores → mandatos e controles de emergência → automação gradual das funções dos fundadores.</li>
<li>Mercados compatíveis → dados e oráculos → provedores de IA → estratégia e execução verificável.</li>
<li>Somente depois das decisões: fontes canônicas → site/Pitch/demo → traduções → exports → testes e build.</li></ol>
<p><strong>Não executar agora:</strong> renunciar ownership, apagar contas/dados, remover pausas e verificações,
alterar split/vesting, abrir saques, migrar contratos ou acionar publicação.</p>
<footer>Levantamento gerado em {esc(summary["generated_at"])}. Arquivos do relatório não contêm credenciais nem conteúdo de registros pessoais.</footer>
</main><script>
document.getElementById('search').addEventListener('input',function(){{
const term=this.value.toLowerCase().trim();
document.querySelectorAll('article').forEach(el=>el.hidden=!!term&&!el.dataset.search.includes(term));
document.querySelectorAll('section').forEach(el=>el.hidden=![...el.querySelectorAll('article')].some(a=>!a.hidden));
}});
</script></body></html>'''
    (OUT / "mapa-centralizacao.html").write_text(document, encoding="utf-8")


if __name__ == "__main__":
    main()
