<template>
  <aside
    class="w-56 h-screen flex flex-col overflow-y-auto"
    style="
      background: var(--sidebar-bg);
      border-right: 2px solid var(--ink-primary);
    "
  >
    <!-- Logo -->
    <div
      style="
        padding: 1.5rem 1.25rem 1rem;
        border-bottom: 2px solid var(--ink-primary);
      "
    >
      <p
        style="
          font-size: 1.25rem;
          font-weight: 900;
          color: var(--ink-primary);
          letter-spacing: -0.03em;
          line-height: 1;
          margin: 0;
        "
      >
        Task<span style="color: var(--accent)">Quest</span>
      </p>
      <p
        style="
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--ink-muted);
          margin: 4px 0 0;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        "
      >
        Productivity
      </p>
    </div>

    <!-- User Profile -->
    <div
      style="padding: 1rem 1.25rem; border-bottom: 2px solid var(--ink-primary)"
    >
      <div class="flex items-center gap-3">
        <div
          style="
            width: 36px;
            height: 36px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
            font-weight: 800;
            color: #fff;
            background: var(--accent);
            border: 2px solid var(--ink-primary);
            box-shadow: 2px 2px 0 var(--ink-primary);
          "
        >
          {{ profile.displayName.charAt(0) }}
        </div>
        <div style="min-width: 0">
          <p
            style="
              font-size: 0.8rem;
              font-weight: 700;
              color: var(--ink-primary);
              margin: 0;
              line-height: 1.2;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            "
          >
            {{ profile.displayName }}
          </p>
          <div class="relative group/badge" style="margin-top: 5px">
            <div
              style="
                position: relative;
                overflow: hidden;
                padding: 4px 8px;
                background: var(--accent-soft);
                border: 1.5px solid var(--accent);
              "
            >
              <div
                style="
                  position: absolute;
                  inset: 0;
                  background: var(--accent);
                  opacity: 0.15;
                  transition: width 0.7s ease;
                "
                :style="{ width: mounted ? progressPct + '%' : '0%' }"
              />
              <div
                style="
                  position: relative;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 6px;
                "
              >
                <div style="display: flex; align-items: center; gap: 4px">
                  <i
                    class="pi pi-star-fill"
                    style="font-size: 0.5rem; color: var(--accent)"
                    :class="xpPulse ? 'animate-ping' : ''"
                  />
                  <span
                    style="
                      font-size: 0.65rem;
                      font-weight: 800;
                      color: var(--accent);
                    "
                    >Lv {{ profile.level }}</span
                  >
                </div>
                <span
                  style="
                    font-size: 0.6rem;
                    font-weight: 600;
                    color: var(--accent);
                    opacity: 0.7;
                  "
                >
                  {{ profile.currentXP }}/{{ profile.xpToNextLevel }}
                </span>
              </div>
            </div>
            <div
              style="
                position: absolute;
                left: 0;
                top: 100%;
                margin-top: 6px;
                z-index: 50;
                pointer-events: none;
                opacity: 0;
                background: var(--ink-primary);
                color: #fff;
                font-size: 0.7rem;
                font-weight: 600;
                padding: 6px 10px;
                white-space: nowrap;
                border: 1.5px solid var(--ink-primary);
                box-shadow: 2px 2px 0 var(--accent);
                transition: opacity 0.15s ease;
              "
              class="group-hover/badge:opacity-100"
            >
              {{ profile.xpToNextLevel - profile.currentXP }} XP to Level
              {{ profile.level + 1 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav style="flex: 1; padding: 0.75rem 0; overflow-y: auto">
      <div
        v-for="section in navSections"
        :key="section.title"
        style="margin-bottom: 4px"
      >
        <button
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: 6px 1.25rem;
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--ink-muted);
          "
          @click="toggle(section.title)"
        >
          <span
            style="
              font-size: 0.62rem;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.12em;
            "
            >{{ section.title }}</span
          >
          <i
            :class="[
              'pi pi-chevron-down',
              collapsed[section.title] ? '-rotate-90' : 'rotate-0',
            ]"
            style="font-size: 0.55rem; transition: transform 0.15s ease"
          />
        </button>

        <div
          style="
            overflow: hidden;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 0 0.5rem;
          "
          :style="
            collapsed[section.title]
              ? 'max-height: 0; opacity: 0;'
              : 'max-height: 300px; opacity: 1;'
          "
        >
          <!-- Regular nav items -->
          <router-link
            v-for="item in section.items.filter((i) => i.name !== 'taskspace')"
            :key="item.name"
            :to="item.path"
            style="
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 7px 10px;
              font-size: 0.8rem;
              font-weight: 600;
              color: var(--ink-secondary);
              text-decoration: none;
              border: 1.5px solid transparent;
              transition: all 80ms ease;
            "
            active-class="nb-nav-active"
            @mouseenter="
              ($event.currentTarget as HTMLElement).style.background =
                'var(--nav-hover)'
            "
            @mouseleave="
              ($event.currentTarget as HTMLElement).style.background =
                'transparent'
            "
          >
            <span style="width: 16px; text-align: center; font-size: 0.9rem">{{
              item.icon
            }}</span>
            <span>{{ item.label }}</span>
          </router-link>

          <!-- TaskSpace -->
          <button
            v-if="section.items.some((i) => i.name === 'taskspace')"
            style="
              display: flex;
              align-items: center;
              gap: 8px;
              width: 100%;
              padding: 7px 10px;
              font-size: 0.8rem;
              font-weight: 600;
              color: var(--ink-secondary);
              background: transparent;
              border: 1.5px solid transparent;
              cursor: pointer;
              text-align: left;
              transition: all 80ms ease;
            "
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
            <span style="width: 16px; text-align: center; font-size: 0.9rem"
              >🗂</span
            >
            <span>TaskSpace</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Streak Coach -->
    <div
      style="padding: 0.75rem 1rem; border-top: 2px solid var(--ink-primary)"
    >
      <div
        v-if="streakCoach"
        style="
          background: var(--accent-soft);
          border: 2px solid var(--ink-primary);
          box-shadow: 3px 3px 0 var(--ink-primary);
          padding: 10px 12px;
        "
      >
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;
          "
        >
          <div style="display: flex; align-items: center; gap: 6px">
            <i
              class="pi pi-sparkles"
              style="color: var(--accent); font-size: 0.75rem"
            />
            <span
              style="
                font-size: 0.6rem;
                font-weight: 800;
                color: var(--accent);
                text-transform: uppercase;
                letter-spacing: 0.08em;
              "
              >Weekly Habit</span
            >
          </div>
          <button
            style="
              background: none;
              border: none;
              cursor: pointer;
              color: var(--accent);
              opacity: 0.6;
            "
            @click="streakCoach = null"
          >
            <i class="pi pi-times" style="font-size: 0.6rem" />
          </button>
        </div>
        <p
          style="
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--ink-primary);
            margin: 0 0 4px;
            line-height: 1.3;
          "
        >
          {{ streakCoach.habit }}
        </p>
        <p
          style="
            font-size: 0.65rem;
            color: var(--ink-secondary);
            margin: 0 0 6px;
            line-height: 1.4;
          "
        >
          {{ streakCoach.why }}
        </p>
        <p
          style="
            font-size: 0.65rem;
            font-weight: 700;
            color: var(--accent);
            margin: 0;
          "
        >
          ▶ {{ streakCoach.howToStart }}
        </p>
      </div>

      <button
        v-else
        :disabled="streakLoading"
        style="
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--accent);
          background: var(--accent-soft);
          border: 2px solid var(--ink-primary);
          box-shadow: 2px 2px 0 var(--ink-primary);
          padding: 8px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 80ms ease;
        "
        @mouseenter="
          ($event.currentTarget as HTMLElement).style.cssText +=
            '; transform: translate(1px,1px); box-shadow: 1px 1px 0 var(--ink-primary);'
        "
        @mouseleave="
          ($event.currentTarget as HTMLElement).style.cssText = (
            $event.currentTarget as HTMLElement
          ).style.cssText
            .replace('transform: translate(1px,1px);', '')
            .replace(
              'box-shadow: 1px 1px 0 var(--ink-primary);',
              'box-shadow: 2px 2px 0 var(--ink-primary);',
            )
        "
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
    <div style="border-top: 2px solid var(--ink-primary); padding: 0.5rem">
      <button
        style="
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 10px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--ink-secondary);
          background: transparent;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: all 80ms ease;
        "
        @mouseenter="
          ($event.currentTarget as HTMLElement).style.background =
            'var(--nav-hover)'
        "
        @mouseleave="
          ($event.currentTarget as HTMLElement).style.background = 'transparent'
        "
        @click="router.push('/settings')"
      >
        <i class="pi pi-cog" style="font-size: 0.875rem" />
        <span>Settings</span>
      </button>
      <button
        style="
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 10px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--danger);
          background: transparent;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: all 80ms ease;
        "
        @mouseenter="
          ($event.currentTarget as HTMLElement).style.background =
            'var(--danger-soft)'
        "
        @mouseleave="
          ($event.currentTarget as HTMLElement).style.background = 'transparent'
        "
        @click="handleLogout"
      >
        <i class="pi pi-sign-out" style="font-size: 0.875rem" />
        <span>Logout</span>
      </button>
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

const navSections: NavSection[] = [
  {
    title: "Work",
    items: [
      { name: "tasks", label: "Tasks", icon: "✓", path: "/personal-tasks" },
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

const openTaskSpace = () => window.open("/taskspace", "_blank");

onMounted(() => setTimeout(() => (mounted.value = true), 100));

watch(
  () => profile.value.currentXP,
  () => {
    xpPulse.value = true;
    setTimeout(() => (xpPulse.value = false), 600);
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
