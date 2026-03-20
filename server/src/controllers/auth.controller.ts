import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

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
});

export const register = async (req: Request, res: Response) => {
  try {
    const { displayName, email, password } = req.body;

    if (!displayName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ displayName, email, password: hashed });
    const token = signToken(user._id.toString());

    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "No account found with that email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    const token = signToken(user._id.toString());
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
