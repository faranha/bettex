"""Capture current files and a consistent development DB snapshot, without secrets in source."""
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tarfile
from datetime import datetime, timezone
from urllib.parse import urlparse, unquote, parse_qs

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / "generated-artifacts/releases/bettex-1.0"


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    os.chmod(DEST, 0o700)
    if (DEST / "payload-manifest.json").exists():
        raise SystemExit("Canonical payload already exists; refusing to overwrite.")
    started = datetime.now(timezone.utc).isoformat()
    commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    dump = DEST / "development.dump"
    env = os.environ.copy()
    if not env.get("DATABASE_URL"):
        raise SystemExit("Development database configuration is unavailable.")
    # Pass the credential through the child environment, never argv or output.
    connection = urlparse(env["DATABASE_URL"])
    env["PGHOST"] = connection.hostname
    env["PGPORT"] = str(connection.port or 5432)
    env["PGDATABASE"] = unquote(connection.path.lstrip("/"))
    env["PGUSER"] = unquote(connection.username or "")
    env["PGPASSWORD"] = unquote(connection.password or "")
    query = parse_qs(connection.query)
    for option, variable in [("sslmode", "PGSSLMODE"), ("channel_binding", "PGCHANNELBINDING")]:
        if option in query:
            env[variable] = query[option][0]
    command = ["pg_dump", "--format=custom", "--no-owner", "--no-acl", "--file", str(dump)]
    result = subprocess.run(command, env=env, capture_output=True)
    if result.returncode:
        error = result.stderr.decode(errors="replace").lower()
        categories = [
            name for name in (
                "permission denied", "row-level security", "version mismatch",
                "server version", "connection refused", "could not translate",
                "password authentication failed", "no password supplied",
                "ssl", "timeout", "no such file", "does not exist", "connection failed",
            ) if name in error
        ]
        raise SystemExit("Development database dump failed; safe error categories: " + ", ".join(categories))
    os.chmod(dump, 0o600)
    subprocess.run(["pg_restore", "--list", str(dump)], check=True, stdout=subprocess.DEVNULL)
    # Decode every archived DB block without connecting to or changing a database.
    subprocess.run(["pg_restore", "--file=/dev/null", str(dump)], check=True)
    tracked = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT).decode().split("\0")
    paths = {Path(p) for p in tracked if p and (ROOT / p).exists()}
    # Include untracked release documentation/tooling, user assets, generated deliverables,
    # reference images, full local research corpus and the compiled site.
    extras = [
        "scripts/releases", "docs/releases", ".agents",
        "attached_assets", "generated-artifacts", "data", "screenshots",
        "artifacts/bettex-site/dist", "artifacts/api-server/dist",
        ".local/skills", ".local/secondary_skills", ".local/private-founder-assets",
    ]
    excluded = []
    for folder in extras:
        directory = ROOT / folder
        if directory.exists():
            for path in directory.rglob("*"):
                if path.is_file() or path.is_symlink():
                    paths.add(path.relative_to(ROOT))
    selected = []
    for relative in sorted(paths):
        path = ROOT / relative
        if path.is_relative_to(DEST) and "reference" not in relative.parts:
            continue
        if any(part in {"node_modules", "__pycache__", ".git"} for part in relative.parts):
            continue
        if (path.name.startswith(".env") and path.name != ".env.example") or path.suffix in {".pem", ".key"}:
            excluded.append(str(relative))
            continue
        if path.is_symlink():
            # Never follow symlinks to private environment files or external workspaces.
            excluded.append(str(relative))
            continue
        if path.is_file():
            selected.append(relative)
    files = []
    archive = DEST / "workspace.tar.gz"
    with tarfile.open(archive, "w:gz", compresslevel=3) as output:
        for relative in selected:
            path = ROOT / relative
            with path.open("rb") as source:
                data = source.read()
            files.append({"path": str(relative), "size": len(data), "sha256": hashlib.sha256(data).hexdigest()})
            info = output.gettarinfo(str(path), arcname=str(relative))
            output.addfile(info, io.BytesIO(data))
        manifest_bytes = json.dumps(files, ensure_ascii=False, indent=2).encode()
        info = tarfile.TarInfo("BETTEX-1.0-FILES.json")
        info.size = len(manifest_bytes)
        output.addfile(info, io.BytesIO(manifest_bytes))
    os.chmod(archive, 0o600)
    expected_hashes = {record["path"]: record["sha256"] for record in files}
    with tarfile.open(archive, "r:gz") as captured:
        for member in captured:
            if member.name == "BETTEX-1.0-FILES.json":
                continue
            stream = captured.extractfile(member)
            digest = hashlib.sha256(stream.read()).hexdigest()
            expected = expected_hashes[member.name]
            if digest != expected:
                raise SystemExit("Workspace archive verification failed.")
    manifest = {
        "id": "bettex-1.0",
        "name": "BETTEX 1.0",
        "captureStartedAt": started,
        "captureCompletedAt": datetime.now(timezone.utc).isoformat(),
        "baselineCommit": commit,
        "files": len(files),
        "excludedFiles": excluded,
        "archives": {
            name: {"size": (DEST / name).stat().st_size, "sha256": sha256(DEST / name)}
            for name in ["workspace.tar.gz", "development.dump"]
        },
        "scope": {
            "workspace": "captured and member hashes verified",
            "developmentDatabase": "consistent pg_dump; all blocks decoded successfully",
            "productionDatabase": "NOT CAPTURED; separate production backup required",
            "clerk": "external tenant, identities and settings not exported",
            "secrets": "values deliberately not exported; preserve through Secrets",
            "appStorage": "requires private server-side snapshot and verified upload",
            "runtime": "RAM, browser sessions and external market/provider responses not frozen",
        },
    }
    (DEST / "payload-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    print(json.dumps({"status": "local-payload-verified", "files": len(files), "archives": manifest["archives"]}))


if __name__ == "__main__":
    main()
