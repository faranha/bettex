import type { ErrorRequestHandler, RequestHandler } from "express";

/** Never derive trusted origins from Host/X-Forwarded-* supplied by a caller. */
export function trustedOrigins(env: NodeJS.ProcessEnv = process.env) {
  const origins = new Set(["https://bettex.ai", "https://www.bettex.ai"]);
  if (env.NODE_ENV !== "production") {
    for (const host of [env.REPLIT_DEV_DOMAIN, ...(env.REPLIT_DOMAINS?.split(",") ?? [])]) {
      if (host && /^[a-z0-9.-]+$/i.test(host)) origins.add(`https://${host}`);
    }
    for (const host of ["localhost", "127.0.0.1"]) {
      for (const port of ["", ":80", ":25336", ":8080", ":5173", ":3000"]) origins.add(`http://${host}${port}`);
    }
  }
  return origins;
}
export function allowedOrigin(origin: string | undefined, env: NodeJS.ProcessEnv = process.env) {
  return !!origin && trustedOrigins(env).has(origin);
}
export const requestBoundary: RequestHandler = (req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "no-referrer");
  res.set("Cache-Control", "no-store, private");
  const origin = req.get("origin");
  if ((origin && !allowedOrigin(origin)) || req.get("sec-fetch-site") === "cross-site"
    && !allowedOrigin(origin)) {
    res.status(403).json({ code: "origin_not_allowed" }); return;
  }
  if (process.env.BETTEX_EXECUTION_PAUSED === "true" && !["GET", "HEAD", "OPTIONS"].includes(req.method)
    && /^\/api\/(?:demo\/(?:movements|history\/distribution-preview)|(?:account\/execution|test-account\/journey))(?:\/|\?|$)/i.test(req.originalUrl)) {
    res.status(503).json({ code: "operations_paused" }); return;
  }
  const clerkProxy = req.originalUrl === "/api/__clerk" || req.originalUrl.startsWith("/api/__clerk/");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)
    && (!allowedOrigin(origin) || !clerkProxy && !req.is("application/json"))) {
    res.status(403).json({ code: "origin_not_allowed" }); return;
  }
  next();
};
/** Parser/database/SDK failures must not echo input, SQL parameters or stacks. */
export const safeHttpError: ErrorRequestHandler = (error, req, res, _next) => {
  if (res.headersSent) { res.end(); return; }
  const status = error?.type === "entity.too.large" ? 413
    : error?.type === "entity.parse.failed" ? 400 : 500;
  req.log?.warn({ code: status === 500 ? "internal_error" : "invalid_body" }, "Request rejected");
  res.status(status).json({ code: status === 413 ? "body_too_large" : status === 400 ? "invalid_body" : "internal_error" });
};
