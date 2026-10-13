#!/usr/bin/env python3
"""Preview or selectively restore the documentation snapshot without Git rollback."""
import argparse
import hashlib
import json
from pathlib import Path
import tarfile


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", required=True)
    parser.add_argument("--changes", required=True, help="Migration file manifest")
    parser.add_argument("--apply", action="store_true", help="Restore only listed files; default is preview")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    changes = json.loads(Path(args.changes).read_text())
    planned = []
    with tarfile.open(args.archive, "r:gz") as archive:
        original = json.load(archive.extractfile("SNAPSHOT-MANIFEST.json"))["files"]
        for entry in changes["files"]:
            relative = entry["path"]
            target = root / relative
            if Path(relative).is_absolute() or not target.resolve().is_relative_to(root):
                raise SystemExit(f"Unsafe path: {relative}")
            if target.is_symlink():
                raise SystemExit(f"Refusing symlink: {relative}")
            current = digest(target.read_bytes()) if target.is_file() else None
            if current != entry["afterSha256"]:
                raise SystemExit(f"Changed since migration; review manually before restoring: {relative}")
            payload = None
            if relative in original:
                member = archive.getmember(relative)
                if not member.isfile():
                    raise SystemExit(f"Not a regular file: {relative}")
                payload = archive.extractfile(member).read()
                if digest(payload) != original[relative]:
                    raise SystemExit(f"Snapshot checksum mismatch: {relative}")
            planned.append((target, payload))
            print(f"{'RESTORE' if payload is not None else 'REMOVE NEW FILE'} {relative}")
    if not args.apply:
        print(f"Preview verified: {len(planned)} documentation-related files. No files changed.")
        return
    # Validate every file before writing any; later unrelated edits never get overwritten.
    for target, payload in planned:
        if payload is None:
            target.unlink(missing_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(payload)
    print("Documentation restored. Rebuild the site and restart its web workflow.")


if __name__ == "__main__":
    main()
