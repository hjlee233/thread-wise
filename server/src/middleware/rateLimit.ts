import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import type { ErrorResponseBody } from "../types/api.js";

/**
 * API_SPEC 3.3 Rate Limit: 개발 기본값 15분당 60회.
 * 초과 시 표준 ErrorResponse(RATE_LIMITED) 를 반환한다.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.setHeader("X-Error-Code", "RATE_LIMITED");
    const body: ErrorResponseBody = {
      error: {
        code: "RATE_LIMITED",
        message: "요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
        requestId: req.requestId ?? "unknown",
        details: [],
      },
    };
    res.status(429).json(body);
  },
});
