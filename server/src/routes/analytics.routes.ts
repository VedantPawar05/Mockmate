import { Router } from "express";
import { analyzeUserPerformance } from "../controllers/analytics.controllers";
import authMiddleware from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/weakness", asyncHandler(authMiddleware), asyncHandler(analyzeUserPerformance));

export default router;
