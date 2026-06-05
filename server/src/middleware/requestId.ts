import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/** 각 요청에 추적용 requestId 를 부여한다. 로그와 에러 응답에서 공통으로 사용한다. */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `req_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
}
