<template>
  <!-- Show sidebar only for main app routes (not auth, not TaskSpace) -->
  <div
    v-if="!isAuthPage && !isTaskSpace"
    class="grid grid-cols-[224px_1fr] h-screen overflow-hidden"
    style="background: var(--surface-bg)"
  >
    <AppSideBar />
    <main
      class="overflow-y-auto pl-10 pr-8 py-8"
      style="background: var(--surface-bg)"
    >
      <RouterView />
    </main>
  </div>

  <!-- For TaskSpace: only the router-view (TaskSpaceLayout will provide its own navigation) -->
  <div v-else-if="isTaskSpace" style="background: var(--surface-bg)">
    <RouterView />
  </div>

  <!-- For auth pages (login, landing): no sidebar, no TaskSpace layout -->
  <div v-else style="background: var(--surface-bg)">
    <RouterView />
  </div>

  <ConfirmDialog />
  <Toast />
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useNotifications } from "@/components/notification";
import { useTasksQuery } from "@/modules/Tasks/tasks.tanstack";
import AppSideBar from "@/components/AppSideBar.vue";
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const { data: tasks } = useTasksQuery();
const { init } = useNotifications();

const isAuthPage = computed(
  () => route.path === "/" || route.path === "/login",
);

const isTaskSpace = computed(() => route.path.startsWith("/taskspace"));

watch(
  () => auth.isAuthenticated,
  (val) => {
    if (val) init(tasks);
  },
  { immediate: true, once: true },
);

const handleStorage = (event: StorageEvent) => {
  if (event.key === "token" && !event.newValue) {
    auth.logout();
    router.push("/login");
  }
};

onMounted(() => {
  window.addEventListener("storage", handleStorage);
});

onUnmounted(() => {
  window.removeEventListener("storage", handleStorage);
});
</script>
