/**
 * Background Service Worker.
 *
 * 책임(ARCHITECTURE 3.3):
 * - 툴바 아이콘 클릭 시 Side Panel 열기
 * - PING/PONG 연결 확인
 * - 현재 탭 컨텍스트 추출 라우팅 (Content Script 경유)
 * - 백엔드 API 호출 중계 (/api/analyze, /api/ask)
 * Background 는 DOM 을 직접 읽지 않는다.
 */

import { analyze, ask } from "./apiClient.js";
import {
  MessageType,
  type PongMessage,
  type RuntimeRequest,
} from "../shared/messages.js";
import { extractFromActiveTab } from "./tabContext.js";

// 툴바 아이콘 클릭으로 Side Panel 을 연다.
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.error("[ThreadWise] setPanelBehavior 실패:", err));
});

chrome.runtime.onMessage.addListener(
  (message: RuntimeRequest, _sender, sendResponse) => {
    switch (message.type) {
      case MessageType.PING: {
        const pong: PongMessage = {
          type: MessageType.PONG,
          receivedAt: Date.now(),
          extensionVersion: chrome.runtime.getManifest().version,
        };
        sendResponse(pong);
        return false; // 동기 응답 완료
      }
      case MessageType.CONTEXT_EXTRACT_REQUEST: {
        // 활성 탭 조회 + content script 통신은 비동기이므로 채널을 열어둔다.
        extractFromActiveTab().then(sendResponse);
        return true;
      }
      case MessageType.ANALYZE_REQUEST: {
        analyze(message.payload).then(sendResponse);
        return true;
      }
      case MessageType.ASK_REQUEST: {
        ask(message.payload).then(sendResponse);
        return true;
      }
      default:
        return false;
    }
  }
);
