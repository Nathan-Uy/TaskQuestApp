<template>
  <div class="min-h-screen bg-gray-50">
    <Menubar :model="menuItems" class="border-b rounded-none sticky top-0 z-10">
      <template #start>
        <h1 class="text-xl font-bold text-gray-800 mr-8">TaskSpace</h1>
      </template>
      <template #end>
        <Button
          label="Logout"
          icon="pi pi-sign-out"
          text
          @click="handleLogout"
        />
      </template>
    </Menubar>
    <div class="p-6">
      <Card>
        <template #content>
          <router-view />
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import Menubar from "primevue/menubar";
import Button from "primevue/button";
import Card from "primevue/card";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const selectedProjectId = ref<string | null>(
  localStorage.getItem("taskSpace_lastProjectId"),
);

const menuItems = computed(() => [
  { label: "Projects", command: () => router.push("/taskspace/projects") },
  {
    label: "Members",
    visible: !!selectedProjectId.value,
    command: () =>
      router.push(`/taskspace/project/${selectedProjectId.value}/members`),
  },
  {
    label: "Chat",
    visible: !!selectedProjectId.value,
    command: () =>
      router.push(`/taskspace/project/${selectedProjectId.value}/chat`),
  },
]);

watch(
  () => route.params.projectId,
  (newId) => {
    if (newId && typeof newId === "string") {
      selectedProjectId.value = newId;
      localStorage.setItem("taskSpace_lastProjectId", newId);
    }
  },
  { immediate: true },
);

const handleLogout = () => {
  auth.logout();
  router.push("/login");
};
</script>
