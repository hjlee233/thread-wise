/**
 * OpenAI Responses API 의 Structured Outputs(json_schema)에 사용하는 스키마.
 * API_SPEC 8장 응답 스키마 초안과 일치한다.
 * strict 모드를 쓰므로 모든 property 는 required 이고 additionalProperties=false 이다.
 */

export const analyzeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "mainPoints", "unknowns", "recommendedQuestions", "caution", "warnings"],
  properties: {
    summary: { type: "string" },
    mainPoints: { type: "array", items: { type: "string" } },
    unknowns: { type: "array", items: { type: "string" } },
    recommendedQuestions: { type: "array", items: { type: "string" } },
    caution: { type: "string" },
    warnings: { type: "array", items: { type: "string" } },
  },
} as const;

export const askJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["answer", "basis", "needsFactCheck", "caution", "warnings"],
  properties: {
    answer: { type: "string" },
    basis: { type: "string" },
    needsFactCheck: { type: "boolean" },
    caution: { type: "string" },
    warnings: { type: "array", items: { type: "string" } },
  },
} as const;
