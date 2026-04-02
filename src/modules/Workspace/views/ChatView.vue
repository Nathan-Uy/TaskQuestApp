<template>
  <div class="flex flex-col h-full">
    <!-- Messages -->
    <div class="flex-1 overflow-y-auto mb-4 space-y-3">
      <div
        v-if="!chatStore.loading && messages.length === 0"
        class="flex items-center justify-center h-full"
      >
        <p style="color: var(--ink-muted)">
          No messages yet. Start the conversation!
        </p>
      </div>

      <Card
        v-for="msg in messages"
        :key="msg._id"
        :pt="{
          root: {
            style: {
              background: 'var(--surface-card)',
              border: '1px solid var(--surface-border)',
              borderRadius: '0.75rem',
              boxShadow: 'none',
            },
          },
          body: {
            style: {
              padding: '0.875rem 1rem',
            },
          },
        }"
      >
        <template #content>
          <div class="flex gap-3">
            <!-- Avatar -->
            <Avatar
              :label="msg.displayName.charAt(0).toUpperCase()"
              shape="circle"
              size="normal"
              :style="{
                background: 'var(--accent)',
                color: 'white',
                fontWeight: '600',
              }"
            />

            <!-- Message -->
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="font-semibold text-sm"
                  style="color: var(--ink-primary)"
                >
                  {{ msg.displayName }}
                </span>
                <span class="text-xs" style="color: var(--ink-muted)">
                  {{ formatTime(msg.createdAt) }}
                </span>
              </div>

              <p
                class="text-sm whitespace-pre-wrap"
                style="color: var(--ink-secondary)"
              >
                {{ msg.content }}
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Message Input -->
    <div class="flex gap-2">
      <InputText
        v-model="messageText"
        placeholder="Type a message..."
        class="flex-1 rounded-lg"
        :pt="{
          root: {
            style: {
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--input-text)',
            },
          },
        }"
        @keyup.enter="sendMessage"
      />

      <Button
        label="Send"
        icon="pi pi-send"
        class="rounded-lg font-semibold"
        :style="{
          background: 'var(--accent)',
          border: 'none',
          color: 'white',
        }"
        @click="sendMessage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useWorkspaceChatStore } from "../workspace-chat.store";

// PrimeVue
import Card from "primevue/card";
import Avatar from "primevue/avatar";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

const route = useRoute();
const chatStore = useWorkspaceChatStore();
const { messages } = storeToRefs(chatStore);

const messageText = ref("");
const teamId = route.params.teamId as string;

onMounted(() => {
  if (teamId) {
    chatStore.fetchMessages(teamId);
  }
});

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const sendMessage = async () => {
  if (messageText.value.trim() && teamId) {
    try {
      await chatStore.sendMessage(teamId, messageText.value);
      messageText.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }
};
</script>
