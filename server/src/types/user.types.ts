import { Document } from "mongoose";

export interface IUser extends Document {
  displayName: string;
  email: string;
  password: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  streakDays: number;
  tasksCompleted: number;
  pomodorosDone: number;
  lastActiveDate?: Date;
  settings: {
    darkMode: boolean;
    themeColor: string;
    notifications: {
      pomodoroEnd: boolean;
      breakEnd: boolean;
      taskDue: boolean;
      dailyReminder: boolean;
      dailyReminderTime: string;
    };
  };
}
