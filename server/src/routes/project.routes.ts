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
  updateCoverPhoto, // ✅ add
  updateProjectColor, // ✅ add
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
router.patch("/:projectId/cover", updateCoverPhoto);
router.patch("/:projectId/color", updateProjectColor);

export default router;
