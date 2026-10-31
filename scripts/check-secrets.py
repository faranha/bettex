"""Conservative offline secret scan. Never print matched values or source lines."""
import argparse
import hashlib
import os
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
RULES = {
    "private-key-block": re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "provider-secret": re.compile(rb"\b(?:sk_(?:live|test)_[A-Za-z0-9]{16,}|sk-[A-Za-z0-9_-]{24,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16})\b"),
    "database-credentials": re.compile(rb"(?:postgres(?:ql)?|mongodb(?:\+srv)?)://[^/\s:\"'<>]+:[^@\s\"'<>]{6,}@"),
    "literal-operational-secret": re.compile(rb"""(?i)\b(?:PRIVATE_KEY(?:_BASE64)?|SESSION_SECRET|CLERK_SECRET_KEY|[A-Z_]*API_KEY)\b["']?\s*[:=]\s*["']([A-Za-z0-9_$/+=.-]{20,})["']"""),
}
# Exact, reviewed public documentation and historical test fixture. Any change revokes this
# allowance, including adding a real secret to the document. No runtime use.
PUBLIC_EXAMPLE_DOCUMENTS = {
    "f47c0fc1dedd054e4ee4386fba55ab4e255b3cad8ace6f1d72183d8a799cb15a":
        "historical Polymarket title translation test fixture; invalid mock key only",
    "e6196a5762d8bac4df0532efe003316bea53d411526af03caa57cbf244344543":
        "https://docs.robinhood.com/crypto/trading/",
}
TEXT = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".json", ".yaml", ".yml",
        ".md", ".txt", ".log", ".toml", ".env", ".sql", ".sh", ".pem", ".key", ".html"}
EXCLUDED = {"node_modules", ".git", ".local", ".cache", "data", "__pycache__"}

def inspect(data, label):
    findings = []
    public_example = hashlib.sha256(data).hexdigest() in PUBLIC_EXAMPLE_DOCUMENTS
    examples = ROOT / "research/sources/bvi-deep-markets-05.md"
    known_public_values = set()
    if label.startswith("runtime-log:") and examples.exists():
        example_data = examples.read_bytes()
        if hashlib.sha256(example_data).hexdigest() in PUBLIC_EXAMPLE_DOCUMENTS:
            known_public_values = {hashlib.sha256(m.group(1)).hexdigest()
                                   for m in RULES["literal-operational-secret"].finditer(example_data)}
    for rule, pattern in RULES.items():
        for match in pattern.finditer(data):
            if public_example and rule == "literal-operational-secret":
                continue
            if rule == "literal-operational-secret" and hashlib.sha256(match.group(1)).hexdigest() in known_public_values:
                continue
            # Documentation placeholders are not credentials. No blanket test-file exemption.
            if b"<" in match.group() or b"${" in match.group():
                continue
            findings.append((label, data[:match.start()].count(b"\n") + 1, rule))
    return findings

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--history", action="store_true")
    parser.add_argument("--logs", action="store_true")
    args = parser.parse_args()
    findings, files = [], 0
    tracked = set(subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT).decode().split("\0"))
    # Prune before descending: rglob still traverses every installed dependency
    # and cache even when individual files are skipped afterwards.
    for directory, folders, names in os.walk(ROOT, followlinks=False):
        folders[:] = [name for name in folders if name not in EXCLUDED]
        for name in names:
            path = pathlib.Path(directory) / name
            relative = str(path.relative_to(ROOT))
            if not path.is_file() or path.is_symlink():
                continue
            if path.suffix.lower() not in TEXT and not path.name.startswith(".env"):
                continue
            # Locally populated, ignored environment files are legitimate secret
            # storage. A tracked/staged environment file is never exempt.
            if name.startswith(".env") and name != ".env.example" and relative not in tracked:
                continue
            data = path.read_bytes()
            findings.extend(inspect(data, relative))
            files += 1
    if args.history:
        listing = subprocess.check_output(["git", "rev-list", "--objects", "--all"], cwd=ROOT).splitlines()
        blobs = {}
        for entry in listing:
            parts = entry.split(b" ", 1)
            if len(parts) != 2:
                continue
            label = parts[1].decode("utf-8", "replace")
            if pathlib.Path(label).suffix.lower() in TEXT or pathlib.Path(label).name.startswith(".env"):
                blobs.setdefault(parts[0].decode(), label)
        child = subprocess.Popen(["git", "cat-file", "--batch"], cwd=ROOT, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        try:
            for oid, label in blobs.items():
                child.stdin.write((oid + "\n").encode())
                child.stdin.flush()
                header = child.stdout.readline().split()
                if len(header) != 3 or header[1] != b"blob":
                    if len(header) == 3:
                        child.stdout.read(int(header[2]) + 1)
                    continue
                data = child.stdout.read(int(header[2]))
                child.stdout.read(1)
                findings.extend(inspect(data, "git:" + label + ":" + oid[:10]))
                files += 1
        finally:
            child.stdin.close()
            child.wait()
    if args.logs:
        for folder in [pathlib.Path("/tmp/logs"), pathlib.Path("/tmp/shell-exec-output")]:
            if folder.is_dir():
                for path in folder.glob("*"):
                    if path.is_file():
                        findings.extend(inspect(path.read_bytes(), "runtime-log:" + path.name))
                        files += 1
    for label, line, rule in sorted(set(findings)):
        print(f"{label}:{line}: {rule} [value redacted]")
    print(f"Secret patterns: {files} files/blobs, {len(set(findings))} findings. Not an entropy/PII audit.")
    return 1 if findings else 0

if __name__ == "__main__":
    sys.exit(main())
