/**
 * Background Service Worker.
 *
 * M3 책임(골격):
 * - 툴바 아이콘 클릭 시 Side Panel 이 열리도록 동작 설정
 * - Side Panel 의 PING 에 PONG 으로 응답(연결성 확인)
 *
 * 이후 단계:
 * - M4: 현재 탭 조회 + Content Script 컨텍스트 추출 라우팅
 * - M5: 백엔드 API 호출 중계
 * Background 는 DOM 을 직접 읽지 않는다(ARCHITECTURE 3.3).
 */

import {
  MessageType,
  type PongMessage,
  type RuntimeRequest,
} from "../shared/messages.js";

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
      default:
        // 아직 구현되지 않은 메시지는 무시한다(M4/M5 에서 처리).
        return false;
    }
  }
);
