<template>
  <div class="flex flex-col h-full" style="background: var(--surface-bg)">
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1"
    >
      <div
        v-if="chatStore.loading"
        class="flex items-center justify-center h-full"
      >
        <i
          class="pi pi-spinner pi-spin text-xl"
          style="color: var(--ink-muted)"
        />
      </div>

      <div
        v-else-if="safeMessages.length === 0"
        class="flex flex-col items-center justify-center h-full gap-3"
      >
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center"
          style="background: var(--accent-soft)"
        >
          <i class="pi pi-comments text-xl text-(--accent)" />
        </div>
        <p class="text-sm font-medium" style="color: var(--ink-secondary)">
          No messages yet
        </p>
        <p class="text-xs" style="color: var(--ink-muted)">
          Start the conversation!
        </p>
      </div>

      <template v-else>
        <template v-for="(msg, idx) in safeMessages" :key="msg._id || idx">
          <div
            v-if="shouldShowDateSeparator(idx)"
            class="flex items-center gap-3 my-3"
          >
            <div class="flex-1 h-px" style="background: var(--card-border)" />
            <span
              class="text-[0.65rem] font-semibold px-2"
              style="color: var(--ink-muted)"
            >
              {{ formatDateSeparator(msg.createdAt) }}
            </span>
            <div class="flex-1 h-px" style="background: var(--card-border)" />
          </div>

          <ChatMessage
            :message="msg"
            :is-own="msg.userId === authStore.user?._id"
            :show-avatar="shouldShowAvatar(idx)"
            :is-last-in-group="isLastInGroup(idx)"
          />
        </template>
      </template>
    </div>

    <div
      class="px-4 py-3 border-t flex items-center gap-2"
      style="border-color: var(--card-border); background: var(--card-bg)"
    >
      <div
        class="flex-1 flex items-center gap-2 rounded-2xl px-4 py-2.5 border"
        style="background: var(--input-bg); border-color: var(--input-border)"
      >
        <input
          v-model="newMessage"
          placeholder="Type a message..."
          class="flex-1 bg-transparent outline-none text-sm"
          style="color: var(--input-text)"
          @keyup.enter="sendMessage"
        />
      </div>
      <button
        type="button"
        :disabled="!newMessage.trim() || isSending"
        class="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-150 shrink-0 disabled:opacity-40"
        style="background: var(--accent)"
        @click="sendMessage"
      >
        <i class="pi pi-send text-white text-sm" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceChatStore } from "../workspace-chat.store";
import ChatMessage from "./ChatMessage.vue";
import type { ChatMessage as ChatMessageType } from "../workspace.types";

const props = defineProps<{ teamId: string }>();

const authStore = useAuthStore();
const chatStore = useWorkspaceChatStore();
const messagesContainer = ref<HTMLElement>();
const newMessage = ref("");
const isSending = ref(false);

const safeMessages = computed<ChatMessageType[]>(() => {
  const history = chatStore.messageHistory;
  if (!Array.isArray(history)) return [];
  return history
    .filter((msg) => msg && typeof msg === "object")
    .map((msg) => {
      const text = msg.message || msg.content || "";
      const userName = msg.userName || msg.sender || msg.name || "Unknown";
      return {
        _id: msg._id || crypto.randomUUID(),
        userId: msg.userId || "",
        userName,
        sender: userName,
        name: userName,
        message: text,
        content: text,
        createdAt: msg.createdAt || null,
      };
    });
});

const shouldShowAvatar = (index: number) => {
  const msgs = safeMessages.value;
  if (index === 0) return true;
  return msgs[index]?.userId !== msgs[index - 1]?.userId;
};

const isLastInGroup = (index: number) => {
  const msgs = safeMessages.value;
  if (index === msgs.length - 1) return true;
  return msgs[index]?.userId !== msgs[index + 1]?.userId;
};

const shouldShowDateSeparator = (index: number) => {
  if (index === 0) return true;
  const msgs = safeMessages.value;
  const curr = msgs[index]?.createdAt;
  const prev = msgs[index - 1]?.createdAt;
  if (!curr || !prev) return false;
  return new Date(curr).toDateString() !== new Date(prev).toDateString();
};

const formatDateSeparator = (date?: string | Date | null) => {
  if (!date) return "";
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value)
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || isSending.value) return;
  isSending.value = true;
  try {
    await chatStore.sendMessage(props.teamId, newMessage.value.trim());
    newMessage.value = "";
    await scrollToBottom();
  } catch {
    console.error("Failed to send message");
  } finally {
    isSending.value = false;
  }
};

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
</script>
