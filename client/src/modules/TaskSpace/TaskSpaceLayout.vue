<template>
  <div
    :style="backgroundStyle"
    class="min-h-screen bg-[#f0eeea] bg-fixed bg-size-[24px_24px]"
  >
    <!-- Header -->
    <header
      class="sticky top-0 z-10 flex h-13 items-center justify-between border-b-2 border-(--ink-primary) bg-white px-6 shadow-[0_2px_0_var(--ink-primary)]"
    >
      <!-- Left Side -->
      <div class="flex min-w-0 items-center">
        <!-- TaskSpace Logo -->
        <span
          class="mr-4 shrink-0 border-r-2 border-(--ink-primary) pr-4 text-base font-black tracking-[-0.03em] text-(--ink-primary)"
        >
          Task<span class="text-(--accent)">Space</span>
        </span>

        <!-- Navigation -->
        <nav
          v-if="visibleMenuItems.length"
          class="flex min-w-0 items-center gap-1"
        >
          <Button
            v-for="item in visibleMenuItems"
            :key="item.label"
            text
            class="m-0! border-2 border-transparent px-3.5 py-1.5 text-[0.75rem] font-extrabold uppercase tracking-[0.06em] transition-all duration-100"
            :class="
              isActiveRoute(item)
                ? 'border-b-(--accent) border-transparent text-(--accent)'
                : 'border-transparent text-(--ink-secondary) hover:text-(--accent)'
            "
            @click="item.command()"
          >
            {{ item.label }}
          </Button>
        </nav>
      </div>

      <!-- Logout -->
      <button
        type="button"
        class="ml-4 flex shrink-0 items-center gap-2 border-2 border-(--ink-primary) bg-white px-3.5 py-1.5 text-[0.75rem] font-extrabold uppercase tracking-[0.06em] text-(--ink-primary) shadow-[2px_2px_0_var(--ink-primary)] transition-all duration-100 hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[1px_1px_0_var(--ink-primary)]"
        @click="handleLogout"
      >
        <i
          class="pi pi-sign-out shrink-0 text-[0.75rem]"
        />

        <span class="whitespace-nowrap">
          Logout
        </span>
      </button>
    </header>

    <!-- Main Content -->
    <main class="px-6 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import { useConfirm } from "primevue/useconfirm";
import { useAuthStore } from "@/stores/auth.store";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const confirm = useConfirm();

const selectedTeamId = ref<string | null>(null);

/**
 * TaskSpace background
 */
const backgroundStyle = {
  minHeight: "100vh",
  backgroundColor: "#f0eeea",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect x='10' y='10' width='2.5' height='2.5' rx='0.5' fill='%231a1714' fill-opacity='0.18'/%3E%3C/svg%3E")`,
  backgroundSize: "24px 24px",
  backgroundAttachment: "fixed",
};

/**
 * TaskSpace menu items
 */
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
      router.push(
        `/taskspace/team/${selectedTeamId.value}/sprints`,
      ),
  },
  {
    label: "Members",
    visible: !!selectedTeamId.value,
    path: `/taskspace/team/${selectedTeamId.value}/members`,
    command: () =>
      router.push(
        `/taskspace/team/${selectedTeamId.value}/members`,
      ),
  },
  {
    label: "Chat",
    visible: !!selectedTeamId.value,
    path: `/taskspace/team/${selectedTeamId.value}/chat`,
    command: () =>
      router.push(
        `/taskspace/team/${selectedTeamId.value}/chat`,
      ),
  },
]);

/**
 * Only show menu items that are currently available
 */
const visibleMenuItems = computed(() =>
  menuItems.value.filter(
    (item) => item.visible !== false,
  ),
);

/**
 * Check active route
 */
const isActiveRoute = (item: { path?: string }) =>
  item.path
    ? route.path.startsWith(item.path)
    : false;

/**
 * Watch team route parameter
 */
watch(
  () => route.params.teamId,
  (newId) => {
    if (newId && typeof newId === "string") {
      selectedTeamId.value = newId;

      localStorage.setItem(
        "taskSpace_lastTeamId",
        newId,
      );
    } else {
      selectedTeamId.value = null;

      localStorage.removeItem(
        "taskSpace_lastTeamId",
      );
    }
  },
  {
    immediate: true,
  },
);

/**
 * Clear team when leaving a team route
 */
watch(
  () => route.path,
  (newPath) => {
    if (!newPath.includes("/team/")) {
      selectedTeamId.value = null;

      localStorage.removeItem(
        "taskSpace_lastTeamId",
      );
    }
  },
);

/**
 * Logout confirmation
 */
const handleLogout = () => {
  confirm.require({
    message: "Are you sure you want to log out?",
    header: "Log out",
    icon: "pi pi-sign-out",
    acceptLabel: "Yes, Log Out",
    acceptIcon: "pi pi-sign-out",
    rejectLabel: "Cancel",

    accept: async () => {
      await auth.logout();
      await router.push("/login");
    },
  });
};
</script>