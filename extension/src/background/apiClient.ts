/**
 * 백엔드 API 클라이언트 (Background 전용).
 *
 * Side Panel 은 직접 서버를 호출하지 않고, Background 가 중계한다(ARCHITECTURE 3.3).
 * 모든 오류는 사용자에게 보여줄 ApiResult 형태로 정규화한다.
 */

import { DEFAULT_SERVER_BASE_URL, STORAGE_KEYS } from "../shared/constants.js";
import type {
  AnalyzeRequestPayload,
  ApiResult,
  AskRequestPayload,
} from "../shared/messages.js";
import type {
  AnalyzeResponse,
  AskResponse,
  ErrorResponseBody,
} from "../shared/types.js";

/** OpenAI 호출 시간을 고려한 클라이언트 타임아웃(서버 30s + 여유). */
const REQUEST_TIMEOUT_MS = 35_000;

/** 저장된 서버 Base URL 을 읽는다. 없으면 기본값. */
async function getServerBaseUrl(): Promise<string> {
  try {
    const stored = await chrome.storage.local.get(STORAGE_KEYS.serverBaseUrl);
    const url = stored?.[STORAGE_KEYS.serverBaseUrl];
    return typeof url === "string" && url.trim() ? url.trim() : DEFAULT_SERVER_BASE_URL;
  } catch {
    return DEFAULT_SERVER_BASE_URL;
  }
}

export function analyze(payload: AnalyzeRequestPayload): Promise<ApiResult<AnalyzeResponse>> {
  return postJson<AnalyzeResponse>("/api/analyze", payload);
}

export function ask(payload: AskRequestPayload): Promise<ApiResult<AskResponse>> {
  return postJson<AskResponse>("/api/ask", payload);
}

async function postJson<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  const base = await getServerBaseUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === "AbortError") {
      return fail("TIMEOUT", "서버 응답이 지연되어 요청을 취소했습니다. 잠시 후 다시 시도하세요.");
    }
    return fail(
      "NETWORK",
      `서버에 연결할 수 없습니다. 서버 실행 상태와 주소(${base})를 확인하세요.`
    );
  } finally {
    clearTimeout(timer);
  }

  // 성공 응답
  if (res.ok) {
    try {
      const data = (await res.json()) as T;
      return { ok: true, data };
    } catch {
      return fail("PARSE_ERROR", "서버 응답을 해석하지 못했습니다.");
    }
  }

  // 오류 응답: 서버 ErrorResponse 형식을 우선 사용한다.
  const parsed = await safeJson(res);
  const errBody = parsed as ErrorResponseBody | null;
  if (errBody?.error?.code) {
    return { ok: false, error: { code: errBody.error.code, message: errBody.error.message } };
  }
  return fail("HTTP_ERROR", `서버 오류가 발생했습니다. (HTTP ${res.status})`);
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function fail(code: string, message: string): ApiResult<never> {
  return { ok: false, error: { code, message } };
}
