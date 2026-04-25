import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";
import { sendResetEmail } from "../lib/mailer";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

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

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential)
      return res.status(400).json({ message: "No credential provided" });

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email)
      return res.status(400).json({ message: "Invalid Google token" });

    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (user) {
      // Update Google ID and avatar if logging in with Google for first time
      if (!user.googleId) user.googleId = googleId;
      if (picture) user.avatar = picture;
      await user.save();
    } else {
      user = await User.create({
        displayName: name ?? email.split("@")[0],
        email,
        password: crypto.randomBytes(32).toString("hex"), 
        googleId,
        avatar: picture ?? "",
      });
    }

    const token = signToken(user._id.toString());
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ message: "Google authentication failed" });
  }
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
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
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
