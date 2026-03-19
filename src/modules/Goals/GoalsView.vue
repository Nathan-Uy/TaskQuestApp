<template>
  <div class="pl-8">
    <div class="flex items-center justify-between mb-7">
      <div>
        <h1 class="text-3xl font-serif text-stone-800 leading-tight">Goals</h1>
        <p class="text-xs text-stone-400 mt-1">Track what matters most</p>
      </div>
      <button
        class="inline-flex items-center gap-2 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-all duration-150 hover:-translate-y-px shadow-sm hover:shadow-md bg-(--accent)"
        @click="openAddGoal"
      >
        <i class="pi pi-plus text-xs" />
        New Goal
      </button>
    </div>

    <div class="grid grid-cols-3 gap-3 mb-7">
      <div class="bg-white border border-stone-200 rounded-xl p-4">
        <p class="text-2xl font-serif text-stone-800 leading-none mb-1.5">
          {{ activeGoals.length }}
        </p>
        <p
          class="text-[0.65rem] font-semibold text-stone-400 uppercase tracking-wide"
        >
          Active
        </p>
      </div>
      <div class="bg-white border border-stone-200 rounded-xl p-4">
        <p class="text-2xl font-serif text-stone-800 leading-none mb-1.5">
          {{ completedGoals.length }}
        </p>
        <p
          class="text-[0.65rem] font-semibold text-stone-400 uppercase tracking-wide"
        >
          Completed
        </p>
      </div>
      <div class="rounded-xl p-4 bg-violet-50">
        <p class="text-2xl font-serif text-violet-600 leading-none mb-1.5">
          +{{ completedGoals.reduce((s, g) => s + g.xpReward, 0) }}
        </p>
        <p
          class="text-[0.65rem] font-semibold text-violet-400 uppercase tracking-wide"
        >
          XP Earned
        </p>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="showAddGoal"
        class="bg-white border border-stone-200 rounded-2xl p-6 mb-6 shadow-sm"
      >
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
            <button
              :disabled="!form.title.trim() || suggestLoading"
              class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed bg-(--accent-soft) text-(--accent) hover:bg-(--accent) hover:text-white shrink-0"
              title="Improve goal with AI"
              @click="suggestGoal"
            >
              <i
                :class="[
                  'pi text-xs',
                  suggestLoading ? 'pi-spinner pi-spin' : 'pi-sparkles',
                ]"
              />
              {{ suggestLoading ? "Thinking..." : "AI Improve" }}
            </button>
          </div>
          <p v-if="suggestError" class="text-xs text-red-500 mt-1">
            {{ suggestError }}
          </p>
        </div>

        <div class="flex flex-col gap-1.5 mb-4">
          <label class="text-xs font-medium text-stone-500"
            >Description
            <span class="font-normal text-stone-400">(optional)</span></label
          >
          <Textarea
            v-model="form.description"
            placeholder="Describe your goal..."
            :rows="2"
            class="w-full resize-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-stone-500">Timeframe</label>
            <Select
              v-model="form.timeframe"
              :options="timeframeOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-stone-500">XP Reward</label>
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
          <Button label="Cancel" severity="secondary" text @click="cancelAdd" />
          <Button
            label="Add Goal"
            :disabled="!form.title.trim() || isCreating"
            class="bg-(--accent)! border-none! rounded-[10px]! text-sm! font-semibold!"
            @click="submitGoal"
          />
        </div>
      </div>
    </Transition>

    <section class="mb-8">
      <div class="flex items-center gap-2 mb-3">
        <span
          class="text-[0.68rem] font-semibold uppercase tracking-widest text-stone-400"
          >Active</span
        >
        <span
          class="bg-stone-100 text-stone-500 text-xs font-medium px-2 py-0.5 rounded-full"
          >{{ activeGoals.length }}</span
        >
      </div>

      <div
        v-if="isLoading"
        class="bg-white border border-stone-200 rounded-2xl p-10 text-center text-sm text-stone-400"
      >
        <i class="pi pi-spinner pi-spin mr-2" />Loading goals...
      </div>
      <div
        v-else-if="activeGoals.length === 0"
        class="bg-white border border-dashed border-stone-200 rounded-2xl p-10 text-center text-sm text-stone-400"
      >
        No active goals. Add one above ↑
      </div>

      <div v-else class="flex flex-col gap-3">
        <div
          v-for="goal in activeGoals"
          :key="goal._id"
          class="bg-white border border-stone-200 rounded-2xl overflow-hidden transition-all duration-150 hover:border-stone-300 hover:shadow-sm"
        >
          <div class="flex items-start gap-3 px-5 py-4">
            <button
              class="mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 border-stone-300 hover:border-emerald-400 flex items-center justify-center transition-all duration-150"
              title="Mark complete"
              @click="completeGoal(goal._id)"
            >
              <i
                class="pi pi-check text-transparent hover:text-emerald-400 text-[0.5rem]"
              />
            </button>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <p class="text-sm font-semibold text-stone-800">
                  {{ goal.title }}
                </p>
                <span
                  :class="[
                    'text-[0.65rem] font-semibold px-2 py-0.5 rounded-md capitalize',
                    timeframeColor(goal.timeframe),
                  ]"
                >
                  {{ goal.timeframe }}
                </span>
                <span
                  class="text-[0.65rem] font-semibold px-2 py-0.5 rounded-md bg-violet-50 text-violet-500"
                >
                  +{{ goal.xpReward }} XP
                </span>
              </div>
              <p v-if="goal.description" class="text-xs text-stone-400 mb-2">
                {{ goal.description }}
              </p>

              <div class="flex items-center gap-2">
                <div
                  class="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full rounded-full transition-[width] duration-500 bg-(--accent)"
                    :style="{ width: getGoalProgress(goal) + '%' }"
                  />
                </div>
                <span class="text-xs text-stone-400 shrink-0"
                  >{{ getGoalProgress(goal) }}%</span
                >
              </div>

              <p class="text-xs text-stone-400 mt-1.5">
                {{ goal.linkedTaskIds.length }} task{{
                  goal.linkedTaskIds.length !== 1 ? "s" : ""
                }}
                linked
              </p>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <button
                class="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all duration-150"
                :title="expandedGoalId === goal._id ? 'Collapse' : 'Link tasks'"
                @click="toggleExpand(goal._id)"
              >
                <i
                  :class="[
                    'pi text-xs',
                    expandedGoalId === goal._id ? 'pi-chevron-up' : 'pi-link',
                  ]"
                />
              </button>
              <button
                class="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
                title="Delete"
                @click="deleteGoal(goal._id)"
              >
                <i class="pi pi-times text-xs" />
              </button>
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
              class="border-t border-stone-100 px-5 py-4"
            >
              <p
                class="text-[0.65rem] font-semibold uppercase tracking-widest text-stone-400 mb-3"
              >
                Link Tasks
              </p>
              <div
                v-if="activeTasks.length === 0"
                class="text-xs text-stone-400"
              >
                No active tasks available.
              </div>
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
                  <button
                    :class="[
                      'shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all duration-150',
                      goal.linkedTaskIds.includes(task._id)
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-500'
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200',
                    ]"
                    @click="
                      goal.linkedTaskIds.includes(task._id)
                        ? unlinkTask({ goalId: goal._id, taskId: task._id })
                        : linkTask({ goalId: goal._id, taskId: task._id })
                    "
                  >
                    {{
                      goal.linkedTaskIds.includes(task._id) ? "Unlink" : "Link"
                    }}
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <section v-if="completedGoals.length > 0" class="mb-8">
      <div class="flex items-center gap-2 mb-3">
        <span
          class="text-[0.68rem] font-semibold uppercase tracking-widest text-emerald-500"
          >Completed</span
        >
        <span
          class="bg-emerald-50 text-emerald-600 text-xs font-medium px-2 py-0.5 rounded-full"
          >{{ completedGoals.length }}</span
        >
      </div>
      <div class="flex flex-col gap-3">
        <div
          v-for="goal in completedGoals"
          :key="goal._id"
          class="bg-white border border-stone-100 rounded-2xl px-5 py-4 opacity-60 flex items-center gap-3"
        >
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
          <span
            :class="[
              'text-[0.65rem] font-semibold px-2 py-0.5 rounded-md capitalize',
              timeframeColor(goal.timeframe),
            ]"
          >
            {{ goal.timeframe }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import Button from "primevue/button";
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
