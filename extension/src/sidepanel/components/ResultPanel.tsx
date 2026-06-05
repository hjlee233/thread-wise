import type { AnalyzeResponse, AskResponse } from "../../shared/types.js";

type ResultPanelProps =
  | { kind: "analyze"; data: AnalyzeResponse }
  | { kind: "ask"; data: AskResponse };

/** 서버 요약/질문 결과를 구조화해 표시한다. */
export function ResultPanel(props: ResultPanelProps) {
  if (props.kind === "analyze") {
    return <AnalyzeView data={props.data} />;
  }
  return <AskView data={props.data} />;
}

function AnalyzeView({ data }: { data: AnalyzeResponse }) {
  return (
    <div className="tw-result">
      <Block label="요약">
        <p className="tw-result-text">{data.summary}</p>
      </Block>

      {data.mainPoints.length > 0 && (
        <Block label="핵심 내용">
          <ul className="tw-list">
            {data.mainPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </Block>
      )}

      {data.unknowns.length > 0 && (
        <Block label="확인되지 않은 내용">
          <ul className="tw-list">
            {data.unknowns.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </Block>
      )}

      {data.recommendedQuestions.length > 0 && (
        <Block label="이어서 물어볼 만한 질문">
          <ul className="tw-list">
            {data.recommendedQuestions.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </Block>
      )}

      <Caution caution={data.caution} warnings={data.warnings} />
    </div>
  );
}

function AskView({ data }: { data: AskResponse }) {
  return (
    <div className="tw-result">
      <Block label="답변">
        <p className="tw-result-text">{data.answer}</p>
      </Block>

      {data.basis && (
        <Block label="근거">
          <p className="tw-result-text tw-muted-text">{data.basis}</p>
        </Block>
      )}

      {data.needsFactCheck && (
        <p className="tw-factcheck">🔎 외부 사실 확인이 필요한 내용입니다.</p>
      )}

      <Caution caution={data.caution} warnings={data.warnings} />
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="tw-result-block">
      <span className="tw-field-label">{label}</span>
      {children}
    </div>
  );
}

function Caution({ caution, warnings }: { caution: string; warnings: string[] }) {
  return (
    <>
      {caution && <p className="tw-caution">ℹ {caution}</p>}
      {warnings.length > 0 && (
        <ul className="tw-warnings">
          {warnings.map((w, i) => (
            <li key={i}>⚠ {w}</li>
          ))}
        </ul>
      )}
    </>
  );
}
