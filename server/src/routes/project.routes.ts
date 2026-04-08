import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from "../controllers/project.controller";

const router = Router();
router.use(protect);

router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.post("/", createProject);
router.put("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);
router.post("/:projectId/members", addMember);
router.delete("/:projectId/members/:userId", removeMember);

export default router;
