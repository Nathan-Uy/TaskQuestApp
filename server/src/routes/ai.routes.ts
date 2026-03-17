import express from "express";
import { protect } from "../middleware/auth";
import { aiThrottle } from "../middleware/aiThrottle";
import {
  getReport,
  downloadReport,
  generateTaskDescription,
  triageOverdueTasks,
  suggestGoalTitle,
  getStreakCoach,
} from "../controllers/ai.controller";

const router = express.Router();

router.get("/report", protect, aiThrottle, getReport);
router.get("/report/download", protect, aiThrottle, downloadReport);
router.post("/task-description", protect, aiThrottle, generateTaskDescription);
router.get("/triage", protect, aiThrottle, triageOverdueTasks);
router.post("/suggest-goal", protect, aiThrottle, suggestGoalTitle);
router.get("/streak-coach", protect, aiThrottle, getStreakCoach);

export default router;
