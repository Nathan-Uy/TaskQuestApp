import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  createSprint,
  getSprints,
  getSprint,
  updateSprint,
  deleteSprint,
} from "../controllers/workspace.sprint.controller";

const router = Router();

router.use(protect); // all sprint routes require auth

router.post("/", createSprint); // ✅ POST /workspace/sprints
router.get("/team/:teamId", getSprints); // GET /workspace/sprints/team/:teamId
router.get("/:sprintId", getSprint);
router.put("/:sprintId", updateSprint);
router.delete("/:sprintId", deleteSprint);

export default router;
