import type { ExtractedPageContext } from "../../shared/types.js";

const METHOD_LABEL: Record<ExtractedPageContext["extractionMethod"], string> = {
  default: "본문 추출",
  "selection-only": "선택 텍스트 기반",
  manual: "수동 입력",
};

/** 추출된 페이지 컨텍스트 미리보기. 서버로 전송하기 전 사용자가 확인하는 화면. */
export function ContextPreview({ context }: { context: ExtractedPageContext }) {
  const bodyChars = context.body.length;

  return (
    <div className="tw-preview">
      <div className="tw-field">
        <span className="tw-field-label">제목</span>
        <span className="tw-field-value">{context.postTitle || "(제목 없음)"}</span>
      </div>

      <div className="tw-field">
        <span className="tw-field-label">URL</span>
        <span className="tw-field-value tw-url" title={context.pageUrl}>
          {context.pageUrl}
        </span>
      </div>

      <div className="tw-field">
        <span className="tw-field-label">본문 미리보기</span>
        <span className="tw-field-meta">
          {METHOD_LABEL[context.extractionMethod]} · {bodyChars.toLocaleString()}자
        </span>
        <pre className="tw-body-preview">
          {context.body ? context.body.slice(0, 1200) : "(본문 없음)"}
          {bodyChars > 1200 ? "\n…" : ""}
        </pre>
      </div>

      {context.selectedText && (
        <div className="tw-field">
          <span className="tw-field-label">선택 텍스트</span>
          <pre className="tw-body-preview tw-selected">
            {context.selectedText.slice(0, 500)}
            {context.selectedText.length > 500 ? "\n…" : ""}
          </pre>
        </div>
      )}

      {context.extractionWarnings.length > 0 && (
        <ul className="tw-warnings">
          {context.extractionWarnings.map((w, i) => (
            <li key={i}>⚠ {w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
