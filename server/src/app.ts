import cors from "cors";
import express, { type Express } from "express";
import { loadConfig } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRateLimiter } from "./middleware/rateLimit.js";
import { requestId } from "./middleware/requestId.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { analyzeRouter } from "./routes/analyze.js";
import { askRouter } from "./routes/ask.js";
import { healthRouter } from "./routes/health.js";

/** Express 앱을 조립한다. server.ts 와 분리해 테스트에서 재사용 가능하게 한다. */
export function createApp(): Express {
  const config = loadConfig();
  const app = express();

  app.disable("x-powered-by");

  // CORS: allowlist 가 비어 있으면 개발 편의를 위해 모두 허용.
  app.use(
    cors({
      origin: config.corsAllowedOrigins.length === 0 ? true : config.corsAllowedOrigins,
    })
  );

  app.use(requestId);
  app.use(requestLogger);

  // 요청 크기 제한(API_SPEC 3.2: 100kb). 초과 시 errorHandler 가 PAYLOAD_TOO_LARGE 로 변환.
  app.use(express.json({ limit: "100kb" }));

  app.use(healthRouter);

  // /api/* 에만 rate limit 적용.
  app.use("/api", apiRateLimiter);
  app.use(analyzeRouter);
  app.use(askRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
