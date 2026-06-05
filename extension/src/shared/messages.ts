/**
 * Side Panel <-> Background <-> Content Script 메시지 계약.
 *
 * - PING/PONG: 연결성 확인 (M3)
 * - CONTEXT_EXTRACT_*: 현재 탭 컨텍스트 추출 (M4)
 * - ANALYZE_REQUEST / ASK_REQUEST: 서버 요약/질문 (M5)
 */

import type {
  AnalyzeQualityMode,
  AnalyzeResponse,
  AskResponse,
  BoostSettings,
  ExtractedPageContext,
} from "./types.js";

export const MessageType = {
  /** Side Panel -> Background 연결 확인 */
  PING: "PING",
  /** Background -> Side Panel 응답 */
  PONG: "PONG",

  /** Side Panel -> Background -> Content Script */
  CONTEXT_EXTRACT_REQUEST: "CONTEXT_EXTRACT_REQUEST",
  /** Content Script -> Background -> Side Panel */
  CONTEXT_EXTRACT_RESULT: "CONTEXT_EXTRACT_RESULT",

  /** Side Panel -> Background -> 서버 /api/analyze */
  ANALYZE_REQUEST: "ANALYZE_REQUEST",
  /** Side Panel -> Background -> 서버 /api/ask */
  ASK_REQUEST: "ASK_REQUEST",
} as const;

export type MessageTypeValue = (typeof MessageType)[keyof typeof MessageType];

/** Side Panel -> Background */
export interface PingMessage {
  type: typeof MessageType.PING;
}

/** Background -> Side Panel 응답 */
export interface PongMessage {
  type: typeof MessageType.PONG;
  receivedAt: number;
  extensionVersion: string;
}

/** 현재 탭에서 컨텍스트 추출 요청 */
export interface ContextExtractRequest {
  type: typeof MessageType.CONTEXT_EXTRACT_REQUEST;
}

/** 컨텍스트 추출 결과 */
export interface ContextExtractResult {
  type: typeof MessageType.CONTEXT_EXTRACT_RESULT;
  context: ExtractedPageContext | null;
  error?: string;
}

/** /api/analyze 요청 페이로드 (서버 스키마와 정렬). */
export interface AnalyzeRequestPayload {
  pageUrl: string;
  site: string;
  title?: string;
  body: string;
  selectedText?: string;
  /** 하이브리드(H4 에서 연동). 없으면 서버 기본값 사용. */
  analyzeQualityMode?: AnalyzeQualityMode;
  boostSettings?: BoostSettings;
}

/** /api/ask 요청 페이로드. */
export interface AskRequestPayload {
  context: {
    pageUrl: string;
    title?: string;
    body: string;
    selectedText?: string;
  };
  question: string;
}

export interface AnalyzeRequestMessage {
  type: typeof MessageType.ANALYZE_REQUEST;
  payload: AnalyzeRequestPayload;
}

export interface AskRequestMessage {
  type: typeof MessageType.ASK_REQUEST;
  payload: AskRequestPayload;
}

/** Side Panel 에 표시할 정규화된 오류. */
export interface ApiError {
  code: string;
  message: string;
}

/** 서버 호출 결과(성공/실패 구분). */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export type AnalyzeResult = ApiResult<AnalyzeResponse>;
export type AskResult = ApiResult<AskResponse>;

/** Side Panel -> Background 로 보낼 수 있는 메시지. */
export type RuntimeRequest =
  | PingMessage
  | ContextExtractRequest
  | AnalyzeRequestMessage
  | AskRequestMessage;

/** Background 가 돌려주는 응답. */
export type RuntimeResponse =
  | PongMessage
  | ContextExtractResult
  | AnalyzeResult
  | AskResult;

/**
 * 타입 안전한 sendMessage 래퍼. Promise 기반.
 * 호출자가 기대 응답 타입을 제네릭으로 지정한다.
 */
export function sendToBackground<R extends RuntimeResponse = RuntimeResponse>(
  message: RuntimeRequest
): Promise<R> {
  return chrome.runtime.sendMessage(message) as Promise<R>;
}
