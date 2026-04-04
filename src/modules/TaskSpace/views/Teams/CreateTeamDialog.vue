<template>
  <Dialog
    v-model:visible="visible"
    header="Create New Team"
    :modal="true"
    class="w-full max-w-md"
    @hide="onHide"
  >
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Team Name *</label>
          <InputText
            v-model="localName"
            type="text"
            placeholder="e.g., Engineering, Marketing"
            class="w-full"
            required
            autofocus
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1"
            >Description (optional)</label
          >
          <Textarea
            v-model="localDescription"
            rows="3"
            placeholder="What's this team for?"
            class="w-full"
          />
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <Button label="Cancel" severity="secondary" @click="visible = false" />
        <Button
          type="submit"
          label="Create"
          :loading="loading"
          :disabled="!localName.trim()"
        />
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "create", payload: { name: string; description: string }): void;
}>();

const visible = ref(props.modelValue);
const localName = ref("");
const localDescription = ref("");
const loading = ref(false);

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (!val) resetForm();
  },
);

watch(visible, (val) => emit("update:modelValue", val));

const resetForm = () => {
  localName.value = "";
  localDescription.value = "";
};

const onHide = () => {
  resetForm();
};

const handleSubmit = async () => {
  if (!localName.value.trim()) return;
  emit("create", {
    name: localName.value.trim(),
    description: localDescription.value.trim(),
  });
  visible.value = false;
};
</script>
