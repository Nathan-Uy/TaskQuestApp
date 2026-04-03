<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Email -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Email Address *
      </label>
      <InputText
        v-model="form.email"
        type="email"
        placeholder="member@example.com"
        class="w-full"
      />
    </div>

    <!-- Error Message -->
    <Message v-if="error" severity="error" :text="error" />

    <!-- Success Message -->
    <Message
      v-if="success"
      severity="success"
      text="Invitation sent successfully!"
    />

    <!-- Buttons -->
    <div class="flex gap-3 justify-end pt-4">
      <Button
        type="button"
        @click="$emit('close')"
        label="Cancel"
        severity="secondary"
      />
      <Button
        type="submit"
        :label="isLoading ? 'Inviting...' : 'Send Invitation'"
        :loading="isLoading"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Message from "primevue/message";
import { useWorkspaceTeamsStore } from "../workspace-team.store";

interface Props {
  teamId: string;
}

interface Emits {
  (e: "close"): void;
  (e: "invited"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const teamsStore = useWorkspaceTeamsStore();

const form = ref({
  email: "",
});

const error = ref("");
const success = ref(false);
const isLoading = ref(false);

const handleSubmit = async () => {
  if (!form.value.email.trim()) {
    error.value = "Email is required";
    return;
  }

  isLoading.value = true;
  error.value = "";
  success.value = false;

  try {
    await teamsStore.inviteMember(props.teamId, form.value.email);
    success.value = true;
    setTimeout(() => {
      emit("invited");
      emit("close");
    }, 1500);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Failed to invite member";
  } finally {
    isLoading.value = false;
  }
};
</script>
