<template>
  <div class="flex flex-col h-full gap-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <ProgressSpinner />
    </div>

    <!-- Content -->
    <template v-else-if="team && team._id && String(team.name).length > 0">
      <!-- Header -->
      <Card>
        <template #title>Team Chat</template>
        <template #subtitle>{{ String(team.name) }}</template>
      </Card>

      <!-- Chat Panel -->
      <ChatPanel :team-id="String(team._id)" class="flex-1" />
    </template>

    <!-- Error State -->
    <div v-else class="flex items-center justify-center h-full text-red-500">
      <p>Failed to load chat. Please go back and select a team.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Card from "primevue/card";
import ProgressSpinner from "primevue/progressspinner";
import { useWorkspaceTeamsStore } from "../workspace-team.store";
import ChatPanel from "./ChatPanel.vue";
import type { Team } from "../workspace.types";

const route = useRoute();
const router = useRouter();
const teamsStore = useWorkspaceTeamsStore();

const isLoading = ref(true);
const team = ref<(Team & { name: string }) | null>(null);

onMounted(async () => {
  try {
    const teamId = route.params.teamId as string;
    
    if (!teamId) {
      isLoading.value = false;
      await router.push("/workspace");
      return;
    }

    // Fetch teams if empty
    if (teamsStore.teams.length === 0) {
      await teamsStore.fetchTeams();
    }

    // Find the team
    let foundTeam = teamsStore.teams.find(t => t?._id === teamId);
    
    if (!foundTeam) {
      console.error("Team not found:", teamId);
      isLoading.value = false;
      return;
    }

    // Type guard: ensure all required properties exist and are correct type
    const safeTeam: Team & { name: string } = {
      ...foundTeam,
      _id: String(foundTeam._id || ""),
      name: String(foundTeam?.name || "Team"),
      owner: String(foundTeam?.owner || ""),
      members: Array.isArray(foundTeam?.members) ? foundTeam.members : [],
      createdAt: foundTeam?.createdAt || new Date(),
      updatedAt: foundTeam?.updatedAt || new Date(),
    };

    team.value = safeTeam;
  } catch (error) {
    console.error("Failed to load chat:", error);
    isLoading.value = false;
  } finally {
    isLoading.value = false;
  }
});
</script>