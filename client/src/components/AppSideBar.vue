<template>
  <aside
    class="box-border flex h-dvh w-60 min-w-60 flex-col overflow-hidden border-r-2 border-(--ink-primary) bg-(--sidebar-bg) text-(--ink-primary) shadow-[4px_0_0_var(--ink-primary)]"
  >
    <!-- Logo -->
    <div
      class="shrink-0 border-b-2 border-(--ink-primary) px-5 pb-4 pt-5"
    >
      <p
        class="m-0 text-[1.35rem] font-black leading-none tracking-[-0.04em]"
      >
        Task<span class="text-(--accent)">Quest</span>
      </p>

      <p
        class="mt-2 text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-(--ink-muted)"
      >
        Productivity
      </p>
    </div>

    <!-- User Profile -->
    <div
      class="shrink-0 border-b-2 border-(--ink-primary) px-4 py-4"
    >
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-(--ink-primary) bg-(--accent) text-sm font-black text-white shadow-[2px_2px_0_var(--ink-primary)]"
        >
          {{ profile.displayName.charAt(0) }}
        </div>

        <div class="min-w-0 flex-1">
          <!-- Name -->
          <p
            class="m-0 truncate text-[0.82rem] font-bold leading-tight text-(--ink-primary)"
          >
            {{ profile.displayName }}
          </p>

          <!-- XP Badge -->
          <div class="group/badge relative mt-2">
            <div
              class="relative overflow-hidden border-[1.5px] border-(--accent) bg-(--accent-soft) px-2 py-1.5"
            >
              <!-- XP Progress -->
              <div
                class="absolute inset-y-0 left-0 bg-(--accent) opacity-20 transition-[width] duration-700 ease-out"
                :style="{
                  width: mounted ? progressPct + '%' : '0%',
                }"
              />

              <div
                class="relative flex items-center justify-between gap-2"
              >
                <div class="flex items-center gap-1.5">
                  <i
                    class="pi pi-star-fill text-[0.52rem] text-(--accent)"
                    :class="xpPulse ? 'animate-ping' : ''"
                  />

                  <span
                    class="text-[0.64rem] font-extrabold text-(--accent)"
                  >
                    Lv {{ profile.level }}
                  </span>
                </div>

                <span
                  class="text-[0.58rem] font-semibold text-(--accent)/80"
                >
                  {{ profile.currentXP }}/{{ profile.xpToNextLevel }}
                </span>
              </div>
            </div>

            <!-- XP Tooltip -->
            <div
              class="pointer-events-none absolute left-0 top-full z-50 mt-2 border-[1.5px] border-(--ink-primary) bg-(--ink-primary) px-2.5 py-1.5 text-[0.7rem] font-semibold text-white opacity-0 shadow-[2px_2px_0_var(--accent)] transition-opacity duration-150 group-hover/badge:opacity-100"
            >
              {{ profile.xpToNextLevel - profile.currentXP }} XP to Level
              {{ profile.level + 1 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav
      class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3"
    >
      <div
        v-for="section in navSections"
        :key="section.title"
        class="mb-2"
      >
        <!-- Section Header -->
        <Button
          text
          class="m-0! w-full justify-between px-3 py-2 text-(--ink-muted) hover:bg-(--nav-hover)"
          :pt="{
            root: {
              class:
                'rounded-none border-none shadow-none text-left',
            },
            label: {
              class:
                'text-[0.62rem] font-extrabold uppercase tracking-[0.12em]',
            },
          }"
          @click="toggle(section.title)"
        >
          <template #default>
            <span>{{ section.title }}</span>

            <i
              :class="[
                'pi pi-chevron-down text-[0.55rem] transition-transform duration-150',
                collapsed[section.title]
                  ? '-rotate-90'
                  : 'rotate-0',
              ]"
            />
          </template>
        </Button>

        <!-- Section Items -->
        <div
          class="flex flex-col gap-1 overflow-hidden px-1 transition-all duration-200 ease-out"
          :style="
            collapsed[section.title]
              ? 'max-height: 0; opacity: 0;'
              : 'max-height: 300px; opacity: 1;'
          "
        >
          <!-- Regular Nav Items -->
          <router-link
            v-for="item in section.items.filter(
              (i) => i.name !== 'taskspace',
            )"
            :key="item.name"
            :to="item.path"
            class="flex min-w-0 items-center gap-2 rounded-none border border-transparent px-3 py-2 text-sm font-semibold text-(--ink-secondary) no-underline transition-all duration-100 hover:bg-(--nav-hover) hover:text-(--ink-primary)"
            active-class="nb-nav-active"
          >
            <span
              class="w-4 shrink-0 text-center text-[0.9rem]"
            >
              {{ item.icon }}
            </span>

            <span class="truncate">
              {{ item.label }}
            </span>
          </router-link>

          <!-- TaskSpace -->
          <Button
            v-if="
              section.items.some(
                (i) => i.name === 'taskspace',
              )
            "
            text
            class="m-0! w-full min-w-0 justify-start gap-2 border border-transparent px-3 py-2.5 text-(--ink-secondary) hover:bg-(--nav-hover)"
            :pt="{
              root: {
                class:
                  'rounded-none shadow-none text-left overflow-hidden',
              },
              label: {
                class: 'truncate text-sm font-semibold',
              },
            }"
            @click="openTaskSpace"
          >
            <template #default>
              <span
                class="w-4 shrink-0 text-center text-[0.9rem]"
              >
                🗂
              </span>

              <span class="truncate">
                TaskSpace
              </span>
            </template>
          </Button>
        </div>
      </div>
    </nav>

    <!-- Streak Coach -->
    <div
      class="shrink-0 border-t-2 border-(--ink-primary) px-3 pb-3 pt-4"
    >
      <!-- Generated Habit -->
      <div
        v-if="streakCoach"
        class="border-2 border-(--ink-primary) bg-(--accent-soft) p-3 shadow-[3px_3px_0_var(--ink-primary)]"
      >
        <div class="mb-2 flex items-center justify-between">
          <div class="flex min-w-0 items-center gap-2">
            <i
              class="pi pi-sparkles shrink-0 text-[0.72rem] text-(--accent)"
            />

            <span
              class="truncate text-[0.58rem] font-extrabold uppercase tracking-[0.08em] text-(--accent)"
            >
              Weekly Habit
            </span>
          </div>

          <Button
            text
            icon="pi pi-times"
            severity="secondary"
            class="m-0! shrink-0 p-0 text-(--accent)! opacity-60!"
            @click="streakCoach = null"
          />
        </div>

        <p
          class="mb-2 text-sm font-bold leading-tight text-(--ink-primary)"
        >
          {{ streakCoach.habit }}
        </p>

        <p
          class="mb-2 text-[0.68rem] leading-relaxed text-(--ink-secondary)"
        >
          {{ streakCoach.why }}
        </p>

        <p
          class="m-0 text-[0.68rem] font-bold text-(--accent)"
        >
          ▶ {{ streakCoach.howToStart }}
        </p>
      </div>

      <!-- Get Habit Button -->
      <Button
        v-else
        :label="
          streakLoading
            ? 'Thinking...'
            : 'Get weekly habit'
        "
        :loading="streakLoading"
        :disabled="streakLoading"
        icon="pi pi-sparkles"
        class="m-0! w-full min-w-0 border-2 border-(--ink-primary) bg-(--accent-soft) text-(--accent) uppercase tracking-[0.05em] shadow-[2px_2px_0_var(--ink-primary)] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0_var(--ink-primary)]"
        @click="fetchStreakCoach"
      />
    </div>

    <!-- Settings & Logout -->
  <div
    class="shrink-0 border-t-2 border-(--ink-primary) p-3"
  >
    <div
      class="w-full border-2 border-(--ink-primary) bg-(--surface-muted) p-1 shadow-[3px_3px_0_var(--ink-primary)]"
    >
      <!-- Settings -->
      <button
        type="button"
        class="flex w-full min-w-0 items-center gap-2 border border-transparent bg-transparent px-2.5 py-2 text-left text-(--ink-secondary) transition-colors hover:bg-(--nav-hover)"
        @click="router.push('/settings')"
      >
        <i
          class="pi pi-cog shrink-0 text-[0.875rem]"
        />

        <span
          class="min-w-0 flex-1 truncate text-sm font-semibold leading-normal"
        >
          Settings
        </span>
      </button>

      <!-- Divider -->
      <div
        class="my-1 h-px bg-(--ink-primary)/20"
      />

      <!-- Logout -->
      <button
        type="button"
        class="flex w-full min-w-0 items-center gap-2 border border-transparent bg-transparent px-2.5 py-2 text-left text-(--danger) transition-colors hover:bg-(--danger-soft)"
        @click="handleLogout"
      >
        <i
          class="pi pi-sign-out shrink-0 text-[0.875rem]"
        />

        <span
          class="min-w-0 flex-1 truncate text-sm font-semibold leading-normal"
        >
          Logout
        </span>
      </button>
    </div>
  </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import { useConfirm } from "primevue/useconfirm";

