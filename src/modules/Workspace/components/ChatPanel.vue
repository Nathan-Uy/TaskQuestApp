<template>
  <Card class="flex flex-col h-full">
    <!-- Messages Container -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
      <ProgressSpinner v-if="chatStore.loading" />

      <div
        v-else-if="safeMessages.length === 0"
        class="flex items-center justify-center h-full text-gray-500"
      >
        <p>No messages yet. Start the conversation!</p>
      </div>

      <div v-else class="space-y-3">
        <ChatMessage
          v-for="(msg, idx) in safeMessages"
          :key="msg._id || idx"
          :message="msg"
          :is-own="msg.userId === authStore.user?._id"
          :show-avatar="shouldShowAvatar(idx)"
        />
      </div>
    </div>

    <Divider />
    <ChatInput :team-id="teamId" @message-sent="scrollToBottom" />
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from "vue";
import Card from "primevue/card";
import Divider from "primevue/divider";
import ProgressSpinner from "primevue/progressspinner";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceChatStore } from "../workspace-chat.store";
import ChatMessage from "./ChatMessage.vue";
import ChatInput from "./ChatInput.vue";
import type { ChatMessage as ChatMessageType } from "../workspace.types";

interface Props {
  teamId: string;
}

const props = defineProps<Props>();
const authStore = useAuthStore();
const chatStore = useWorkspaceChatStore();
const messagesContainer = ref<HTMLElement>();

// ✅ Ultra‑safe normalization – every field is guaranteed a string
const safeMessages = computed<ChatMessageType[]>(() => {
  const history = chatStore.messageHistory;
  if (!Array.isArray(history)) return [];

  return history
    .filter((msg) => msg && typeof msg === "object")
    .map((msg) => {
      const messageText = msg.message || msg.content || "";
      const userName = msg.userName || msg.sender || msg.name || "Unknown";
      return {
        _id: msg._id || crypto.randomUUID(),
        userId: msg.userId || "",
        userName: userName,
        sender: userName,
        name: userName,
        message: messageText,
        content: messageText,
        createdAt: msg.createdAt || null,
      };
    });
});

watch(
  () => safeMessages.value.length,
  () => scrollToBottom(),
  { flush: "post" },
);

onMounted(async () => {
  if (!props.teamId) return;
  await chatStore.fetchMessages(props.teamId);
  await nextTick();
  scrollToBottom();
});

const shouldShowAvatar = (index: number) => {
  const messages = safeMessages.value;
  if (messages.length <= 1) return true;
  const current = messages[index];
  const previous = messages[index - 1];
  if (!current || !previous) return true;
  return current.userId !== previous.userId;
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};
</script>
