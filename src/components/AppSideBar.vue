<template>
  <aside
    class="w-56 h-screen flex flex-col bg-white border-r border-stone-200 overflow-y-auto"
    style="padding: 28px 20px"
  >
    <!-- Logo -->
    <div
      style="
        padding-bottom: 20px;
        margin-bottom: 20px;
        border-bottom: 1px solid #e7e5e4;
      "
    >
      <p class="font-serif text-xl leading-none text-stone-800">TaskQuest</p>
      <p class="text-[0.7rem] text-stone-400 mt-1">Productivity</p>
    </div>

    <!-- User + XP Bar -->
    <div style="margin-bottom: 24px">
      <div class="flex items-center gap-3" style="margin-bottom: 14px">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 text-white"
          style="background: var(--accent)"
        >
          {{ profile.displayName.charAt(0) }}
        </div>
        <div>
          <p class="text-sm font-semibold text-stone-800 leading-none mb-2">
            {{ profile.displayName }}
          </p>

          <!-- Level badge with animated progress + tooltip -->
          <div class="relative group/badge">
            <div
              class="relative overflow-hidden rounded-md"
              style="
                background: var(--accent-soft);
                padding: 5px 10px;
                box-shadow: 0 2px 8px rgba(194, 98, 42, 0.2);
                width: 110px;
              "
            >
              <!-- Progress fill — animates on mount via CSS -->
              <div
                class="absolute inset-0 rounded-md transition-[width] duration-700 ease-out"
                style="background: var(--accent); opacity: 0.15; width: 0"
                :style="{ width: mounted ? progressPct + '%' : '0%' }"
              />
              <!-- Label -->
              <div class="relative flex items-center justify-between gap-2">
                <div class="flex items-center gap-1">
                  <!-- Star pulses when XP changes -->
                  <i
                    class="pi pi-star-fill text-[0.55rem]"
                    :class="xpPulse ? 'animate-ping' : ''"
                    style="color: var(--accent)"
                  />
                  <span
                    class="text-[0.7rem] font-semibold"
                    style="color: var(--accent)"
                  >
                    Lv {{ profile.level }}
                  </span>
                </div>
                <span
                  class="text-[0.6rem] font-medium"
                  style="color: var(--accent); opacity: 0.7"
                >
                  {{ profile.currentXP }}/{{ profile.xpToNextLevel }}
                </span>
              </div>
            </div>

            <!-- Tooltip -->
            <div
              class="absolute left-0 top-full mt-2 z-50 pointer-events-none opacity-0 group-hover/badge:opacity-100 transition-opacity duration-150"
              style="
                background: #1a1714;
                color: #fff;
                font-size: 0.7rem;
                padding: 6px 10px;
                border-radius: 8px;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              "
            >
              {{ profile.xpToNextLevel - profile.currentXP }} XP to Level
              {{ profile.level + 1 }}
              <!-- Arrow -->
              <div
                class="absolute -top-1 left-4"
                style="
                  width: 0;
                  height: 0;
                  border-left: 5px solid transparent;
                  border-right: 5px solid transparent;
                  border-bottom: 5px solid #1a1714;
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 flex flex-col" style="gap: 2px">
      <div
        v-for="section in navSections"
        :key="section.title"
        class="flex flex-col"
        style="margin-bottom: 8px"
      >
        <button
          class="flex items-center justify-between w-full rounded-lg hover:bg-stone-100 transition-colors duration-150"
          style="padding: 6px 8px; margin-bottom: 2px"
          @click="toggle(section.title)"
        >
          <span
            class="text-[0.68rem] font-semibold uppercase tracking-widest text-stone-400"
          >
            {{ section.title }}
          </span>
          <i
            :class="[
              'pi pi-chevron-down text-stone-400 transition-transform duration-200 text-[0.6rem]',
              collapsed[section.title] ? '-rotate-90' : 'rotate-0',
            ]"
          />
        </button>

        <div
          class="flex flex-col overflow-hidden transition-all duration-200"
          :class="
            collapsed[section.title]
              ? 'max-h-0 opacity-0'
              : 'max-h-75 opacity-100'
          "
          style="gap: 2px"
        >
          <router-link
            v-for="item in section.items"
            :key="item.name"
            :to="item.path"
            class="flex items-center rounded-lg text-sm font-medium text-stone-500 no-underline transition-all duration-150 hover:bg-stone-100 hover:text-stone-800"
            style="gap: 10px; padding: 8px 12px"
            active-class="!bg-[var(--accent-soft)] !text-[var(--accent)]"
          >
            <span class="w-4 text-center text-[0.95rem]">{{ item.icon }}</span>
            <span class="flex-1">{{ item.label }}</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Footer — settings -->
    <div
      style="border-top: 1px solid #e7e5e4; margin-top: 8px; padding-top: 8px"
    >
      <button
        class="flex items-center gap-2.5 w-full rounded-lg text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-all duration-150"
        style="padding: 8px 12px"
        @click="router.push('/settings')"
      >
        <i class="pi pi-cog text-sm" />
        <span>Settings</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useGamificationStore } from "./sidebar.store";
import type { NavSection } from "./sidebar.types";
import Button from "primevue/button";

const { profile, progressPct } = storeToRefs(useGamificationStore());
const router = useRouter();

const navSections: NavSection[] = [
  {
    title: "Work",
    items: [
      { name: "tasks", label: "Tasks", icon: "✓", path: "/tasks" },
      { name: "pomodoro", label: "Pomodoro", icon: "⏱", path: "/pomodoro" },
      { name: "calendar", label: "Calendar", icon: "📅", path: "/calendar" },
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

function toggle(title: string) {
  collapsed.value[title] = !collapsed.value[title];
}

const mounted = ref(false);
onMounted(() => setTimeout(() => (mounted.value = true), 100));

const xpPulse = ref(false);
watch(
  () => profile.value.currentXP,
  () => {
    xpPulse.value = true;
    setTimeout(() => (xpPulse.value = false), 600);
  },
);
</script>
