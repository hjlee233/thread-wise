import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors.js";
import type { ErrorResponseBody } from "../types/api.js";

/** 404 핸들러. 라우트에 매칭되지 않은 요청을 표준 에러로 변환한다. */
export function notFoundHandler(req: Request, res: Response): void {
  res.setHeader("X-Error-Code", "VALIDATION_ERROR");
  const body: ErrorResponseBody = {
    error: {
      code: "VALIDATION_ERROR",
      message: `경로를 찾을 수 없습니다: ${req.method} ${req.path}`,
      requestId: req.requestId ?? "unknown",
      details: [],
    },
  };
  res.status(404).json(body);
}

/**
 * 중앙 에러 핸들러. 모든 오류를 ErrorResponse 형식으로 변환한다.
 * 원문 본문/질문은 details 에 절대 포함하지 않는다.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const requestId = req.requestId ?? "unknown";

  // express.json() body limit 초과는 type=entity.too.large 로 들어온다.
  if (isPayloadTooLarge(err)) {
    return send(res, AppError.payloadTooLarge(), requestId);
  }

  if (err instanceof AppError) {
    return send(res, err, requestId);
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    return send(res, AppError.validation("요청 형식이 올바르지 않습니다.", details), requestId);
  }

  // JSON 파싱 실패
  if (err instanceof SyntaxError && "body" in err) {
    return send(res, AppError.validation("요청 본문이 올바른 JSON 이 아닙니다."), requestId);
  }

  // 그 외는 내부 오류로 처리. 상세 메시지는 노출하지 않는다.
  console.error(
    JSON.stringify({
      requestId,
      level: "error",
      message: "unhandled error",
      name: err instanceof Error ? err.name : typeof err,
    })
  );
  send(res, AppError.internal(), requestId);
}

function isPayloadTooLarge(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    (err as { type?: string }).type === "entity.too.large"
  );
}

function send(res: Response, err: AppError, requestId: string): void {
  res.setHeader("X-Error-Code", err.code);
  const body: ErrorResponseBody = {
    error: {
      code: err.code,
      message: err.message,
      requestId,
      details: err.details,
    },
  };
  res.status(err.statusCode).json(body);
}
