<template>
  <!-- Main app routes -->
  <div
    v-if="!isAuthPage && !isTaskSpace"
    class="grid grid-cols-[224px_1fr] h-screen overflow-hidden"
  >
    <AppSideBar />
    <main class="overflow-y-auto pl-10 pr-8 py-8">
      <RouterView />
    </main>
  </div>

  <!-- TaskSpace -->
  <div v-else-if="isTaskSpace">
    <RouterView />
  </div>

  <!-- Auth pages — keep solid background so dots don't show on landing -->
  <div v-else style="background: #f0eeea">
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
  globalThis.addEventListener("storage", handleStorage);
});

onUnmounted(() => {
  globalThis.removeEventListener("storage", handleStorage);
});
</script>
