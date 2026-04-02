import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { chatApi } from "./workspace.api";
import type { ChatMessage } from "./workspace.types";

export const useWorkspaceChatStore = defineStore("workspaceChat", () => {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const messageHistory = computed(() => messages.value);

  const fetchMessages = async (teamId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await chatApi.getMessages(teamId);
      messages.value = data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch messages";
    } finally {
      loading.value = false;
    }
  };

  const sendMessage = async (teamId: string, content: string) => {
    try {
      const { data } = await chatApi.sendMessage(teamId, content);
      messages.value.push(data);
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to send message";
      throw err;
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
