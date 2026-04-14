import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../controllers/invitation.controller";

const router = Router();
router.use(protect);

router.get("/", getMyInvitations);
router.patch("/:invitationId/accept", acceptInvitation);
router.patch("/:invitationId/reject", rejectInvitation);

export default router;
