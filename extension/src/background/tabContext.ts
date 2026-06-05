/**
 * 현재 활성 탭에서 페이지 컨텍스트를 받아오는 로직.
 *
 * 흐름(ARCHITECTURE 2.1):
 *   Background -> (활성 탭) Content Script 에 추출 요청 -> 결과 반환
 *
 * Content Script 가 아직 주입되지 않은 탭(확장 재로드 직후 등)을 위해,
 * 메시지 실패 시 chrome.scripting 으로 한 번 재주입한 뒤 재시도한다.
 */

import {
  MessageType,
  type ContextExtractRequest,
  type ContextExtractResult,
} from "../shared/messages.js";

/** content script 를 주입/통신할 수 없는 제한 URL 인지 판단한다. */
function isRestrictedUrl(url: string | undefined): boolean {
  if (!url) return true;
  return !/^https?:\/\//i.test(url);
}

/** 현재 창의 활성 탭을 조회한다. */
async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/** manifest 에 선언된 content script 파일 경로(빌드 시 해시됨)를 가져온다. */
function getContentScriptFile(): string | undefined {
  const scripts = chrome.runtime.getManifest().content_scripts;
  return scripts?.[0]?.js?.[0];
}

const extractRequest: ContextExtractRequest = {
  type: MessageType.CONTEXT_EXTRACT_REQUEST,
};

/**
 * 활성 탭에서 컨텍스트를 추출해 ContextExtractResult 로 반환한다.
 * 실패는 throw 하지 않고 error 필드를 채운 결과로 돌려준다.
 */
export async function extractFromActiveTab(): Promise<ContextExtractResult> {
  const tab = await getActiveTab();

  if (!tab?.id || isRestrictedUrl(tab.url)) {
    return {
      type: MessageType.CONTEXT_EXTRACT_RESULT,
      context: null,
      error:
        "이 페이지에서는 내용을 읽을 수 없습니다. 일반 웹페이지(http/https)에서 다시 시도하세요.",
    };
  }

  const tabId = tab.id;

  try {
    return await sendExtractRequest(tabId);
  } catch {
    // content script 미주입 가능성 → 재주입 후 재시도.
    const file = getContentScriptFile();
    if (!file) {
      return connectionError();
    }
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: [file] });
      // 로더가 실제 모듈을 동적 import 하므로 리스너 등록까지 잠깐 재시도한다.
      return await sendWithRetries(tabId, 5, 100);
    } catch {
      return connectionError();
    }
  }
}

function sendExtractRequest(tabId: number): Promise<ContextExtractResult> {
  return chrome.tabs.sendMessage<ContextExtractRequest, ContextExtractResult>(
    tabId,
    extractRequest
  );
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** content script 리스너가 준비될 때까지 짧은 간격으로 재시도한다. */
async function sendWithRetries(
  tabId: number,
  attempts: number,
  intervalMs: number
): Promise<ContextExtractResult> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await sendExtractRequest(tabId);
    } catch (err) {
      lastErr = err;
      await delay(intervalMs);
    }
  }
  throw lastErr;
}

function connectionError(): ContextExtractResult {
  return {
    type: MessageType.CONTEXT_EXTRACT_RESULT,
    context: null,
    error: "페이지와 연결하지 못했습니다. 페이지를 새로고침한 뒤 다시 시도하세요.",
  };
}
