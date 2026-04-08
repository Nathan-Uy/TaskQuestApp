import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";

const router = Router();
router.use(protect);

router.get("/sprint/:sprintId", getTasks);
router.post("/sprint/:sprintId", createTask);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
