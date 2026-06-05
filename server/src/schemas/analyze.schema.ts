import { z } from "zod";

/** 하이브리드 부스트 설정 (docs/HYBRID_AI_PLAN.md). 모든 필드 optional. */
export const boostSettingsSchema = z.object({
  preset: z.enum(["fast", "balanced", "high_quality", "custom"]).optional(),
  model: z.string().max(80).optional(),
  tokenBudget: z.enum(["low", "normal", "high"]).optional(),
  reasoningEffort: z.enum(["low", "medium", "high"]).optional(),
});

/**
 * POST /api/analyze 요청 검증. API_SPEC 6장 Validation 규칙을 따른다.
 * analyzeQualityMode/boostSettings 는 하이브리드용 optional 필드로,
 * 없으면 기존(OpenAI) 동작과 동일하다.
 */
export const analyzeRequestSchema = z.object({
  pageUrl: z.string().url({ message: "pageUrl 은 유효한 URL 이어야 합니다." }),
  site: z.string().min(1).max(80),
  title: z.string().max(500).optional(),
  body: z.string().min(1, { message: "body 는 1자 이상이어야 합니다." }),
  selectedText: z.string().max(5000).optional(),
  analyzeQualityMode: z.enum(["local", "boost"]).optional(),
  boostSettings: boostSettingsSchema.optional(),
});

export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>;
