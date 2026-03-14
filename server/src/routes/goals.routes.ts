import { Router } from "express";
import {
  getGoals,
  createGoal,
  completeGoal,
  linkTask,
  unlinkTask,
  deleteGoal,
} from "../controllers/goals.controller";
import { protect } from "../middleware/auth";

const router = Router();
router.use(protect);
router.get("/", getGoals);
router.post("/", createGoal);
router.patch("/:id/complete", completeGoal);
router.patch("/:id/link-task", linkTask);
router.patch("/:id/unlink-task", unlinkTask);
router.delete("/:id", deleteGoal);

export default router;
