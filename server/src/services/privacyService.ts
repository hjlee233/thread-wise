/**
 * 개인정보/원문 보호 유틸.
 * - 본문 길이 제한 적용
 * - 로그용 비민감 메타데이터 생성
 * 원문 자체는 어떤 함수도 반환/저장하지 않는다.
 */

export interface TruncateResult {
  text: string;
  truncated: boolean;
  originalLength: number;
}

/** 본문을 최대 길이로 자른다. 토큰 비용과 응답 품질을 위한 안전장치. */
export function truncateBody(body: string, maxChars: number): TruncateResult {
  const originalLength = body.length;
  if (originalLength <= maxChars) {
    return { text: body, truncated: false, originalLength };
  }
  return {
    text: body.slice(0, maxChars),
    truncated: true,
    originalLength,
  };
}

/** 로그에 남겨도 되는 비민감 메타데이터만 추출한다. */
export function toLogMeta(input: {
  site?: string;
  bodyLength?: number;
}): Record<string, unknown> {
  return {
    site: input.site,
    bodyLength: input.bodyLength,
  };
}
