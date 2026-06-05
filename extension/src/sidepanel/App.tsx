import { useState } from "react";
import { MessageType, sendToBackground } from "../shared/messages.js";
import type { PongMessage } from "../shared/messages.js";

type ConnStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "ok"; message: string }
  | { kind: "error"; message: string };

export function App() {
  const [conn, setConn] = useState<ConnStatus>({ kind: "idle" });

  async function checkConnection() {
    setConn({ kind: "checking" });
    try {
      const res = await sendToBackground<PongMessage>({ type: MessageType.PING });
      if (res?.type === MessageType.PONG) {
        setConn({
          kind: "ok",
          message: `Background 연결됨 · v${res.extensionVersion}`,
        });
      } else {
        setConn({ kind: "error", message: "예상치 못한 응답을 받았습니다." });
      }
    } catch (err) {
      setConn({
        kind: "error",
        message: `Background 연결 실패: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  return (
    <div className="tw-app">
      <header className="tw-header">
        <h1>Thread Wise</h1>
        <p>게시글을 함께 읽는 AI 보조 도구 · 1차 MVP 골격</p>
      </header>

      <section className="tw-card">
        <h2>연결 확인</h2>
        <button
          className="tw-button"
          onClick={checkConnection}
          disabled={conn.kind === "checking"}
        >
          {conn.kind === "checking" ? "확인 중…" : "Background 연결 확인"}
        </button>
        {conn.kind === "ok" && (
          <p className="tw-status is-ok">✓ {conn.message}</p>
        )}
        {conn.kind === "error" && (
          <p className="tw-status is-error">✕ {conn.message}</p>
        )}
      </section>

      <section className="tw-card">
        <h2>읽기</h2>
        <p className="tw-muted">
          현재 글 가져오기 · 요약 · 질문 기능은 다음 단계(M4·M5)에서 연결됩니다.
        </p>
      </section>
    </div>
  );
}
