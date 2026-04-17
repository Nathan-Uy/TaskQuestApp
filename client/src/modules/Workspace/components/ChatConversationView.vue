<template>
  <div class="flex flex-col h-full">
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <i
        class="pi pi-spinner pi-spin text-xl"
        style="color: var(--ink-muted)"
      />
    </div>

    <div v-else-if="!team" class="flex items-center justify-center h-full">
      <p class="text-sm" style="color: var(--ink-muted)">
        Team not found. Please go back and select a team.
      </p>
    </div>

    <ChatPanel v-else :team-id="String(team._id)" class="flex-1 min-h-0" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useWorkspaceTeamsStore } from "../workspace-team.store";
import ChatPanel from "./ChatPanel.vue";
import type { Team } from "../workspace.types";

const route = useRoute();
const router = useRouter();
const teamsStore = useWorkspaceTeamsStore();

const isLoading = ref(true);
const team = ref<Team | null>(null);

onMounted(async () => {
  try {
    const teamId = route.params.teamId as string;
    if (!teamId) {
      await router.push("/workspace");
      return;
    }
    if (teamsStore.teams.length === 0) await teamsStore.fetchTeams();
    team.value = teamsStore.teams.find((t) => t?._id === teamId) ?? null;
  } catch {
    console.error("Failed to load chat");
  } finally {
    isLoading.value = false;
  }
});
</script>
