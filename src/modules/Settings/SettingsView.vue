<template>
  <div class="pl-8">
    <!-- Header -->
    <div class="mb-7">
      <h1 class="text-3xl font-serif text-stone-800 leading-tight">Settings</h1>
      <p class="text-xs text-stone-400 mt-1">Manage your preferences</p>
    </div>

    <div class="grid grid-cols-[200px_1fr] gap-6 items-start">
      <!-- Tabs -->
      <div
        class="bg-white border border-stone-200 rounded-2xl p-2 flex flex-col gap-1"
      >
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[
            'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left',
            activeTab === tab.key
              ? 'text-white'
              : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800',
          ]"
          :style="activeTab === tab.key ? { background: 'var(--accent)' } : {}"
          @click="activeTab = tab.key as SettingsTab"
        >
          <i :class="['pi text-sm', tab.icon]" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Panel -->
      <div class="bg-white border border-stone-200 rounded-2xl p-6">
        <!-- Profile -->
        <div v-if="activeTab === 'profile'">
          <p class="text-sm font-semibold text-stone-800 mb-5">Profile</p>

          <!-- Avatar -->
          <div
            class="flex items-center gap-4 mb-6 pb-6 border-b border-stone-100"
          >
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold text-white shrink-0"
              style="background: var(--accent)"
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

          <!-- Display name -->
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

          <!-- Stats -->
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
              class="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px"
              style="background: var(--accent)"
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

        <!-- Appearance -->
        <div v-else-if="activeTab === 'appearance'">
          <p class="text-sm font-semibold text-stone-800 mb-5">Appearance</p>

          <!-- Dark mode -->
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

          <!-- Theme color -->
          <p class="text-xs font-medium text-stone-500 mb-3">Accent color</p>
          <div class="flex items-center gap-3 flex-wrap">
            <button
              v-for="theme in themeOptions"
              :key="theme.value"
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

        <!-- Notifications -->
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

            <!-- Daily reminder time -->
            <div
              v-if="settings.notifications.dailyReminder"
              class="flex items-center justify-between pt-1"
            >
              <label class="text-sm font-medium text-stone-800"
                >Reminder time</label
              >
              <input
                type="time"
                :value="settings.notifications.dailyReminderTime"
                class="text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-stone-400"
                @change="
                  updateNotifications({
                    dailyReminderTime: ($event.target as HTMLInputElement)
                      .value,
                  })
                "
              />
            </div>
          </div>
        </div>

        <!-- Data -->
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
                  class="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all duration-150"
                  @click="showResetConfirm = true"
                >
                  Reset all data
                </button>
              </div>
            </div>
          </div>

          <!-- Confirm dialog -->
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
                    class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-all duration-150"
                    @click="showResetConfirm = false"
                  >
                    Cancel
                  </button>
                  <button
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
</script>
