"""Official repository discovery. Only docs/specs/changelogs, never repository code execution."""
import hashlib
import json
import re
from urllib.parse import quote, unquote

from network import CONFIG, FetchError
from store import now


def discover(store, client, platform, name, proof_url, proof_hash):
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", name):
        store.exclude(platform, "https://github.com/" + name, "malformed_repository_reference")
        return
    # GitHub repository identity is case-insensitive; file paths remain case-sensitive.
    existing = store.db.execute("SELECT name FROM repositories WHERE platform=? AND lower(name)=lower(?)",
                               (platform, name)).fetchone()
    if existing:
        client.repositories.add(existing["name"].lower())
        return
    owner = name.split("/")[0].lower()
    if owner not in {value.lower() for value in CONFIG[platform]["owners"]}:
        store.exclude(platform, "https://github.com/" + name, "repository_owner_not_validated")
        return
    client.repositories.add(name.lower())
    with store.db:
        store.db.execute(
            """INSERT INTO repositories(platform,name,proof_url,proof_hash) VALUES(?,?,?,?)
               ON CONFLICT(platform,name) DO NOTHING""", (platform, name, proof_url, proof_hash))


def technical_path(platform, repository, path):
    if repository.lower() == "ethereum/ethereum-org-website":
        return path.startswith("public/content/developers/docs/") and path.endswith((".md", ".mdx"))
    if repository.lower() in ("ethereum/eips", "ethereum/ercs"):
        return bool(re.match(r"(?:EIPS/eip|ERCS/erc)-(?:20|155|1559|712|2612|1193)\.md$", path))
    if re.search(r"(?:^|/)(?:translations?|i18n|locales|node_modules|vendor|fixtures|test|tests)/", path, re.I):
        return False
    return path.lower().endswith((".md", ".mdx", ".rst")) or bool(
        re.search(r"(?:openapi|swagger)[^/]*\.(?:json|yaml|yml)$", path, re.I))


def collect_repository(store, client, platform, repository, max_files=2000):
    base = "https://api.github.com/repos/" + repository
    metadata = json.loads(client.fetch(base)["raw"])
    if metadata.get("full_name", "").lower() != repository.lower() or metadata.get("private"):
        raise FetchError("Metadados não validam repositório público cadastrado.")
    if repository.lower() == "ethereum/ethereum-org-website" and metadata.get("homepage", "").rstrip("/") != "https://ethereum.org":
        raise FetchError("Homepage do espelho Ethereum não corresponde à fonte cadastrada.")
    branch = metadata["default_branch"]
    tree_url = base + "/git/trees/" + quote(branch, safe="") + "?recursive=1"
    old = store.document(platform, tree_url)
    response = client.fetch(tree_url, old["etag"] if old else None)
    if response["status"] == 304:
        store.verified(platform, tree_url)
        raw = store.raw(old)
    else:
        raw = response["raw"]
        store.record(platform, tree_url, raw, raw.decode(), repository + " documentation tree", kind="control",
                     version="git-tree:" + json.loads(raw)["sha"], etag=response.get("etag"))
    tree = json.loads(raw)
    if tree.get("truncated"):
        store.exclude(platform, tree_url, "repository_tree_truncated_coverage_gap")
    selected = enqueue_tree(store, platform, repository, branch, tree)
    if len(selected) > max_files:
        store.exclude(platform, tree_url, f"repository_budget_pending:{len(selected) - max_files}")
    with store.db:
        store.db.execute("UPDATE repositories SET checked_at=?,commit_sha=? WHERE platform=? AND name=?",
                         (now(), "tree:" + tree["sha"], platform, repository))
    return len(selected)


def enqueue_tree(store, platform, repository, branch, tree):
    selected = [entry for entry in tree["tree"] if entry["type"] == "blob" and technical_path(platform, repository, entry["path"])]
    for item in selected:
        path = item["path"]
        fetch_url = "https://raw.githubusercontent.com/" + repository + "/" + quote(branch, safe="") + "/" + quote(path, safe="/")
        logical_url = "https://github.com/" + repository + "/blob/" + branch + "/" + path
        if repository.lower() == "ethereum/ethereum-org-website":
            route = path.removeprefix("public/content/developers/docs/").removesuffix("index.md").removesuffix(".mdx").removesuffix(".md")
            logical_url = "https://ethereum.org/en/developers/docs/" + route
        # Blob identity is independently verifiable without assuming tree SHA is a commit SHA.
        store.enqueue(platform, logical_url, fetch_url, kind="repository", version="git-blob:" + item["sha"],
                      origin=fetch_url, priority=20)
    return selected


def recover_cached_index(store, platform, repository):
    """Explicit recovery: retain index-failure state; do not claim latest tree verification."""
    prefix = "https://api.github.com/repos/" + repository + "/git/trees/"
    previous = store.db.execute("SELECT * FROM documents WHERE platform=? AND lower(url) LIKE lower(?) ORDER BY checked_at DESC LIMIT 1",
                                (platform, prefix + "%")).fetchone()
    if not previous:
        return False
    tree = json.loads(store.raw(previous))
    branch = unquote(previous["url"].split("/git/trees/", 1)[1].split("?", 1)[0])
    enqueue_tree(store, platform, repository, branch, tree)
    return True


def validate_blob(raw, version):
    if version and version.startswith("git-blob:"):
        actual = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
        if actual != version.removeprefix("git-blob:"):
            raise FetchError("Conteúdo mudou após descoberta do tree; não atribuir versão incorreta. Reconciliar na próxima sincronização.")
