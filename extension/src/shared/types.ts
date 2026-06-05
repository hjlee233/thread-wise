/**
 * Extension 전반에서 공유하는 도메인 타입.
 * 서버 API_SPEC 의 PageContext / ARCHITECTURE 의 ExtractedPageContext 와 정렬한다.
 * M3 골격 단계에서는 타입만 정의하고, 실제 추출은 M4 에서 구현한다.
 */

export type ExtractionMethod = "default" | "selection-only" | "manual";

/** Content Script 가 페이지에서 추출하는 컨텍스트. */
export interface ExtractedPageContext {
  pageUrl: string;
  pageTitle: string;
  site: string;
  postTitle: string;
  body: string;
  selectedText: string;
  extractionMethod: ExtractionMethod;
  extractionWarnings: string[];
}

/**
 * 하이브리드 AI 설정 (docs/HYBRID_AI_PLAN.md). 1차에서는 요약에만 적용.
 * 실제 UI 연동은 H4 에서 한다. H1 에서는 타입/기본값만 둔다.
 */
export type AnalyzeQualityMode = "local" | "boost";
export type BoostPreset = "fast" | "balanced" | "high_quality" | "custom";
export type TokenBudget = "low" | "normal" | "high";
export type ReasoningEffort = "low" | "medium" | "high";

export interface BoostSettings {
  preset?: BoostPreset;
  model?: string;
  tokenBudget?: TokenBudget;
  reasoningEffort?: ReasoningEffort;
}

export interface HybridSettings {
  analyzeQualityMode: AnalyzeQualityMode;
  boostPreset: BoostPreset;
  boostModel?: string;
  tokenBudget: TokenBudget;
  reasoningEffort: ReasoningEffort;
}

/** 응답 meta (실제 사용 provider). optional. */
export interface AnalyzeResponseMeta {
  provider: "local" | "openai";
  model: string;
  analyzeQualityMode?: AnalyzeQualityMode;
}

/** 서버 /api/analyze 응답 (API_SPEC 6장). */
export interface AnalyzeResponse {
  summary: string;
  mainPoints: string[];
  unknowns: string[];
  recommendedQuestions: string[];
  caution: string;
  warnings: string[];
  meta?: AnalyzeResponseMeta;
}

/** 서버 /api/ask 응답 (API_SPEC 7장). */
export interface AskResponse {
  answer: string;
  basis: string;
  needsFactCheck: boolean;
  caution: string;
  warnings: string[];
}

/** 서버 공통 에러 응답 (API_SPEC 4.2). */
export interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    requestId: string;
    details: unknown[];
  };
}
