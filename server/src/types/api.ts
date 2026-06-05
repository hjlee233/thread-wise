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

/**
 * 하이브리드 AI 확장 타입 (docs/HYBRID_AI_PLAN.md).
 * 1차에서는 요약(/api/analyze)에만 적용한다. 모두 optional 이라 기존 요청과 호환된다.
 */
export type AnalyzeQualityMode = "local" | "boost";

export interface BoostSettings {
  preset?: "fast" | "balanced" | "high_quality" | "custom";
  model?: string;
  tokenBudget?: "low" | "normal" | "high";
  reasoningEffort?: "low" | "medium" | "high";
}

/** 실제 사용한 provider 정보(응답 meta). H2/H3 에서 채운다. */
export interface AnalyzeResponseMeta {
  provider: "local" | "openai";
  model: string;
  analyzeQualityMode?: AnalyzeQualityMode;
}

/** POST /api/analyze 요청 */
export interface AnalyzeRequest {
  pageUrl: string;
  site: string;
  title?: string;
  body: string;
  selectedText?: string;
  /** 하이브리드: 요약 provider 선택. 없으면 서버 기본값(DEFAULT_ANALYZE_QUALITY_MODE). */
  analyzeQualityMode?: AnalyzeQualityMode;
  /** 하이브리드: 부스트 세부 설정. analyzeQualityMode="boost" 일 때 의미가 있다. */
  boostSettings?: BoostSettings;
}

/** POST /api/analyze 응답 (Structured Output) */
export interface AnalyzeResponse {
  summary: string;
  mainPoints: string[];
  unknowns: string[];
  recommendedQuestions: string[];
  caution: string;
  warnings: string[];
  /** 실제 사용 provider 정보. 1차 호환을 위해 optional. */
  meta?: AnalyzeResponseMeta;
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
