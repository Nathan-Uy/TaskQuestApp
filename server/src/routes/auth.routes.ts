import {
  register,
  login,
  getMe,
  updateSettings,
  forgotPassword,
  resetPassword,
  logout,
  getCsrfToken,
} from "../controllers/auth.controller";
import { protect, requireCsrfToken } from "../middleware/auth";
import { Router } from "express";

const router = Router();
router.get("/csrf-token", getCsrfToken);
router.use(requireCsrfToken);
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", logout);
router.patch("/settings", protect, updateSettings);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
