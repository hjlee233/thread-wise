import type { NextFunction, Request, Response } from "express";

/**
 * 요청 로거.
 * API_SPEC 3.4 에 따라 원문 본문/질문/응답 전문은 절대 로그에 남기지 않는다.
 * 허용 필드: requestId, method, path, statusCode, latencyMs, site, bodyLength, errorCode
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();
  const bodyLength = Number(req.headers["content-length"] ?? 0);

  res.on("finish", () => {
    const latencyMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const errorCode = res.getHeader("X-Error-Code");

    // body 는 express.json() 이후에 채워지므로 finish 시점에 읽는다.
    // site 는 비민감 메타데이터이므로 기록 가능.
    const site =
      typeof req.body?.site === "string"
        ? req.body.site
        : typeof req.body?.context?.pageUrl === "string"
          ? "(context)"
          : undefined;

    const line = {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      latencyMs: Math.round(latencyMs),
      site,
      bodyLength,
      errorCode: typeof errorCode === "string" ? errorCode : undefined,
    };

    // 원문을 포함하지 않는 구조화 한 줄 로그.
    console.log(JSON.stringify(line));
  });

  next();
}
