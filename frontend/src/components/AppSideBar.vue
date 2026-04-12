<template>
  <aside
    class="w-56 h-screen flex flex-col overflow-y-auto px-5 py-7 border-r transition-colors duration-200"
    style="background: var(--sidebar-bg); border-color: var(--sidebar-border)"
  >
    <!-- Logo -->
    <div class="pb-5 mb-5 border-b" style="border-color: var(--sidebar-border)">
      <p
        class="font-serif text-xl leading-none"
        style="color: var(--ink-primary)"
      >
        TaskQuest
      </p>
      <p class="text-[0.7rem] mt-1" style="color: var(--ink-muted)">
        Productivity
      </p>
    </div>

    <!-- User Profile -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-3.5">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 text-white bg-(--accent)"
        >
          {{ profile.displayName.charAt(0) }}
        </div>
        <div>
          <p
            class="text-sm font-semibold leading-none mb-2"
            style="color: var(--ink-primary)"
          >
            {{ profile.displayName }}
          </p>
          <div class="relative group/badge">
            <div
              class="relative overflow-hidden rounded-md w-27.5 px-2.5 py-1.5 shadow-[0_2px_8px_rgba(194,98,42,0.2)]"
              style="background: var(--accent-soft)"
            >
              <div
                class="absolute inset-0 rounded-md transition-[width] duration-700 ease-out bg-(--accent) opacity-15"
                :style="{ width: mounted ? progressPct + '%' : '0%' }"
              />
              <div class="relative flex items-center justify-between gap-2">
                <div class="flex items-center gap-1">
                  <i
                    class="pi pi-star-fill text-[0.55rem] text-(--accent)"
                    :class="xpPulse ? 'animate-ping' : ''"
                  />
                  <span class="text-[0.7rem] font-semibold text-(--accent)"
                    >Lv {{ profile.level }}</span
                  >
                </div>
                <span
                  class="text-[0.6rem] font-medium text-(--accent) opacity-70"
                >
                  {{ profile.currentXP }}/{{ profile.xpToNextLevel }}
                </span>
              </div>
            </div>
            <div
              class="absolute left-0 top-full mt-2 z-50 pointer-events-none opacity-0 group-hover/badge:opacity-100 transition-opacity duration-150 text-white text-[0.7rem] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg"
              style="background: var(--ink-primary)"
            >
              {{ profile.xpToNextLevel - profile.currentXP }} XP to Level
              {{ profile.level + 1 }}
              <div
                class="absolute -top-1 left-4 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[5px]"
                style="border-bottom-color: var(--ink-primary)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 flex flex-col gap-0.5">
      <div
        v-for="section in navSections"
        :key="section.title"
        class="flex flex-col mb-2"
      >
        <button
          class="flex items-center justify-between w-full rounded-lg transition-colors duration-150 px-2 py-1.5 mb-0.5"
          style="color: var(--ink-muted)"
          @mouseenter="
            ($event.currentTarget as HTMLElement).style.background =
              'var(--nav-hover)'
          "
          @mouseleave="
            ($event.currentTarget as HTMLElement).style.background =
              'transparent'
          "
          @click="toggle(section.title)"
        >
          <span
            class="text-[0.68rem] font-semibold uppercase tracking-widest"
            >{{ section.title }}</span
          >
          <i
            :class="[
              'pi pi-chevron-down transition-transform duration-200 text-[0.6rem]',
              collapsed[section.title] ? '-rotate-90' : 'rotate-0',
            ]"
          />
        </button>
        <div
          class="flex flex-col overflow-hidden transition-all duration-200 gap-0.5"
          :class="
            collapsed[section.title]
              ? 'max-h-0 opacity-0'
              : 'max-h-75 opacity-100'
          "
        >
          <!-- Regular items (use router-link) -->
          <router-link
            v-for="item in section.items.filter((i) => i.name !== 'taskspace')"
            :key="item.name"
            :to="item.path"
            class="flex items-center gap-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-150 px-3 py-2"
            :style="{ color: 'var(--ink-secondary)' }"
            active-class="!bg-[var(--accent-soft)] !text-[var(--accent)]"
            @mouseenter="
              ($event.currentTarget as HTMLElement).style.background =
                'var(--nav-hover)'
            "
            @mouseleave="
              ($event.currentTarget as HTMLElement).style.cssText = ''
            "
          >
            <span class="w-4 text-center text-[0.95rem]">{{ item.icon }}</span>
            <span class="flex-1">{{ item.label }}</span>
          </router-link>

          <!-- TaskSpace item – opens in new tab, no external icon -->
          <button
            v-if="section.items.some((i) => i.name === 'taskspace')"
            class="flex items-center gap-2.5 w-full rounded-lg text-sm font-medium transition-all duration-150 px-3 py-2"
            :style="{ color: 'var(--ink-secondary)' }"
            @mouseenter="
              ($event.currentTarget as HTMLElement).style.background =
                'var(--nav-hover)'
            "
            @mouseleave="
              ($event.currentTarget as HTMLElement).style.background =
                'transparent'
            "
            @click="openTaskSpace"
          >
            <span class="w-4 text-center text-[0.95rem]">🗂</span>
            <span class="flex-1">TaskSpace</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Streak Coach -->
    <div class="mb-3">
      <div
        v-if="streakCoach"
        class="rounded-xl p-3"
        style="background: var(--accent-soft)"
      >
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-1.5">
            <i class="pi pi-sparkles text-(--accent) text-xs" />
            <span
              class="text-[0.65rem] font-semibold text-(--accent) uppercase tracking-wide"
              >Weekly Habit</span
            >
          </div>
          <button
            class="text-(--accent) opacity-50 hover:opacity-100 transition-opacity"
            @click="streakCoach = null"
          >
            <i class="pi pi-times text-[0.6rem]" />
          </button>
        </div>
        <p
          class="text-xs font-semibold leading-snug mb-1"
          style="color: var(--ink-primary)"
        >
          {{ streakCoach.habit }}
        </p>
        <p
          class="text-[0.65rem] leading-relaxed mb-1.5"
          style="color: var(--ink-secondary)"
        >
          {{ streakCoach.why }}
        </p>
        <p class="text-[0.65rem] font-medium text-(--accent)">
          ▶ {{ streakCoach.howToStart }}
        </p>
      </div>
      <button
        v-else
        :disabled="streakLoading"
        class="w-full flex items-center justify-center gap-1.5 text-[0.7rem] font-semibold text-(--accent) bg-(--accent-soft) hover:bg-(--accent) hover:text-white rounded-xl py-2 transition-all duration-150 disabled:opacity-50"
        @click="fetchStreakCoach"
      >
        <i
          :class="[
            'pi text-xs',
            streakLoading ? 'pi-spinner pi-spin' : 'pi-sparkles',
          ]"
        />
        {{ streakLoading ? "Thinking..." : "Get weekly habit" }}
      </button>
    </div>

    <!-- Settings & Logout -->
    <div class="pt-4 mt-2 border-t" style="border-color: var(--sidebar-border)">
      <div class="flex flex-col gap-1">
        <button
          class="flex items-center gap-2.5 w-full rounded-lg text-sm font-medium transition-all duration-150 px-3 py-2"
          style="color: var(--ink-secondary)"
          @mouseenter="
            ($event.currentTarget as HTMLElement).style.background =
              'var(--nav-hover)'
          "
          @mouseleave="
            ($event.currentTarget as HTMLElement).style.background =
              'transparent'
          "
          @click="router.push('/settings')"
        >
          <i class="pi pi-cog text-sm" />
          <span>Settings</span>
        </button>
        <button
          class="flex items-center gap-2.5 w-full rounded-lg text-sm font-medium transition-all duration-150 px-3 py-2 hover:bg-red-50 hover:text-red-500"
          style="color: var(--ink-secondary)"
          @click="handleLogout"
        >
          <i class="pi pi-sign-out text-sm" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useGamificationStore } from "./sidebar.store";
