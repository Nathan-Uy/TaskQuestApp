<template>
  <div class="pl-8">
    <div class="flex items-center justify-between mb-7">
      <div>
        <h1 class="text-3xl font-serif text-stone-800 leading-tight">
          Calendar
        </h1>
        <p class="text-xs text-stone-400 mt-1">{{ headerSubtitle }}</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex gap-1 bg-stone-100 rounded-lg p-1">
          <button
            v-for="v in views"
            :key="v.key"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150',
              currentView === v.key
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-400 hover:text-stone-600',
            ]"
            @click="setView(v.key as CalendarView)"
          >
            {{ v.label }}
          </button>
        </div>
        <div class="flex items-center gap-1">
          <button
            class="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all duration-150"
            @click="navigate(-1)"
          >
            <i class="pi pi-chevron-left text-xs" />
          </button>
          <button
            class="px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-all duration-150"
            @click="goToToday"
          >
            Today
          </button>
          <button
            class="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all duration-150"
            @click="navigate(1)"
          >
            <i class="pi pi-chevron-right text-xs" />
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="currentView === 'day'"
      class="grid grid-cols-[1fr_260px] gap-5 items-start"
    >
      <div class="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-stone-100">
          <p class="text-sm font-semibold text-stone-800">
            {{ formatDayHeader(cursor) }}
          </p>
          <p class="text-xs text-stone-400 mt-0.5">
            {{ tasksForCursor.length }} task{{
              tasksForCursor.length !== 1 ? "s" : ""
            }}
          </p>
        </div>
        <div class="p-4">
          <div
            v-if="tasksForCursor.length === 0"
            class="py-12 text-center text-sm text-stone-400"
          >
            No tasks for this day. Add one →
          </div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="task in tasksForCursor"
              :key="task._id"
              :class="[
                'flex items-start gap-3 rounded-xl px-4 py-3 border transition-all duration-150',
                task.status === 'completed'
                  ? 'border-stone-100 opacity-60'
                  : 'border-stone-200 hover:border-stone-300 hover:shadow-sm',
              ]"
            >
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
                <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    :class="[
                      'inline-flex items-center rounded-md text-xs font-semibold capitalize px-2 py-0.5',
                      task.priority === 'high'
                        ? 'bg-red-50 text-red-600'
                        : task.priority === 'medium'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600',
                    ]"
                    >{{ task.priority }}</span
                  >
                  <span
                    class="inline-flex items-center rounded-md text-xs font-semibold px-2 py-0.5 bg-violet-50 text-violet-500"
                  >
                    +{{ task.xpReward }} XP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white border border-stone-200 rounded-2xl p-5">
        <p
          class="text-[0.65rem] font-semibold uppercase tracking-widest text-stone-400 mb-4"
        >
          Add Task
        </p>
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-stone-500">Task name</label>
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
          <button
            :disabled="!newTaskTitle.trim()"
            class="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px bg-(--accent)"
            @click="addTask"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>

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
          <button
            :class="[
              'w-8 h-8 rounded-full text-sm font-medium mx-auto flex items-center justify-center transition-all duration-150',
              isToday(day)
                ? 'text-white'
                : isSameDay(day, cursor)
                  ? 'bg-stone-100 text-stone-800'
                  : 'text-stone-500 hover:bg-stone-100',
            ]"
            :style="isToday(day) ? { background: 'var(--accent)' } : {}"
            @click="
              setCursor(day);
              setView('day');
            "
          >
            {{ day.getDate() }}
          </button>
        </div>
      </div>
      <div class="grid grid-cols-7 gap-2">
        <div
          v-for="day in weekDays"
          :key="day.toISOString()"
          :class="[
            'bg-white border rounded-xl p-3 min-h-32 cursor-pointer transition-all duration-150 hover:border-stone-300 hover:shadow-sm',
            isSameDay(day, cursor) ? 'border-stone-300' : 'border-stone-200',
          ]"
          @click="
            setCursor(day);
            setView('day');
          "
        >
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
        </div>
      </div>
    </div>

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
        <div
          v-for="(day, idx) in monthGrid"
          :key="idx"
          :class="[
            'rounded-xl p-2 min-h-24 transition-all duration-150',
            day
              ? 'bg-white border cursor-pointer hover:border-stone-300 hover:shadow-sm'
              : 'bg-transparent border-transparent',
            day && isSameDay(day, cursor)
              ? 'border-stone-300'
              : 'border-stone-200',
          ]"
          @click="day && (setCursor(day), setView('day'))"
        >
          <template v-if="day">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import Select from "primevue/select";
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
</script>
