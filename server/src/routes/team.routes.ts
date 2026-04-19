import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  updateTeamCoverPhoto,
  updateTeamColor,
} from "../controllers/team.controller";

const router = Router();
router.use(protect);

router.get("/project/:projectId", getTeams);
router.post("/project/:projectId", createTeam);
router.get("/:teamId", getTeam);
router.put("/:teamId", updateTeam);
router.delete("/:teamId", deleteTeam);
router.post("/:teamId/members", addTeamMember);
router.delete("/:teamId/members/:userId", removeTeamMember);
router.patch("/:teamId/cover", protect, updateTeamCoverPhoto);
router.patch("/:teamId/color", protect, updateTeamColor);

export default router;
