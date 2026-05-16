<template>
  <div class="flex flex-col h-full gap-4">
    <div class="flex justify-between items-center">
      <h2
        style="
          font-size: 1.75rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: var(--ink-primary);
          margin: 0;
        "
      >
        Team Members
      </h2>
      <Button
        label="+ Invite Member"
        style="font-weight: 800"
        @click="showInviteModal = true"
      />
    </div>

    <div v-if="teamLoading" class="flex justify-center py-8">
      <ProgressSpinner />
    </div>
    <div
      v-else-if="teamError"
      style="
        color: var(--danger);
        font-weight: 700;
        padding: 1rem;
        border: 2px solid var(--danger);
        background: var(--danger-soft);
      "
    >
      Failed to load team.
    </div>

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
          <span
            :style="{
              fontSize: '0.65rem',
              fontWeight: '800',
              padding: '3px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              border: '1.5px solid currentColor',
              color:
                data.role === 'owner'
                  ? 'var(--danger)'
                  : data.role === 'admin'
                    ? 'var(--warning)'
                    : 'var(--xp)',
              background:
                data.role === 'owner'
                  ? 'var(--danger-soft)'
                  : data.role === 'admin'
                    ? 'var(--warning-soft)'
                    : 'var(--xp-soft)',
            }"
          >
            {{ capitalizeRole(data.role) }}
          </span>
        </template>
      </Column>
      <Column field="joinedAt" header="Joined">
        <template #body="{ data }">
          <span
            style="
              font-size: 0.8rem;
              font-weight: 600;
              color: var(--ink-secondary);
            "
          >
            {{ formatDate(data.joinedAt) }}
          </span>
        </template>
      </Column>
      <Column field="inviteStatus" header="Status">
        <template #body="{ data }">
          <span
            :style="{
              fontSize: '0.65rem',
              fontWeight: '800',
              padding: '3px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              border: '1.5px solid currentColor',
              color:
                data.inviteStatus === 'pending'
                  ? 'var(--warning)'
                  : 'var(--success)',
              background:
                data.inviteStatus === 'pending'
                  ? 'var(--warning-soft)'
                  : 'var(--success-soft)',
            }"
          >
            {{ data.inviteStatus === "pending" ? "Pending" : "Active" }}
          </span>
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
          />
          <span
            v-else-if="data.inviteStatus === 'pending'"
            style="
              font-size: 0.75rem;
              color: var(--ink-muted);
              font-weight: 600;
            "
          >
            Waiting...
          </span>
        </template>
      </Column>
    </DataTable>

    <!-- Invite Modal -->
    <Dialog
      v-model:visible="showInviteModal"
      header="Invite Member"
      :modal="true"
      class="w-full max-w-md"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label
            for="email"
            style="
              font-size: 0.7rem;
              font-weight: 800;
              color: var(--ink-primary);
              text-transform: uppercase;
              letter-spacing: 0.08em;
            "
          >
            Email Address *
          </label>
          <InputText
            v-model="inviteEmail"
            type="email"
            class="w-full"
            placeholder="member@example.com"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label
            for="role"
            style="
              font-size: 0.7rem;
              font-weight: 800;
              color: var(--ink-primary);
              text-transform: uppercase;
              letter-spacing: 0.08em;
            "
          >
            Role
          </label>
          <Select
            v-model="inviteRole"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
        <p
          v-if="inviteError"
          style="
            font-size: 0.75rem;
            color: var(--danger);
            font-weight: 700;
            background: var(--danger-soft);
            border: 1.5px solid var(--danger);
            padding: 8px 12px;
            margin: 0;
          "
        >
          {{ inviteError }}
        </p>
        <div
          style="
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            border-top: 2px solid var(--surface-muted);
            padding-top: 16px;
          "
        >
          <Button
            label="Cancel"
            severity="secondary"
            text
            @click="showInviteModal = false"
          />
          <Button
            label="Send Invitation"
            :loading="inviting"
            style="background: var(--accent); color: #fff; font-weight: 800"
            @click="handleInvite"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { useTeam, useRemoveTeamMember } from "./team.tanstack";
import { useAddMember } from "../Project/project.tanstack";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
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
const projectId = computed(() => teamData.value?.projectId ?? "");

const addMemberMutation = useAddMember();
const removeMember = useRemoveTeamMember();

const showInviteModal = ref(false);
const inviteEmail = ref("");
const inviteRole = ref<"member" | "admin">("member");
const inviteError = ref("");
const inviting = ref(false);

const roleOptions = [
  { label: "Member", value: "member" as const },
  { label: "Admin", value: "admin" as const },
];

const handleInvite = async () => {
  if (!inviteEmail.value.trim()) return;
  if (!projectId.value) {
    toast.add({
      severity: "error",
      summary: "Project not found",
      detail: "Could not resolve project ID.",
      life: 3000,
    });
    return;
  }
  inviting.value = true;
  inviteError.value = "";
  try {
    await addMemberMutation.mutateAsync({
      projectId: projectId.value,
      data: { email: inviteEmail.value.trim(), role: inviteRole.value },
    });
    toast.add({
      severity: "success",
      summary: "Invitation Sent",
      detail: `Invited ${inviteEmail.value}`,
      life: 3000,
    });
    showInviteModal.value = false;
    inviteEmail.value = "";
    inviteRole.value = "member";
  } catch (error: any) {
    inviteError.value = error.response?.data?.error ?? "Invite failed";
    toast.add({
      severity: "error",
      summary: "Error",
      detail: inviteError.value,
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
          detail: error.response?.data?.error ?? "Remove failed",
          life: 4000,
        });
      }
    },
  });
};

const capitalizeRole = (role: string) =>
  role.charAt(0).toUpperCase() + role.slice(1);
const formatDate = (date: Date | string) => new Date(date).toLocaleDateString();
</script>
