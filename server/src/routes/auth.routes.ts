import {
  googleAuth,
  getMe,
  updateSettings,
  forgotPassword,
  resetPassword,
  logout
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth";
import { Router } from "express";

const router = Router();
router.post("/google", googleAuth);
router.get("/me", protect, getMe);
router.post("/logout", logout)
router.patch("/settings", protect, updateSettings);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
