import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from "../controllers/project.controller";

const router = Router();

router.use(protect); 

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:projectId", getProject);
router.put("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);
router.post("/:projectId/members", addMember);
router.delete("/:projectId/members/:userId", removeMember);

export default router;
