import { Router } from "express";
import { saveProject, updateProjectStatus, getUserProjects } from "../controllers/project.controllers";
import authMiddleware from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/save", asyncHandler(authMiddleware), asyncHandler(saveProject));
router.patch("/:id/status", asyncHandler(authMiddleware), asyncHandler(updateProjectStatus));
router.get("/", asyncHandler(authMiddleware), asyncHandler(getUserProjects));

export default router;
