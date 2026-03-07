<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <span class="logo-mark">TQ</span>
      <div>
        <p class="logo-name">TaskQuest</p>
        <p class="logo-sub">Productivity</p>
      </div>
    </div>

    <!-- XP Bar -->
    <div class="xp-bar-wrap">
      <div class="xp-bar-header">
        <span class="xp-level">Lv {{ profile.level }}</span>
        <span class="xp-points"
          >{{ profile.currentXP }} / {{ profile.xpToNextLevel }} XP</span
        >
      </div>
      <div class="xp-track">
        <div class="xp-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="sidebar-nav">
      <div
        v-for="section in navSections"
        :key="section.title"
        class="nav-section"
      >
        <button class="nav-section-toggle" @click="toggle(section.title)">
          <span class="nav-section-label">{{ section.title }}</span>
          <svg
            :class="[
              'nav-chevron',
              { 'nav-chevron--open': !collapsed[section.title] },
            ]"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <div
          class="nav-items-wrap"
          :class="{ 'nav-items-wrap--hidden': collapsed[section.title] }"
        >
          <router-link
            v-for="item in section.items"
            :key="item.name"
            :to="item.path"
            class="nav-item"
            active-class="nav-item--active"
          >
            <span class="nav-item-icon">{{ item.icon }}</span>
            <span class="nav-item-label">{{ item.label }}</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="user-chip">
        <div class="user-avatar">{{ profile.displayName.charAt(0) }}</div>
        <div class="user-info">
          <p class="user-name">{{ profile.displayName }}</p>
          <p class="user-streak">🔥 {{ profile.streakDays }}d streak</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useGamificationStore } from "./sidebar.store";
import { storeToRefs } from "pinia";
import type { NavSection } from "./sidebar.types";

const { profile, progressPct } = storeToRefs(useGamificationStore());

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
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 224px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--surface-card);
  border-right: 1px solid var(--surface-border);
  padding: 20px 12px;
  overflow-y: auto;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 20px;
  border-bottom: 1px solid var(--surface-border);
  margin-bottom: 16px;
}
.logo-mark {
  width: 34px;
  height: 34px;
  background: var(--accent);
  color: white;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "DM Serif Display", serif;
  font-size: 0.95rem;
  flex-shrink: 0;
}
.logo-name {
  font-family: "DM Serif Display", serif;
  font-size: 1rem;
  line-height: 1;
  color: var(--ink-primary);
}
.logo-sub {
  font-size: 0.7rem;
  color: var(--ink-muted);
  margin-top: 2px;
}

/* XP bar */
.xp-bar-wrap {
  background: var(--surface-muted);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  margin-bottom: 20px;
}
.xp-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.xp-level {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ink-primary);
}
.xp-points {
  font-size: 0.7rem;
  color: var(--ink-muted);
}
.xp-track {
  height: 5px;
  background: var(--surface-border);
  border-radius: 99px;
  overflow: hidden;
}
.xp-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 99px;
  transition: width 0.4s var(--ease);
}

/* Nav */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-section {
  display: flex;
  flex-direction: column;
}

.nav-section-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 5px 8px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--duration-fast) var(--ease);
}
.nav-section-toggle:hover {
  background: var(--surface-hover);
}
.nav-section-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.nav-chevron {
  width: 14px;
  height: 14px;
  color: var(--ink-muted);
  transition: transform var(--duration-fast) var(--ease);
  transform: rotate(-90deg);
}
.nav-chevron--open {
  transform: rotate(0deg);
}

.nav-items-wrap {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
  max-height: 300px;
  transition:
    max-height var(--duration-normal) var(--ease),
    opacity var(--duration-normal) var(--ease);
  opacity: 1;
  margin-bottom: 8px;
}
.nav-items-wrap--hidden {
  max-height: 0;
  opacity: 0;
  margin-bottom: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink-secondary);
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease);
}
.nav-item:hover {
  background: var(--surface-hover);
  color: var(--ink-primary);
}
.nav-item--active {
  background: var(--accent-soft);
  color: var(--accent);
}
.nav-item--active .nav-item-icon {
  opacity: 1;
}

.nav-item-icon {
  font-size: 0.95rem;
  width: 18px;
  text-align: center;
  opacity: 0.7;
}
.nav-item-label {
  flex: 1;
}

/* Footer */
.sidebar-footer {
  border-top: 1px solid var(--surface-border);
  padding-top: 14px;
  margin-top: 8px;
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  transition: background var(--duration-fast) var(--ease);
  cursor: default;
}
.user-chip:hover {
  background: var(--surface-hover);
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}
.user-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-primary);
  line-height: 1;
}
.user-streak {
  font-size: 0.7rem;
  color: var(--ink-muted);
  margin-top: 2px;
}
</style>
