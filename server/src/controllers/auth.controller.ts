import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";
import { sendResetEmail } from "../lib/mailer";

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

// Bounded quantifiers avoid the catastrophic-backtracking risk of unbounded
// adjacent [^\s@]+ groups (SonarLint typescript:S8786).
const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,24}$/;

const generateCsrfToken = () => crypto.randomBytes(32).toString("hex");

const setCsrfCookie = (res: Response, token: string) => {
  res.cookie("csrfToken", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 60 * 1000,
  });
};

const hashPassword = (password: string) =>
  crypto.createHash("sha256").update(password).digest("hex");

const sanitizeUser = (user: any) => ({
  _id: user._id,
  displayName: user.displayName,
  email: user.email,
  level: user.level,
  currentXP: user.currentXP,
  xpToNextLevel: user.xpToNextLevel,
  totalXP: user.totalXP,
  streakDays: user.streakDays,
  tasksCompleted: user.tasksCompleted,
  pomodorosDone: user.pomodorosDone,
  settings: user.settings,
  avatar: user.avatar,
});

const setTokenCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearTokenCookie = (res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

export const getCsrfToken = async (req: Request, res: Response) => {
  const csrfToken = generateCsrfToken();
  setCsrfCookie(res, csrfToken);
  res.json({ csrfToken });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { displayName, email, password } = req.body;
    const trimmedName = String(displayName ?? "").trim();
    const normalizedEmail = String(email ?? "")
      .trim()
      .toLowerCase();
    const passwordHash = String(password ?? "");

    if (!trimmedName || !normalizedEmail || !passwordHash) {
      return res
        .status(400)
        .json({ message: "Display name, email, and password are required" });
    }

    if (trimmedName.length < 2 || trimmedName.length > 40) {
      return res
        .status(400)
        .json({ message: "Display name must be between 2 and 40 characters" });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    if (passwordHash.length !== 64) {
      return res.status(400).json({ message: "Invalid password format" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account with that email already exists" });
    }

    const user = await User.create({
      displayName: trimmedName,
      email: normalizedEmail,
      password: passwordHash,
      avatar: "",
    });

    const token = signToken(user._id.toString());
    setTokenCookie(res, token);
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);
    res.status(201).json({ token, user: sanitizeUser(user), csrfToken });
  } catch {
    res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email ?? "")
      .trim()
      .toLowerCase();
    const passwordHash = String(password ?? "");

    if (!normalizedEmail || !passwordHash) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user?.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const bcrypt = await import("bcryptjs");
    const isDirectMatch = user.password === passwordHash;
    const isLegacyBcryptMatch =
      !isDirectMatch &&
      (await bcrypt.default.compare(passwordHash, user.password));

    if (!isDirectMatch && !isLegacyBcryptMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.password !== passwordHash) {
      user.password = passwordHash;
      await user.save();
    }

    const token = signToken(user._id.toString());
    setTokenCookie(res, token);
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);
    res.json({ token, user: sanitizeUser(user), csrfToken });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
};

export const logout = async (req: Request, res: Response) => {
  clearTokenCookie(res);
  res.clearCookie("csrfToken", { path: "/" });
  res.json({ message: "Logged out" });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(sanitizeUser(user));
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { settings: req.body } },
      { returnDocument: "after" },
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(sanitizeUser(user));
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "No account found with that email" });
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await sendResetEmail(user.email, resetUrl);
    res.json({ message: "Reset link sent to your email" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (password.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user)
      return res
        .status(400)
        .json({ message: "Reset link is invalid or expired" });
    user.password = await (await import("bcryptjs")).default.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password reset successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
