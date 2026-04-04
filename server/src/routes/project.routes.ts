import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";

const router = Router();
router.use(protect);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:projectId", getProject);
router.put("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);

export default router;
