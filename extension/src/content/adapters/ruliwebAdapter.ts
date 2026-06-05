import type { ExtractedPageContext } from "../../shared/types.js";
import { extractReadableText, normalizeWhitespace } from "./defaultAdapter.js";
import type { PageAdapter } from "./types.js";

/**
 * 루리웹 게시글 어댑터.
 *
 * 본문 1순위는 JSON-LD(DiscussionForumPosting.articleBody)이다. 루리웹은 게시글
 * 본문을 서버 렌더링된 JSON-LD 에 깨끗하게 담으므로, DOM 스크래핑보다 노이즈가 적다.
 *
 * 1차 MVP 범위상 댓글은 본문에 포함하지 않는다(PRD/MVP_1_PLAN: 기존 댓글 추출 제외).
 * 후속 확장을 위한 DOM 선택자 메모만 아래에 남긴다(코드는 만들지 않는다).
 *
 *   베스트 댓글:   .comment_view.best tr.comment_element
 *   일반 댓글:     .comment_view:not(.best) tr.comment_element
 *   작성자:        .nick strong
 *   댓글 본문:     .text_wrapper .text
 *   이미지 댓글:   .comment_img[src]
 *   시간:          .control_box .time
 *   추천/비추천:   .btn_like .num / .btn_dislike .num
 *   (JSON-LD comment[] 는 부분집합이므로 전체 댓글 소스로는 부적합)
 *
 * 후속 토큰 정책(메모): 베스트 최대 3개 / 일반 최대 5개 / 각 300자 / 이미지-only 제외 / 중복 제거.
 */

const READ_PATH = /^\/community\/board\/\d+\/read\/\d+/;

export const ruliwebAdapter: PageAdapter = {
  id: "ruliweb",

  matches(url: URL): boolean {
    return url.hostname === "bbs.ruliweb.com" && READ_PATH.test(url.pathname);
  },

  extract(document: Document): ExtractedPageContext {
    const warnings: string[] = [];
    const win = document.defaultView ?? window;

    const pageUrl = document.location?.href ?? win.location.href;
    const pageTitle = document.title ?? "";
    const selectedText = (win.getSelection?.()?.toString() ?? "").trim();

    const post = findDiscussionPosting(document);

    // --- 제목: JSON-LD headline → og:title → .subject_inner_text → document.title ---
    const postTitle =
      decodeHtml(document, asString(post?.headline)) ||
      metaContent(document, 'meta[property="og:title"]') ||
      metaContent(document, 'meta[name="title"]') ||
      textOf(document, ".subject_inner_text") ||
      pageTitle;

    // --- 본문: JSON-LD articleBody(1순위) → DOM fallback ---
    let body = normalizeWhitespace(decodeHtml(document, asString(post?.articleBody)));

    if (body.length === 0) {
      // JSON-LD 에 본문이 없을 때만 DOM 에서 추출한다.
      const domContainer =
        document.querySelector('.view_content[itemprop="articleBody"] article') ??
        document.querySelector('.view_content[itemprop="articleBody"]') ??
        document.querySelector(".view_content.autolink");
      body = domContainer ? extractReadableText(domContainer) : "";
      warnings.push("루리웹 구조화 데이터를 찾지 못해 본문 영역에서 추출했습니다.");
    } else {
      // 성공 경로는 경고가 아니라 디버그 로그로만 남긴다.
      console.debug("[ThreadWise] ruliweb: JSON-LD articleBody 사용");
    }

    let extractionMethod: ExtractedPageContext["extractionMethod"] = "default";

    // articleBody 가 비어있지 않으면 길이가 짧아도 신뢰한다(짧은 글 강등 금지).
    if (body.length === 0) {
      if (selectedText.length >= 1) {
        body = selectedText;
        extractionMethod = "selection-only";
        warnings.push("본문을 추출하지 못해 선택한 텍스트를 본문으로 사용합니다.");
      } else {
        warnings.push("본문을 추출하지 못했습니다. 본문 영역을 드래그해 선택한 뒤 다시 시도하세요.");
      }
    }

    if (!postTitle) {
      warnings.push("게시글 제목을 찾지 못했습니다.");
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

interface DiscussionPosting {
  headline?: unknown;
  articleBody?: unknown;
}

/**
 * 모든 ld+json 블록을 순회하며 DiscussionForumPosting 노드를 찾는다.
 * @graph 배열, 루트 배열, 단일 객체를 모두 처리하고, 파싱 실패는 조용히 건너뛴다.
 */
function findDiscussionPosting(document: Document): DiscussionPosting | null {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    'script[type="application/ld+json"]'
  );
  for (const script of Array.from(scripts)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(script.textContent ?? "");
    } catch {
      continue;
    }
    const found = searchNodes(parsed);
    if (found) return found;
  }
  return null;
}

function searchNodes(value: unknown): DiscussionPosting | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = searchNodes(item);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (matchesType(obj["@type"])) {
      return obj as DiscussionPosting;
    }
    if ("@graph" in obj) {
      return searchNodes(obj["@graph"]);
    }
  }
  return null;
}

function matchesType(type: unknown): boolean {
  if (typeof type === "string") return type === "DiscussionForumPosting";
  if (Array.isArray(type)) return type.includes("DiscussionForumPosting");
  return false;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** HTML 엔티티 디코드 + 태그 제거(textarea/임시 요소 활용). */
function decodeHtml(document: Document, raw: string): string {
  if (!raw) return "";
  if (!/[<&]/.test(raw)) return raw.trim();
  const el = document.createElement("div");
  el.innerHTML = raw;
  return (el.textContent ?? "").trim();
}

function metaContent(document: Document, selector: string): string {
  return document.querySelector(selector)?.getAttribute("content")?.trim() ?? "";
}

function textOf(document: Document, selector: string): string {
  return document.querySelector(selector)?.textContent?.trim() ?? "";
}
