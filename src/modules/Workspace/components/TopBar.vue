<template>
  <div
    class="flex justify-between items-center p-4 rounded-lg"
    style="
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
    "
  >
    <div>
      <h1 class="text-xl font-bold" style="color: var(--ink-primary)">
        {{ team.teamName }}
      </h1>
      <p class="text-xs" style="color: var(--ink-muted)">
        {{ team.description }}
      </p>
    </div>
    <div v-if="sprint" class="text-right">
      <p class="text-sm font-semibold" style="color: var(--ink-primary)">
        {{ sprint.name }}
      </p>
      <p class="text-xs" style="color: var(--ink-muted)">
        {{ formatDate(sprint.startDate) }} - {{ formatDate(sprint.endDate) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Team, Sprint } from "../workspace.types";

defineProps<{
  team: Team;
  sprint?: Sprint | null;
}>();

const formatDate = (date: string) => new Date(date).toLocaleDateString();
</script>
