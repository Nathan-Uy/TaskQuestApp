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
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import AppSideBar from "@/components/AppSideBar.vue";

const auth = useAuthStore();
const route = useRoute();

const isAuthPage = computed(
  () => route.path === "/" || route.path === "/login",
);
</script>
