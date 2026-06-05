import type { ExtractedPageContext } from "../../shared/types.js";
import { defaultAdapter } from "./defaultAdapter.js";
import { ruliwebAdapter } from "./ruliwebAdapter.js";
import type { PageAdapter } from "./types.js";

/**
 * 사이트별 어댑터 레지스트리.
 * 사이트별 어댑터를 defaultAdapter 보다 앞에 두고, matches() 로 우선 선택되게 한다.
 * defaultAdapter 는 항상 마지막 fallback 이다.
 */
const adapters: PageAdapter[] = [
  ruliwebAdapter,
  // 예: dcinsideAdapter, clienAdapter ... (후속)
  defaultAdapter,
];

/** 현재 페이지에 맞는 어댑터를 고른다. 항상 defaultAdapter 로 fallback 된다. */
export function selectAdapter(document: Document): PageAdapter {
  const url = new URL(document.location?.href ?? window.location.href);
  for (const adapter of adapters) {
    try {
      if (adapter.matches(url, document)) return adapter;
    } catch {
      // matches 중 예외는 무시하고 다음 어댑터로 넘어간다.
    }
  }
  return defaultAdapter;
}

/** 현재 문서에서 컨텍스트를 추출한다. */
export function extractPageContext(document: Document): ExtractedPageContext {
  return selectAdapter(document).extract(document);
}
