<template>
  <div class="flex flex-col pl-8 pr-8 py-8 gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1
          style="
            font-size: 2.5rem;
            font-weight: 900;
            letter-spacing: -0.03em;
            color: var(--ink-primary);
            line-height: 1;
            margin: 0;
          "
        >
          {{ project?.name || "Project" }} Teams
        </h1>
        <p
          style="
            font-size: 0.75rem;
            margin-top: 6px;
            color: var(--ink-muted);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          "
        >
          Organize your team members and manage collaboration
        </p>
      </div>
      <Button
        label="+ Create Team"
        style="font-weight: 800"
        @click="openCreateDialog()"
      />
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading || isProjectLoading"
      style="display: flex; justify-content: center; padding: 5rem 0"
    >
      <i
        class="pi pi-spinner pi-spin"
        style="font-size: 1.5rem; color: var(--ink-muted)"
      />
    </div>

    <!-- Empty -->
    <div
      v-else-if="!teams?.length"
      style="
        border: 2px dashed var(--ink-primary);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 5rem 2rem;
        gap: 12px;
        text-align: center;
      "
    >
      <i class="pi pi-users" style="font-size: 2rem; color: var(--ink-muted)" />
      <p
        style="
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--ink-secondary);
          margin: 0;
        "
      >
        No teams yet
      </p>
      <p
        style="
          font-size: 0.75rem;
          color: var(--ink-muted);
          margin: 0;
          font-weight: 500;
        "
      >
        Create a team to start organizing members and tasks
      </p>
      <Button
        label="+ Create your first team"
        style="font-weight: 800; margin-top: 8px"
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
        class="group relative overflow-hidden cursor-pointer transition-all duration-100"
        :style="{
          ...getTeamCardStyle(team._id),
          border:
            selectedTeamId === team._id
              ? '3px solid var(--accent)'
              : '2px solid var(--ink-primary)',
          boxShadow:
            selectedTeamId === team._id
              ? '5px 5px 0 var(--accent)'
              : '4px 4px 0 var(--ink-primary)',
          background: getTeamCardStyle(team._id).background || 'var(--card-bg)',
        }"
        @mouseenter="
          ($event.currentTarget as HTMLElement).style.transform =
            'translate(-2px,-2px)';
          ($event.currentTarget as HTMLElement).style.boxShadow =
            selectedTeamId === team._id
              ? '7px 7px 0 var(--accent)'
              : '6px 6px 0 var(--ink-primary)';
        "
        @mouseleave="
          ($event.currentTarget as HTMLElement).style.transform = 'none';
          ($event.currentTarget as HTMLElement).style.boxShadow =
            selectedTeamId === team._id
              ? '5px 5px 0 var(--accent)'
              : '4px 4px 0 var(--ink-primary)';
        "
        @click="selectTeam(team._id)"
      >
        <!-- Cover -->
        <div
          v-if="getTeamCover(team._id)"
          style="
            height: 96px;
            overflow: hidden;
            border-bottom: 2px solid var(--ink-primary);
          "
        >
          <img
            :src="getTeamCover(team._id)!"
            style="width: 100%; height: 100%; object-fit: cover"
            :alt="team.name"
          />
        </div>

        <!-- Content -->
        <div style="padding: 14px 16px">
          <p
            style="
              font-size: 0.875rem;
              font-weight: 800;
              color: var(--ink-primary);
              margin: 0 0 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              letter-spacing: -0.01em;
            "
          >
            {{ team.name }}
          </p>
          <p
            v-if="team.description"
            style="
              font-size: 0.75rem;
              color: var(--ink-muted);
              margin: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              font-weight: 500;
            "
          >
            {{ team.description }}
          </p>
          <div
            style="
              display: flex;
              align-items: center;
              gap: 4px;
              margin-top: 10px;
            "
          >
            <i
              class="pi pi-users"
              style="font-size: 0.65rem; color: var(--ink-muted)"
            />
            <span
              style="
                font-size: 0.7rem;
                color: var(--ink-muted);
                font-weight: 700;
              "
            >
              {{ team.members?.length ?? 0 }} member{{
                (team.members?.length ?? 0) !== 1 ? "s" : ""
              }}
            </span>
          </div>
        </div>

        <!-- Action buttons — always visible, no opacity trick -->
        <div
          style="
            position: absolute;
            top: 8px;
            right: 8px;
            display: flex;
            gap: 4px;
            opacity: 0;
            transition: opacity 80ms ease;
          "
          class="group-hover:opacity-100"
        >
          <button
            style="
              width: 28px;
              height: 28px;
              background: #fff;
              border: 2px solid var(--ink-primary);
              box-shadow: 2px 2px 0 var(--ink-primary);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 80ms ease;
            "
            title="Customize appearance"
            @mouseenter="
              ($event.currentTarget as HTMLElement).style.transform =
                'translate(1px,1px)';
              ($event.currentTarget as HTMLElement).style.boxShadow =
                '1px 1px 0 var(--ink-primary)';
            "
            @mouseleave="
              ($event.currentTarget as HTMLElement).style.transform = 'none';
              ($event.currentTarget as HTMLElement).style.boxShadow =
                '2px 2px 0 var(--ink-primary)';
            "
            @click.stop="openCustomizeDialog(team)"
          >
            <i
              class="pi pi-palette"
              style="font-size: 0.75rem; color: var(--ink-primary)"
            />
          </button>
          <button
            style="
              width: 28px;
              height: 28px;
              background: var(--accent);
              border: 2px solid var(--ink-primary);
              box-shadow: 2px 2px 0 var(--ink-primary);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 80ms ease;
            "
            title="Open team"
            @mouseenter="
              ($event.currentTarget as HTMLElement).style.transform =
                'translate(1px,1px)';
              ($event.currentTarget as HTMLElement).style.boxShadow =
                '1px 1px 0 var(--ink-primary)';
            "
            @mouseleave="
              ($event.currentTarget as HTMLElement).style.transform = 'none';
              ($event.currentTarget as HTMLElement).style.boxShadow =
                '2px 2px 0 var(--ink-primary)';
            "
            @click.stop="selectTeam(team._id)"
          >
            <i
              class="pi pi-arrow-right"
              style="font-size: 0.75rem; color: #fff"
            />
          </button>
        </div>
      </div>
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

const { data: project, isLoading: isProjectLoading } = useProject(projectId);

const getTeamCardStyle = (teamId: string) => {
  const tileStyle = getTileStyle(teamId);
  return {
    ...tileStyle,
    background: tileStyle.backgroundColor || "var(--card-bg)",
  };
};

const getTeamCover = (teamId: string) => getCoverImage(teamId);
</script>
