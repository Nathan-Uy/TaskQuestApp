<template>
  <div class="pl-8">
    <div class="mb-7">
      <h1 class="text-3xl font-serif text-stone-800 leading-tight">Settings</h1>
      <p class="text-xs text-stone-400 mt-1">Manage your preferences</p>
    </div>

    <div class="grid grid-cols-[200px_1fr] gap-6 items-start">
      <div
        class="bg-white border border-stone-200 rounded-2xl p-2 flex flex-col gap-1"
      >
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          :class="[
            'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left',
            activeTab === tab.key
              ? 'text-white bg-(--accent)'
              : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800',
          ]"
          @click="activeTab = tab.key as SettingsTab"
        >
          <i :class="['pi text-sm', tab.icon]" />
          {{ tab.label }}
        </button>
      </div>

      <div class="bg-white border border-stone-200 rounded-2xl p-6">
        <div v-if="activeTab === 'profile'">
          <p class="text-sm font-semibold text-stone-800 mb-5">Profile</p>
          <div
            class="flex items-center gap-4 mb-6 pb-6 border-b border-stone-100"
          >
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold text-white shrink-0 bg-(--accent)"
            >
              {{ profile.displayName.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-semibold text-stone-800">
                {{ profile.displayName }}
              </p>
              <p class="text-xs text-stone-400 mt-0.5">
                Level {{ profile.level }} · {{ profile.totalXP }} XP total
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-1.5 mb-4">
            <label class="text-xs font-medium text-stone-500"
              >Display name</label
            >
            <InputText
              v-model="displayNameInput"
              placeholder="Your name"
              class="w-full"
            />
          </div>
          <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="bg-stone-50 rounded-xl p-3 text-center">
              <p class="text-lg font-serif text-stone-800 leading-none mb-1">
                {{ profile.tasksCompleted }}
              </p>
              <p class="text-[0.65rem] font-medium text-stone-400">
                Tasks Done
              </p>
            </div>
            <div class="bg-stone-50 rounded-xl p-3 text-center">
              <p class="text-lg font-serif text-stone-800 leading-none mb-1">
                {{ profile.pomodorosDone }}
              </p>
              <p class="text-[0.65rem] font-medium text-stone-400">Pomodoros</p>
            </div>
            <div class="bg-stone-50 rounded-xl p-3 text-center">
              <p class="text-lg font-serif text-stone-800 leading-none mb-1">
                {{ profile.streakDays }}
              </p>
              <p class="text-[0.65rem] font-medium text-stone-400">
                Day Streak
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px bg-(--accent)"
              @click="saveProfile"
            >
              Save Changes
            </button>
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0"
              leave-to-class="opacity-0"
            >
              <span
                v-if="isSaved"
                class="text-xs text-emerald-500 font-medium flex items-center gap-1"
              >
                <i class="pi pi-check" /> Saved
              </span>
            </Transition>
          </div>
        </div>

        <div v-else-if="activeTab === 'appearance'">
          <p class="text-sm font-semibold text-stone-800 mb-5">Appearance</p>
          <div
            class="flex items-center justify-between py-3 border-b border-stone-100 mb-5"
          >
            <div>
              <p class="text-sm font-medium text-stone-800">Dark mode</p>
              <p class="text-xs text-stone-400 mt-0.5">
                Switch to a darker interface
              </p>
            </div>
            <button
              type="button"
              :class="[
                'relative w-11 h-6 rounded-full transition-all duration-200',
                settings.darkMode ? 'bg-(--accent)' : 'bg-stone-200',
              ]"
              @click="setDarkMode(!settings.darkMode)"
            >
              <span
                :class="[
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
                  settings.darkMode ? 'translate-x-5' : 'translate-x-0',
                ]"
              />
            </button>
          </div>
          <p class="text-xs font-medium text-stone-500 mb-3">Accent color</p>
          <div class="flex items-center gap-3 flex-wrap">
            <button
              v-for="theme in themeOptions"
              :key="theme.value"
              type="button"
              :title="theme.label"
              :class="[
                'flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-150',
                settings.themeColor === theme.value
                  ? 'border-stone-400 bg-stone-50'
                  : 'border-transparent hover:border-stone-200',
              ]"
              @click="setThemeColor(theme.value)"
            >
              <div
                class="w-8 h-8 rounded-full"
                :style="{ background: theme.color }"
              />
              <span class="text-[0.65rem] font-medium text-stone-500">{{
                theme.label
              }}</span>
            </button>
          </div>
        </div>

        <div v-else-if="activeTab === 'notifications'">
          <p class="text-sm font-semibold text-stone-800 mb-5">Notifications</p>
          <div class="flex flex-col gap-4">
            <div
              v-for="pref in notificationPrefs"
              :key="pref.key"
              class="flex items-center justify-between py-3 border-b border-stone-100 last:border-0"
            >
              <div>
                <p class="text-sm font-medium text-stone-800">
                  {{ pref.label }}
                </p>
                <p class="text-xs text-stone-400 mt-0.5">
                  {{ pref.description }}
                </p>
              </div>
              <button
                type="button"
                :class="[
                  'relative w-11 h-6 rounded-full transition-all duration-200',
                  settings.notifications[pref.key]
                    ? 'bg-(--accent)'
                    : 'bg-stone-200',
                ]"
                @click="
                  updateNotifications({
                    [pref.key]: !settings.notifications[pref.key],
                  })
                "
              >
                <span
                  :class="[
                    'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
                    settings.notifications[pref.key]
                      ? 'translate-x-5'
                      : 'translate-x-0',
                  ]"
                />
              </button>
            </div>

            <div
              v-if="settings.notifications.dailyReminder"
              class="flex items-center justify-between pt-1"
            >
              <label class="text-sm font-medium text-stone-800"
                >Reminder time</label
              >
              <div class="flex items-center gap-2">
                <select
                  :value="reminderHour"
                  class="text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-stone-400 bg-white"
                  @change="
                    updateReminderHour(
                      ($event.target as HTMLSelectElement).value,
                    )
                  "
                >
                  <option v-for="h in hours" :key="h" :value="h">
                    {{ h }}
                  </option>
                </select>
                <span class="text-stone-400 text-sm font-medium">:</span>
                <select
                  :value="reminderMinute"
                  class="text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-stone-400 bg-white"
                  @change="
                    updateReminderMinute(
                      ($event.target as HTMLSelectElement).value,
                    )
                  "
                >
                  <option value="00">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
                <select
                  :value="reminderPeriod"
                  class="text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-stone-400 bg-white"
                  @change="
                    updateReminderPeriod(
                      ($event.target as HTMLSelectElement).value,
                    )
                  "
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'data'">
          <p class="text-sm font-semibold text-stone-800 mb-5">Data</p>
          <div class="bg-red-50 border border-red-100 rounded-2xl p-5">
            <div class="flex items-start gap-3">
              <i class="pi pi-exclamation-triangle text-red-500 mt-0.5" />
              <div>
                <p class="text-sm font-semibold text-red-700 mb-1">
                  Reset all data
                </p>
                <p class="text-xs text-red-500 mb-4">
                  This will permanently delete all tasks, goals, pomodoro
                  history, and reset your XP and level. This cannot be undone.
                </p>
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all duration-150"
                  @click="showResetConfirm = true"
                >
                  Reset all data
                </button>
              </div>
            </div>
          </div>

          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 scale-95"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showResetConfirm"
              class="fixed inset-0 flex items-center justify-center z-50"
            >
              <div
                class="absolute inset-0 bg-black/20"
                @click="showResetConfirm = false"
              />
              <div class="relative bg-white rounded-2xl p-6 shadow-xl w-80">
                <p class="text-sm font-semibold text-stone-800 mb-2">
                  Are you sure?
                </p>
                <p class="text-xs text-stone-400 mb-5">
                  All your data will be permanently deleted. This cannot be
                  undone.
                </p>
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-all duration-150"
                    @click="showResetConfirm = false"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all duration-150"
                    @click="confirmReset"
                  >
                    Yes, reset everything
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import InputText from "primevue/inputtext";
import { useSettings } from "./settings.composable";
import type { SettingsTab } from "./settings.type";

