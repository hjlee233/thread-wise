/**
 * 프롬프트 생성.
 * PRD 9장(프롬프트 설계 원칙)의 공통 시스템 지시문을 따른다.
 * 1차 MVP 범위: 요약, 게시글 기반 질문 응답. 외부 웹 검색은 사용하지 않는다.
 */

const COMMON_SYSTEM = `당신은 사용자가 커뮤니티 게시글을 읽고 이해하도록 돕는 AI 보조 도구입니다.
게시글의 사실과 의견을 구분하십시오.
확인되지 않은 사실은 단정하지 마십시오.
게시글에 없는 사실을 만들어 넣지 마십시오.
사용자를 대신해 댓글을 게시하지 않습니다.
혐오, 괴롭힘, 개인정보 노출, 불법행위 조장 표현은 피하십시오.
당신은 외부 웹 검색을 사용할 수 없습니다. 게시글 내부 내용과 일반 상식만으로 답하십시오.
외부 확인이 필요한 최신 정보, 법률, 가격, 일정, 사건 등은 단정하지 말고 검증이 필요하다고 표시하십시오.
반드시 지정된 JSON 스키마에 맞는 형식으로만 응답하십시오.`;

export function systemPrompt(): string {
  return COMMON_SYSTEM;
}

interface AnalyzeContext {
  pageUrl: string;
  site: string;
  title?: string;
  body: string;
  selectedText?: string;
  truncated: boolean;
}

export function analyzeUserPrompt(ctx: AnalyzeContext): string {
  const parts: string[] = [];
  parts.push("다음 커뮤니티 게시글을 분석하십시오.");
  parts.push(`사이트: ${ctx.site}`);
  parts.push(`URL: ${ctx.pageUrl}`);
  if (ctx.title) parts.push(`제목: ${ctx.title}`);
  if (ctx.truncated) {
    parts.push("주의: 본문이 길어 일부만 제공되었습니다. 잘림 가능성을 warnings 에 반영하십시오.");
  }
  if (ctx.selectedText) {
    parts.push(`사용자가 특히 주목한 문장: ${ctx.selectedText}`);
  }
  parts.push("본문:");
  parts.push(ctx.body);
  parts.push(
    [
      "",
      "다음을 작성하십시오:",
      "- summary: 게시글 핵심 요약",
      "- mainPoints: 핵심 주장 또는 정보 목록",
      "- unknowns: 게시글만으로 확인되지 않는 내용 목록",
      "- recommendedQuestions: 사용자가 이어서 물어볼 만한 질문 목록",
      "- caution: 요약의 제한 사항 안내",
      "- warnings: 처리 중 발생한 비치명 경고(없으면 빈 배열)",
    ].join("\n")
  );
  return parts.join("\n");
}

interface AskContext {
  pageUrl: string;
  title?: string;
  body: string;
  selectedText?: string;
  question: string;
  truncated: boolean;
}

export function askUserPrompt(ctx: AskContext): string {
  const parts: string[] = [];
  parts.push("다음 게시글 맥락을 바탕으로 사용자의 질문에 답하십시오.");
  parts.push(`URL: ${ctx.pageUrl}`);
  if (ctx.title) parts.push(`제목: ${ctx.title}`);
  if (ctx.truncated) {
    parts.push("주의: 본문이 길어 일부만 제공되었습니다.");
  }
  if (ctx.selectedText) {
    parts.push(`사용자가 선택한 문장: ${ctx.selectedText}`);
  }
  parts.push("본문:");
  parts.push(ctx.body);
  parts.push("");
  parts.push(`질문: ${ctx.question}`);
  parts.push(
    [
      "",
      "다음을 작성하십시오:",
      "- answer: 질문에 대한 답변",
      "- basis: 게시글 내부 근거, 선택 텍스트, 또는 추론 기준",
      "- needsFactCheck: 외부 출처 확인이 필요하면 true",
      "- caution: 답변의 제한 사항(외부 검색을 수행하지 않았음을 포함)",
      "- warnings: 처리 중 발생한 비치명 경고(없으면 빈 배열)",
    ].join("\n")
  );
  return parts.join("\n");
}
