<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1.5">
      <label
        for="title"
        style="
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--ink-primary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        "
      >
        Task name
      </label>
      <div class="flex gap-2">
        <InputText
          v-model="form.title"
          placeholder="What needs to be done?"
          class="flex-1"
          autofocus
          @keyup.enter="emit('submit')"
        />
        <slot name="ai-button" />
      </div>
    </div>

    <div class="grid grid-cols-2" style="gap: 16px">
      <div class="flex flex-col gap-1.5">
        <label
          for="priority"
          style="
            font-size: 0.7rem;
            font-weight: 800;
            color: var(--ink-primary);
            text-transform: uppercase;
            letter-spacing: 0.08em;
          "
        >
          Priority
        </label>
        <Select
          v-model="form.priority"
          :options="priorityOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label
          for="duration"
          style="
            font-size: 0.7rem;
            font-weight: 800;
            color: var(--ink-primary);
            text-transform: uppercase;
            letter-spacing: 0.08em;
          "
        >
          Duration
        </label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="preset in durationPresets"
            :key="preset.value"
            type="button"
            :style="{
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: '800',
              border: '2px solid var(--ink-primary)',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              background:
                selectedDuration === preset.value ? 'var(--accent)' : '#fff',
              color:
                selectedDuration === preset.value
                  ? '#fff'
                  : 'var(--ink-primary)',
              boxShadow:
                selectedDuration === preset.value
                  ? '2px 2px 0 var(--ink-primary)'
                  : '2px 2px 0 var(--ink-primary)',
              transition: 'all 80ms ease',
            }"
            @click="selectDuration(preset.value)"
          >
            {{ preset.label }}
          </button>
          <button
            type="button"
            :style="{
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: '800',
              border: '2px solid var(--ink-primary)',
              cursor: 'pointer',
              background: showCustom ? 'var(--ink-primary)' : '#fff',
              color: showCustom ? '#fff' : 'var(--ink-primary)',
              boxShadow: '2px 2px 0 var(--ink-primary)',
              transition: 'all 80ms ease',
            }"
            @click="showCustom = !showCustom"
          >
            Custom
          </button>
        </div>
        <div v-if="showCustom" class="flex items-center gap-2 mt-1">
          <InputNumber
            v-model="form.hours"
            :min="0"
            :use-grouping="false"
            placeholder="0h"
            class="w-full"
            input-class="w-full text-center text-sm"
          />
          <span
            style="
              color: var(--ink-muted);
              font-size: 0.75rem;
              font-weight: 700;
              flex-shrink: 0;
            "
            >h</span
          >
          <InputNumber
            v-model="form.minutes"
            :min="0"
            :max="59"
            :use-grouping="false"
            placeholder="0m"
            class="w-full"
            input-class="w-full text-center text-sm"
          />
          <span
            style="
              color: var(--ink-muted);
              font-size: 0.75rem;
              font-weight: 700;
              flex-shrink: 0;
            "
            >m</span
          >
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <label
        for="due_date"
        style="
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--ink-primary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        "
      >
        Due date
        <span
          style="
            font-weight: 500;
            text-transform: none;
            letter-spacing: 0;
            color: var(--ink-muted);
          "
          >(optional)</span
        >
      </label>
      <DatePicker
        v-model="form.dueDate"
        placeholder="Pick a date"
        date-format="M dd, yy"
        class="w-full"
        show-icon
        icon-display="input"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <label
        for="notes"
        style="
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--ink-primary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        "
      >
        Notes
        <span
          style="
            font-weight: 500;
            text-transform: none;
            letter-spacing: 0;
            color: var(--ink-muted);
          "
          >(optional)</span
        >
      </label>
      <Textarea
        v-model="form.notes"
        placeholder="Any details..."
        :rows="2"
        class="w-full resize-none"
      />
    </div>

    <div
      class="flex justify-end"
      style="
        gap: 8px;
        border-top: 2px solid var(--surface-muted);
        padding-top: 16px;
        margin-top: 4px;
      "
    >
      <Button
        label="Cancel"
        severity="secondary"
        text
        @click="emit('cancel')"
      />
      <Button
        :label="submitLabel"
        :disabled="!form.title.trim() || loading"
        style="background: var(--accent); color: #fff; font-weight: 800"
        @click="emit('submit')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import type { TaskPriority } from "./tasks.type";

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const durationPresets = [
  { label: "15m", value: 900 },
  { label: "25m", value: 1500 },
  { label: "45m", value: 2700 },
  { label: "1h", value: 3600 },
  { label: "2h", value: 7200 },
];

const form = defineModel<{
  title: string;
  notes: string;
  priority: TaskPriority;
  dueDate: Date | null;
  hours: number;
  minutes: number;
  seconds: number;
}>("form", { required: true });

withDefaults(
  defineProps<{
    submitLabel?: string;
    loading?: boolean;
  }>(),
  {
    submitLabel: "Save",
    loading: false,
  },
);

const emit = defineEmits<{
  submit: [];
  cancel: [];
}>();

const showCustom = ref(false);

const selectedDuration = computed(() => {
  const total =
    form.value.hours * 3600 + form.value.minutes * 60 + form.value.seconds;
  return durationPresets.find((p) => p.value === total)?.value ?? null;
});

const selectDuration = (seconds: number) => {
  showCustom.value = false;
  form.value.hours = Math.floor(seconds / 3600);
  form.value.minutes = Math.floor((seconds % 3600) / 60);
  form.value.seconds = 0;
};
</script>
