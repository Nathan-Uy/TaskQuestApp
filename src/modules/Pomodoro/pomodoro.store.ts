import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  PomodoroPhase,
  PomodoroSession,
  PomodoroSettings,
} from "./pomodoro.type";
import { useGamificationStore } from "@/components/sidebar.store";

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMins: 25,
  shortBreakMins: 5,
  longBreakMins: 15,
  sessionsUntilLongBreak: 4,
};

export const usePomodoroStore = defineStore("pomodoro", () => {
  const gamification = useGamificationStore();

  const settings = ref<PomodoroSettings>({ ...DEFAULT_SETTINGS });
  const phase = ref<PomodoroPhase>("work");
  const status = ref<"idle" | "running" | "paused" | "completed">("idle");
  const sessionsCompleted = ref(0);
  const linkedTaskId = ref<string | null>(null);
  const history = ref<PomodoroSession[]>([]);

  const totalSeconds = computed(() => {
    if (phase.value === "work") return settings.value.workMins * 60;
    if (phase.value === "short-break")
      return settings.value.shortBreakMins * 60;
    return settings.value.longBreakMins * 60;
  });

  const remainingSeconds = ref(totalSeconds.value);

  const isRunning = computed(() => status.value === "running");
  const isPaused = computed(() => status.value === "paused");
  const isIdle = computed(() => status.value === "idle");

  const progress = computed(
    () =>
      ((totalSeconds.value - remainingSeconds.value) / totalSeconds.value) *
      100,
  );

  const formattedTime = computed(() => {
    const m = Math.floor(remainingSeconds.value / 60)
      .toString()
      .padStart(2, "0");
    const s = (remainingSeconds.value % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  });

  const todaySessions = computed(() => {
    const today = new Date().toDateString();
    return history.value.filter(
      (s) => new Date(s.completedAt).toDateString() === today,
    );
  });

  const todayFocusMinutes = computed(() =>
    todaySessions.value
      .filter((s) => s.phase === "work")
      .reduce((sum, s) => sum + s.durationMins, 0),
  );

  const start = () => {
    status.value = "running";
  };
  const pause = () => {
    status.value = "paused";
  };

  const toggle = () => {
    if (status.value === "running") pause();
    else start();
  };

  const reset = () => {
    status.value = "idle";
    remainingSeconds.value = totalSeconds.value;
  };

  const tick = () => {
    if (status.value !== "running") return;
    if (remainingSeconds.value <= 0) {
      completePhase();
      return;
    }
    remainingSeconds.value--;
  };

  const completePhase = () => {
    status.value = "idle";

    history.value.push({
      id: Date.now(),
      phase: phase.value,
      durationMins:
        Math.round((totalSeconds.value - remainingSeconds.value) / 60) ||
        settings.value.workMins,
      completedAt: new Date(),
      linkedTaskId: (linkedTaskId.value),
    });

    if (phase.value === "work") {
      sessionsCompleted.value++;
      gamification.recordPomodoro();
      const isLongBreak =
        sessionsCompleted.value % settings.value.sessionsUntilLongBreak === 0;
      phase.value = isLongBreak ? "long-break" : "short-break";
    } else {
      phase.value = "work";
    }

    remainingSeconds.value = totalSeconds.value;
  };

  const skip = () => completePhase();

  const switchPhase = (p: PomodoroPhase) => {
    phase.value = p;
    status.value = "idle";
    remainingSeconds.value = totalSeconds.value;
  };

  const linkTask = (taskId: string | null) => {
    linkedTaskId.value = taskId;
  };

  const updateSettings = (patch: Partial<PomodoroSettings>) => {
    settings.value = { ...settings.value, ...patch };
    reset();
  };

  return {
    settings,
    phase,
    status,
    sessionsCompleted,
    linkedTaskId,
    history,
    remainingSeconds,
    isRunning,
    isPaused,
    isIdle,
    progress,
    formattedTime,
    totalSeconds,
    todaySessions,
    todayFocusMinutes,
    start,
    pause,
    toggle,
    reset,
    tick,
    completePhase,
    skip,
    switchPhase,
    linkTask,
    updateSettings,
  };
});
