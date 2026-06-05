/**
 * Side Panel <-> Background <-> Content Script 메시지 계약.
 *
 * M3(골격)에서는 연결성 확인용 PING/PONG 만 구현한다.
 * M4/M5 에서 아래 주석의 메시지(CONTEXT_EXTRACT, ANALYZE, ASK)를 채운다.
 */

import type { ExtractedPageContext } from "./types.js";

export const MessageType = {
  /** Side Panel -> Background 연결 확인 */
  PING: "PING",
  /** Background -> Side Panel 응답 */
  PONG: "PONG",

  // --- 이후 MVP 단계에서 구현 (현재는 예약) ---
  // Side Panel -> Background -> Content Script
  CONTEXT_EXTRACT_REQUEST: "CONTEXT_EXTRACT_REQUEST",
  // Content Script -> Background -> Side Panel
  CONTEXT_EXTRACT_RESULT: "CONTEXT_EXTRACT_RESULT",
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

/** (예약) 현재 탭에서 컨텍스트 추출 요청 */
export interface ContextExtractRequest {
  type: typeof MessageType.CONTEXT_EXTRACT_REQUEST;
}

/** (예약) 컨텍스트 추출 결과 */
export interface ContextExtractResult {
  type: typeof MessageType.CONTEXT_EXTRACT_RESULT;
  context: ExtractedPageContext | null;
  error?: string;
}

/** Side Panel -> Background 로 보낼 수 있는 메시지. */
export type RuntimeRequest = PingMessage | ContextExtractRequest;

/** Background 가 돌려주는 응답. */
export type RuntimeResponse = PongMessage | ContextExtractResult;

/**
 * 타입 안전한 sendMessage 래퍼. Promise 기반.
 * 호출자가 기대 응답 타입을 제네릭으로 지정한다.
 */
export function sendToBackground<R extends RuntimeResponse = RuntimeResponse>(
  message: RuntimeRequest
): Promise<R> {
  return chrome.runtime.sendMessage(message) as Promise<R>;
}
