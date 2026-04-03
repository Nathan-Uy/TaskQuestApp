<template>
  <form @submit.prevent="handleSend" class="flex gap-2 p-4">
    <InputText
      v-model="message"
      type="text"
      placeholder="Type a message..."
      class="flex-1"
      maxlength="500"
    />
    <Button
      type="submit"
      :disabled="!message.trim() || isLoading"
      :loading="isLoading"
      icon="pi pi-send"
    />
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { useWorkspaceChatStore } from "../workspace-chat.store";

interface Props {
  teamId: string;
}

interface Emits {
  (e: "message-sent"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const chatStore = useWorkspaceChatStore();

const message = ref("");
const isLoading = ref(false);

const handleSend = async () => {
  if (!message.value.trim()) return;

  isLoading.value = true;
  try {
    await chatStore.sendMessage(props.teamId, message.value);
    message.value = "";
    emit("message-sent");
  } catch (error) {
    console.error("Failed to send message:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>
