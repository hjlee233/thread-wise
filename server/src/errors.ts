import type { ErrorCode } from "./types/api.js";

/**
 * 도메인/요청 처리 중 발생하는 예측된 오류.
 * errorHandler 가 이를 ErrorResponse 로 변환한다.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details: unknown[];

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details: unknown[] = []
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  static validation(message: string, details: unknown[] = []): AppError {
    return new AppError("VALIDATION_ERROR", message, 400, details);
  }

  static emptyContext(message = "분석할 게시글 본문이 없습니다."): AppError {
    return new AppError("EMPTY_CONTEXT", message, 400);
  }

  static payloadTooLarge(message = "요청 크기가 허용 한도를 초과했습니다."): AppError {
    return new AppError("PAYLOAD_TOO_LARGE", message, 413);
  }

  static rateLimited(message = "요청이 너무 많습니다. 잠시 후 다시 시도하세요."): AppError {
    return new AppError("RATE_LIMITED", message, 429);
  }

  static openaiError(message = "AI 응답 생성에 실패했습니다."): AppError {
    return new AppError("OPENAI_ERROR", message, 502);
  }

  static openaiTimeout(message = "AI 응답이 시간 내에 도착하지 않았습니다."): AppError {
    return new AppError("OPENAI_TIMEOUT", message, 504);
  }

  static unsupportedOrigin(message = "허용되지 않은 요청 출처입니다."): AppError {
    return new AppError("UNSUPPORTED_ORIGIN", message, 403);
  }

  static internal(message = "서버 내부 오류가 발생했습니다."): AppError {
    return new AppError("INTERNAL_ERROR", message, 500);
  }
}
