<template>
  <div class="pl-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-7">
      <div>
        <h1 class="text-3xl font-serif text-stone-800 leading-tight">
          Calendar
        </h1>
        <p class="text-xs text-stone-400 mt-1">{{ headerSubtitle }}</p>
      </div>

      <div class="flex items-center gap-2">
        <!-- View Switch -->
        <SelectButton
          :model-value="currentView"
          :options="viewOptions"
          optionLabel="label"
          optionValue="value"
          class="calendar-view-switch"
          @update:model-value="setView"
        />

        <!-- Navigation -->
        <div class="flex items-center gap-1">
          <Button
            icon="pi pi-chevron-left"
            text
            rounded
            severity="secondary"
            class="w-8! h-8!"
            @click="navigate(-1)"
          />
          <Button
            label="Today"
            text
            severity="secondary"
            class="rounded-lg! text-xs! font-medium!"
            @click="goToToday"
          />
          <Button
            icon="pi pi-chevron-right"
            text
            rounded
            severity="secondary"
            class="w-8! h-8!"
            @click="navigate(1)"
          />
        </div>
      </div>
    </div>

    <!-- DAY VIEW -->
    <div
      v-if="currentView === 'day'"
      class="grid grid-cols-[1fr_280px] gap-5 items-start"
    >
      <!-- Tasks for Selected Day -->
      <Card
        class="rounded-2xl border border-stone-200 shadow-none overflow-hidden"
      >
        <template #content>
          <div class="px-1 py-1">
            <div class="pb-4 border-b border-stone-100 mb-4">
              <p class="text-sm font-semibold text-stone-800">
                {{ formatDayHeader(cursor) }}
              </p>
              <p class="text-xs text-stone-400 mt-0.5">
                {{ tasksForCursor.length }} task{{
                  tasksForCursor.length !== 1 ? "s" : ""
                }}
              </p>
            </div>

            <Message
              v-if="tasksForCursor.length === 0"
              severity="secondary"
              class="rounded-xl"
            >
              No tasks for this day. Add one →
            </Message>

            <div v-else class="flex flex-col gap-2">
              <Card
                v-for="task in tasksForCursor"
                :key="task._id"
                class="rounded-xl border shadow-none transition-all duration-150"
                :class="
                  task.status === 'completed'
                    ? 'border-stone-100 opacity-60'
                    : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                "
              >
                <template #content>
                  <div class="flex items-start gap-3">
                    <div
                      :class="[
                        'mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center',
                        task.status === 'completed'
                          ? 'border-emerald-400 bg-emerald-400'
                          : 'border-stone-300',
                      ]"
                    >
                      <i
                        v-if="task.status === 'completed'"
                        class="pi pi-check text-white text-[0.5rem]"
                      />
                    </div>

                    <div class="flex-1 min-w-0">
                      <p
                        :class="[
                          'text-sm font-semibold leading-snug',
                          task.status === 'completed'
                            ? 'line-through text-stone-400'
                            : 'text-stone-800',
                        ]"
                      >
                        {{ task.title }}
                      </p>

                      <div class="flex items-center gap-2 mt-2 flex-wrap">
                        <Tag
                          :value="task.priority"
                          rounded
                          :class="[
                            'capitalize border-0!',
                            task.priority === 'high'
                              ? 'bg-red-50! text-red-600!'
                              : task.priority === 'medium'
                                ? 'bg-amber-50! text-amber-600!'
                                : 'bg-emerald-50! text-emerald-600!',
                          ]"
                        />
                        <Tag
                          :value="`+${task.xpReward} XP`"
                          rounded
                          class="bg-violet-50! text-violet-500! border-0!"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </template>
      </Card>

      <!-- Add Task -->
      <Card class="rounded-2xl border border-stone-200 shadow-none">
        <template #content>
          <p
            class="text-[0.65rem] font-semibold uppercase tracking-widest text-stone-400 mb-4"
          >
            Add Task
          </p>

          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-stone-500"
                >Task name</label
              >
              <InputText
                v-model="newTaskTitle"
                placeholder="What needs to be done?"
                class="w-full"
                @keyup.enter="addTask"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-stone-500">Priority</label>
              <Select
                v-model="newTaskPriority"
                :options="priorityOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>

            <Button
              label="Add Task"
              :disabled="!newTaskTitle.trim()"
              class="w-full rounded-xl! text-sm! font-semibold! border-none! bg-(--accent)!"
              @click="addTask"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- WEEK VIEW -->
    <div v-else-if="currentView === 'week'">
      <div class="grid grid-cols-7 gap-2 mb-2">
        <div
          v-for="day in weekDays"
          :key="day.toISOString()"
          class="text-center"
        >
          <p
            class="text-[0.65rem] font-semibold uppercase tracking-widest text-stone-400 mb-1"
          >
            {{ formatWeekDay(day) }}
          </p>

          <Button
            :label="String(day.getDate())"
            rounded
            text
            class="w-8! h-8! text-sm! font-medium!"
            :class="
              isToday(day)
                ? 'text-white!'
                : isSameDay(day, cursor)
                  ? 'bg-stone-100! text-stone-800!'
                  : 'text-stone-500!'
            "
            :style="isToday(day) ? { background: 'var(--accent)' } : {}"
            @click="
              setCursor(day);
              setView('day');
            "
          />
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2">
        <Card
          v-for="day in weekDays"
          :key="day.toISOString()"
          class="rounded-xl border min-h-32 shadow-none cursor-pointer transition-all duration-150 hover:border-stone-300 hover:shadow-sm"
          :class="
            isSameDay(day, cursor) ? 'border-stone-300' : 'border-stone-200'
          "
          @click="
            setCursor(day);
            setView('day');
          "
        >
          <template #content>
            <div
              v-if="getTasksForDay(day).length === 0"
              class="text-xs text-stone-300 text-center mt-4"
            >
              No tasks
            </div>

            <div v-else class="flex flex-col gap-1.5">
              <div
                v-for="task in getTasksForDay(day).slice(0, 3)"
                :key="task._id"
                :class="[
                  'text-xs rounded-md px-2 py-1 font-medium truncate',
                  task.priority === 'high'
                    ? 'bg-red-50 text-red-600'
                    : task.priority === 'medium'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-emerald-50 text-emerald-600',
                  task.status === 'completed' ? 'opacity-50 line-through' : '',
                ]"
              >
                {{ task.title }}
              </div>

              <p
                v-if="getTasksForDay(day).length > 3"
                class="text-[0.6rem] text-stone-400 text-center"
              >
                +{{ getTasksForDay(day).length - 3 }} more
              </p>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- MONTH VIEW -->
    <div v-else-if="currentView === 'month'">
      <div class="grid grid-cols-7 gap-2 mb-2">
        <div
          v-for="d in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
          :key="d"
          class="text-[0.65rem] font-semibold uppercase tracking-widest text-stone-400 text-center py-1"
        >
          {{ d }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2">
        <Card
          v-for="(day, idx) in monthGrid"
          :key="idx"
          class="rounded-xl min-h-24 shadow-none transition-all duration-150"
          :class="[
            day
              ? 'bg-white border cursor-pointer hover:border-stone-300 hover:shadow-sm'
              : 'bg-transparent border-transparent shadow-none',
            day && isSameDay(day, cursor)
              ? 'border-stone-300'
              : 'border-stone-200',
          ]"
          @click="day && (setCursor(day), setView('day'))"
        >
          <template v-if="day" #content>
            <div
              :class="[
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1.5',
                isToday(day) ? 'text-white' : 'text-stone-600',
              ]"
              :style="isToday(day) ? { background: 'var(--accent)' } : {}"
            >
              {{ day.getDate() }}
            </div>

            <div class="flex flex-col gap-1">
              <div
                v-for="task in getTasksForDay(day).slice(0, 2)"
                :key="task._id"
                :class="[
                  'text-[0.6rem] rounded px-1.5 py-0.5 font-medium truncate',
                  task.priority === 'high'
                    ? 'bg-red-50 text-red-500'
                    : task.priority === 'medium'
                      ? 'bg-amber-50 text-amber-500'
                      : 'bg-emerald-50 text-emerald-500',
                  task.status === 'completed' ? 'opacity-50' : '',
                ]"
              >
                {{ task.title }}
              </div>

              <p
                v-if="getTasksForDay(day).length > 2"
                class="text-[0.6rem] text-stone-400"
              >
                +{{ getTasksForDay(day).length - 2 }} more
              </p>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";
import Tag from "primevue/tag";
import Message from "primevue/message";

import { computed } from "vue";
import { useCalendar } from "./calendar.composable";
import type { CalendarView } from "./calendar.type";

const {
  currentView,
  cursor,
  weekDays,
  monthGrid,
  navigate,
  goToToday,
  setView,
  setCursor,
  views,
  priorityOptions,
  newTaskTitle,
  newTaskPriority,
  tasksForCursor,
  headerSubtitle,
  isToday,
  isSameDay,
  formatDayHeader,
  formatWeekDay,
  getTasksForDay,
  addTask,
} = useCalendar();

const viewOptions = computed(() =>
  views.map((v) => ({
    label: v.label,
    value: v.key,
  })),
);
</script>

<style scoped>
:deep(.calendar-view-switch .p-selectbutton) {
  display: flex;
  background: #f5f5f4;
  padding: 0.25rem;
  border-radius: 0.75rem;
  gap: 0.25rem;
}

:deep(.calendar-view-switch .p-togglebutton) {
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: #78716c;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

:deep(.calendar-view-switch .p-togglebutton.p-highlight) {
  background: white;
  color: #292524;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
