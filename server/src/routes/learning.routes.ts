import { Router } from "express";
import { getPlaylist, saveProgress, getProgress, resetProgress } from "../controllers/learning.controllers";
import authMiddleware from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/playlist/:topic", asyncHandler(authMiddleware), asyncHandler(getPlaylist));
router.post("/progress", asyncHandler(authMiddleware), asyncHandler(saveProgress));
router.get("/progress/:userId", asyncHandler(authMiddleware), asyncHandler(getProgress));
router.delete("/progress/:userId/:topic", asyncHandler(authMiddleware), asyncHandler(resetProgress));

export default router;
