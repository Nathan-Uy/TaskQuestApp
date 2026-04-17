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

    <!-- Pending Invitations -->
    <div v-if="pendingInvitations.length > 0" class="flex flex-col gap-2">
      <p
        class="text-xs font-semibold uppercase tracking-widest"
        style="color: var(--ink-muted)"
      >
        Pending Invitations
      </p>
      <div
        v-for="inv in pendingInvitations"
        :key="inv._id"
        class="flex items-center justify-between rounded-2xl border px-5 py-4 transition-all duration-150"
        style="background: var(--card-bg); border-color: var(--card-border)"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
            style="background: var(--accent)"
          >
            {{ inv.inviterName.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="text-sm font-medium" style="color: var(--ink-primary)">
              <span class="font-semibold">{{ inv.inviterName }}</span> has
              invited you to
              <span class="font-semibold">{{ inv.projectName }}</span>
            </p>
            <p class="text-xs mt-0.5" style="color: var(--ink-muted)">
              {{ formatInviteDate(inv.createdAt) }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <Button
            label="Decline"
            severity="secondary"
            text
            class="rounded-xl! text-sm! h-8!"
            :loading="rejectingId === inv._id"
            @click="handleReject(inv._id)"
          />
          <Button
            label="Accept"
            class="bg-(--accent)! border-none! rounded-xl! text-sm! font-semibold! h-8!"
            :loading="acceptingId === inv._id"
            @click="handleAccept(inv._id)"
          />
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <i
        class="pi pi-spinner pi-spin text-2xl"
        style="color: var(--ink-muted)"
      />
    </div>

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
        <div v-if="getProjectCover(project._id)" class="h-24 overflow-hidden">
          <img
            :src="getProjectCover(project._id)!"
            class="w-full h-full object-cover"
          />
        </div>
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
              {{ project.members?.length ?? 0 }} member{{
                (project.members?.length ?? 0) !== 1 ? "s" : ""
              }}
            </span>
          </div>
        </div>
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
    borderColor: "var(--card-border)",
    background: tileStyle.backgroundColor || "var(--card-bg)",
  };
};

const getProjectCover = (projectId: string) => store.getCoverImage(projectId);
console.log("Invitations:", invitationsData.value);
</script>
