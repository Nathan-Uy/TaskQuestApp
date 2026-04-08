<template>
  <div class="flex flex-col pl-8 pr-8 py-8 gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1
          class="font-serif text-3xl leading-tight"
          style="color: var(--ink-primary)"
        >
          {{ project?.name || "Project" }} Teams
        </h1>
        <p class="text-xs mt-1" style="color: var(--ink-muted)">
          Organize your team members and manage collaboration
        </p>
      </div>

      <Button
        label="Create Team"
        icon="pi pi-plus"
        class="bg-(--accent)! border-none! rounded-[10px]! text-sm! font-semibold! shadow-sm! hover:shadow-md! hover:-translate-y-px! transition-all! duration-150!"
        @click="openCreateDialog()"
      />
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading || isProjectLoading"
      class="flex items-center justify-center py-20"
    >
      <i
        class="pi pi-spinner pi-spin text-2xl"
        style="color: var(--ink-muted)"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!teams?.length"
      class="rounded-2xl border border-dashed flex flex-col items-center justify-center py-20 gap-3"
      style="border-color: var(--card-border)"
    >
      <i class="pi pi-users text-3xl" style="color: var(--ink-muted)" />
      <p class="text-sm font-medium" style="color: var(--ink-secondary)">
        No teams yet
      </p>
      <p class="text-xs" style="color: var(--ink-muted)">
        Create a team to start organizing members and tasks
      </p>
      <Button
        label="Create your first team"
        icon="pi pi-plus"
        class="bg-(--accent)! border-none! rounded-xl! text-sm! font-semibold! mt-2!"
        @click="openCreateDialog()"
      />
    </div>

    <!-- Team Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="team in teams"
        :key="team._id"
        class="group relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
        :class="{
          'ring-2 ring-(--accent) shadow-md': selectedTeamId === team._id,
        }"
        :style="getTeamCardStyle(team._id)"
        @click="selectTeam(team._id)"
      >
        <!-- Cover -->
        <div v-if="getTeamCover(team._id)" class="h-24 overflow-hidden">
          <img
            :src="getTeamCover(team._id)!"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Content -->
        <div class="p-4">
          <p
            class="font-semibold text-sm leading-snug mb-1 truncate"
            style="color: var(--ink-primary)"
          >
            {{ team.name }}
          </p>

          <p
            v-if="team.description"
            class="text-xs truncate"
            style="color: var(--ink-muted)"
          >
            {{ team.description }}
          </p>

          <div class="flex items-center gap-1 mt-3">
            <i class="pi pi-users text-xs" style="color: var(--ink-muted)" />
            <span class="text-xs" style="color: var(--ink-muted)">
              {{ team.members?.length ?? 0 }} member{{
                (team.members?.length ?? 0) !== 1 ? "s" : ""
              }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div
          class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-1"
        >
          <Button
            icon="pi pi-palette"
            text
            rounded
            class="w-7! h-7! bg-white/80!"
            @click.stop="openCustomizeDialog(team)"
          />
          <Button
            icon="pi pi-arrow-right"
            text
            rounded
            class="w-7! h-7! bg-white/80!"
            @click.stop="selectTeam(team._id)"
          />
        </div>
      </div>
    </div>

    <!-- Dialogs -->
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
import Button from "primevue/button";
import CreateTeamDialog from "./CreateTeamDialog.vue";
import CustomizeAppearanceDialog from "./CustomizeAppearanceDialog.vue";
import { useTeamView } from "./teamview.composable";
import { useProject } from "../Project/project.tanstack";

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
  openCreateDialog,
  saveTeamAppearance,
  handleCreateTeam,
  selectTeam,
  isLoading,
  selectedTeamId,
} = useTeamView();

// Fetch current project info
const { data: project, isLoading: isProjectLoading } = useProject(projectId);

/**
 * Card style helper
 */
const getTeamCardStyle = (teamId: string) => {
  const tileStyle = getTileStyle(teamId);

  return {
    ...tileStyle,
    borderColor: "var(--card-border)",
    background: tileStyle.backgroundColor || "var(--card-bg)",
  };
};

/**
 * Cover helper
 */
const getTeamCover = (teamId: string) => {
  return getCoverImage(teamId);
};
</script>
