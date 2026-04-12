<template>
  <div class="pl-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-7">
      <div>
        <h1 class="text-3xl font-serif text-stone-800 leading-tight">Goals</h1>
        <p class="text-xs text-stone-400 mt-1">Track what matters most</p>
      </div>

      <Button
        label="New Goal"
        icon="pi pi-plus"
        class="rounded-xl! px-4! py-2.5! text-sm! font-semibold! border-none! bg-(--accent)!"
        @click="openAddGoal"
      />
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3 mb-7">
      <Card class="rounded-xl border border-stone-200 shadow-none">
        <template #content>
          <p class="text-2xl font-serif text-stone-800 leading-none mb-1.5">
            {{ activeGoals.length }}
          </p>
          <p
            class="text-[0.65rem] font-semibold text-stone-400 uppercase tracking-wide"
          >
            Active
          </p>
        </template>
      </Card>

      <Card class="rounded-xl border border-stone-200 shadow-none">
        <template #content>
          <p class="text-2xl font-serif text-stone-800 leading-none mb-1.5">
            {{ completedGoals.length }}
          </p>
          <p
            class="text-[0.65rem] font-semibold text-stone-400 uppercase tracking-wide"
          >
            Completed
          </p>
        </template>
      </Card>

      <Card class="rounded-xl border-0 shadow-none bg-violet-50">
        <template #content>
          <p class="text-2xl font-serif text-violet-600 leading-none mb-1.5">
            +{{ completedGoals.reduce((s, g) => s + g.xpReward, 0) }}
          </p>
          <p
            class="text-[0.65rem] font-semibold text-violet-400 uppercase tracking-wide"
          >
            XP Earned
          </p>
        </template>
      </Card>
    </div>

    <!-- Add Goal Form -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <Card
        v-if="showAddGoal"
        class="rounded-2xl border border-stone-200 shadow-sm mb-6"
      >
        <template #content>
          <p class="text-sm font-semibold text-stone-800 mb-5">New Goal</p>

          <div class="flex flex-col gap-1.5 mb-4">
            <label class="text-xs font-medium text-stone-500">Goal title</label>
            <div class="flex gap-2">
              <InputText
                v-model="form.title"
                placeholder="What do you want to achieve?"
                class="flex-1"
                @keyup.enter="submitGoal"
                autofocus
              />
              <Button
                :label="suggestLoading ? 'Thinking...' : 'AI Improve'"
                :icon="
                  suggestLoading ? 'pi pi-spinner pi-spin' : 'pi pi-sparkles'
                "
                :disabled="!form.title.trim() || suggestLoading"
                severity="secondary"
                class="rounded-lg! text-xs! font-semibold! shrink-0"
                @click="suggestGoal"
              />
            </div>
            <small v-if="suggestError" class="text-red-500">
              {{ suggestError }}
            </small>
          </div>

          <div class="flex flex-col gap-1.5 mb-4">
            <label class="text-xs font-medium text-stone-500">
              Description
              <span class="font-normal text-stone-400">(optional)</span>
            </label>
            <Textarea
              v-model="form.description"
              placeholder="Describe your goal..."
              :rows="2"
              class="w-full resize-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-stone-500"
                >Timeframe</label
              >
              <Select
                v-model="form.timeframe"
                :options="timeframeOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-stone-500"
                >XP Reward</label
              >
              <InputNumber
                v-model="form.xpReward"
                :min="10"
                :max="1000"
                :use-grouping="false"
                class="w-full"
              />
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <Button
              label="Cancel"
              severity="secondary"
              text
              @click="cancelAdd"
            />
            <Button
              label="Add Goal"
              :disabled="!form.title.trim() || isCreating"
              class="bg-(--accent)! border-none! rounded-[10px]! text-sm! font-semibold!"
              @click="submitGoal"
            />
          </div>
        </template>
      </Card>
    </Transition>

    <!-- Active Goals -->
    <section class="mb-8">
      <div class="flex items-center gap-2 mb-3">
        <span
          class="text-[0.68rem] font-semibold uppercase tracking-widest text-stone-400"
        >
          Active
        </span>
        <Tag :value="String(activeGoals.length)" severity="secondary" rounded />
      </div>

      <Message v-if="isLoading" severity="info" class="rounded-2xl mb-3">
        <i class="pi pi-spinner pi-spin mr-2" /> Loading goals...
      </Message>

      <Message
        v-else-if="activeGoals.length === 0"
        severity="secondary"
        class="rounded-2xl mb-3"
      >
        No active goals. Add one above ↑
      </Message>

      <div v-else class="flex flex-col gap-3">
        <Card
          v-for="goal in activeGoals"
          :key="goal._id"
          class="rounded-2xl border border-stone-200 shadow-none hover:shadow-sm transition-all duration-150"
        >
          <template #content>
            <div class="flex items-start gap-3">
              <Button
                icon="pi pi-check"
                rounded
                text
                severity="success"
                class="mt-0.5 shrink-0"
                title="Mark complete"
                @click="completeGoal(goal._id)"
              />

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <p class="text-sm font-semibold text-stone-800">
                    {{ goal.title }}
                  </p>

                  <Tag
                    :value="goal.timeframe"
                    :class="timeframeColor(goal.timeframe)"
                    rounded
                  />

                  <Tag
                    :value="`+${goal.xpReward} XP`"
                    class="bg-violet-50! text-violet-500! border-0!"
                    rounded
                  />
                </div>

                <p v-if="goal.description" class="text-xs text-stone-400 mb-2">
                  {{ goal.description }}
                </p>

                <div class="flex items-center gap-2">
                  <ProgressBar
                    :value="getGoalProgress(goal)"
                    :showValue="false"
                    class="flex-1 h-2"
                  />
                  <span class="text-xs text-stone-400 shrink-0">
                    {{ getGoalProgress(goal) }}%
                  </span>
                </div>

                <p class="text-xs text-stone-400 mt-1.5">
                  {{ goal.linkedTaskIds.length }} task{{
                    goal.linkedTaskIds.length !== 1 ? "s" : ""
                  }}
                  linked
                </p>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <Button
                  :icon="
                    expandedGoalId === goal._id
                      ? 'pi pi-chevron-up'
                      : 'pi pi-link'
                  "
                  text
                  rounded
                  severity="secondary"
                  :title="
                    expandedGoalId === goal._id ? 'Collapse' : 'Link tasks'
                  "
                  @click="toggleExpand(goal._id)"
                />
                <Button
                  icon="pi pi-times"
                  text
                  rounded
                  severity="danger"
                  title="Delete"
                  @click="deleteGoal(goal._id)"
                />
              </div>
            </div>

            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              leave-active-class="transition-all duration-150 ease-in"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div
                v-if="expandedGoalId === goal._id"
                class="border-t border-stone-100 mt-4 pt-4"
              >
                <p
                  class="text-[0.65rem] font-semibold uppercase tracking-widest text-stone-400 mb-3"
                >
                  Link Tasks
                </p>

                <Message
                  v-if="activeTasks.length === 0"
                  severity="secondary"
                  class="rounded-xl"
                >
                  No active tasks available.
                </Message>

                <div v-else class="flex flex-col gap-2">
                  <div
                    v-for="task in activeTasks"
                    :key="task._id"
                    class="flex items-center justify-between rounded-xl px-3 py-2 border border-stone-100 hover:border-stone-200 transition-all duration-150"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <span
                        :class="[
                          'w-1.5 h-1.5 rounded-full shrink-0',
                          task.priority === 'high'
                            ? 'bg-red-400'
                            : task.priority === 'medium'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400',
                        ]"
                      />
                      <p class="text-sm text-stone-700 truncate">
                        {{ task.title }}
                      </p>
                    </div>

                    <Button
                      :label="
                        goal.linkedTaskIds.includes(task._id)
                          ? 'Unlink'
                          : 'Link'
                      "
                      size="small"
                      :severity="
                        goal.linkedTaskIds.includes(task._id)
                          ? 'danger'
                          : 'secondary'
                      "
                      outlined
                      class="rounded-lg!"
                      @click="
                        goal.linkedTaskIds.includes(task._id)
                          ? unlinkTask({ goalId: goal._id, taskId: task._id })
                          : linkTask({ goalId: goal._id, taskId: task._id })
                      "
                    />
                  </div>
                </div>
              </div>
            </Transition>
          </template>
        </Card>
      </div>
    </section>

    <!-- Completed Goals -->
    <section v-if="completedGoals.length > 0" class="mb-8">
      <div class="flex items-center gap-2 mb-3">
        <span
          class="text-[0.68rem] font-semibold uppercase tracking-widest text-emerald-500"
        >
          Completed
        </span>
        <Tag
          :value="String(completedGoals.length)"
          class="bg-emerald-50! text-emerald-600! border-0!"
          rounded
        />
      </div>

      <div class="flex flex-col gap-3">
        <Card
          v-for="goal in completedGoals"
          :key="goal._id"
          class="rounded-2xl border border-stone-100 shadow-none opacity-60"
        >
          <template #content>
            <div class="flex items-center gap-3">
              <div
                class="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center shrink-0"
              >
                <i class="pi pi-check text-white text-[0.5rem]" />
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-stone-800 line-through">
                  {{ goal.title }}
                </p>
                <p class="text-xs text-stone-400 mt-0.5">
                  +{{ goal.xpReward }} XP earned
                </p>
              </div>

              <Tag
                :value="goal.timeframe"
                :class="timeframeColor(goal.timeframe)"
                rounded
              />
            </div>
          </template>
        </Card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import Button from "primevue/button";
