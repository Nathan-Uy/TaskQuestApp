<template>
  <div class="max-w-full">
    <!-- Page Header -->
    <div class="flex items-end justify-between mb-7">
      <div>
        <h1 class="text-4xl text-stone-800 font-serif">Tasks</h1>
        <p class="text-sm text-stone-400 mt-1">{{ today }}</p>
      </div>
      <Button label="New Task" icon="pi pi-plus" @click="showAddTask = true" />
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-4 gap-3 mb-7">
      <Card class="shadow-none! border border-stone-200 rounded-xl!">
        <template #content>
          <span
            class="block text-2xl text-stone-800 font-serif leading-none mb-1"
            >{{ activeTasks.length }}</span
          >
          <span
            class="text-xs font-medium text-stone-400 uppercase tracking-wide"
            >Active</span
          >
        </template>
      </Card>
      <Card class="shadow-none! border border-stone-200 rounded-xl!">
        <template #content>
          <span
            class="block text-2xl text-stone-800 font-serif leading-none mb-1"
            >{{ completedToday.length }}</span
          >
          <span
            class="text-xs font-medium text-stone-400 uppercase tracking-wide"
            >Done Today</span
          >
        </template>
      </Card>
      <Card class="shadow-none! border border-stone-200 rounded-xl!">
        <template #content>
          <span
            class="block text-2xl text-stone-800 font-serif leading-none mb-1"
            >{{ profile.tasksCompleted }}</span
          >
          <span
            class="text-xs font-medium text-stone-400 uppercase tracking-wide"
            >All Time</span
          >
        </template>
      </Card>
      <Card class="shadow-none! bg-violet-50! border-0 rounded-xl!">
        <template #content>
          <span
            class="block text-2xl text-violet-600 font-serif leading-none mb-1"
            >+{{ completedToday.reduce((s, t) => s + t.xpReward, 0) }}</span
          >
          <span
            class="text-xs font-medium text-violet-400 uppercase tracking-wide"
            >XP Today</span
          >
        </template>
      </Card>
    </div>

    <!-- Add Task Panel -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <Card
        v-if="showAddTask"
        class="shadow-sm! border border-stone-200 rounded-xl! mb-7"
      >
        <template #content>
          <p class="text-base font-medium text-stone-800 mb-5">New Task</p>

          <div class="flex flex-col gap-1.5 mb-4">
            <label class="text-xs font-medium text-stone-500">Task name</label>
            <InputText
              v-model="form.title"
              placeholder="What needs to be done?"
              class="w-full"
              @keyup.enter="submitTask"
              autofocus
            />
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-stone-500">Priority</label>
              <Select
                v-model="form.priority"
                :options="priorityOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-stone-500">Duration</label>
              <div class="grid grid-cols-3 gap-2">
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

          <div class="flex flex-col gap-1.5 mb-5">
            <label class="text-xs font-medium text-stone-500">
              Notes <span class="font-normal text-stone-400">(optional)</span>
            </label>
            <Textarea
              v-model="form.notes"
              placeholder="Any details..."
              :rows="2"
              class="w-full resize-none"
            />
          </div>

          <div class="flex justify-end gap-2">
            <Button
              label="Cancel"
              severity="secondary"
              text
              @click="cancelAdd"
            />
            <Button
              label="Add Task"
              :disabled="!form.title.trim()"
              @click="submitTask"
            />
          </div>
        </template>
      </Card>
    </Transition>

    <!-- Active Tasks -->
    <section class="mb-9">
      <div class="flex items-center gap-2 mb-3">
        <span
          class="text-xs font-semibold uppercase tracking-widest text-stone-400"
          >Active</span
        >
        <Badge :value="activeTasks.length" severity="secondary" />
      </div>

      <div v-if="activeTasks.length === 0">
        <Card
          class="shadow-none! border border-dashed border-stone-200 rounded-xl!"
        >
          <template #content>
            <p class="text-center text-sm text-stone-400 py-4">
              No active tasks. Add one above ↑
            </p>
          </template>
        </Card>
      </div>

      <div v-else class="flex flex-col gap-2">
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
    <section v-if="completedToday.length > 0" class="mb-9">
      <div class="flex items-center gap-2 mb-3">
        <span
          class="text-xs font-semibold uppercase tracking-widest text-emerald-500"
          >Completed Today</span
        >
        <Badge :value="completedToday.length" severity="success" />
      </div>
      <div class="flex flex-col gap-2">
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
import Card from "primevue/card";
import Badge from "primevue/badge";
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
