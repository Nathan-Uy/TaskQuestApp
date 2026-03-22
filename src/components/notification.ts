import { watch } from "vue";
import { useSettingsStore } from "@/modules/Settings/settings.store";
import type { Ref } from "vue";
import type { Task } from "@/modules/Tasks/tasks.type";

let dailyReminderTimeout: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

export const useNotifications = () => {
  const settingsStore = useSettingsStore();

  const requestPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  };

  const sendNotification = (title: string, body: string) => {
    if (Notification.permission !== "granted") return;
    const n = new Notification(title, { body });
    setTimeout(() => n.close(), 4000);
  };

  const checkTasksDueToday = (tasks: Task[] | undefined) => {
    if (!settingsStore.settings.notifications.taskDue) return;
    if (!tasks?.length) return;

    const today = new Date().toDateString();
    const dueTasks = tasks.filter(
      (t) =>
        t.status === "active" &&
        t.dueDate &&
        new Date(t.dueDate).toDateString() === today,
    );

    if (dueTasks.length === 0) return;

    const title = `${dueTasks.length} task${dueTasks.length > 1 ? "s" : ""} due today`;
    const first = dueTasks[0]?.title ?? "";
    const body =
      dueTasks.length === 1
        ? `"${first}" is due today`
        : `${dueTasks
            .slice(0, 2)
            .map((t) => t.title)
            .join(
              ", ",
            )}${dueTasks.length > 2 ? ` and ${dueTasks.length - 2} more` : ""}`;

    sendNotification("📋 TaskQuest", `${title} — ${body}`);
  };

  const scheduleDailyReminder = () => {
    if (!settingsStore.settings.notifications.dailyReminder) return;

    if (dailyReminderTimeout) {
      clearTimeout(dailyReminderTimeout);
      dailyReminderTimeout = null;
    }

    const parts = settingsStore.settings.notifications.dailyReminderTime
      .split(":")
      .map(Number);
    const hours = parts[0] ?? 9;
    const minutes = parts[1] ?? 0;

    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const delay = target.getTime() - now.getTime();

    dailyReminderTimeout = setTimeout(() => {
      sendNotification(
        "🔔 TaskQuest",
        "Time to check your tasks and stay on track!",
      );
      scheduleDailyReminder();
    }, delay);
  };

  const setup = (tasks: Ref<Task[] | undefined>) => {
    watch(
      () => settingsStore.settings.notifications.dailyReminder,
      (val) => {
        if (val) scheduleDailyReminder();
        else if (dailyReminderTimeout) {
          clearTimeout(dailyReminderTimeout);
          dailyReminderTimeout = null;
        }
      },
    );

    watch(
      () => settingsStore.settings.notifications.dailyReminderTime,
      () => {
        if (settingsStore.settings.notifications.dailyReminder)
          scheduleDailyReminder();
      },
    );

    watch(
      () => settingsStore.settings.notifications.taskDue,
      (val) => {
        if (val) checkTasksDueToday(tasks.value);
      },
    );

    const stopTasksWatch = watch(
      tasks,
      (val) => {
        if (!val) return;
        checkTasksDueToday(val);
        stopTasksWatch();
      },
      { immediate: true },
    );
  };

  const init = async (tasks: Ref<Task[] | undefined>) => {
    if (initialized) return;
    initialized = true;

    setup(tasks);

    const granted = await requestPermission();
    if (!granted) return;

    if (tasks.value) {
      checkTasksDueToday(tasks.value);
    }

    scheduleDailyReminder();
  };

  return { init, requestPermission, sendNotification };
};