import Tag from "primevue/tag";
import ProgressBar from "primevue/progressbar";
import Message from "primevue/message";

import { useGoalsStore } from "./goals.store";
import {
  useGoalForm,
  useGoalFormatters,
  useGoalFilters,
  useGoalProgress,
} from "./goals.composable";
import {
  useGoalsQuery,
  useCreateGoalMutation,
  useCompleteGoalMutation,
  useDeleteGoalMutation,
  useLinkTaskMutation,
  useUnlinkTaskMutation,
} from "./goals.tanstack";
import { useTasksQuery } from "@/modules/Tasks/tasks.tanstack";
import { aiApi } from "@/api/ai.api";

const { data: goals, isLoading } = useGoalsQuery();
const { data: tasks } = useTasksQuery();
const { mutate: completeGoal } = useCompleteGoalMutation();
const { mutate: deleteGoal } = useDeleteGoalMutation();
const { mutate: createGoal, isPending: isCreating } = useCreateGoalMutation();
const { mutate: linkTask } = useLinkTaskMutation();
const { mutate: unlinkTask } = useUnlinkTaskMutation();

const goalsStore = useGoalsStore();
const { showAddGoal, expandedGoalId } = storeToRefs(goalsStore);
const { openAddGoal, closeAddGoal, toggleExpand } = goalsStore;

const { form, resetForm, timeframeOptions } = useGoalForm();
const { timeframeColor } = useGoalFormatters();
const { activeGoals, completedGoals } = useGoalFilters(() => goals.value);
const { getGoalProgress } = useGoalProgress(() => tasks.value);

const activeTasks = computed(
  () => tasks.value?.filter((t) => t.status === "active") ?? [],
);

const suggestLoading = ref(false);
const suggestError = ref("");

const submitGoal = () => {
  if (!form.value.title.trim()) return;
  createGoal({
    title: form.value.title.trim(),
    description: form.value.description || undefined,
    timeframe: form.value.timeframe,
    xpReward: form.value.xpReward,
    deadline: form.value.deadline ?? undefined,
  });
  closeAddGoal();
  resetForm();
};

const cancelAdd = () => {
  closeAddGoal();
  resetForm();
};

const suggestGoal = async () => {
  if (!form.value.title.trim()) return;
  suggestLoading.value = true;
  suggestError.value = "";
  try {
    const result = await aiApi.suggestGoalTitle(form.value.title);
    form.value.title = result.title;
    form.value.description = result.description;
  } catch {
    suggestError.value = "Failed to improve goal. Try again.";
  } finally {
    suggestLoading.value = false;
  }
};
</script>