const {
  activeTab,
  showResetConfirm,
  displayNameInput,
  isSaved,
  tabs,
  themeOptions,
  settings,
  profile,
  saveProfile,
  confirmReset,
  setDarkMode,
  setThemeColor,
  updateNotifications,
} = useSettings();

const notificationPrefs = [
  {
    key: "pomodoroEnd" as const,
    label: "Pomodoro complete",
    description: "Notify when a focus session ends",
  },
  {
    key: "breakEnd" as const,
    label: "Break complete",
    description: "Notify when a break ends",
  },
  {
    key: "taskDue" as const,
    label: "Task due",
    description: "Notify when a task is due today",
  },
  {
    key: "dailyReminder" as const,
    label: "Daily reminder",
    description: "Get a daily nudge to stay on track",
  },
];

const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);

const reminderHour = computed(() => {
  const parts = settings.value.notifications.dailyReminderTime.split(":");
  const hour = parseInt(parts[0] ?? "9");
  const h12 = hour % 12 || 12;
  return String(h12).padStart(2, "0");
});

const reminderMinute = computed(() => {
  const parts = settings.value.notifications.dailyReminderTime.split(":");
  return parts[1] ?? "00";
});

const reminderPeriod = computed(() => {
  const parts = settings.value.notifications.dailyReminderTime.split(":");
  return parseInt(parts[0] ?? "9") >= 12 ? "PM" : "AM";
});

const buildTime = (hour: string, minute: string, period: string) => {
  let h = parseInt(hour);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${minute}`;
};

const updateReminderHour = (hour: string) => {
  updateNotifications({
    dailyReminderTime: buildTime(
      hour,
      reminderMinute.value,
      reminderPeriod.value,
    ),
  });
};

const updateReminderMinute = (minute: string) => {
  updateNotifications({
    dailyReminderTime: buildTime(
      reminderHour.value,
      minute,
      reminderPeriod.value,
    ),
  });
};

const updateReminderPeriod = (period: string) => {
  updateNotifications({
    dailyReminderTime: buildTime(
      reminderHour.value,
      reminderMinute.value,
      period,
    ),
  });
};
</script>
