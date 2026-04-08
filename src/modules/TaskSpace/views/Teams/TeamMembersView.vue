<template>
  <div class="flex flex-col h-full gap-4">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Team Members</h2>
      <Button
        @click="showInviteModal = true"
        label="Invite Member"
        icon="pi pi-plus"
      />
    </div>

    <div v-if="teamLoading" class="flex justify-center py-8">
      <ProgressSpinner />
    </div>
    <div v-else-if="teamError" class="text-red-500">Failed to load team.</div>

    <DataTable
      :value="team?.members || []"
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
      <Column field="joinedAt" header="Joined">
        <template #body="{ data }">{{ formatDate(data.joinedAt) }}</template>
      </Column>
      <Column field="inviteStatus" header="Status">
        <template #body="{ data }">
          <Tag
            v-if="data.inviteStatus === 'pending'"
            value="Pending"
            severity="warning"
            icon="pi pi-clock"
          />
          <Tag
            v-else
            value="Active"
            severity="success"
            icon="pi pi-check-circle"
          />
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <Button
            v-if="data.role !== 'owner' && data.inviteStatus !== 'pending'"
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            size="small"
            @click="confirmRemoveMember(data)"
            title="Remove member"
          />
          <span
            v-else-if="data.inviteStatus === 'pending'"
            class="text-gray-400 text-sm"
            >Waiting...</span
          >
        </template>
      </Column>
    </DataTable>

    <!-- Invite Modal (unchanged) -->
    <Dialog
      v-model:visible="showInviteModal"
      header="Invite Member"
      :modal="true"
      class="w-full max-w-md"
    >
      <form @submit.prevent="handleInvite">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1"
              >Email Address *</label
            >
            <InputText
              v-model="inviteEmail"
              type="email"
              class="w-full"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Role</label>
            <Select
              v-model="inviteRole"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <Button
            label="Cancel"
            severity="secondary"
            @click="showInviteModal = false"
          />
          <Button type="submit" label="Send Invitation" :loading="inviting" />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import {
  useTeam,
  useAddTeamMember,
  useRemoveTeamMember,
} from "./team.tanstack";
import type { MemberRole } from "./team.types";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import ProgressSpinner from "primevue/progressspinner";

const route = useRoute();
const toast = useToast();
const confirm = useConfirm();

const teamId = route.params.teamId as string;
const {
  data: teamData,
  isLoading: teamLoading,
  error: teamError,
  refetch,
} = useTeam(teamId);
const team = computed(() => teamData.value);

const addMember = useAddTeamMember();
const removeMember = useRemoveTeamMember();

const showInviteModal = ref(false);
const inviteEmail = ref("");
const inviteRole = ref<MemberRole>({ role: "member" });
const inviting = ref(false);
const roleOptions = [
  { label: "Member", value: "member" as const },
  { label: "Admin", value: "admin" as const },
];

const handleInvite = async () => {
  if (!inviteEmail.value.trim()) return;
  inviting.value = true;
  try {
    await addMember.mutateAsync({
      teamId,
      data: { email: inviteEmail.value, role: inviteRole.value },
    });
    toast.add({
      severity: "success",
      summary: "Invited",
      detail: `Invited ${inviteEmail.value}`,
      life: 3000,
    });
    showInviteModal.value = false;
    inviteEmail.value = "";
    await refetch();
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.error || "Invite failed",
      life: 4000,
    });
  } finally {
    inviting.value = false;
  }
};

const confirmRemoveMember = (member: any) => {
  confirm.require({
    message: `Remove ${member.name} from the team?`,
    header: "Remove Member",
    accept: async () => {
      try {
        await removeMember.mutateAsync({ teamId, userId: member.userId });
        toast.add({
          severity: "success",
          summary: "Removed",
          detail: `${member.name} removed`,
          life: 3000,
        });
        await refetch();
      } catch (error: any) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: error.response?.data?.error || "Remove failed",
          life: 4000,
        });
      }
    },
  });
};

const capitalizeRole = (role: string) =>
  role.charAt(0).toUpperCase() + role.slice(1);
const getRoleSeverity = (role: string) =>
  ({ owner: "danger", admin: "warning", member: "info" })[role] || "info";
const formatDate = (date: Date | string) => new Date(date).toLocaleDateString();
</script>
