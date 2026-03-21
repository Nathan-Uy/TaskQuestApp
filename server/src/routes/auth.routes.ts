import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth";
import { Router } from "express";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
