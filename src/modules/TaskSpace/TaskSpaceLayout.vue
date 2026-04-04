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
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceTeamsStore } from "@/modules/Workspace/workspace-team.store";
import Menubar from "primevue/menubar";
import Button from "primevue/button";
import Card from "primevue/card";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const teamsStore = useWorkspaceTeamsStore();

const selectedTeamId = ref<string | null>(null);

const menuItems = computed(() => [
  { label: "Projects", command: () => router.push("/taskspace/projects") },
  {
    label: "Members",
    visible: !!selectedTeamId.value,
    command: () =>
      router.push(`/taskspace/project/${selectedTeamId.value}/members`),
  },
  {
    label: "Chat",
    visible: !!selectedTeamId.value,
    command: () =>
      router.push(`/taskspace/project/${selectedTeamId.value}/chat`),
  },
]);

const loadTeams = async () => {
  if (teamsStore.teams.length === 0) await teamsStore.fetchTeams();
  if (teamsStore.teams.length > 0 && !selectedTeamId.value) {
    const lastTeamId = localStorage.getItem("taskSpace_lastTeamId");
    const teamExists = teamsStore.teams.some((t) => t._id === lastTeamId);
    selectedTeamId.value =
      lastTeamId && teamExists ? lastTeamId : teamsStore.teams[0]!._id;
    localStorage.setItem("taskSpace_lastTeamId", selectedTeamId.value);
  }
};

const handleLogout = () => {
  auth.logout();
  router.push("/login");
};

onMounted(() => loadTeams());

watch(
  () => route.params.teamId,
  (newTeamId) => {
    if (newTeamId && typeof newTeamId === "string") {
      selectedTeamId.value = newTeamId;
      localStorage.setItem("taskSpace_lastTeamId", newTeamId);
    }
  },
  { immediate: true },
);
</script>