import { useGamificationStore } from "./sidebar.store";
import { useAuthStore } from "@/stores/auth.store";
import { aiApi } from "@/api/ai.api";

import type { StreakCoach } from "@/types/ai.types";
import type { NavSection } from "./sidebar.types";

const { profile, progressPct } =
  storeToRefs(useGamificationStore());

const router = useRouter();
const auth = useAuthStore();
const confirm = useConfirm();

const navSections: NavSection[] = [
  {
    title: "Work",
    items: [
      {
        name: "tasks",
        label: "Tasks",
        icon: "✓",
        path: "/personal-tasks",
      },
      {
        name: "pomodoro",
        label: "Pomodoro",
        icon: "⏱",
        path: "/pomodoro",
      },
      {
        name: "calendar",
        label: "Calendar",
        icon: "📅",
        path: "/calendar",
      },
      {
        name: "taskspace",
        label: "TaskSpace",
        icon: "🗂",
        path: "/taskspace",
      },
    ],
  },
  {
    title: "Growth",
    items: [
      {
        name: "goals",
        label: "Goals",
        icon: "🎯",
        path: "/goals",
      },
      {
        name: "analytics",
        label: "Analytics",
        icon: "📈",
        path: "/analytics",
      },
    ],
  },
];

const collapsed = ref<Record<string, boolean>>({});
const mounted = ref(false);
const xpPulse = ref(false);
const streakLoading = ref(false);
const streakCoach = ref<StreakCoach | null>(null);

