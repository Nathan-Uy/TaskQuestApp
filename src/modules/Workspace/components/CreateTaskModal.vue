<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 class="text-2xl font-bold mb-4">Create New Task</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task title"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task description"
          />
        </div>

        <!-- Priority -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            v-model="form.priority"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>

        <!-- Due Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Due Date (Optional)
          </label>
          <input
            v-model="form.dueDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"
        >
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 justify-end pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {{ isLoading ? "Creating..." : "Create Task" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useWorkspaceTasksStore } from "../workspace-tasks.store";

interface Props {
  sprintId: string;
}

interface Emits {
  (e: "close"): void;
  (e: "created"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const tasksStore = useWorkspaceTasksStore();

const form = ref({
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
});

const error = ref("");
const isLoading = ref(false);

const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    error.value = "Task title is required";
    return;
  }

  isLoading.value = true;
  error.value = "";

  try {
    await tasksStore.createTask(
      props.sprintId,
      form.value.title,
      form.value.description,
      form.value.priority,
    );

    emit("created");
    emit("close");
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to create task";
  } finally {
    isLoading.value = false;
  }
};
</script>
