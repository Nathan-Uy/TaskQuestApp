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

router.get("/debug", async (req: any, res) => {
  const { default: Invitation } = await import("../models/Invitation");
  const all = await Invitation.find({}).lean();
  res.json({
    yourUserId: req.userId,
    invitations: all.map((i) => ({
      inviteeId: i.inviteeId,
      matches: i.inviteeId === req.userId,
      status: i.status,
    })),
  });
});

export default router;
