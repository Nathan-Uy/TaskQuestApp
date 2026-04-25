import { Schema, model } from "mongoose";
import type { IUser } from "../types/user.types";

const UserSchema = new Schema<IUser>(
  {
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false, default: null },
    googleId: { type: String, default: null },
    avatar: { type: String, default: null },
    level: { type: Number, default: 1 },
    currentXP: { type: Number, default: 0 },
    xpToNextLevel: { type: Number, default: 100 },
    totalXP: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    pomodorosDone: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    settings: {
      darkMode: { type: Boolean, default: false },
      themeColor: { type: String, default: "terracotta" },
      notifications: {
        pomodoroEnd: { type: Boolean, default: true },
        breakEnd: { type: Boolean, default: true },
        taskDue: { type: Boolean, default: false },
        dailyReminder: { type: Boolean, default: false },
        dailyReminderTime: { type: String, default: "09:00" },
      },
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", UserSchema);
