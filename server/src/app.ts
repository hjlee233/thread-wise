import cors from "cors";
import express, { type Express } from "express";
import { loadConfig } from "./config.js";
import { buildCorsOptions } from "./middleware/cors.js";
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

  // requestId/logger 를 먼저 두어 CORS 거부 응답도 추적/로깅되게 한다.
  app.use(requestId);
  app.use(requestLogger);

  // CORS: production 에서는 allowlist 강제(config guard), 그 외에는 buildCorsOptions 규칙을 따른다.
  app.use(cors(buildCorsOptions(config)));

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
