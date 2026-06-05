import OpenAI, { APIError } from "openai";
import { loadConfig } from "../config.js";
import { AppError } from "../errors.js";

/**
 * OpenAI Responses API 래퍼.
 * - Structured Outputs(json_schema, strict) 강제
 * - 타임아웃과 오류를 AppError 로 변환
 * API Key 는 config 를 통해 환경변수에서만 읽는다.
 */

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;
  const config = loadConfig();
  client = new OpenAI({
    apiKey: config.openaiApiKey,
    timeout: config.openaiTimeoutMs,
    maxRetries: 1,
  });
  return client;
}

export interface StructuredRequest {
  system: string;
  user: string;
  /** json_schema 의 name. 영문/숫자/언더스코어. */
  schemaName: string;
  /** JSON Schema 객체 */
  schema: Record<string, unknown>;
}

/**
 * 구조화 응답을 생성하고 파싱된 객체를 반환한다.
 * 호출자는 반환 타입을 제네릭으로 지정한다.
 */
export async function createStructuredResponse<T>(req: StructuredRequest): Promise<T> {
  const config = loadConfig();
  const openai = getClient();

  let outputText: string;
  try {
    const response = await openai.responses.create({
      model: config.openaiModel,
      input: [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
      ],
      text: {
        format: {
          type: "json_schema",
          name: req.schemaName,
          schema: req.schema,
          strict: true,
        },
      },
    });

    outputText = response.output_text;
  } catch (err) {
    throw mapOpenAiError(err);
  }

  if (!outputText || outputText.trim() === "") {
    throw AppError.openaiError("AI 응답이 비어 있습니다.");
  }

  try {
    return JSON.parse(outputText) as T;
  } catch {
    throw AppError.openaiError("AI 응답을 구조화 형식으로 해석하지 못했습니다.");
  }
}

function mapOpenAiError(err: unknown): AppError {
  if (err instanceof APIError) {
    // 타임아웃/연결 오류
    if (err.code === "ETIMEDOUT" || err.name === "APIConnectionTimeoutError") {
      return AppError.openaiTimeout();
    }
    // 429 는 상류(OpenAI) rate limit. 서버 자체 한도와 구분하되 동일 코드로 노출.
    return AppError.openaiError(`AI 응답 생성에 실패했습니다. (status ${err.status ?? "?"})`);
  }
  if (err instanceof Error && /timeout/i.test(err.message)) {
    return AppError.openaiTimeout();
  }
  return AppError.openaiError();
}
