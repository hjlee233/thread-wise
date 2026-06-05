import { z } from "zod";

/** POST /api/analyze 요청 검증. API_SPEC 6장 Validation 규칙을 따른다. */
export const analyzeRequestSchema = z.object({
  pageUrl: z.string().url({ message: "pageUrl 은 유효한 URL 이어야 합니다." }),
  site: z.string().min(1).max(80),
  title: z.string().max(500).optional(),
  body: z.string().min(1, { message: "body 는 1자 이상이어야 합니다." }),
  selectedText: z.string().max(5000).optional(),
});

export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>;
