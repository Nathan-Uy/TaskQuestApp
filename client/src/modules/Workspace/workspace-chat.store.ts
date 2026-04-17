import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { chatApi } from "./workspace.api";
import type { ChatMessage } from "./workspace.types";

export const useWorkspaceChatStore = defineStore("workspaceChat", () => {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const messageHistory = computed(() => messages.value);

  const normalizeMessage = (msg: any): ChatMessage => {
    const messageText = msg?.message || msg?.content || "";
    const userName =
      msg?.userName ||
      msg?.senderName ||
      msg?.user?.name ||
      msg?.sender?.name ||
      "Unknown";

    return {
      _id: msg?._id || crypto.randomUUID(),
      userId: msg?.userId || msg?.sender?._id || msg?.user?._id || "",
      userName: userName,
      sender: userName,
      name: userName,
      message: messageText,
      content: messageText,
      createdAt: msg?.createdAt || null,
    };
  };

  const fetchMessages = async (teamId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await chatApi.getMessages(teamId);
      messages.value = Array.isArray(data) ? data.map(normalizeMessage) : [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch messages";
    } finally {
      loading.value = false;
    }
  };

  const sendMessage = async (teamId: string, content: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await chatApi.sendMessage(teamId, content);
      const normalized = normalizeMessage(data);
      messages.value.push(normalized);
      return normalized;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to send message";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearMessages = () => {
    messages.value = [];
  };

  return {
    messages,
    messageHistory,
    loading,
    error,
    fetchMessages,
    sendMessage,
    clearMessages,
  };
});
