import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { askRequestSchema } from "../schemas/ask.schema.js";
import { askAboutPost } from "../services/postAnalysisService.js";

export const askRouter = Router();

/** POST /api/ask — 게시글 기반 질문 응답. API_SPEC 7장. */
askRouter.post(
  "/api/ask",
  asyncHandler(async (req, res) => {
    const parsed = askRequestSchema.parse(req.body);
    const result = await askAboutPost(parsed);
    res.status(200).json(result);
  })
);
