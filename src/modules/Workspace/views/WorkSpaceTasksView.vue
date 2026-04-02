<template>
  <div class="flex flex-col h-full gap-4">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Sprint Tasks</h2>
      <button
        @click="showCreateTaskModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        + New Task
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="tasksStore.loading"
      class="flex justify-center items-center h-96"
    >
      <p class="text-gray-500">Loading tasks...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="tasksStore.error"
      class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
    >
      {{ tasksStore.error }}
    </div>

    <!-- Kanban Board -->
    <div v-else class="flex gap-6 flex-1 overflow-auto pb-4">
      <!-- Todo Column -->
      <div class="shrink-0 w-80">
        <div class="bg-gray-100 rounded-lg p-4 h-full flex flex-col">
          <h3 class="font-semibold text-gray-800 mb-4">
            📋 To Do
            <span class="text-sm text-gray-600"
              >({{ tasksStore.tasksByStatus.todo.length }})</span
            >
          </h3>
          <div class="space-y-3 flex-1 overflow-y-auto">
            <TaskCard
              v-for="task in tasksStore.tasksByStatus.todo"
              :key="task._id"
              :task="task"
              @update="handleUpdateTask"
              @delete="handleDeleteTask"
            />
          </div>
        </div>
      </div>

      <!-- In Progress Column -->
      <div class="shrink-0 w-80">
        <div class="bg-blue-50 rounded-lg p-4 h-full flex flex-col">
          <h3 class="font-semibold text-blue-800 mb-4">
            🔄 In Progress
            <span class="text-sm text-blue-600"
              >({{ tasksStore.tasksByStatus["in-progress"].length }})</span
            >
          </h3>
          <div class="space-y-3 flex-1 overflow-y-auto">
            <TaskCard
              v-for="task in tasksStore.tasksByStatus['in-progress']"
              :key="task._id"
              :task="task"
              @update="handleUpdateTask"
              @delete="handleDeleteTask"
            />
          </div>
        </div>
      </div>

      <!-- Done Column -->
      <div class="shrink-0 w-80">
        <div class="bg-green-50 rounded-lg p-4 h-full flex flex-col">
          <h3 class="font-semibold text-green-800 mb-4">
            ✅ Done
            <span class="text-sm text-green-600"
              >({{ tasksStore.tasksByStatus.done.length }})</span
            >
          </h3>
          <div class="space-y-3 flex-1 overflow-y-auto">
            <TaskCard
              v-for="task in tasksStore.tasksByStatus.done"
              :key="task._id"
              :task="task"
              @update="handleUpdateTask"
              @delete="handleDeleteTask"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Create Task Modal -->
    <CreateTaskModal
      v-if="showCreateTaskModal"
      :sprint-id="route.params.sprintId as string"
      @close="showCreateTaskModal = false"
      @created="handleTaskCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useWorkspaceTasksStore } from "../workspace-tasks.store";
import TaskCard from "../components/TaskCard.vue";
import CreateTaskModal from "../components/CreateTaskModal.vue";
import type { WorkspaceTask } from "../workspace.types";

const route = useRoute();
const tasksStore = useWorkspaceTasksStore();
const showCreateTaskModal = ref(false);

onMounted(() => {
  const sprintId = route.params.sprintId as string;
  if (sprintId) {
    tasksStore.fetchTasks(sprintId);
  }
});

const handleUpdateTask = async (
  taskId: string,
  updates: Partial<WorkspaceTask>,
) => {
  try {
    await tasksStore.updateTask(taskId, updates);
  } catch (error) {
    console.error("Failed to update task:", error);
  }
};

const handleDeleteTask = async (taskId: string) => {
  if (confirm("Are you sure you want to delete this task?")) {
    try {
      await tasksStore.deleteTask(taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  }
};

const handleTaskCreated = () => {
  showCreateTaskModal.value = false;
};
</script>
