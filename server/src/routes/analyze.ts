import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { analyzeRequestSchema } from "../schemas/analyze.schema.js";
import { analyzePost } from "../services/postAnalysisService.js";

export const analyzeRouter = Router();

/** POST /api/analyze — 게시글 요약. API_SPEC 6장. */
analyzeRouter.post(
  "/api/analyze",
  asyncHandler(async (req, res) => {
    const parsed = analyzeRequestSchema.parse(req.body);
    const result = await analyzePost(parsed);
    res.status(200).json(result);
  })
);
