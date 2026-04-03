<template>
  <div
    v-if="message && message._id"
    class="flex gap-3"
    :class="{ 'flex-row-reverse': isOwn, 'items-start': true }"
  >
    <!-- Avatar -->
    <Avatar
      v-if="showAvatar"
      :label="getInitials(getSenderName(message))"
      class="shrink-0"
      :style="{
        backgroundColor: getAvatarColor(getUserId(message)),
        color: '#fff',
      }"
    />
    <div v-else class="w-12 shrink-0" />

    <!-- Message Bubble -->
    <div
      class="max-w-xs lg:max-w-md rounded-lg p-3"
      :class="
        isOwn
          ? 'bg-blue-600 text-white rounded-br-none'
          : 'bg-gray-100 text-gray-800 rounded-bl-none'
      "
    >
      <p
        v-if="showAvatar"
        :class="[
          'text-xs font-semibold mb-1',
          isOwn ? 'opacity-70 text-white' : 'text-gray-600',
        ]"
      >
        {{ getSenderName(message) }}
      </p>

      <p class="wrap-break-words">{{ getMessageText(message) }}</p>

      <p v-if="message?.createdAt" class="text-xs mt-1 opacity-70">
        {{ formatTime(message.createdAt) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from "primevue/avatar";
import type { ChatMessage } from "../workspace.types";

interface Props {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
}

const props = defineProps<Props>();

const getSenderName = (msg: any): string => {
  if (!msg) return "Unknown";
  return (
    msg.userName ||
    msg.senderName ||
    msg.user?.name ||
    msg.sender?.name ||
    "Unknown"
  );
};

const getUserId = (msg: any): string => {
  if (!msg) return "unknown";
  return msg.userId || msg.sender?._id || msg.user?._id || "unknown";
};

const getMessageText = (msg: any): string => {
  if (!msg) return "";
  return msg.message || msg.content || "";
};

// ✅ Safe initials – never calls charAt on undefined
const getInitials = (name?: string | null): string => {
  if (!name || typeof name !== "string") return "U";
  const trimmed = name.trim();
  if (trimmed.length === 0) return "U";

  const words = trimmed.split(/\s+/);
  let initials = words
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
  return initials || "U";
};

// ✅ Safe avatar color – never calls charCodeAt on undefined
const getAvatarColor = (userId?: string | null): string => {
  if (!userId || typeof userId !== "string") return "#3b82f6";

  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length] ?? "#3b82f6";
};

const formatTime = (date?: Date | string | null): string => {
  if (!date) return "";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};
</script>
