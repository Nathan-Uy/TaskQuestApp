<template>
  <div class="flex flex-col pl-8 pr-8 py-8 gap-6">
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
          Projects
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
          Select a project to manage your teams and sprints
        </p>
      </div>
      <Button
        label="+ New Project"
        style="font-weight: 800"
        @click="store.openCreate()"
      />
    </div>

    <!-- Pending Invitations -->
    <div v-if="pendingInvitations.length > 0" class="flex flex-col gap-2">
      <p
        style="
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--ink-muted);
        "
      >
        Pending Invitations
      </p>
      <div
        v-for="inv in pendingInvitations"
        :key="inv._id"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: var(--card-bg);
          border: 2px solid var(--ink-primary);
          box-shadow: 3px 3px 0 var(--ink-primary);
        "
      >
        <div style="display: flex; align-items: center; gap: 12px">
          <div
            style="
              width: 36px;
              height: 36px;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.875rem;
              font-weight: 800;
              color: #fff;
              background: var(--accent);
              border: 2px solid var(--ink-primary);
            "
          >
            {{ inv.inviterName.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p
              style="
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--ink-primary);
                margin: 0;
              "
            >
              <span style="font-weight: 800">{{ inv.inviterName }}</span> has
              invited you to
              <span style="font-weight: 800">{{ inv.projectName }}</span>
            </p>
            <p
              style="
                font-size: 0.7rem;
                color: var(--ink-muted);
                margin: 2px 0 0;
                font-weight: 600;
              "
            >
              {{ formatInviteDate(inv.createdAt) }}
            </p>
          </div>
        </div>
        <div
          style="display: flex; align-items: center; gap: 8px; flex-shrink: 0"
        >
          <Button
            label="Decline"
            severity="secondary"
            text
            :loading="rejectingId === inv._id"
            @click="handleReject(inv._id)"
          />
          <Button
            label="Accept"
            :loading="acceptingId === inv._id"
            style="background: var(--success); color: #fff; font-weight: 800"
            @click="handleAccept(inv._id)"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      style="display: flex; justify-content: center; padding: 5rem 0"
    >
      <i
        class="pi pi-spinner pi-spin"
        style="font-size: 1.5rem; color: var(--ink-muted)"
      />
    </div>

    <!-- Empty -->
    <div
      v-else-if="!projects?.length"
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
      <i
        class="pi pi-folder-open"
        style="font-size: 2rem; color: var(--ink-muted)"
      />
      <p
        style="
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--ink-secondary);
          margin: 0;
        "
      >
        No projects yet
      </p>
      <p
        style="
          font-size: 0.75rem;
          color: var(--ink-muted);
          margin: 0;
          font-weight: 500;
        "
      >
        Create a project to start organizing your work
      </p>
      <Button
        label="+ Create your first project"
        style="font-weight: 800; margin-top: 8px"
        @click="store.openCreate()"
      />
    </div>

    <!-- Project grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="project in projects"
        :key="project._id"
        class="group relative overflow-hidden cursor-pointer transition-all duration-100"
        :style="{
          ...getProjectCardStyle(project._id),
          border:
            store.selectedProjectId === project._id
              ? '3px solid var(--accent)'
              : '2px solid var(--ink-primary)',
          boxShadow:
            store.selectedProjectId === project._id
              ? '5px 5px 0 var(--accent)'
              : '4px 4px 0 var(--ink-primary)',
          background:
            getProjectCardStyle(project._id).background || 'var(--card-bg)',
        }"
        @mouseenter="
          ($event.currentTarget as HTMLElement).style.transform =
            'translate(-2px,-2px)';
          ($event.currentTarget as HTMLElement).style.boxShadow =
            store.selectedProjectId === project._id
              ? '7px 7px 0 var(--accent)'
              : '6px 6px 0 var(--ink-primary)';
        "
        @mouseleave="
          ($event.currentTarget as HTMLElement).style.transform = 'none';
          ($event.currentTarget as HTMLElement).style.boxShadow =
            store.selectedProjectId === project._id
              ? '5px 5px 0 var(--accent)'
              : '4px 4px 0 var(--ink-primary)';
        "
        @click="selectProject(project._id)"
      >
        <div
          v-if="getProjectCover(project._id)"
          style="
            height: 96px;
            overflow: hidden;
            border-bottom: 2px solid var(--ink-primary);
          "
        >
          <img
            :src="getProjectCover(project._id)!"
            :alt="`${project.name} cover`"
            style="width: 100%; height: 100%; object-fit: cover"
          />
        </div>
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
            {{ project.name }}
          </p>
          <p
            v-if="project.description"
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
            {{ project.description }}
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
              {{ project.members?.length ?? 0 }} member{{
                (project.members?.length ?? 0) !== 1 ? "s" : ""
              }}
            </span>
          </div>
        </div>
        <div
          style="
            position: absolute;
            top: 8px;
            right: 8px;
            opacity: 0;
            transition: opacity 80ms ease;
          "
          class="group-hover:opacity-100"
        >
          <Button
            icon="pi pi-palette"
            text
            rounded
            style="
              background: #fff;
              border: 2px solid var(--ink-primary);
              width: 28px;
              height: 28px;
              box-shadow: 2px 2px 0 var(--ink-primary);
            "
            @click.stop="store.openCustomize(project)"
          />
        </div>
      </div>
    </div>

    <CreateProjectDialog
      v-model="store.showCreateDialog"
      @create="handleCreateProject"
    />
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
import { ref, computed } from "vue";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import CreateProjectDialog from "./CreateProjectDialog.vue";
import CustomizeProjectDialog from "./CustomizeProjectAppearanceDialog.vue";
import { useProjectComposable } from "./projectview.composable";
import {
  useInvitations,
  useAcceptInvitation,
  useRejectInvitation,
} from "../Invitation/invitation.tanstack";

const {
  projects,
  isLoading,
  store,
  handleCreateProject,
  handleSaveAppearance,
  selectProject,
} = useProjectComposable();

const toast = useToast();
const { data: invitationsData } = useInvitations();
const acceptMutation = useAcceptInvitation();
const rejectMutation = useRejectInvitation();

const pendingInvitations = computed(() => invitationsData.value ?? []);
const acceptingId = ref<string | null>(null);
const rejectingId = ref<string | null>(null);

const handleAccept = async (invitationId: string) => {
  acceptingId.value = invitationId;
  try {
    await acceptMutation.mutateAsync(invitationId);
    toast.add({ severity: "success", summary: "Joined project!", life: 3000 });
  } catch {
    toast.add({
      severity: "error",
      summary: "Failed to accept invitation",
      life: 3000,
    });
  } finally {
    acceptingId.value = null;
  }
};

const handleReject = async (invitationId: string) => {
  rejectingId.value = invitationId;
  try {
    await rejectMutation.mutateAsync(invitationId);
    toast.add({ severity: "info", summary: "Invitation declined", life: 3000 });
  } catch {
    toast.add({
      severity: "error",
      summary: "Failed to decline invitation",
      life: 3000,
    });
  } finally {
    rejectingId.value = null;
  }
};

const formatInviteDate = (date: string | Date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getProjectCardStyle = (projectId: string) => {
  const tileStyle = store.getTileStyle(projectId);
  return {
    ...tileStyle,
    background: tileStyle.backgroundColor || "var(--card-bg)",
  };
};

const getProjectCover = (projectId: string) => store.getCoverImage(projectId);
</script>
