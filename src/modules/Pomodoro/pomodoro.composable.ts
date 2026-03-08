import { watch, onUnmounted } from "vue";
import { usePomodoroStore } from "./pomodoro.store";

export function usePomodoroTimer() {
  const store = usePomodoroStore();

  let interval: ReturnType<typeof setInterval> | null = null;

  const startInterval = () => {
    if (interval) return;
    interval = setInterval(() => store.tick(), 1000);
  };

  const stopInterval = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  watch(
    () => store.isRunning,
    (running) => {
      if (running) startInterval();
      else stopInterval();
    },
    { immediate: true },
  );

  onUnmounted(stopInterval);

  return {
    phase: store.phase,
    status: store.status,
    isRunning: store.isRunning,
    isPaused: store.isPaused,
    isIdle: store.isIdle,
    formattedTime: store.formattedTime,
    progress: store.progress,
    sessionsCompleted: store.sessionsCompleted,
    todayFocusMinutes: store.todayFocusMinutes,
    linkedTaskId: store.linkedTaskId,
    settings: store.settings,

    toggle: store.toggle,
    reset: store.reset,
    skip: store.skip,
    switchPhase: store.switchPhase,
    linkTask: store.linkTask,
    updateSettings: store.updateSettings,
  };
}