import { useAuthStore } from "@/stores/auth.store";
import { aiApi } from "@/api/ai.api";
import type { StreakCoach } from "@/types/ai.types";
import type { NavSection } from "./sidebar.types";

const { profile, progressPct } = storeToRefs(useGamificationStore());
const router = useRouter();
const auth = useAuthStore();

// Only one TaskSpace entry under WORK
const navSections: NavSection[] = [
  {
    title: "Work",
    items: [
      { name: "tasks", label: "Tasks", icon: "✓", path: "/tasks" },
      { name: "pomodoro", label: "Pomodoro", icon: "⏱", path: "/pomodoro" },
      { name: "calendar", label: "Calendar", icon: "📅", path: "/calendar" },
      { name: "taskspace", label: "TaskSpace", icon: "🗂", path: "/taskspace" },
    ],
  },
  {
    title: "Growth",
    items: [
      { name: "goals", label: "Goals", icon: "🎯", path: "/goals" },
      { name: "analytics", label: "Analytics", icon: "📈", path: "/analytics" },
    ],
  },
];

const collapsed = ref<Record<string, boolean>>({});
const mounted = ref(false);
const xpPulse = ref(false);
const streakLoading = ref(false);
const streakCoach = ref<StreakCoach | null>(null);

function toggle(title: string) {
  collapsed.value[title] = !collapsed.value[title];
}

const handleLogout = () => {
  auth.logout();
  router.push("/");
};

const fetchStreakCoach = async () => {
  streakLoading.value = true;
  try {
    streakCoach.value = await aiApi.getStreakCoach();
  } catch {
    console.error("Streak coach failed");
  } finally {
    streakLoading.value = false;
  }
};

// Opens TaskSpace in a new tab
const openTaskSpace = () => {
  window.open("/taskspace", "_blank");
};

onMounted(() => setTimeout(() => (mounted.value = true), 100));

watch(
  () => profile.value.currentXP,
  () => {
    xpPulse.value = true;
    setTimeout(() => (xpPulse.value = false), 600);
  },
);
</script>
