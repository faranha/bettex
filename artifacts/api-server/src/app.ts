import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import healthRouter from "./routes/health";
import { logger } from "./lib/logger";
import { allowedOrigin, requestBoundary, safeHttpError } from "./middlewares/http-security";

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
  if (req.method === "OPTIONS") return res.sendStatus(204);
  if (!["GET", "HEAD"].includes(req.method)) {
    return res.status(403).json({ error: "interface_demo_only", message: "Demonstração visual: operações desativadas." });
  }
  if (req.path === "/healthz") return next();
  if (req.path === "/account/session") return res.json({ account: null });
  return res.status(410).json({ error: "not_available_in_interface_demo", message: "Os dados fictícios do demo são locais. Não há conexão operacional." });
});
app.use("/api", requestBoundary);
app.use(cors({ credentials: true, origin: (origin, callback) => callback(null, allowedOrigin(origin)) }));
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true }));
// Deliberately do not import operational routes or authentication middleware:
// even their initialization must not access accounts, databases, RPC or testnet.
// Implementations and existing records remain preserved but unreachable.
app.use("/api", healthRouter);
app.use(safeHttpError);

export default app;
