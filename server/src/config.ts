import "dotenv/config";

/**
 * 환경변수 로딩과 검증을 한 곳에서 처리한다.
 * OPENAI_API_KEY 는 서버에서만 사용하고 응답이나 로그에 노출하지 않는다.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `환경변수 ${name} 가 설정되지 않았습니다. server/.env 파일을 확인하세요 (.env.example 참고).`
    );
  }
  return value;
}

function optionalInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  openaiApiKey: string;
  openaiModel: string;
  openaiTimeoutMs: number;
  maxBodyChars: number;
  /** 빈 배열이면 모든 origin 허용(개발 편의) */
  corsAllowedOrigins: string[];
  serviceName: string;
  serviceVersion: string;
}

let cached: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (cached) return cached;

  const corsRaw = process.env.CORS_ALLOWED_ORIGINS ?? "";
  const corsAllowedOrigins = corsRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const nodeEnv = process.env.NODE_ENV ?? "development";

  // Production CORS guard: 운영 환경에서 allowlist 가 비어 있으면
  // 모든 origin 을 허용하는 위험한 상태가 되므로 기동을 거부한다.
  if (nodeEnv === "production" && corsAllowedOrigins.length === 0) {
    throw new Error(
      "production 환경에서는 CORS_ALLOWED_ORIGINS 를 반드시 설정해야 합니다. " +
        "예: chrome-extension://<확장 ID> (콤마로 여러 개 구분)."
    );
  }

  cached = {
    nodeEnv,
    port: optionalInt("PORT", 3000),
    openaiApiKey: requireEnv("OPENAI_API_KEY"),
    openaiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    openaiTimeoutMs: optionalInt("OPENAI_TIMEOUT_MS", 30_000),
    maxBodyChars: optionalInt("MAX_BODY_CHARS", 12_000),
    corsAllowedOrigins,
    serviceName: "thread-wise-server",
    serviceVersion: "0.1.0",
  };

  return cached;
}
