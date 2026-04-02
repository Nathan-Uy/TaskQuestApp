<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold" style="color: var(--ink-primary)">
        Teams
      </h2>

      <Button
        label="Create Team"
        icon="pi pi-plus"
        class="rounded-lg font-semibold"
        :style="{
          background: 'var(--accent)',
          border: 'none',
          color: 'white',
        }"
        @click="showCreateTeam = true"
      />
    </div>

    <!-- Teams Grid -->
    <div
      v-if="teams.length"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <Card
        v-for="team in teams"
        :key="team._id"
        class="cursor-pointer transition-all hover:shadow-md"
        :pt="{
          root: {
            style: {
              background: 'var(--surface-card)',
              border: '1px solid var(--surface-border)',
              borderRadius: '0.75rem',
            },
          },
          body: {
            style: {
              padding: '1rem',
            },
          },
        }"
        @click="selectTeam(team._id)"
      >
        <template #title>
          <h3 class="font-semibold" style="color: var(--ink-primary)">
            {{ team.teamName }}
          </h3>
        </template>

        <template #content>
          <p class="text-sm mb-3" style="color: var(--ink-muted)">
            {{ team.description }}
          </p>

          <div
            class="flex justify-between items-center text-xs"
            style="color: var(--ink-secondary)"
          >
            <span>{{ team.members.length }} members</span>
            <i class="pi pi-chevron-right" />
          </div>
        </template>
      </Card>
    </div>

    <!-- Empty State -->
    <Card
      v-else
      class="text-center"
      :pt="{
        root: {
          style: {
            background: 'var(--surface-card)',
            border: '1px solid var(--surface-border)',
            borderRadius: '0.75rem',
          },
        },
        body: {
          style: {
            padding: '3rem 1rem',
          },
        },
      }"
    >
      <template #content>
        <div class="flex flex-col items-center gap-3">
          <i class="pi pi-users text-4xl" style="color: var(--ink-muted)" />
          <p style="color: var(--ink-muted)">
            No teams yet. Create one to get started!
          </p>
        </div>
      </template>
    </Card>

    <!-- Create Team Modal -->
    <CreateTeamModal
      v-if="showCreateTeam"
      @close="showCreateTeam = false"
      @created="handleTeamCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useWorkspaceTeamsStore } from "../workspace-team.store";
import CreateTeamModal from "../components/CreateTeamModal.vue";

import Button from "primevue/button";
import Card from "primevue/card";

const router = useRouter();
const teamsStore = useWorkspaceTeamsStore();
const { teams } = storeToRefs(teamsStore);

const showCreateTeam = ref(false);

const selectTeam = (teamId: string) => {
  teamsStore.setCurrentTeam(teamId);
  router.push(`/workspace/teams/${teamId}/sprints`);
};

const handleTeamCreated = () => {
  showCreateTeam.value = false;
};
</script>
