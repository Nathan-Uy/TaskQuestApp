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

const selectedTeamId = ref<string | null>(null);

// Build dynamic menu – Members & Chat visible only when a team is selected
const menuItems = computed(() => [
  { label: "Projects", command: () => router.push("/taskspace/projects") },
  {
    label: "Sprints",
    visible: !!selectedTeamId.value,
    command: () =>
      router.push(`/taskspace/team/${selectedTeamId.value}/sprints`),
  },
  {
    label: "Members",
    visible: !!selectedTeamId.value,
    command: () =>
      router.push(`/taskspace/team/${selectedTeamId.value}/members`),
  },
  {
    label: "Chat",
    visible: !!selectedTeamId.value,
    command: () => router.push(`/taskspace/team/${selectedTeamId.value}/chat`),
  },
]);

// Watch for teamId in route params
watch(
  () => route.params.teamId,
  (newId) => {
    if (newId && typeof newId === "string") {
      selectedTeamId.value = newId;
      localStorage.setItem("taskSpace_lastTeamId", newId);
    } else {
      // No teamId in route – clear selection
      selectedTeamId.value = null;
      localStorage.removeItem("taskSpace_lastTeamId");
    }
  },
  { immediate: true },
);

// Also watch the full path to clear when navigating to non-team routes
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
