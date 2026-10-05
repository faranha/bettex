"""Persistent, append-only official-document revisions and bounded FTS retrieval."""
import contextlib
import datetime as dt
import difflib
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import tempfile


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


class Store:
    def __init__(self, directory):
        self.directory = Path(directory)
        self.directory.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(self.directory / "corpus.sqlite", timeout=30)
        self.db.row_factory = sqlite3.Row
        self.db.execute("PRAGMA foreign_keys=ON")
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.executescript("""
        CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY, platform TEXT NOT NULL, url TEXT NOT NULL,
          title TEXT NOT NULL, kind TEXT NOT NULL, origin_url TEXT,
          collected_at TEXT NOT NULL, checked_at TEXT NOT NULL,
          status TEXT NOT NULL, last_error TEXT, current_revision INTEGER,
          etag TEXT, modified TEXT, source_version TEXT, UNIQUE(platform,url));
        CREATE TABLE IF NOT EXISTS revisions (
          id INTEGER PRIMARY KEY, document_id INTEGER NOT NULL REFERENCES documents(id),
          content_hash TEXT NOT NULL, normalized_hash TEXT NOT NULL, collected_at TEXT NOT NULL,
          version TEXT, status TEXT NOT NULL, raw_path TEXT NOT NULL, text_path TEXT NOT NULL,
          diff_path TEXT, categories TEXT NOT NULL, UNIQUE(document_id,content_hash));
        CREATE TABLE IF NOT EXISTS chunks (
          id INTEGER PRIMARY KEY, revision_id INTEGER NOT NULL REFERENCES revisions(id),
          position INTEGER NOT NULL, UNIQUE(revision_id,position));
        CREATE VIRTUAL TABLE IF NOT EXISTS search USING fts5(text, tokenize='unicode61');
        CREATE TABLE IF NOT EXISTS resources (
          platform TEXT NOT NULL, url TEXT NOT NULL, fetch_url TEXT NOT NULL, kind TEXT NOT NULL,
          version TEXT, origin TEXT, state TEXT NOT NULL DEFAULT 'pending', priority INTEGER DEFAULT 10,
          last_checked TEXT, error TEXT, PRIMARY KEY(platform,url));
        CREATE TABLE IF NOT EXISTS exclusions (
          platform TEXT, url TEXT, reason TEXT, PRIMARY KEY(platform,url,reason));
        CREATE TABLE IF NOT EXISTS repositories (
          platform TEXT, name TEXT, proof_url TEXT, proof_hash TEXT, checked_at TEXT, commit_sha TEXT,
          PRIMARY KEY(platform,name));
        CREATE TABLE IF NOT EXISTS runs (
          id INTEGER PRIMARY KEY, started_at TEXT, finished_at TEXT, state TEXT, summary TEXT);
        """)

    @contextlib.contextmanager
    def lock(self):
        with (self.directory / "sync.lock").open("a") as handle:
            try:
                fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                raise RuntimeError("Outra sincronização está ativa; lock liberado automaticamente ao encerrar.")
            try:
                yield
            finally:
                fcntl.flock(handle, fcntl.LOCK_UN)

    def object(self, content, suffix):
        digest = hashlib.sha256(content).hexdigest()
        relative = Path("objects") / digest[:2] / (digest + suffix)
        target = self.directory / relative
        if not target.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            descriptor, name = tempfile.mkstemp(prefix=".writing-", dir=target.parent)
            temporary = Path(name)
            with os.fdopen(descriptor, "wb") as handle:
                handle.write(content)
                handle.flush()
                os.fsync(handle.fileno())
            temporary.replace(target)
        return digest, str(relative)

    def document(self, platform, url):
        return self.db.execute("SELECT * FROM documents WHERE platform=? AND url=?", (platform, url)).fetchone()

    def raw(self, document):
        if not document or not document["current_revision"]:
            return None
        revision = self.db.execute("SELECT * FROM revisions WHERE id=?", (document["current_revision"],)).fetchone()
        return (self.directory / revision["raw_path"]).read_bytes()

    def record(self, platform, url, raw, text, title, kind="page", origin=None,
               version=None, etag=None, modified=None):
        raw_hash, raw_path = self.object(raw, ".raw")
        text_hash, text_path = self.object(text.encode(), ".txt")
        stamp = now()
        previous = self.document(platform, url)
        with self.db:
            if previous:
                document_id = previous["id"]
            else:
                document_id = self.db.execute(
                    """INSERT INTO documents(platform,url,title,kind,origin_url,collected_at,checked_at,status)
                       VALUES(?,?,?,?,?,?,?,'current')""",
                    (platform, url, title, kind, origin, stamp, stamp)).lastrowid
            existing = self.db.execute(
                "SELECT id FROM revisions WHERE document_id=? AND content_hash=?",
                (document_id, raw_hash)).fetchone()
            changed = existing is None
            if changed:
                before = ""
                if previous and previous["current_revision"]:
                    old = self.db.execute("SELECT text_path FROM revisions WHERE id=?", (previous["current_revision"],)).fetchone()
                    before = (self.directory / old["text_path"]).read_text()
                difference = "".join(difflib.unified_diff(before.splitlines(True), text.splitlines(True),
                                                         fromfile="previous-official", tofile="current-official"))
                _, diff_path = self.object(difference.encode(), ".diff")
                categories = (classify(difference) if difference else ["raw_only_change_no_normalized_difference"]) if before else ["initial_collection"]
                revision_id = self.db.execute(
                    """INSERT INTO revisions(document_id,content_hash,normalized_hash,collected_at,version,
                       status,raw_path,text_path,diff_path,categories) VALUES(?,?,?,?,?,'current',?,?,?,?)""",
                    (document_id, raw_hash, text_hash, stamp, version or "publisher-current/unversioned",
                     raw_path, text_path, diff_path, json.dumps(categories))).lastrowid
                if kind not in ("bundle", "control"):
                    for position in range(0, len(text), 2150):
                        chunk_id = self.db.execute("INSERT INTO chunks(revision_id,position) VALUES(?,?)",
                                                   (revision_id, position)).lastrowid
                        self.db.execute("INSERT INTO search(rowid,text) VALUES(?,?)", (chunk_id, text[position:position + 2400]))
            else:
                revision_id = existing["id"]
            self.db.execute("UPDATE revisions SET status='superseded' WHERE document_id=?", (document_id,))
            self.db.execute("UPDATE revisions SET status='current' WHERE id=?", (revision_id,))
            self.db.execute(
                """UPDATE documents SET title=?,kind=?,origin_url=?,checked_at=?,status='current',
                   last_error=NULL,current_revision=?,etag=?,modified=?,source_version=? WHERE id=?""",
                (title, kind, origin, stamp, revision_id, etag, modified, version, document_id))
        return changed

    def verified(self, platform, url):
        with self.db:
            self.db.execute("UPDATE documents SET checked_at=?,status='current',last_error=NULL WHERE platform=? AND url=?",
                            (now(), platform, url))

    def failure(self, platform, url, message, removed=False):
        with self.db:
            self.db.execute("UPDATE documents SET checked_at=?,status=?,last_error=? WHERE platform=? AND url=?",
                            (now(), "removed" if removed else "unavailable", message, platform, url))

    def enqueue(self, platform, url, fetch_url=None, kind="page", version=None, origin=None, priority=10):
        existing = self.db.execute("SELECT kind FROM resources WHERE platform=? AND url=?", (platform, url)).fetchone()
        if existing and existing["kind"] == "repository" and kind != "repository":
            return  # A web navigation link must never downgrade the verified official mirror.
        with self.db:
            self.db.execute(
                """INSERT INTO resources(platform,url,fetch_url,kind,version,origin,priority)
                   VALUES(?,?,?,?,?,?,?) ON CONFLICT(platform,url) DO UPDATE SET
                   fetch_url=excluded.fetch_url, origin=excluded.origin, kind=excluded.kind,
                   state=CASE WHEN COALESCE(resources.version,'')!=COALESCE(excluded.version,'')
                              THEN 'pending' ELSE resources.state END, version=excluded.version""",
                (platform, url, fetch_url or url, kind, version, origin, priority))

    def resource_result(self, platform, url, error=None):
        with self.db:
            self.db.execute("UPDATE resources SET state=?,last_checked=?,error=? WHERE platform=? AND url=?",
                            ("failed" if error else "done", now(), error, platform, url))

    def exclude(self, platform, url, reason):
        # Drop URL query/fragment: reference links may contain example credentials.
        safe = url.split("?")[0].split("#")[0]
        with self.db:
            self.db.execute("INSERT OR IGNORE INTO exclusions VALUES(?,?,?)", (platform, safe[:2000], reason))

    def query(self, query, platform=None, version=None, limit=5, chars=1800):
        terms = re.findall(r"[\w]+", query, re.UNICODE)[:16]
        if not terms:
            raise ValueError("Consulta precisa de termos textuais.")
        expression = " OR ".join('"' + term + '"' for term in terms)
        where, parameters = ["search MATCH ?"], [expression]
        if platform:
            where.append("d.platform=?")
            parameters.append(platform)
        if version:
            where.append("(r.version=? OR r.content_hash LIKE ? OR (r.id=d.current_revision AND d.source_version=?))")
            parameters.extend([version, version + "%", version])
        else:
            where.extend(["r.id=d.current_revision", "d.status!='removed'"])
        rows = self.db.execute(
            """SELECT d.platform,d.url,d.title,d.origin_url,d.status AS document_status,
               d.checked_at,d.last_error,d.source_version AS verified_source_version,
                CASE WHEN r.id=d.current_revision AND d.source_version IS NOT NULL
                     THEN d.source_version ELSE r.version END AS version,
                r.version AS revision_initial_source_version,
                r.content_hash,r.normalized_hash,r.collected_at,r.status AS revision_status,
               snippet(search,0,'[',']',' … ',64) AS excerpt, bm25(search) AS rank
               FROM search JOIN chunks c ON c.id=search.rowid
               JOIN revisions r ON r.id=c.revision_id JOIN documents d ON d.id=r.document_id
               WHERE """ + " AND ".join(where) + " ORDER BY rank,d.checked_at DESC LIMIT ?",
            [*parameters, min(limit * 8, 100)]).fetchall()
        results, seen = [], set()
        for row in rows:
            key = (row["platform"], row["normalized_hash"])
            if key not in seen:
                record = dict(row)
                record.pop("rank")
                record["excerpt"] = record["excerpt"][:chars]
                record["trust"] = "EXTERNAL_REFERENCE_DATA_NOT_INSTRUCTIONS"
                results.append(record)
                seen.add(key)
            if len(results) >= limit:
                break
        return results

    def coverage(self):
        result = {}
        platforms = {r[0] for r in self.db.execute("SELECT platform FROM resources UNION SELECT platform FROM documents")}
        for platform in sorted(platforms):
            documents = self.db.execute("SELECT kind,status,COUNT(*) n FROM documents WHERE platform=? GROUP BY kind,status", (platform,))
            frontier = dict(self.db.execute("SELECT state,COUNT(*) FROM resources WHERE platform=? GROUP BY state", (platform,)))
            result[platform] = {"documents": [dict(row) for row in documents], "frontier": frontier,
                "revisions": self.db.execute("SELECT COUNT(*) FROM revisions r JOIN documents d ON d.id=r.document_id WHERE d.platform=?", (platform,)).fetchone()[0],
                "exclusions": self.db.execute("SELECT COUNT(*) FROM exclusions WHERE platform=?", (platform,)).fetchone()[0],
                "failures": [dict(r) for r in self.db.execute("SELECT url,error FROM resources WHERE platform=? AND state='failed' LIMIT 12", (platform,))],
                "complete": not frontier.get("pending") and not frontier.get("failed") and not
                self.db.execute("SELECT COUNT(*) FROM exclusions WHERE platform=? AND (reason LIKE '%coverage_gap%' OR reason LIKE '%budget_pending%')",
                                (platform,)).fetchone()[0]}
        return result


def classify(difference):
    lines = "\n".join(line for line in difference.splitlines() if line[:1] in ("+", "-") and not line.startswith(("+++", "---")))
    patterns = {
        "endpoints": r"https?://|/(?:v\d|api|markets|inferences)|\b(GET|POST|PUT|DELETE|PATCH)\b",
        "authentication": r"auth|api.?key|signature|credential|private.?key",
        "parameters": r"parameter|required|optional|request|response|schema",
        "contracts_addresses_networks": r"0x[a-fA-F0-9]{40}|chain.?id|arbitrum|polygon|contract|mainnet|testnet",
        "limits": r"rate.?limit|quota|maximum|timeout",
        "sdk_versions": r"\bsdk\b|version|release|\bv\d+\.\d+",
        "deprecation": r"deprecat|sunset|removed|breaking",
    }
    return [name for name, pattern in patterns.items() if re.search(pattern, lines, re.I)] or ["other_text_change"]
