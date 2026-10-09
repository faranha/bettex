import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { CLERK_PROXY_PATH, clerkProxyMiddleware, getClerkProxyHost } from "./middlewares/clerkProxyMiddleware";
import { allowedOrigin, trustedOrigins, requestBoundary, safeHttpError } from "./middlewares/http-security";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.disable("x-powered-by");
app.use("/api", (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  res.status(403).json({ error: "interface_demo_only", message: "Demonstração visual: operações desativadas." });
});
app.use("/api", requestBoundary);
app.use(cors({ credentials: true, origin: (origin, callback) => callback(null, allowedOrigin(origin)) }));
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true }));
// A clean development clone supports native test accounts without a Clerk tenant.
// Production still installs Clerk unconditionally and fails closed if misconfigured.
const clerkConfigured = Boolean(process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY);
if (process.env.NODE_ENV !== "development" || clerkConfigured) {
  app.use(
    clerkMiddleware((req) => ({
      authorizedParties: [...trustedOrigins()],
      publishableKey: publishableKeyFromHost(
        getClerkProxyHost(req) ?? "",
        process.env.CLERK_PUBLISHABLE_KEY,
      ),
    })),
  );
} else {
  logger.warn("Clerk is not configured: only native development test-account authentication is available.");
}

app.use("/api", router);
app.use(safeHttpError);

export default app;
