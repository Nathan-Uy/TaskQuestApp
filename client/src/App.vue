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

<style>
/* Global Confirm Dialog Styling — applies to all confirm dialogs */
:deep(.p-confirm-dialog) {
  border: 2px solid var(--ink-primary) !important;
  box-shadow: 4px 4px 0 var(--ink-primary) !important;
}

:deep(.p-confirm-dialog .p-confirm-dialog-header) {
  border-bottom: 2px solid var(--ink-primary) !important;
  background: var(--surface-default) !important;
  font-weight: 700 !important;
}

:deep(.p-confirm-dialog .p-confirm-dialog-content) {
  font-weight: 500 !important;
  line-height: 1.5;
}

:deep(.p-confirm-dialog .p-confirm-dialog-accept) {
  border: 2px solid var(--ink-primary) !important;
  background: var(--danger, #ef4444) !important;
  color: #000 !important;
  font-weight: 700 !important;
  box-shadow: 2px 2px 0 var(--ink-primary) !important;
  transition: all 150ms ease-out !important;
  padding: 0.625rem 1rem !important;
}

:deep(.p-confirm-dialog .p-confirm-dialog-accept:hover) {
  transform: translate(1px, 1px) !important;
  box-shadow: 1px 1px 0 var(--ink-primary) !important;
}

:deep(.p-confirm-dialog .p-confirm-dialog-accept:active) {
  transform: translate(2px, 2px) !important;
  box-shadow: 0 0 0 var(--ink-primary) !important;
}

:deep(.p-confirm-dialog .p-confirm-dialog-reject) {
  border: 2px solid var(--ink-primary) !important;
  background: var(--surface-default) !important;
  color: var(--ink-primary) !important;
  font-weight: 700 !important;
  box-shadow: 2px 2px 0 var(--ink-primary) !important;
  transition: all 150ms ease-out !important;
  padding: 0.625rem 1rem !important;
}

:deep(.p-confirm-dialog .p-confirm-dialog-reject:hover) {
  transform: translate(1px, 1px) !important;
  box-shadow: 1px 1px 0 var(--ink-primary) !important;
}

:deep(.p-confirm-dialog .p-confirm-dialog-reject:active) {
  transform: translate(2px, 2px) !important;
  box-shadow: 0 0 0 var(--ink-primary) !important;
}

:deep(.p-confirm-dialog .p-button-icon) {
  margin-right: 0.5rem !important;
}
</style>
