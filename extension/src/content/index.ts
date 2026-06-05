/**
 * Content Script.
 *
 * 책임(ARCHITECTURE 3.4):
 * - 현재 페이지에서 게시글 컨텍스트 추출
 * - Background 의 CONTEXT_EXTRACT_REQUEST 에 응답
 * Content Script 는 서버와 직접 통신하지 않는다. 추출 결과만 Background 로 돌려준다.
 *
 * Background 가 chrome.scripting 으로 재주입할 수 있으므로, 리스너가 중복
 * 등록되지 않도록 전역 플래그로 가드한다.
 */

import {
  MessageType,
  type ContextExtractResult,
  type RuntimeRequest,
} from "../shared/messages.js";
import { extractPageContext } from "./adapters/adapterRegistry.js";

declare global {
  interface Window {
    __threadWiseContentLoaded?: boolean;
  }
}

if (!window.__threadWiseContentLoaded) {
  window.__threadWiseContentLoaded = true;
  console.debug("[ThreadWise] content script loaded:", location.href);

  chrome.runtime.onMessage.addListener(
    (message: RuntimeRequest, _sender, sendResponse) => {
      if (message.type !== MessageType.CONTEXT_EXTRACT_REQUEST) {
        return false;
      }

      try {
        const context = extractPageContext(document);
        const result: ContextExtractResult = {
          type: MessageType.CONTEXT_EXTRACT_RESULT,
          context,
        };
        sendResponse(result);
      } catch (err) {
        const result: ContextExtractResult = {
          type: MessageType.CONTEXT_EXTRACT_RESULT,
          context: null,
          error: err instanceof Error ? err.message : String(err),
        };
        sendResponse(result);
      }
      return false; // 동기 응답
    }
  );
}

export {};
