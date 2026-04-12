export type ThemeColor =
  | "terracotta"
  | "ocean"
  | "forest"
  | "lavender"
  | "rose";
export type SettingsTab = "profile" | "appearance" | "notifications" | "data";

export interface NotificationPreferences {
  pomodoroEnd: boolean;
  breakEnd: boolean;
  taskDue: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string;
}

export interface AppSettings {
  darkMode: boolean;
  themeColor: ThemeColor;
  notifications: NotificationPreferences;
}
