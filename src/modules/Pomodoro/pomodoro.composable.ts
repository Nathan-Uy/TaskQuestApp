import { watch, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { usePomodoroStore } from "./pomodoro.store";

export const usePomodoroTimer = () => {
  const store = usePomodoroStore();

  const {
    phase,
    status,
    isRunning,
    isPaused,
    isIdle,
    formattedTime,
    progress,
    sessionsCompleted,
    todayFocusMinutes,
    linkedTaskId,
    settings,
  } = storeToRefs(store);

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
    isRunning,
    (running) => {
      if (running) startInterval();
      else stopInterval();
    },
    { immediate: true },
  );

  onUnmounted(stopInterval);

  return {
    phase,
    status,
    isRunning,
    isPaused,
    isIdle,
    formattedTime,
    progress,
    sessionsCompleted,
    todayFocusMinutes,
    linkedTaskId,
    settings,
    toggle: store.toggle,
    reset: store.reset,
    skip: store.skip,
    switchPhase: store.switchPhase,
    linkTask: store.linkTask,
    updateSettings: store.updateSettings,
  };
};
