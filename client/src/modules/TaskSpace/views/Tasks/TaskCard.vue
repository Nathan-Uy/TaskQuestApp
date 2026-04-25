<template>
  <div
    class="bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow"
  >
    <div class="flex items-start justify-between gap-2 mb-2">
      <h3 class="text-sm font-medium flex-1">{{ task.title }}</h3>
      <span class="text-xs px-2 py-0.5 rounded-full" :class="priorityClass">{{
        task.priority
      }}</span>
    </div>
    <p v-if="task.description" class="text-xs text-gray-500 mb-2 line-clamp-2">
      {{ task.description }}
    </p>
    <div class="flex items-center justify-between text-xs text-gray-400">
      <div class="flex items-center gap-2">
        <span v-if="task.duration"
          ><i class="pi pi-clock"></i> {{ task.duration }}h</span
        >
      </div>
      <div class="flex gap-1">
        <Button
          icon="pi pi-pencil"
          text
          rounded
          size="small"
          @click.stop="$emit('edit', task)"
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
          size="small"
          @click.stop="$emit('delete', task)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Button from "primevue/button";
import type { Task } from "./tasks.types";

const props = defineProps<{ task: Task }>();
defineEmits<{
  (e: "edit", task: Task): void;
  (e: "delete", task: Task): void;
}>();

const priorityClass = computed(() => {
  const map = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };
  return map[props.task.priority];
});
</script>
