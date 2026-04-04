<template>
  <div class="max-w-6xl">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-xl font-bold">Your Teams</h1>
      <Button
        label="Create Team"
        icon="pi pi-plus"
        size="small"
        @click="showCreateDialog = true"
      />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      <ProgressSpinner />
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <Card
        v-for="team in teams"
        :key="team._id"
        class="cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
        :style="getTileStyle(team._id)"
        @click="selectTeam(team._id)"
      >
        <template #header v-if="getCoverImage(team._id)">
          <div class="h-24 overflow-hidden">
            <img
              :src="getCoverImage(team._id)"
              class="w-full h-full object-cover"
            />
          </div>
        </template>
        <template #content>
          <div class="p-3">
            <h2 class="text-base font-semibold truncate">{{ team.name }}</h2>
            <p class="text-xs text-gray-500">
              {{ team.members.length }} members
            </p>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-1 p-2 pt-0">
            <Button
              icon="pi pi-palette"
              rounded
              text
              size="small"
              @click.stop="openCustomizeDialog(team)"
              title="Customize appearance"
            />
            <i class="pi pi-chevron-right text-gray-400 text-sm" />
          </div>
        </template>
      </Card>
    </div>

    <CreateTeamDialog v-model="showCreateDialog" @create="handleCreateTeam" />
    <CustomizeAppearanceDialog
      v-model="showCustomizeDialog"
      :team="customizingTeam"
      :initial-color="tempColor"
      :initial-cover="tempCover"
      :color-palette="colorPalette"
      @save="saveTeamAppearance"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useTeamView } from "./teamview.composable";
import Card from "primevue/card";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import CreateTeamDialog from "./CreateTeamDialog.vue";
import CustomizeAppearanceDialog from "./CustomizeAppearanceDialog.vue";

const route = useRoute();
const projectId = route.params.projectId as string;

const {
  teams,
  showCreateDialog,
  showCustomizeDialog,
  customizingTeam,
  tempColor,
  tempCover,
  colorPalette,
  getTileStyle,
  getCoverImage,
  openCustomizeDialog,
  saveTeamAppearance,
  handleCreateTeam,
  selectTeam,
  isLoading,
} = useTeamView(projectId);
</script>
