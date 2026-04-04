<template>
  <div class="flex flex-col h-full gap-4">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Team Members</h2>
      <Button
        v-if="isTeamOwner"
        @click="showInviteModal = true"
        label="+ Invite Member"
        icon="pi pi-plus"
      />
    </div>

    <!-- Loading State -->
    <ProgressSpinner v-if="teamsStore.loading" />

    <!-- Error State -->
    <Message
      v-else-if="teamsStore.error"
      severity="error"
      :text="teamsStore.error"
    />

    <!-- Members List -->
    <DataTable
      v-else
      :value="currentTeam?.members || []"
      class="flex-1"
      :paginator="true"
      :rows="5"
    >
      <Column field="name" header="Name" />
      <Column field="email" header="Email" />
      <Column field="role" header="Role">
        <template #body="{ data }">
          <Tag
            :value="capitalizeRole(data.role)"
            :severity="getRoleSeverity(data.role)"
          />
        </template>
      </Column>
      <Column field="inviteStatus" header="Status">
        <template #body="{ data }">
          <Tag
            :value="data.inviteStatus === 'accepted' ? 'Active' : 'Pending'"
            :severity="data.inviteStatus === 'accepted' ? 'success' : 'warning'"
          />
        </template>
      </Column>
      <Column header="Actions" v-if="isTeamOwner">
        <template #body="{ data }">
          <div class="flex gap-1">
            <!-- Resend invite -->
            <Button
              v-if="data.inviteStatus === 'pending'"
              icon="pi pi-send"
              text
              rounded
              severity="info"
              size="small"
              @click="handleResendInvite(data)"
              title="Resend invitation"
            />
            <!-- Cancel invite -->
            <Button
              v-if="data.inviteStatus === 'pending'"
              icon="pi pi-times"
              text
              rounded
              severity="warning"
              size="small"
              @click="confirmCancelInvite(data)"
              title="Cancel invitation"
            />
            <!-- Remove member -->
            <Button
              v-if="data.role !== 'owner' && data.inviteStatus === 'accepted'"
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              size="small"
              @click="confirmRemoveMember(data)"
              title="Remove member"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Invite Modal -->
    <Dialog
      v-model:visible="showInviteModal"
      header="Invite Team Member"
      :modal="true"
      class="w-full max-w-md"
    >
      <InviteMemberModal
        :team-id="currentTeam?._id || ''"
        @close="showInviteModal = false"
        @invited="handleMemberInvited"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceTeamsStore } from "../workspace-team.store";
import InviteMemberModal from "../components/InviteMemberModal.vue";
import type { TeamMember } from "../workspace.types";

const route = useRoute();
const authStore = useAuthStore();
const teamsStore = useWorkspaceTeamsStore();
const confirm = useConfirm();
const toast = useToast();

const showInviteModal = ref(false);
const isLoadingTeam = ref(false);

const currentTeam = computed(() => teamsStore.currentTeam);
const isTeamOwner = computed(
  () => currentTeam.value?.owner === authStore.user?._id,
);

// Force reload team data
const loadTeam = async (teamId: string) => {
  isLoadingTeam.value = true;
  try {
    await teamsStore.fetchTeamById(teamId);
    teamsStore.setCurrentTeam(teamId);
  } catch (error) {
    console.error("Failed to load team:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Could not load team members.",
      life: 3000,
    });
  } finally {
    isLoadingTeam.value = false;
  }
};

// Watch for teamId changes in route
watch(
  () => route.params.teamId as string,
  async (newTeamId) => {
    if (newTeamId) {
      await loadTeam(newTeamId);
    }
  },
  { immediate: true },
);

// Also watch for currentTeamId to ensure team exists
watch(
  () => teamsStore.currentTeamId,
  async (newId) => {
    if (newId && !teamsStore.currentTeam) {
      await loadTeam(newId);
    }
  },
);

// Remove the old onMounted and use the watch instead
// onMounted is no longer needed because watch with immediate:true runs at startup

const confirmRemoveMember = (member: TeamMember) => {
  confirm.require({
    message: `Remove ${member.name} from the team?`,
    header: "Remove Member",
    icon: "pi pi-exclamation-triangle",
    accept: async () => {
      if (!currentTeam.value) return;
      try {
        await teamsStore.removeMember(currentTeam.value._id, member.userId);
        toast.add({
          severity: "success",
          summary: "Member Removed",
          detail: `${member.name} has been removed.`,
          life: 3000,
        });
        // Refresh team after removal
        await loadTeam(currentTeam.value._id);
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to remove member.",
          life: 3000,
        });
      }
    },
  });
};

const confirmCancelInvite = (member: TeamMember) => {
  confirm.require({
    message: `Cancel invitation for ${member.email}?`,
    header: "Cancel Invitation",
    icon: "pi pi-times-circle",
    accept: async () => {
      if (!currentTeam.value) return;
      try {
        await teamsStore.removeMember(currentTeam.value._id, member.userId);
        toast.add({
          severity: "info",
          summary: "Invitation Cancelled",
          detail: `Invitation to ${member.email} cancelled.`,
          life: 3000,
        });
        await loadTeam(currentTeam.value._id);
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to cancel invitation.",
          life: 3000,
        });
      }
    },
  });
};

const handleResendInvite = async (member: TeamMember) => {
  if (!currentTeam.value) return;
  try {
    await teamsStore.inviteMember(currentTeam.value._id, member.email);
    toast.add({
      severity: "success",
      summary: "Invitation Resent",
      detail: `Invitation resent to ${member.email}.`,
      life: 3000,
    });
    await loadTeam(currentTeam.value._id);
  } catch (error: any) {
    const message =
      error.response?.data?.error || "Failed to resend invitation";
    toast.add({
      severity: "error",
      summary: "Resend Failed",
      detail: message,
      life: 4000,
    });
  }
};

const handleMemberInvited = async () => {
  showInviteModal.value = false;
  if (currentTeam.value) {
    await loadTeam(currentTeam.value._id);
    toast.add({
      severity: "success",
      summary: "Invitation Sent",
      detail: "Team member invited successfully.",
      life: 3000,
    });
  }
};

const capitalizeRole = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getRoleSeverity = (role: string) => {
  const severities: Record<string, string> = {
    owner: "danger",
    admin: "warning",
    member: "info",
  };
  return severities[role] || "info";
};
</script>
