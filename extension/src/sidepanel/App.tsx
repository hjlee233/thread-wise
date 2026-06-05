import { useState } from "react";
import { MessageType, sendToBackground } from "../shared/messages.js";
import type { ContextExtractResult } from "../shared/messages.js";
import type { ExtractedPageContext } from "../shared/types.js";
import { ContextPreview } from "./components/ContextPreview.js";

type ExtractState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; context: ExtractedPageContext }
  | { kind: "error"; message: string };

export function App() {
  const [extract, setExtract] = useState<ExtractState>({ kind: "idle" });

  async function fetchCurrentPost() {
    setExtract({ kind: "loading" });
    try {
      const res = await sendToBackground<ContextExtractResult>({
        type: MessageType.CONTEXT_EXTRACT_REQUEST,
      });

      if (res?.type === MessageType.CONTEXT_EXTRACT_RESULT && res.context) {
        setExtract({ kind: "ready", context: res.context });
      } else {
        setExtract({
          kind: "error",
          message: res?.error ?? "페이지 내용을 가져오지 못했습니다.",
        });
      }
    } catch (err) {
      setExtract({
        kind: "error",
        message: `요청 실패: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  return (
    <div className="tw-app">
      <header className="tw-header">
        <h1>Thread Wise</h1>
        <p>게시글을 함께 읽는 AI 보조 도구 · 1차 MVP</p>
      </header>

      <section className="tw-card">
        <h2>읽기</h2>
        <button
          className="tw-button"
          onClick={fetchCurrentPost}
          disabled={extract.kind === "loading"}
        >
          {extract.kind === "loading" ? "가져오는 중…" : "현재 글 가져오기"}
        </button>

        {extract.kind === "error" && (
          <p className="tw-status is-error">✕ {extract.message}</p>
        )}

        {extract.kind === "ready" && <ContextPreview context={extract.context} />}

        {extract.kind === "idle" && (
          <p className="tw-muted">
            게시글 페이지에서 버튼을 누르면 제목과 본문을 추출해 여기에 표시합니다.
            이 단계에서는 서버로 아무것도 전송하지 않습니다.
          </p>
        )}
      </section>

      <section className="tw-card">
        <h2>요약 · 질문</h2>
        <p className="tw-muted">요약/질문 기능은 다음 단계(M5)에서 서버와 연결됩니다.</p>
      </section>
    </div>
  );
}
