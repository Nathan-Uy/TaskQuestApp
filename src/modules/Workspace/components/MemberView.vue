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
            :value="data.inviteStatus"
            :severity="data.inviteStatus === 'accepted' ? 'success' : 'warning'"
          />
        </template>
      </Column>
      <Column header="Actions" v-if="isTeamOwner">
        <template #body="{ data }">
          <Button
            v-if="data.role !== 'owner'"
            @click="handleRemoveMember(data)"
            icon="pi pi-trash"
            severity="danger"
            text
            size="small"
          />
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

    <!-- Remove Confirmation -->
    <ConfirmDialog
      v-if="showRemoveDialog && memberToRemove"
      :visible="showRemoveDialog"
      message="Are you sure you want to remove this member?"
      @confirm="handleConfirmRemove"
      @cancel="showRemoveDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import ConfirmDialog from "primevue/confirmdialog";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceTeamsStore } from "../workspace-team.store";
import InviteMemberModal from "../components/InviteMemberModal.vue";
import type { TeamMember } from "../workspace.types";

const route = useRoute();
const authStore = useAuthStore();
const teamsStore = useWorkspaceTeamsStore();

const showInviteModal = ref(false);
const showRemoveDialog = ref(false);
const memberToRemove = ref<TeamMember | null>(null);

const currentTeam = computed(() => teamsStore.currentTeam);

const isTeamOwner = computed(
  () => currentTeam.value?.owner === authStore.user?._id,
);

onMounted(() => {
  const teamId = route.params.teamId as string;
  if (teamId) {
    teamsStore.setCurrentTeam(teamId);
  }
});

const handleRemoveMember = (member: TeamMember) => {
  memberToRemove.value = member;
  showRemoveDialog.value = true;
};

const handleConfirmRemove = async () => {
  if (!memberToRemove.value || !currentTeam.value) return;

  try {
    await teamsStore.removeMember(
      currentTeam.value._id,
      memberToRemove.value.userId,
    );
    showRemoveDialog.value = false;
    memberToRemove.value = null;
  } catch (error) {
    console.error("Failed to remove member:", error);
  }
};

const handleMemberInvited = () => {
  showInviteModal.value = false;
  if (currentTeam.value) {
    teamsStore.setCurrentTeam(currentTeam.value._id);
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
