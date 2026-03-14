import { Router } from "express";
import {
  getTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from "../controllers/task.controller";
import { protect } from "../middleware/auth";

const router = Router();
router.use(protect);
router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.patch("/:id/complete", completeTask);
router.delete("/:id", deleteTask);

export default router;
