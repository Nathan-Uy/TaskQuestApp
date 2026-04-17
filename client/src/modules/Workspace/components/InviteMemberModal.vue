<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-medium" style="color: var(--ink-secondary)"
        >Email address</label
      >
      <InputText
        v-model="form.email"
        type="email"
        placeholder="member@example.com"
        class="w-full"
        autofocus
      />
    </div>

    <div
      v-if="error"
      class="text-xs rounded-xl px-3 py-2 bg-red-50 border border-red-100 text-red-500"
    >
      {{ error }}
    </div>

    <div class="flex justify-end gap-2 pt-1">
      <Button
        label="Cancel"
        severity="secondary"
        text
        class="rounded-xl! text-sm!"
        @click="emit('close')"
      />
      <Button
        :label="isLoading ? 'Sending...' : 'Send Invitation'"
        :loading="isLoading"
        :disabled="!form.email.trim() || isLoading"
        type="submit"
        class="bg-(--accent)! border-none! rounded-xl! text-sm! font-semibold!"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { useWorkspaceTeamsStore } from "../workspace-team.store";

const props = defineProps<{ teamId: string }>();
const emit = defineEmits<{ close: []; invited: [] }>();

const teamsStore = useWorkspaceTeamsStore();
const form = ref({ email: "" });
const isLoading = ref(false);
const error = ref("");

const handleSubmit = async () => {
  if (!form.value.email.trim()) {
    error.value = "Email is required";
    return;
  }
  isLoading.value = true;
  error.value = "";
  try {
    await teamsStore.inviteMember(props.teamId, form.value.email.trim());
    emit("invited");
    emit("close");
  } catch (e: any) {
    error.value =
      e?.response?.data?.error || e?.message || "Failed to invite member";
  } finally {
    isLoading.value = false;
  }
};
</script>
