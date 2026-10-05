"""Public, allowlisted HTTP only. No credentials, cookies, execution or financial APIs."""
import ipaddress
import json
from pathlib import Path
import re
import socket
import threading
import time
from urllib import error, parse, request, robotparser

CONFIG = json.loads((Path(__file__).parent / "sources.json").read_text())["platforms"]
MAX_BYTES = 20 * 1024 * 1024
RATE_LOCK = threading.Lock()
RATE_TIMING = {}


def canonical(url):
    parts = parse.urlsplit(url)
    path = parts.path or "/"
    if path.endswith(".md") and "/_llms/" not in path:
        path = path[:-3]
    return parse.urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, "", ""))


class FetchError(Exception):
    def __init__(self, reason, status=None):
        super().__init__(reason)
        self.status = status


class GuardedRedirect(request.HTTPRedirectHandler):
    def __init__(self, client):
        self.client = client

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        self.client.validate(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


class Client:
    def __init__(self, platform, repositories=(), interval=0.35):
        self.platform = platform
        self.config = CONFIG[platform]
        self.repositories = {name.lower() for name in repositories}
        self.interval = interval
        self.timing = RATE_TIMING
        self.mutex = RATE_LOCK
        self.robots = {}
        self.opener = request.build_opener(GuardedRedirect(self))

    def validate(self, url):
        parts = parse.urlsplit(url)
        if parts.scheme != "https" or parts.username or parts.password or parts.port not in (None, 443):
            raise FetchError("URL não é HTTPS público sem credenciais.")
        if re.search(r"(?:key|token|secret|password|credential|signature|authorization)=", parts.query, re.I):
            raise FetchError("URL contém possível credencial; excluída.")
        host = parts.hostname or ""
        if host in ("api.github.com", "raw.githubusercontent.com"):
            pieces = parts.path.strip("/").split("/")
            if host == "api.github.com":
                if len(pieces) < 3 or pieces[0] != "repos":
                    raise FetchError("Endpoint GitHub fora do escopo cadastrado.")
                name = "/".join(pieces[1:3])
            else:
                name = "/".join(pieces[:2])
            if name.lower() not in self.repositories:
                raise FetchError("Repositório sem procedência validada.")
        elif host not in self.config["hosts"]:
            raise FetchError("Domínio não cadastrado.")
        elif host == "ethereum.org" and not any(parts.path.startswith(p) for p in self.config["paths"]):
            raise FetchError("Página Ethereum fora do escopo técnico/inglês.")
        elif host in ("eips.ethereum.org", "ercs.ethereum.org") and not re.match(r"/(?:EIPS/eip|ERCS/erc)-\d+$", parts.path):
            if parts.path != "/robots.txt":
                raise FetchError("Padrão fora do escopo cadastrado.")
        for item in socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM):
            if not ipaddress.ip_address(item[4][0]).is_global:
                raise FetchError("Endereço de rede não público bloqueado.")
        return parts

    def fetch(self, url, etag=None, modified=None, bypass_robots=False):
        parts = self.validate(url)
        host = parts.hostname
        if not bypass_robots and host in self.robots and not self.robots[host].can_fetch("BETTEX-Documentation", url):
            raise FetchError("robots.txt impede esta coleta.")
        headers = {"User-Agent": "BETTEX-Documentation/1.0 (public technical reference; no training)",
                   "Accept": "text/markdown, application/json, text/html, */*", "Accept-Encoding": "identity"}
        if etag:
            headers["If-None-Match"] = etag
        if modified:
            headers["If-Modified-Since"] = modified
        last = None
        for attempt in range(3):
            with self.mutex:
                wait = max(0, self.timing.get(host, 0) - time.monotonic())
                if wait:
                    time.sleep(wait)
                self.timing[host] = time.monotonic() + self.interval
            try:
                with self.opener.open(request.Request(url, headers=headers), timeout=22) as response:
                    raw = response.read(MAX_BYTES + 1)
                    if len(raw) > MAX_BYTES:
                        raise FetchError("Documento excede o limite de 20 MiB.")
                    return {"status": response.status, "raw": raw, "url": response.url,
                            "etag": response.headers.get("ETag"), "modified": response.headers.get("Last-Modified"),
                            "type": response.headers.get("Content-Type", "")}
            except error.HTTPError as exception:
                if exception.code == 304:
                    return {"status": 304}
                last = FetchError(f"HTTP {exception.code}; não contornar acesso", exception.code)
                if exception.code not in (408, 429, 500, 502, 503, 504):
                    raise last from None
                delay = exception.headers.get("Retry-After", "")
                # Do not retry sooner than the server permits. Defer long waits to the next run.
                try:
                    seconds = float(delay) if delay else 2 ** attempt
                except ValueError:
                    raise FetchError("Retry-After com data; fonte adiada", exception.code) from None
                if seconds > 30:
                    raise FetchError("Retry-After longo; fonte adiada", exception.code) from None
                time.sleep(max(seconds, 2 ** attempt))
            except (error.URLError, TimeoutError, OSError) as exception:
                last = FetchError(f"Falha de transporte: {type(exception).__name__}")
                time.sleep(2 ** attempt)
        raise last

    def set_robots(self, host, text):
        if re.search(r"(?:ai-input|search)\s*=\s*no", text, re.I):
            text += "\nUser-agent: BETTEX-Documentation\nDisallow: /\n"
        rules = robotparser.RobotFileParser()
        rules.parse(text.splitlines())
        delay = rules.crawl_delay("BETTEX-Documentation") or rules.crawl_delay("*")
        if delay:
            self.interval = max(self.interval, delay)
        self.robots[host] = rules
