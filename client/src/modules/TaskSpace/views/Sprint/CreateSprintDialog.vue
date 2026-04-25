<template>
  <Dialog
    v-model:visible="visible"
    :header="editingSprint ? 'Edit Sprint' : 'Create Sprint'"
    :modal="true"
    class="w-full max-w-md"
    @hide="onHide"
  >
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Sprint Name *</label>
          <InputText v-model="form.name" class="w-full" required autofocus />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Description</label>
          <Textarea v-model="form.description" rows="3" class="w-full" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-1">Start Date *</label>
            <DatePicker
              v-model="form.startDate"
              dateFormat="yy-mm-dd"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">End Date *</label>
            <DatePicker
              v-model="form.endDate"
              dateFormat="yy-mm-dd"
              class="w-full"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Status</label>
          <Select
            v-model="form.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <Button label="Cancel" severity="secondary" @click="visible = false" />
        <Button type="submit" label="Save" :loading="loading" />
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import DatePicker from "primevue/datepicker";
import Select from "primevue/select";
import Button from "primevue/button";
import type { Sprint, SprintStatus } from "./sprint.types";

const props = defineProps<{
  modelValue: boolean;
  sprint?: Sprint | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (
    e: "save",
    data: {
      name: string;
      description: string;
      startDate: string;
      endDate: string;
      status: SprintStatus;
    },
  ): void;
}>();

const visible = ref(props.modelValue);
const loading = ref(false);
const editingSprint = ref<Sprint | null>(props.sprint || null);

// ✅ Explicitly type form with SprintStatus
const form = reactive<{
  name: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  status: SprintStatus;
}>({
  name: "",
  description: "",
  startDate: null,
  endDate: null,
  status: "planning",
});

const statusOptions = [
  { label: "Planning", value: "planning" as const },
  { label: "Active", value: "active" as const },
  { label: "Completed", value: "completed" as const },
];

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val && props.sprint) {
      editingSprint.value = props.sprint;
      form.name = props.sprint.name;
      form.description = props.sprint.description || "";
      form.startDate = new Date(props.sprint.startDate);
      form.endDate = new Date(props.sprint.endDate);
      form.status = props.sprint.status;
    } else if (val && !props.sprint) {
      editingSprint.value = null;
      form.name = "";
      form.description = "";
      form.startDate = null;
      form.endDate = null;
      form.status = "planning";
    }
  },
  { immediate: true },
);

watch(visible, (val) => emit("update:modelValue", val));

const onHide = () => {
  // optional reset
};

const handleSubmit = () => {
  if (!form.name) return;
  emit("save", {
    name: form.name,
    description: form.description,
    startDate: form.startDate?.toISOString()!,
    endDate: form.endDate?.toISOString()!,
    status: form.status,
  });
  visible.value = false;
};
</script>
