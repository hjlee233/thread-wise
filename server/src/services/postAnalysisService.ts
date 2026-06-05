import { loadConfig } from "../config.js";
import { AppError } from "../errors.js";
import { analyzeJsonSchema, askJsonSchema } from "../schemas/structuredOutputs.js";
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  AskRequest,
  AskResponse,
} from "../types/api.js";
import { createStructuredResponse } from "./openaiClient.js";
import { analyzeUserPrompt, askUserPrompt, systemPrompt } from "./promptService.js";
import { truncateBody } from "./privacyService.js";

/**
 * 게시글 요약과 질문 응답의 도메인 로직.
 * 본문 길이 제한 -> 프롬프트 생성 -> OpenAI 구조화 호출 -> 후처리.
 */

const TRUNCATION_WARNING = "본문이 길어 일부만 분석했습니다.";

export async function analyzePost(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  const config = loadConfig();

  const trimmedBody = req.body.trim();
  if (trimmedBody.length === 0) {
    throw AppError.emptyContext();
  }

  const { text, truncated } = truncateBody(trimmedBody, config.maxBodyChars);

  const result = await createStructuredResponse<AnalyzeResponse>({
    system: systemPrompt(),
    user: analyzeUserPrompt({
      pageUrl: req.pageUrl,
      site: req.site,
      title: req.title,
      body: text,
      selectedText: req.selectedText,
      truncated,
    }),
    schemaName: "analyze_result",
    schema: analyzeJsonSchema as unknown as Record<string, unknown>,
  });

  return appendTruncationWarning(result, truncated);
}

export async function askAboutPost(req: AskRequest): Promise<AskResponse> {
  const config = loadConfig();

  const trimmedBody = req.context.body.trim();
  if (trimmedBody.length === 0) {
    throw AppError.emptyContext();
  }

  const { text, truncated } = truncateBody(trimmedBody, config.maxBodyChars);

  const result = await createStructuredResponse<AskResponse>({
    system: systemPrompt(),
    user: askUserPrompt({
      pageUrl: req.context.pageUrl,
      title: req.context.title,
      body: text,
      selectedText: req.context.selectedText,
      question: req.question,
      truncated,
    }),
    schemaName: "ask_result",
    schema: askJsonSchema as unknown as Record<string, unknown>,
  });

  return appendTruncationWarning(result, truncated);
}

function appendTruncationWarning<T extends { warnings: string[] }>(
  result: T,
  truncated: boolean
): T {
  if (!truncated) return result;
  const warnings = Array.isArray(result.warnings) ? result.warnings : [];
  if (!warnings.includes(TRUNCATION_WARNING)) {
    warnings.push(TRUNCATION_WARNING);
  }
  return { ...result, warnings };
}
