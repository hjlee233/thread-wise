import { useState } from "react";
import {
  MessageType,
  sendToBackground,
  type AnalyzeResult,
  type AskResult,
  type ContextExtractResult,
} from "../shared/messages.js";
import type { ExtractedPageContext } from "../shared/types.js";
import { ContextPreview } from "./components/ContextPreview.js";
import { ResultPanel } from "./components/ResultPanel.js";

type ExtractState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; context: ExtractedPageContext }
  | { kind: "error"; message: string };

type AnalyzeState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; data: Extract<AnalyzeResult, { ok: true }>["data"] }
  | { kind: "error"; message: string };

type AskState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; data: Extract<AskResult, { ok: true }>["data"] }
  | { kind: "error"; message: string };

export function App() {
  const [extract, setExtract] = useState<ExtractState>({ kind: "idle" });
  const [analyze, setAnalyze] = useState<AnalyzeState>({ kind: "idle" });
  const [question, setQuestion] = useState("");
  const [ask, setAsk] = useState<AskState>({ kind: "idle" });

  const context = extract.kind === "ready" ? extract.context : null;
  const hasBody = !!context && context.body.trim().length > 0;

  async function fetchCurrentPost() {
    setExtract({ kind: "loading" });
    setAnalyze({ kind: "idle" });
    setAsk({ kind: "idle" });
    try {
      const res = await sendToBackground<ContextExtractResult>({
        type: MessageType.CONTEXT_EXTRACT_REQUEST,
      });
      if (res?.type === MessageType.CONTEXT_EXTRACT_RESULT && res.context) {
        setExtract({ kind: "ready", context: res.context });
      } else {
        setExtract({ kind: "error", message: res?.error ?? "페이지 내용을 가져오지 못했습니다." });
      }
    } catch (err) {
      setExtract({ kind: "error", message: reqErr(err) });
    }
  }

  async function runAnalyze() {
    if (!context) return;
    setAnalyze({ kind: "loading" });
    try {
      const res = await sendToBackground<AnalyzeResult>({
        type: MessageType.ANALYZE_REQUEST,
        payload: {
          pageUrl: context.pageUrl,
          site: context.site,
          title: context.postTitle || undefined,
          body: context.body,
          selectedText: context.selectedText || undefined,
        },
      });
      if (res.ok) setAnalyze({ kind: "ready", data: res.data });
      else setAnalyze({ kind: "error", message: `${res.error.message} (${res.error.code})` });
    } catch (err) {
      setAnalyze({ kind: "error", message: reqErr(err) });
    }
  }

  async function runAsk() {
    if (!context || question.trim().length === 0) return;
    setAsk({ kind: "loading" });
    try {
      const res = await sendToBackground<AskResult>({
        type: MessageType.ASK_REQUEST,
        payload: {
          context: {
            pageUrl: context.pageUrl,
            title: context.postTitle || undefined,
            body: context.body,
            selectedText: context.selectedText || undefined,
          },
          question: question.trim(),
        },
      });
      if (res.ok) setAsk({ kind: "ready", data: res.data });
      else setAsk({ kind: "error", message: `${res.error.message} (${res.error.code})` });
    } catch (err) {
      setAsk({ kind: "error", message: reqErr(err) });
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
        <button className="tw-button" onClick={fetchCurrentPost} disabled={extract.kind === "loading"}>
          {extract.kind === "loading" ? "가져오는 중…" : "현재 글 가져오기"}
        </button>

        {extract.kind === "error" && <p className="tw-status is-error">✕ {extract.message}</p>}
        {extract.kind === "ready" && <ContextPreview context={extract.context} />}
        {extract.kind === "idle" && (
          <p className="tw-muted">
            게시글 페이지에서 버튼을 누르면 제목과 본문을 추출해 표시합니다. 이 단계에서는
            서버로 아무것도 전송하지 않습니다.
          </p>
        )}
      </section>

      <section className="tw-card">
        <h2>요약</h2>
        <button
          className="tw-button"
          onClick={runAnalyze}
          disabled={!hasBody || analyze.kind === "loading"}
        >
          {analyze.kind === "loading" ? "요약 중…" : "요약하기"}
        </button>
        {!hasBody && <p className="tw-muted">먼저 “현재 글 가져오기”로 본문을 불러오세요.</p>}
        {analyze.kind === "error" && <p className="tw-status is-error">✕ {analyze.message}</p>}
        {analyze.kind === "ready" && <ResultPanel kind="analyze" data={analyze.data} />}
      </section>

      <section className="tw-card">
        <h2>질문</h2>
        <textarea
          className="tw-textarea"
          placeholder="이 글에 대해 궁금한 점을 물어보세요. (예: 글쓴이가 확신하지 못하는 부분은?)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          disabled={!hasBody}
        />
        <button
          className="tw-button"
          onClick={runAsk}
          disabled={!hasBody || question.trim().length === 0 || ask.kind === "loading"}
        >
          {ask.kind === "loading" ? "질문 중…" : "질문하기"}
        </button>
        {ask.kind === "error" && <p className="tw-status is-error">✕ {ask.message}</p>}
        {ask.kind === "ready" && <ResultPanel kind="ask" data={ask.data} />}
      </section>
    </div>
  );
}

function reqErr(err: unknown): string {
  return `요청 실패: ${err instanceof Error ? err.message : String(err)}`;
}
