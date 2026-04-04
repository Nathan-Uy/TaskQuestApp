<template>
  <div class="max-w-6xl mx-auto py-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-xl font-bold">Your Projects</h1>
      <Button
        label="Create Project"
        icon="pi pi-plus"
        size="small"
        @click="showCreateDialog = true"
      />
    </div>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <Card
        v-for="project in projects"
        :key="project._id"
        class="cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
        :style="getTileStyle(project._id)"
        @click="selectProject(project._id)"
      >
        <template #header v-if="getCoverImage(project._id)">
          <div class="h-24 overflow-hidden">
            <img
              :src="getCoverImage(project._id)"
              class="w-full h-full object-cover"
            />
          </div>
        </template>
        <template #content>
          <div class="p-3">
            <h2 class="text-base font-semibold truncate">{{ project.name }}</h2>
            <p class="text-xs text-gray-500">
              {{ project.members.length }} members
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
              @click.stop="openCustomizeDialog(project)"
              title="Customize appearance"
            />
            <i class="pi pi-chevron-right text-gray-400 text-sm" />
          </div>
        </template>
      </Card>
    </div>

    <CreateProjectDialog
      v-model="showCreateDialog"
      @create="handleCreateProject"
    />
    <CustomizeProjectAppearanceDialog
      v-model="showCustomizeDialog"
      :project="customizingProject"
      :initial-color="tempColor"
      :initial-cover="tempCover"
      :color-palette="colorPalette"
      @save="saveProjectAppearance"
    />
  </div>
</template>

<script setup lang="ts">
import { useProjectView } from "./projectview.composable";
import Card from "primevue/card";
import Button from "primevue/button";
import CreateProjectDialog from "./CreateProjectDialog.vue";
import CustomizeProjectAppearanceDialog from "./CustomizeProjectAppearanceDialog.vue";

const {
  projects,
  showCreateDialog,
  showCustomizeDialog,
  customizingProject,
  tempColor,
  tempCover,
  colorPalette,
  getTileStyle,
  getCoverImage,
  openCustomizeDialog,
  saveProjectAppearance,
  handleCreateProject,
  selectProject,
} = useProjectView();
</script>
