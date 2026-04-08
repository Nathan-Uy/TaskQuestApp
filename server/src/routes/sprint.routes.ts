import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  getSprints,
  getSprint,
  createSprint,
  updateSprint,
  deleteSprint,
} from "../controllers/sprint.controller";

const router = Router();
router.use(protect);

router.get("/team/:teamId", getSprints);
router.post("/team/:teamId", createSprint);
router.get("/:sprintId", getSprint);
router.put("/:sprintId", updateSprint);
router.delete("/:sprintId", deleteSprint);

export default router;
