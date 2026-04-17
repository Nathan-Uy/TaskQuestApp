<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1.5">
      <label class="text-stone-500 font-medium" style="font-size: 0.75rem"
        >Task name</label
      >
      <div class="flex gap-2">
        <InputText
          v-model="form.title"
          placeholder="What needs to be done?"
          class="flex-1"
          @keyup.enter="emit('submit')"
          autofocus
        />
        <slot name="ai-button" />
      </div>
    </div>

    <div class="grid grid-cols-2" style="gap: 16px">
      <div class="flex flex-col gap-1.5">
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
      <div class="flex flex-col gap-1.5">
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

    <div class="flex flex-col gap-1.5">
      <label class="text-stone-500 font-medium" style="font-size: 0.75rem">
        Due date <span class="font-normal text-stone-400">(optional)</span>
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
      <Button
        label="Cancel"
        severity="secondary"
        text
        @click="emit('cancel')"
      />
      <Button
        :label="submitLabel"
        :disabled="!form.title.trim() || loading"
        class="bg-(--accent)! border-none! rounded-[10px]! text-sm! font-semibold! shadow-sm! hover:shadow-md! hover:-translate-y-px! transition-all! duration-150!"
        @click="emit('submit')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
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
</script>
