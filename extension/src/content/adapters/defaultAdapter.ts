import type { ExtractedPageContext, ExtractionMethod } from "../../shared/types.js";
import type { PageAdapter } from "./types.js";

/** 본문이 이보다 짧으면 추출 품질이 낮다고 보고 경고/대체 전략을 적용한다. */
const MIN_BODY_LENGTH = 200;

/** 본문에서 제외할 노이즈 요소 선택자. */
const NOISE_SELECTORS = [
  "script",
  "style",
  "noscript",
  "template",
  "nav",
  "aside",
  "header",
  "footer",
  "form",
  "iframe",
];

/** 본문 텍스트를 블록 단위로 줄바꿈 보존하기 위한 블록 요소 선택자. */
const BLOCK_SELECTORS = "p, li, h1, h2, h3, h4, h5, h6, blockquote, pre, td, dd";

/**
 * 사이트 구분 없이 동작하는 기본 어댑터.
 * 본문 후보를 우선순위에 따라 탐색하고, 추출 품질이 낮으면 경고를 남긴다.
 * 완벽 추출보다 실패를 드러내는 것을 우선한다(MVP_1_PLAN 4.1).
 */
export const defaultAdapter: PageAdapter = {
  id: "default",

  matches() {
    return true;
  },

  extract(document: Document): ExtractedPageContext {
    const warnings: string[] = [];
    const win = document.defaultView ?? window;

    const pageUrl = document.location?.href ?? win.location.href;
    const pageTitle = document.title ?? "";
    const selectedText = (win.getSelection?.()?.toString() ?? "").trim();

    const postTitle = extractTitle(document) || pageTitle;
    if (!postTitle) {
      warnings.push("게시글 제목을 찾지 못했습니다.");
    }

    const container = findBodyContainer(document);
    let body = container ? cleanText(container) : "";
    let extractionMethod: ExtractionMethod = "default";

    if (body.length < MIN_BODY_LENGTH) {
      if (selectedText.length >= 1) {
        // 본문 추출이 부실하면 선택 텍스트를 본문으로 사용한다.
        body = selectedText;
        extractionMethod = "selection-only";
        warnings.push("본문을 충분히 추출하지 못해 선택한 텍스트를 본문으로 사용합니다.");
      } else if (body.length === 0) {
        warnings.push("본문을 추출하지 못했습니다. 본문 영역을 드래그해 선택한 뒤 다시 시도하세요.");
      } else {
        warnings.push("추출된 본문이 짧습니다. 광고/댓글이 섞이거나 본문이 누락됐을 수 있습니다.");
      }
    }

    return {
      pageUrl,
      pageTitle,
      site: this.id,
      postTitle,
      body,
      selectedText,
      extractionMethod,
      extractionWarnings: warnings,
    };
  },
};

/** 게시글 제목 후보: 첫 번째 h1 → og:title → document.title. */
function extractTitle(document: Document): string {
  const h1Text = document.querySelector("h1")?.textContent?.trim();
  if (h1Text) return h1Text;

  const og = document
    .querySelector('meta[property="og:title"]')
    ?.getAttribute("content")
    ?.trim();
  if (og) return og;

  return "";
}

/**
 * 본문 컨테이너를 우선순위에 따라 찾는다(ARCHITECTURE 3.5).
 * article → main → [role=main] → 가장 긴 텍스트 블록.
 */
function findBodyContainer(document: Document): Element | null {
  const direct =
    document.querySelector("article") ??
    document.querySelector("main") ??
    document.querySelector('[role="main"]');
  if (direct && rawTextLength(direct) >= MIN_BODY_LENGTH) {
    return direct;
  }

  const longest = findLongestTextBlock(document);
  if (longest) return longest;

  // 그래도 없으면 직접 후보(짧더라도) 또는 body 를 반환한다.
  return direct ?? document.body ?? null;
}

/** div/section 등 후보 중 텍스트가 가장 많은 요소를 고른다(저렴한 길이 기준 랭킹). */
function findLongestTextBlock(document: Document): Element | null {
  const candidates = document.querySelectorAll("article, main, section, div");
  let best: Element | null = null;
  let bestLen = MIN_BODY_LENGTH; // 임계값 미만은 후보로 보지 않는다.

  candidates.forEach((el) => {
    const len = rawTextLength(el);
    if (len > bestLen) {
      bestLen = len;
      best = el;
    }
  });

  return best;
}

/** 랭킹용 저렴한 텍스트 길이 측정(레이아웃 비용 없음). */
function rawTextLength(element: Element): number {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim().length;
}

/**
 * 요소에서 노이즈를 제거하고 본문 텍스트를 정규화해 반환한다.
 * 분리된 노드에서 innerText 가 비는 문제를 피하려고 clone + textContent 를 사용하고,
 * 블록 요소 단위로 줄바꿈을 보존한다.
 */
function cleanText(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  clone.querySelectorAll(NOISE_SELECTORS.join(",")).forEach((n) => n.remove());

  const blocks = clone.querySelectorAll(BLOCK_SELECTORS);
  let text = "";
  if (blocks.length > 0) {
    text = Array.from(blocks)
      .map((b) => (b.textContent ?? "").trim())
      .filter((t) => t.length > 0)
      .join("\n");
  }

  // 블록 추출 결과가 부실하면 전체 textContent 로 대체한다.
  if (text.length < MIN_BODY_LENGTH) {
    const fallback = (clone.textContent ?? "").trim();
    if (fallback.length > text.length) {
      text = fallback;
    }
  }

  return text
    .replace(/\r/g, "")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}
