<template>
  <div class="flex flex-col pl-8 pr-8 py-8 gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1
          class="font-serif text-3xl leading-tight"
          style="color: var(--ink-primary)"
        >
          Projects
        </h1>
        <p class="text-xs mt-1" style="color: var(--ink-muted)">
          Select a project to manage your teams and sprints
        </p>
      </div>

      <Button
        label="New Project"
        icon="pi pi-plus"
        class="bg-(--accent)! border-none! rounded-[10px]! text-sm! font-semibold! shadow-sm! hover:shadow-md! hover:-translate-y-px! transition-all! duration-150!"
        @click="store.openCreate()"
      />
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <i
        class="pi pi-spinner pi-spin text-2xl"
        style="color: var(--ink-muted)"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!projects?.length"
      class="rounded-2xl border border-dashed flex flex-col items-center justify-center py-20 gap-3"
      style="border-color: var(--card-border)"
    >
      <i class="pi pi-folder-open text-3xl" style="color: var(--ink-muted)" />
      <p class="text-sm font-medium" style="color: var(--ink-secondary)">
        No projects yet
      </p>
      <p class="text-xs" style="color: var(--ink-muted)">
        Create a project to start organizing your work
      </p>
      <Button
        label="Create your first project"
        icon="pi pi-plus"
        class="bg-(--accent)! border-none! rounded-xl! text-sm! font-semibold! mt-2!"
        @click="store.openCreate()"
      />
    </div>

    <!-- Project Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="project in projects"
        :key="project._id"
        class="group relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
        :class="{
          'ring-2 ring-(--accent) shadow-md':
            store.selectedProjectId === project._id,
        }"
        :style="getProjectCardStyle(project._id)"
        @click="selectProject(project._id)"
      >
        <!-- Cover -->
        <div v-if="getProjectCover(project._id)" class="h-24 overflow-hidden">
          <img
            :src="getProjectCover(project._id)!"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Content -->
        <div class="p-4">
          <p
            class="font-semibold text-sm leading-snug mb-1 truncate"
            style="color: var(--ink-primary)"
          >
            {{ project.name }}
          </p>

          <p
            v-if="project.description"
            class="text-xs truncate"
            style="color: var(--ink-muted)"
          >
            {{ project.description }}
          </p>

          <div class="flex items-center gap-1 mt-3">
            <i class="pi pi-users text-xs" style="color: var(--ink-muted)" />
            <span class="text-xs" style="color: var(--ink-muted)">
              {{ project.memberCount }} member{{
                project.memberCount !== 1 ? "s" : ""
              }}
            </span>
          </div>
        </div>

        <!-- Customize Button -->
        <div
          class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        >
          <Button
            icon="pi pi-palette"
            text
            rounded
            class="w-7! h-7! bg-white/80!"
            @click.stop="store.openCustomize(project)"
          />
        </div>
      </div>
    </div>

    <!-- Create Dialog -->
    <CreateProjectDialog
      v-model="store.showCreateDialog"
      @create="handleCreateProject"
    />

    <!-- Customize Dialog -->
    <CustomizeProjectDialog
      v-model="store.showCustomizeDialog"
      :project="store.customizingProject"
      :initial-color="store.tempColor"
      :initial-cover="store.tempCover"
      :color-palette="store.colorPalette"
      @save="handleSaveAppearance"
    />
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import CreateProjectDialog from "./CreateProjectDialog.vue";
import CustomizeProjectDialog from "./CustomizeProjectAppearanceDialog.vue";
import { useProjectComposable } from "./projectview.composable";

const {
  projects,
  isLoading,
  error,
  store,
  handleCreateProject,
  handleSaveAppearance,
  selectProject,
} = useProjectComposable();

const getProjectCardStyle = (projectId: string) => {
  const tileStyle = store.getTileStyle(projectId);

  return {
    ...tileStyle,
    borderColor: "var(--card-border)",
    background: tileStyle.backgroundColor || "var(--card-bg)",
  };
};

const getProjectCover = (projectId: string) => {
  return store.getCoverImage(projectId);
};
</script>
