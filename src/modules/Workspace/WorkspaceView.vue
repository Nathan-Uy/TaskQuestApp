<template>
  <div
    class="flex flex-col h-screen gap-4 p-6"
    style="background: var(--surface-bg)"
  >
    <!-- Top Bar -->
    <WorkspaceTopBar
      v-if="currentTeam"
      :team="currentTeam"
      :sprint="currentSprint"
    />

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useWorkspaceTeamsStore } from "./workspace-team.store";
import { useWorkspaceSprintsStore } from "./workspace-sprints.store";
import WorkspaceTopBar from "./components/TopBar.vue";

const teamsStore = useWorkspaceTeamsStore();
const sprintsStore = useWorkspaceSprintsStore();

const { currentTeam } = storeToRefs(teamsStore);
const { currentSprint } = storeToRefs(sprintsStore);

onMounted(() => {
  teamsStore.fetchTeams();
});
</script>
F
