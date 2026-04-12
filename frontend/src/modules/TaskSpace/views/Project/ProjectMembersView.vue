<template>
  <div class="flex flex-col h-full gap-4">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Project Members</h2>
      <Button
        v-if="isOwnerOrAdmin"
        @click="showInviteModal = true"
        label="+ Invite Member"
        icon="pi pi-plus"
      />
    </div>

    <div v-if="projectLoading" class="flex justify-center py-8">
      <ProgressSpinner />
    </div>

    <div v-else-if="projectError" class="text-red-500 text-center py-8">
      Failed to load project.
    </div>

    <DataTable
      v-else
      :value="project?.members || []"
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
        <template #body="{ data }">
          {{ formatDate(data.joinedAt) }}
        </template>
      </Column>
      <Column header="Actions" v-if="isOwnerOrAdmin">
        <template #body="{ data }">
          <div class="flex gap-1">
            <Button
              v-if="data.role !== 'owner'"
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
              placeholder="member@example.com"
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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { useProject, useAddMember, useRemoveMember } from "./project.tanstack";
import {} from "./project.tanstack";
import type { Project, ProjectMember } from "./project.types";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import ProgressSpinner from "primevue/progressspinner";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const projectId = route.params.projectId as string;

const {
  data: projectData,
  isLoading: projectLoading,
  error: projectError,
  refetch,
} = useProject(projectId);
const project = computed(() => projectData.value);

const currentUserId = localStorage.getItem("userId") || ""; // adjust to your auth store
const isOwnerOrAdmin = computed(() => {
  if (!project.value) return false;
  if (project.value.owner === currentUserId) return true;
  return project.value.members.some(
    (m) => m.userId === currentUserId && m.role === "admin",
  );
});

const showInviteModal = ref(false);
const inviteEmail = ref("");
const inviteRole = ref("member");
const inviting = ref(false);
const roleOptions = [
  { label: "Member", value: "member" },
  { label: "Admin", value: "admin" },
];

const addMemberMutation = useAddMember();
const removeMemberMutation = useRemoveMember();

const handleInvite = async () => {
  if (!inviteEmail.value.trim()) return;
  inviting.value = true;
  try {
    await addMemberMutation.mutateAsync({
      projectId,
      data: { email: inviteEmail.value.trim(), role: inviteRole.value as any },
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
    await refetch();
  } catch (error: any) {
    const msg = error.response?.data?.error || "Failed to invite member";
    toast.add({ severity: "error", summary: "Error", detail: msg, life: 4000 });
  } finally {
    inviting.value = false;
  }
};

const confirmRemoveMember = (member: ProjectMember) => {
  confirm.require({
    message: `Remove ${member.name} from the project?`,
    header: "Remove Member",
    icon: "pi pi-exclamation-triangle",
    accept: async () => {
      try {
        await removeMemberMutation.mutateAsync({
          projectId,
          userId: member.userId,
        });
        toast.add({
          severity: "success",
          summary: "Member Removed",
          detail: `${member.name} removed`,
          life: 3000,
        });
        await refetch();
      } catch (error: any) {
        const msg = error.response?.data?.error || "Failed to remove member";
        toast.add({
          severity: "error",
          summary: "Error",
          detail: msg,
          life: 4000,
        });
      }
    },
  });
};

const capitalizeRole = (role: string) =>
  role.charAt(0).toUpperCase() + role.slice(1);
const getRoleSeverity = (role: string) => {
  const map: Record<string, string> = {
    owner: "danger",
    admin: "warning",
    member: "info",
  };
  return map[role] || "info";
};
const formatDate = (date: Date | string) => new Date(date).toLocaleDateString();
</script>
