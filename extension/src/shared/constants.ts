/** Extension 공용 상수. */

/** 서버 Base URL 기본값. M5 에서 설정 UI/스토리지로 분리한다. */
export const DEFAULT_SERVER_BASE_URL = "http://localhost:3000";

/** chrome.storage 키. */
export const STORAGE_KEYS = {
  serverBaseUrl: "serverBaseUrl",
} as const;
