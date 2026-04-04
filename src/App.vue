<template>
  <div
    v-if="!isAuthPage"
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
  <div v-else style="background: var(--surface-bg)">
    <RouterView />
  </div>

  <ConfirmDialog />
  <Toast />
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useNotifications } from "@/components/notification";
import { useTasksQuery } from "@/modules/Tasks/tasks.tanstack";
import AppSideBar from "@/components/AppSideBar.vue";
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast"; 

const auth = useAuthStore();
const route = useRoute();
const { data: tasks } = useTasksQuery();
const { init } = useNotifications();

const isAuthPage = computed(
  () => route.path === "/" || route.path === "/login",
);

watch(
  () => auth.isAuthenticated,
  (val) => {
    if (val) init(tasks);
  },
  { immediate: true, once: true },
);
</script>
