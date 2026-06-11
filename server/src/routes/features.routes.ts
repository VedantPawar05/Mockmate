// src/routes/features.routes.ts
// Consolidates all new feature routes: leaderboard, resume, judge0, PDF report, company config
import { Router } from "express";
import multer from "multer";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler";
import authMiddleware from "../middlewares/auth.middleware";
import { getLeaderboard } from "../controllers/leaderboard.controllers";
import { analyzeResume } from "../controllers/resume.controllers";
import { executeCode } from "../controllers/judge0.controllers";
import { generatePDFReport } from "../controllers/report.controllers";
import {
  getCompanyConfigs,
  getCompanyConfig,
  seedCompanyConfigs,
} from "../controllers/companyconfig.controllers";

const router = Router();

// --- Multer config for resume uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// --- Leaderboard ---
router.get("/leaderboard", asyncHandler(authMiddleware), asyncHandler(getLeaderboard));

// --- Resume Analyzer ---
router.post(
  "/resume/analyze",
  asyncHandler(authMiddleware),
  upload.single("resume"),
  asyncHandler(analyzeResume)
);

// --- Judge0 Code Execution ---
router.post("/execute", asyncHandler(authMiddleware), asyncHandler(executeCode));

// --- PDF Report ---
router.get("/reports/pdf/:sessionId", asyncHandler(authMiddleware), asyncHandler(generatePDFReport));

// --- Company Config ---
router.get("/companies", asyncHandler(authMiddleware), asyncHandler(getCompanyConfigs));
router.get("/companies/:companyName", asyncHandler(authMiddleware), asyncHandler(getCompanyConfig));
router.post("/companies/seed", asyncHandler(seedCompanyConfigs));

export default router;
