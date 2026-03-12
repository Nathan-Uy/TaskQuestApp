<template>
  <div class="flex flex-col pl-8">
    <!-- Page Header -->
    <div class="flex items-center justify-between" style="margin-bottom: 28px">
      <div>
        <h1
          class="font-serif text-stone-800"
          style="font-size: 2rem; line-height: 1.1"
        >
          Tasks
        </h1>
        <p class="text-stone-400" style="font-size: 0.8rem; margin-top: 4px">
          {{ today }}
        </p>
      </div>
      <Button
        label="New Task"
        icon="pi pi-plus"
        class="bg-(--accent)! hover:bg---accent-hover)! border-none! rounded-[10px]! text-sm! font-semibold! shadow-sm! hover:shadow-md! hover:-translate-y-px! transition-all! duration-150!"
        @click="showAddTask = true"
      />
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-4 gap-3" style="margin-bottom: 28px">
      <div
        class="bg-white border border-stone-200 rounded-2xl"
        style="padding: 16px 18px"
      >
        <p
          class="font-serif text-stone-800"
          style="font-size: 1.75rem; line-height: 1; margin-bottom: 6px"
        >
          {{ activeTasks.length }}
        </p>
        <p
          class="text-stone-400 font-semibold uppercase tracking-wide"
          style="font-size: 0.65rem"
        >
          Active
        </p>
      </div>
      <div
        class="bg-white border border-stone-200 rounded-2xl"
        style="padding: 16px 18px"
      >
        <p
          class="font-serif text-stone-800"
          style="font-size: 1.75rem; line-height: 1; margin-bottom: 6px"
        >
          {{ completedToday.length }}
        </p>
        <p
          class="text-stone-400 font-semibold uppercase tracking-wide"
          style="font-size: 0.65rem"
        >
          Done Today
        </p>
      </div>
      <div
        class="bg-white border border-stone-200 rounded-2xl"
        style="padding: 16px 18px"
      >
        <p
          class="font-serif text-stone-800"
          style="font-size: 1.75rem; line-height: 1; margin-bottom: 6px"
        >
          {{ profile.tasksCompleted }}
        </p>
        <p
          class="text-stone-400 font-semibold uppercase tracking-wide"
          style="font-size: 0.65rem"
        >
          All Time
        </p>
      </div>
      <div
        class="rounded-2xl"
        style="padding: 16px 18px; background: var(--xp-soft)"
      >
        <p
          class="font-serif"
          style="
            font-size: 1.75rem;
            line-height: 1;
            margin-bottom: 6px;
            color: var(--xp);
          "
        >
          +{{ completedToday.reduce((s, t) => s + t.xpReward, 0) }}
        </p>
        <p
          class="font-semibold uppercase tracking-wide"
          style="font-size: 0.65rem; color: var(--xp); opacity: 0.7"
        >
          XP Today
        </p>
      </div>
    </div>

    <!-- Add Task Panel -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="showAddTask"
        class="bg-white border border-stone-200 rounded-2xl"
        style="
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(26, 23, 20, 0.08);
        "
      >
        <p
          class="font-semibold text-stone-800"
          style="font-size: 0.95rem; margin-bottom: 20px"
        >
          New Task
        </p>

        <div class="flex flex-col" style="gap: 6px; margin-bottom: 16px">
          <label class="text-stone-500 font-medium" style="font-size: 0.75rem"
            >Task name</label
          >
          <InputText
            v-model="form.title"
            placeholder="What needs to be done?"
            class="w-full"
            @keyup.enter="submitTask"
            autofocus
          />
        </div>

        <div class="grid grid-cols-2" style="gap: 16px; margin-bottom: 16px">
          <div class="flex flex-col" style="gap: 6px">
            <label class="text-stone-500 font-medium" style="font-size: 0.75rem"
              >Priority</label
            >
            <Select
              v-model="form.priority"
              :options="priorityOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>
          <div class="flex flex-col" style="gap: 6px">
            <label class="text-stone-500 font-medium" style="font-size: 0.75rem"
              >Duration</label
            >
            <div class="grid grid-cols-3" style="gap: 8px">
              <InputNumber
                v-model="form.hours"
                :min="0"
                :use-grouping="false"
                placeholder="0h"
                class="w-full"
                input-class="w-full text-center"
              />
              <InputNumber
                v-model="form.minutes"
                :min="0"
                :max="59"
                :use-grouping="false"
                placeholder="25m"
                class="w-full"
                input-class="w-full text-center"
              />
              <InputNumber
                v-model="form.seconds"
                :min="0"
                :max="59"
                :use-grouping="false"
                placeholder="0s"
                class="w-full"
                input-class="w-full text-center"
              />
            </div>
          </div>
        </div>

        <div class="flex flex-col" style="gap: 6px; margin-bottom: 20px">
          <label class="text-stone-500 font-medium" style="font-size: 0.75rem">
            Notes <span class="font-normal text-stone-400">(optional)</span>
          </label>
          <Textarea
            v-model="form.notes"
            placeholder="Any details..."
            :rows="2"
            class="w-full resize-none"
          />
        </div>

        <div class="flex justify-end" style="gap: 8px">
          <Button label="Cancel" severity="secondary" text @click="cancelAdd" />
          <Button
            label="Add Task"
            :disabled="!form.title.trim()"
            class="bg-(--accent)! hover:bg-(--accent-hover)! border-none! rounded-[10px]! text-sm! font-semibold! shadow-sm! hover:shadow-md! hover:-translate-y-px! transition-all! duration-150!"
            @click="submitTask"
          />
        </div>
      </div>
    </Transition>

    <!-- Active Tasks -->
    <section style="margin-bottom: 32px">
      <div class="flex items-center" style="gap: 8px; margin-bottom: 12px">
        <span
          class="text-stone-400 font-semibold uppercase tracking-widest"
          style="font-size: 0.68rem"
          >Active</span
        >
        <span
          class="font-semibold rounded-full"
          style="
            background: var(--surface-muted);
            color: var(--ink-secondary);
            font-size: 0.7rem;
            padding: 1px 8px;
          "
          >{{ activeTasks.length }}</span
        >
      </div>
      <div
        v-if="activeTasks.length === 0"
        class="bg-white border border-dashed border-stone-200 rounded-2xl text-center text-stone-400"
        style="padding: 40px; font-size: 0.875rem"
      >
        No active tasks. Add one above ↑
      </div>
      <div v-else class="flex flex-col" style="gap: 8px">
        <TaskCard
          v-for="task in activeTasks"
          :key="task.id"
          :task="task"
          @complete="tasksStore.completeTask"
          @delete="tasksStore.deleteTask"
        />
      </div>
    </section>

    <!-- Completed Today -->
    <section v-if="completedToday.length > 0" style="margin-bottom: 32px">
      <div class="flex items-center" style="gap: 8px; margin-bottom: 12px">
        <span
          class="font-semibold uppercase tracking-widest"
          style="font-size: 0.68rem; color: var(--success)"
          >Completed Today</span
        >
        <span
          class="font-semibold rounded-full"
          style="
            background: var(--success-soft);
            color: var(--success);
            font-size: 0.7rem;
            padding: 1px 8px;
          "
          >{{ completedToday.length }}</span
        >
      </div>
      <div class="flex flex-col" style="gap: 8px">
        <TaskCard
          v-for="task in completedToday"
          :key="task.id"
          :task="task"
          :readonly="true"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import { useTasksStore } from "@/modules/Tasks/tasks.store";
import { useGamificationStore } from "@/components/sidebar.store";
import { useTasksComposable } from "@/modules/Tasks/tasks.composable";
import TaskCard from "@/modules/Tasks/TasksCard.vue";

const tasksStore = useTasksStore();
const { activeTasks, completedToday } = storeToRefs(tasksStore);
const { profile } = storeToRefs(useGamificationStore());
const { today, priorityOptions, showAddTask, form, submitTask, cancelAdd } =
  useTasksComposable();
</script>
