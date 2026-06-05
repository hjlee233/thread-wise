import type { ExtractedPageContext } from "../../shared/types.js";

/**
 * 사이트별 본문 추출 전략(ARCHITECTURE 3.5).
 * 1차 MVP 에서는 defaultAdapter 만 구현하고, 이후 사용량 많은 사이트부터 추가한다.
 */
export interface PageAdapter {
  /** 어댑터 식별자. ExtractedPageContext.site 에 기록된다. */
  id: string;
  /** 이 어댑터가 현재 페이지를 처리할 수 있는지 판단한다. */
  matches(url: URL, document: Document): boolean;
  /** 현재 문서에서 게시글 컨텍스트를 추출한다. */
  extract(document: Document): ExtractedPageContext;
}
