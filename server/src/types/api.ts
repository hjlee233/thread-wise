/**
 * Extension <-> 서버 API 의 공통 타입.
 * API_SPEC.md 4장(공통 타입)과 6/7장(analyze/ask)을 따른다.
 */

/** API_SPEC 4.2 ErrorResponse */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "PAYLOAD_TOO_LARGE"
  | "RATE_LIMITED"
  | "OPENAI_ERROR"
  | "OPENAI_TIMEOUT"
  | "EMPTY_CONTEXT"
  | "UNSUPPORTED_ORIGIN"
  | "INTERNAL_ERROR";

export interface ErrorResponseBody {
  error: {
    code: ErrorCode;
    message: string;
    requestId: string;
    /** 디버깅용 제한 정보. 원문 본문/질문은 절대 포함하지 않는다. */
    details: unknown[];
  };
}

/** GET /health */
export interface HealthResponse {
  ok: true;
  service: string;
  version: string;
}

/** POST /api/analyze 요청 */
export interface AnalyzeRequest {
  pageUrl: string;
  site: string;
  title?: string;
  body: string;
  selectedText?: string;
}

/** POST /api/analyze 응답 (Structured Output) */
export interface AnalyzeResponse {
  summary: string;
  mainPoints: string[];
  unknowns: string[];
  recommendedQuestions: string[];
  caution: string;
  warnings: string[];
}

/** POST /api/ask 요청 */
export interface AskRequest {
  context: {
    pageUrl: string;
    title?: string;
    body: string;
    selectedText?: string;
  };
  question: string;
}

/** POST /api/ask 응답 (Structured Output) */
export interface AskResponse {
  answer: string;
  basis: string;
  needsFactCheck: boolean;
  caution: string;
  warnings: string[];
}
