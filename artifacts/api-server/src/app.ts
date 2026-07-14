import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { createSessionMiddleware } from "./lib/session";

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required in production");
}

const app: Express = express();
const sessionSecret =
  process.env.SESSION_SECRET ?? "climate-action-hub-local-development";

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

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(...createSessionMiddleware(sessionSecret));

app.use("/api", router);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error({ err: error }, "Unhandled request error");
    if (res.headersSent) {
      next(error);
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  },
);

export default app;
