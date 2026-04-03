<template>
  <Card class="mb-4">
    <template #title>
      {{ currentTeam?.name || "Workspace" }}
    </template>

    <template #content>
      <div class="flex gap-2 flex-wrap">
        <!-- Back to Teams -->
        <Button
          @click="$router.push('/workspace')"
          label="Teams"
          icon="pi pi-arrow-left"
          text
          severity="secondary"
        />

        <!-- View Sprint Tasks -->
        <Button
          v-if="currentSprint"
          @click="$router.push(`/workspace/sprints/${currentSprint._id}/tasks`)"
          label="Tasks"
          icon="pi pi-list"
          :severity="currentView === 'tasks' ? 'primary' : 'secondary'"
          :outlined="currentView !== 'tasks'"
        />

        <!-- View Team Chat -->
        <Button
          v-if="currentTeam"
          @click="$router.push(`/workspace/teams/${currentTeam._id}/chat`)"
          label="Chat"
          icon="pi pi-comments"
          :severity="currentView === 'chat' ? 'primary' : 'secondary'"
          :outlined="currentView !== 'chat'"
        />

        <!-- View Team Members -->
        <Button
          v-if="currentTeam"
          @click="$router.push(`/workspace/teams/${currentTeam._id}/members`)"
          label="Members"
          icon="pi pi-users"
          :severity="currentView === 'members' ? 'primary' : 'secondary'"
          :outlined="currentView !== 'members'"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import Card from "primevue/card";
import Button from "primevue/button";
import { useWorkspaceTeamsStore } from "../workspace-team.store";
import { useWorkspaceSprintsStore } from "../workspace-sprints.store";

const route = useRoute();
const teamsStore = useWorkspaceTeamsStore();
const sprintsStore = useWorkspaceSprintsStore();

const currentTeam = computed(() => teamsStore.currentTeam);
const currentSprint = computed(() => sprintsStore.currentSprint);

const currentView = computed(() => {
  const path = route.path;
  if (path.includes("chat")) return "chat";
  if (path.includes("members")) return "members";
  if (path.includes("tasks")) return "tasks";
  return "default";
});
</script>
