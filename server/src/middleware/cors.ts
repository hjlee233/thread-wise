import type { CorsOptions } from "cors";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";

/**
 * CORS 옵션을 config 에 따라 구성한다.
 *
 * - allowlist 가 비어 있으면(개발 기본값) 모든 origin 을 허용한다.
 *   단, config 단계의 production guard 가 운영 환경에서는 빈 allowlist 를 막는다.
 * - allowlist 가 있으면 목록에 포함된 origin 만 허용하고 나머지는 거부한다.
 * - Origin 헤더가 없는 요청(curl, 서버 간 호출, 동일 출처)은 허용한다.
 */
export function buildCorsOptions(config: AppConfig): CorsOptions {
  const allowlist = config.corsAllowedOrigins;

  if (allowlist.length === 0) {
    return { origin: true };
  }

  return {
    origin(origin, callback) {
      // Origin 이 없는 비브라우저 요청은 통과시킨다.
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowlist.includes(origin)) {
        callback(null, true);
        return;
      }
      // 허용 목록에 없는 origin 은 403 UNSUPPORTED_ORIGIN 으로 거부한다.
      callback(AppError.unsupportedOrigin(), false);
    },
  };
}
