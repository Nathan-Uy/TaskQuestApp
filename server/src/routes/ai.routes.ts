import express from "express";
import { protect } from "../middleware/auth";
import { aiThrottle } from "../middleware/aiThrottle";
import {
  getReport,
  downloadReport,
  goalHealthCheck,
  getDailyFocus,
} from "../controllers/ai.controller";

const router = express.Router();

router.get("/report", protect, aiThrottle, getReport);
router.get("/report/download", protect, aiThrottle, downloadReport);
router.get("/goal-health/:goalId", protect, aiThrottle, goalHealthCheck);
router.get("/daily-focus", protect, aiThrottle, getDailyFocus);

export default router;
