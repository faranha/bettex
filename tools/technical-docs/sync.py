"""Resumable collector with evidence, robots, conditional requests and explicit gaps."""
import datetime as dt
import hashlib
import json
import re
import time
import sys
from urllib.parse import urljoin, urlsplit

from content import bundle_pages, index_pages, literal_openapi, next_documentation_scripts, normalize, repository_links, scope, sitemap_links
from network import CONFIG, Client, FetchError, canonical
from repositories import collect_repository, discover, recover_cached_index, validate_blob
from store import now


def stale(stamp, days=1):
    return not stamp or dt.datetime.now(dt.timezone.utc) - dt.datetime.fromisoformat(stamp) > dt.timedelta(days=days)


class Collector:
    def __init__(self, store, platform, transport=None):
        self.store, self.platform = store, platform
        names = [row[0] for row in store.db.execute("SELECT name FROM repositories WHERE platform=?", (platform,))]
        self.client = transport or Client(platform, names + CONFIG[platform]["repositories"])
        self.counts = {"new_or_changed": 0, "unchanged": 0, "failures": 0, "bundle_pages": 0, "cached_indices_used_with_warning": 0}
        self.index = []

    def fetch(self, url, kind="page", fetch_url=None, version=None, origin=None, optional=False):
        store, platform = self.store, self.platform
        old = store.document(platform, url)
        try:
            response = self.client.fetch(fetch_url or url, old["etag"] if old else None, old["modified"] if old else None,
                                         bypass_robots=kind == "robots")
            if response["status"] == 304:
                if not old:
                    raise FetchError("304 sem cópia local válida.")
                store.verified(platform, url)
                raw = store.raw(old)
                validate_blob(raw, version)
                title, text, links = normalize(raw, "text/plain" if kind in ("bundle", "control") else "", fetch_url or url)
                self.counts["unchanged"] += 1
            else:
                raw = response["raw"]
                validate_blob(raw, version)
                title, text, links = normalize(raw, response.get("type", ""), fetch_url or url)
                if title.lower().strip().startswith(("404", "page not found", "just a moment", "access denied")):
                    raise FetchError("Página de erro/desafio não é documentação; não contornar bloqueio.")
                if len(text.strip()) < 20:
                    for script_url in next_documentation_scripts(raw, url):
                        script = self.client.fetch(script_url)
                        specifications = literal_openapi(script["raw"])
                        self.store.record(platform, script_url, script["raw"], script["raw"].decode("utf8", "replace"),
                                          "Official documentation page module (not executed)", kind="control",
                                          origin=url, etag=script.get("etag"))
                        if specifications:
                            text = "\n\n".join(json.dumps(specification, ensure_ascii=False, indent=2) for specification in specifications)
                            title = specifications[0].get("info", {}).get("title", title)
                            origin = script_url
                            version = "published-page-module:" + script_url.rsplit("/", 1)[-1]
                if not text.strip() or len(text.strip()) < 20:
                    raise FetchError("Resposta sem documentação textual suficiente.")
                changed = store.record(platform, url, raw, text, title, "control" if kind in ("robots", "sitemap") else kind,
                                       origin, version, response.get("etag"), response.get("modified"))
                self.counts["new_or_changed" if changed else "unchanged"] += 1
            store.resource_result(platform, url)
            return raw, text, links
        except (FetchError, ValueError, KeyError) as exception:
            message = str(exception)
            self.counts["failures"] += 1
            if optional and getattr(exception, "status", None) == 404:
                store.exclude(platform, url, "optional_discovery_endpoint_absent")
                with store.db:
                    store.db.execute("UPDATE resources SET state='excluded',last_checked=?,error=? WHERE platform=? AND url=?",
                                     (now(), message, platform, url))
            else:
                store.failure(platform, url, message, removed=getattr(exception, "status", None) in (404, 410))
                store.resource_result(platform, url, message)
            return None

    def links(self, source_url, raw, links):
        proof_hash = hashlib.sha256(raw).hexdigest()
        for repository in repository_links(self.platform, links):
            discover(self.store, self.client, self.platform, repository, source_url, proof_hash)
        for url in links:
            if urlsplit(url).hostname == "github.com":
                if not repository_links(self.platform, [url]):
                    self.store.exclude(self.platform, url, "repository_owner_not_validated")
                continue
            allowed, reason = scope(self.platform, url)
            if not allowed:
                self.store.exclude(self.platform, url, reason)
                continue
            logical = canonical(url)
            if logical == canonical(source_url):
                continue
            kind = "spec" if urlsplit(url).path.endswith((".yaml", ".yml", ".json")) else "page"
            self.store.enqueue(self.platform, logical, url, kind=kind, origin=source_url)

    def seed(self):
        source = CONFIG[self.platform]
        root = source["root"]
        host_root = "https://" + urlsplit(root).hostname + "/"
        robots = host_root + "robots.txt"
        self.store.enqueue(self.platform, robots, kind="robots", priority=0)
        result = self.fetch(robots, "robots", optional=True)
        if result:
            self.client.set_robots(urlsplit(root).hostname, result[1])
        elif self.store.db.execute("SELECT error FROM resources WHERE platform=? AND url=?", (self.platform, robots)).fetchone()[0].startswith("HTTP 403"):
            # Block further access to this host when even its access policy is denied.
            self.client.set_robots(urlsplit(root).hostname, "User-agent: *\nDisallow: /")
        for path, kind in [("llms.txt", "control"), ("sitemap.xml", "sitemap")]:
            url = host_root + path
            self.store.enqueue(self.platform, url, kind=kind, priority=0)
            result = self.fetch(url, kind, optional=True)
            if result:
                if path == "llms.txt":
                    self.index = index_pages(result[1], host_root)
                    self.links(url, result[0], result[2])
                else:
                    for link, is_index in sitemap_links(result[0]):
                        if scope(self.platform, link)[0]:
                            self.store.enqueue(self.platform, link, kind="sitemap" if is_index else "page", priority=1 if is_index else 10)
                        else:
                            self.store.exclude(self.platform, link, scope(self.platform, link)[1])
        bundle_url = host_root + "llms-full.txt"
        self.store.enqueue(self.platform, bundle_url, kind="bundle", priority=0)
        result = self.fetch(bundle_url, "bundle", optional=True)
        if result:
            self.links(bundle_url, result[0], result[2])
            for title, url, body in bundle_pages(result[1], self.index, host_root):
                if not scope(self.platform, url)[0]:
                    continue
                # Explicitly retain origin: these are extracts of the official export, not separately fetched pages.
                changed = self.store.record(self.platform, url, body.encode(), body, title, kind="page", origin=bundle_url)
                self.counts["new_or_changed" if changed else "unchanged"] += 1
                self.counts["bundle_pages"] += 1
                self.store.enqueue(self.platform, url, origin=bundle_url)
                self.store.resource_result(self.platform, url)
        for url in [root, *source.get("standards", [])]:
            self.store.enqueue(self.platform, canonical(url), url, priority=2)
        for repository in source["repositories"]:
            discover(self.store, self.client, self.platform, repository, root, "registered-and-verified-official-source")

    def run(self, due=False, max_pages=2000, seconds=600, repositories=True):
        start = time.monotonic()
        self.seed()
        if repositories:
            # Capture all discoveries. API denial/rate limits stay visible; no token or workaround.
            rows = list(self.store.db.execute("SELECT * FROM repositories WHERE platform=?", (self.platform,)))
            for row in rows:
                if time.monotonic() - start > seconds:
                    break
                if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", row["name"]):
                    marker = "https://api.github.com/repos/" + row["name"]
                    self.store.exclude(self.platform, marker, "malformed_repository_reference")
                    with self.store.db:
                        self.store.db.execute("UPDATE resources SET state='excluded',error=NULL WHERE platform=? AND url=?",
                                              (self.platform, marker))
                    continue
                if due and not stale(row["checked_at"]):
                    recover_cached_index(self.store, self.platform, row["name"])
                    continue
                marker = "https://api.github.com/repos/" + row["name"]
                self.store.enqueue(self.platform, marker, kind="repository_index")
                try:
                    collect_repository(self.store, self.client, self.platform, row["name"], max_pages)
                    self.store.resource_result(self.platform, marker)
                except (FetchError, ValueError, KeyError) as exception:
                    self.store.resource_result(self.platform, marker, str(exception))
                    self.counts["failures"] += 1
                    if recover_cached_index(self.store, self.platform, row["name"]):
                        self.counts["cached_indices_used_with_warning"] += 1
        attempted = set()
        fetched = 0
        while fetched < max_pages and time.monotonic() - start < seconds:
            rows = self.store.db.execute(
                """SELECT * FROM resources WHERE platform=? AND kind NOT IN
                   ('robots','control','bundle','repository_index') AND state!='excluded' ORDER BY priority,url""", (self.platform,)).fetchall()
            row = next((row for row in rows if row["url"] not in attempted and
                         (row["state"] == "pending" or not due or stale(row["last_checked"]))), None)
            if not row:
                break
            attempted.add(row["url"])
            if row["kind"] != "repository" and not scope(self.platform, row["url"])[0]:
                self.store.exclude(self.platform, row["url"], scope(self.platform, row["url"])[1])
                with self.store.db:
                    self.store.db.execute("UPDATE resources SET state='excluded',error=NULL WHERE platform=? AND url=?",
                                          (self.platform, row["url"]))
                continue
            # Bundle extracts were verified in this run; don't duplicate their canonical pages.
            document = self.store.document(self.platform, row["url"])
            if document and document["origin_url"] and document["origin_url"].endswith("llms-full.txt") and not stale(document["checked_at"]):
                continue
            result = self.fetch(row["url"], row["kind"], row["fetch_url"], row["version"], row["origin"])
            fetched += 1
            if result:
                if row["kind"] == "sitemap":
                    for link, is_index in sitemap_links(result[0]):
                        if scope(self.platform, link)[0]:
                            self.store.enqueue(self.platform, link, kind="sitemap" if is_index else "page")
                else:
                    self.links(row["url"], result[0], result[2])
            if fetched % 25 == 0:
                print(f"{self.platform}: {fetched} recursos verificados; {self.counts}", file=sys.stderr, flush=True)
        self.counts["attempted_resources"] = fetched
        self.counts["budget_exhausted"] = fetched >= max_pages or time.monotonic() - start >= seconds
        return self.counts
