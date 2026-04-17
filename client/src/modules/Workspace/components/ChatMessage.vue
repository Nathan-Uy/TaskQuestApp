<template>
  <div
    v-if="message?._id"
    class="flex gap-2"
    :class="[
      isOwn ? 'flex-row-reverse' : 'flex-row',
      isLastInGroup ? 'mb-3' : 'mb-0.5',
    ]"
  >
    <div class="shrink-0 w-8">
      <div
        v-if="showAvatar && !isOwn"
        class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
        :style="{ background: getAvatarColor(message.userId) }"
      >
        {{ getInitials(getSenderName(message)) }}
      </div>
    </div>

    <div
      class="flex flex-col max-w-[65%]"
      :class="isOwn ? 'items-end' : 'items-start'"
    >
      <div
        v-if="showAvatar && !isOwn"
        class="text-[0.7rem] font-semibold mb-1 px-1"
        style="color: var(--ink-secondary)"
      >
        {{ getSenderName(message) }}
      </div>

      <div
        class="flex items-end gap-1.5"
        :class="isOwn ? 'flex-row-reverse' : 'flex-row'"
      >
        <div
          class="px-3.5 py-2 text-sm leading-relaxed"
          :class="[
            isOwn ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm',
          ]"
          :style="
            isOwn
              ? { background: 'var(--accent)', color: 'white' }
              : {
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--ink-primary)',
                }
          "
        >
          {{ getMessageText(message) }}
        </div>
        <span
          v-if="isLastInGroup"
          class="text-[0.6rem] shrink-0 mb-0.5"
          style="color: var(--ink-muted)"
        >
          {{ formatTime(message.createdAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from "../workspace.types";

defineProps<{
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  isLastInGroup: boolean;
}>();

const getSenderName = (msg: any): string =>
  msg?.userName || msg?.senderName || msg?.user?.name || "Unknown";
const getMessageText = (msg: any): string => msg?.message || msg?.content || "";

const getInitials = (name?: string | null): string => {
  if (!name?.trim()) return "U";
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "U"
  );
};

const getAvatarColor = (userId?: string | null): string => {
  if (!userId) return "var(--accent)";
  const colors = [
    "#c2622a",
    "#0077b6",
    "#2d7a4f",
    "#7c5cbf",
    "#be3455",
    "#a07620",
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++)
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length] ?? "var(--accent)";
};

const formatTime = (date?: Date | string | null): string => {
  if (!date) return "";
  try {
    const d = new Date(date);
    return isNaN(d.getTime())
      ? ""
      : d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};
</script>
