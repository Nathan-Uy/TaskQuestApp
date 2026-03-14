<template>
  <div
    class="grid grid-cols-[224px_1fr] h-screen overflow-hidden"
    v-if="!isAuthPage()"
  >
    <AppSideBar />
    <main class="overflow-y-auto pl-10 pr-8 py-8">
      <RouterView />
    </main>
  </div>
  <div v-else>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { useTasksStore } from "@/modules/Tasks/tasks.store";
import { useGoalsStore } from "@/modules/Goals/goals.store";
import AppSideBar from "@/components/AppSideBar.vue";
import { useRoute } from "vue-router";

const auth = useAuthStore();
const tasks = useTasksStore();
const goals = useGoalsStore();
const route = useRoute();

const isAuthPage = () => route.path === "/" || route.path === "/login";

onMounted(async () => {
  if (auth.isAuthenticated) {
    await Promise.all([tasks.fetchTasks(), goals.fetchGoals()]);
  }
});
</script>
