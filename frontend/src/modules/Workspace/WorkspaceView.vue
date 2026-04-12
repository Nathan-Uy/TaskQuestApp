<template>
  <div
    class="flex flex-col h-screen gap-4"
    style="background: var(--surface-bg)"
  >
    <!-- Top Bar - Only show when in nested team routes -->
    <WorkspaceTopBar
      v-if="showTopBar && currentTeam"
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
import { onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useWorkspaceTeamsStore } from "./workspace-team.store";
import { useWorkspaceSprintsStore } from "./workspace-sprints.store";
import WorkspaceTopBar from "./components/TopBar.vue";

const route = useRoute();
const teamsStore = useWorkspaceTeamsStore();
const sprintsStore = useWorkspaceSprintsStore();

const { currentTeam } = storeToRefs(teamsStore);
const { currentSprint } = storeToRefs(sprintsStore);

// Only show TopBar when we're in nested routes, not on teams list
const showTopBar = computed(() => {
  // Show TopBar when route includes teamId or sprintId (nested routes)
  return !!(route.params.teamId || route.params.sprintId);
});

onMounted(() => {
  teamsStore.fetchTeams();
});
</script>
