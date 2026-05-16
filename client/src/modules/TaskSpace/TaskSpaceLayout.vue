<template>
  <div :style="backgroundStyle">
    <!-- Navbar -->
    <div
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1.5rem;
        height: 52px;
        background: #fff;
        border-bottom: 2px solid #1a1714;
        box-shadow: 0 2px 0 #1a1714;
        position: sticky;
        top: 0;
        z-index: 10;
      "
    >
      <!-- Left: brand + nav -->
      <div style="display: flex; align-items: center; gap: 0">
        <span
          style="
            font-size: 1rem;
            font-weight: 900;
            color: #1a1714;
            letter-spacing: -0.03em;
            padding-right: 1.5rem;
            border-right: 2px solid #1a1714;
            margin-right: 1rem;
          "
        >
          Task<span style="color: var(--accent)">Space</span>
        </span>

        <button
          v-for="item in visibleMenuItems"
          :key="item.label"
          :style="{
            padding: '6px 14px',
            fontSize: '0.75rem',
            fontWeight: '800',
            border: '2px solid transparent',
            background: 'transparent',
            color: isActiveRoute(item)
              ? 'var(--accent)'
              : 'var(--ink-secondary)',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderBottom: isActiveRoute(item)
              ? '2px solid var(--accent)'
              : '2px solid transparent',
            transition: 'all 80ms ease',
          }"
          @mouseenter="
            ($event.currentTarget as HTMLElement).style.color = 'var(--accent)'
          "
          @mouseleave="
            ($event.currentTarget as HTMLElement).style.color = isActiveRoute(
              item,
            )
              ? 'var(--accent)'
              : 'var(--ink-secondary)'
          "
          @click="item.command()"
        >
          {{ item.label }}
        </button>
      </div>

      <!-- Right: logout -->
      <button
        style="
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border: 2px solid var(--ink-primary);
          background: #fff;
          color: var(--ink-primary);
          cursor: pointer;
          box-shadow: 2px 2px 0 var(--ink-primary);
          transition: all 80ms ease;
        "
        @mouseenter="
          ($event.currentTarget as HTMLElement).style.transform =
            'translate(1px,1px)';
          ($event.currentTarget as HTMLElement).style.boxShadow =
            '1px 1px 0 var(--ink-primary)';
        "
        @mouseleave="
          ($event.currentTarget as HTMLElement).style.transform = 'none';
          ($event.currentTarget as HTMLElement).style.boxShadow =
            '2px 2px 0 var(--ink-primary)';
        "
        @click="handleLogout"
      >
        <i class="pi pi-sign-out" style="font-size: 0.75rem" />
        Logout
      </button>
    </div>

    <!-- Content -->
    <div style="padding: 2rem 1.5rem">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const selectedTeamId = ref<string | null>(null);

const backgroundStyle = {
  minHeight: "100vh",
  backgroundColor: "#f0eeea",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect x='10' y='10' width='2.5' height='2.5' rx='0.5' fill='%231a1714' fill-opacity='0.18'/%3E%3C/svg%3E")`,
  backgroundSize: "24px 24px",
  backgroundAttachment: "fixed",
};

const menuItems = computed(() => [
  {
    label: "Projects",
    command: () => router.push("/taskspace/projects"),
    path: "/taskspace/projects",
  },
  {
    label: "Sprints",
    visible: !!selectedTeamId.value,
    path: `/taskspace/team/${selectedTeamId.value}/sprints`,
    command: () =>
      router.push(`/taskspace/team/${selectedTeamId.value}/sprints`),
  },
  {
    label: "Members",
    visible: !!selectedTeamId.value,
    path: `/taskspace/team/${selectedTeamId.value}/members`,
    command: () =>
      router.push(`/taskspace/team/${selectedTeamId.value}/members`),
  },
  {
    label: "Chat",
    visible: !!selectedTeamId.value,
    path: `/taskspace/team/${selectedTeamId.value}/chat`,
    command: () => router.push(`/taskspace/team/${selectedTeamId.value}/chat`),
  },
]);

const visibleMenuItems = computed(() =>
  menuItems.value.filter((item) => item.visible !== false),
);

const isActiveRoute = (item: { path?: string }) =>
  item.path ? route.path.startsWith(item.path) : false;

watch(
  () => route.params.teamId,
  (newId) => {
    if (newId && typeof newId === "string") {
      selectedTeamId.value = newId;
      localStorage.setItem("taskSpace_lastTeamId", newId);
    } else {
      selectedTeamId.value = null;
      localStorage.removeItem("taskSpace_lastTeamId");
    }
  },
  { immediate: true },
);

watch(
  () => route.path,
  (newPath) => {
    if (!newPath.includes("/team/")) {
      selectedTeamId.value = null;
      localStorage.removeItem("taskSpace_lastTeamId");
    }
  },
);

const handleLogout = () => {
  auth.logout();
  router.push("/login");
};
</script>
