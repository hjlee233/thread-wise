import type { HybridSettings } from "./types.js";

/** Extension 공용 상수. */

/** 서버 Base URL 기본값. M5 에서 설정 UI/스토리지로 분리한다. */
export const DEFAULT_SERVER_BASE_URL = "http://localhost:3000";

/** chrome.storage 키. */
export const STORAGE_KEYS = {
  serverBaseUrl: "serverBaseUrl",
  hybridSettings: "hybridSettings",
} as const;

/**
 * 하이브리드 설정 기본값 (docs/HYBRID_AI_PLAN.md).
 * 설정 저장 기본값은 local 이지만, 서버 기본 provider 전환은 품질 게이트(H3) 이후에 한다.
 * UI 연동은 H4 에서 추가한다.
 */
export const DEFAULT_HYBRID_SETTINGS: HybridSettings = {
  analyzeQualityMode: "local",
  boostPreset: "balanced",
  tokenBudget: "normal",
  reasoningEffort: "medium",
};