function toggle(title: string) {
  collapsed.value[title] =
    !collapsed.value[title];
}

const handleLogout = () => {
  confirm.require({
    message:
      "You will be logged out of your account and return to the login screen. Your progress and data are safely saved.",
    header: "Confirm Logout",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Yes, Log Out",
    acceptIcon: "pi pi-sign-out",
    rejectLabel: "Cancel",
    rejectIcon: "pi pi-times",
    accept: async () => {
      await auth.logout();
      await router.push("/");
    },
    reject: () => {
      /* Dialog dismissed */
    },
  });
};

const fetchStreakCoach = async () => {
  streakLoading.value = true;

  try {
    streakCoach.value =
      await aiApi.getStreakCoach();
  } catch {
    streakCoach.value = null;
  } finally {
    streakLoading.value = false;
  }
};

const openTaskSpace = () =>
  window.open("/taskspace", "_blank");

onMounted(() => {
  setTimeout(() => {
    mounted.value = true;
  }, 100);
});

watch(
  () => profile.value.currentXP,
  () => {
    xpPulse.value = true;

    setTimeout(() => {
      xpPulse.value = false;
    }, 600);
  },
);
</script>

<style scoped>
.nb-nav-active {
  background: var(--accent) !important;
  color: #fff !important;
  border-color: var(--ink-primary) !important;
  box-shadow: 2px 2px 0 var(--ink-primary);
}
</style>