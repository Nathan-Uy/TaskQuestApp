<template>
  <Dialog
    v-model:visible="visible"
    header="Customize Appearance"
    :modal="true"
    :draggable="false"
    class="w-full max-w-md"
    @hide="resetToInitial"
  >
    <div class="flex flex-col gap-5">
      <div>
        <p class="text-xs font-medium mb-3" style="color: var(--ink-secondary)">
          Background color
        </p>
        <div class="grid grid-cols-10 gap-1.5 mb-3">
          <button
            v-for="color in colorPalette"
            :key="color"
            type="button"
            class="w-7 h-7 rounded-lg transition-all duration-150 hover:scale-110 border-2"
            :style="{
              backgroundColor: color,
              borderColor:
                selectedColor === color ? 'var(--ink-primary)' : 'transparent',
            }"
            @click="selectedColor = color"
          />
        </div>
        <button
          type="button"
          class="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all"
          style="
            border-color: var(--card-border);
            color: var(--ink-secondary);
            background: var(--card-bg);
          "
          @click="selectedColor = ''"
        >
          <i class="pi pi-times text-xs" /> Clear color
        </button>
      </div>

      <div>
        <p class="text-xs font-medium mb-3" style="color: var(--ink-secondary)">
          Cover image
          <span class="font-normal" style="color: var(--ink-muted)"
            >(optional)</span
          >
        </p>
        <div
          v-if="coverPreview"
          class="relative w-full h-28 rounded-xl overflow-hidden mb-2 border"
          style="border-color: var(--card-border)"
        >
          <img :src="coverPreview" class="w-full h-full object-cover" />
          <button
            type="button"
            class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
            @click="removeCover"
          >
            <i class="pi pi-times text-xs text-stone-600" />
          </button>
        </div>
        <FileUpload
          mode="basic"
          name="cover"
          accept="image/*"
          :max-file-size="1000000"
          choose-label="Upload cover image"
          class="w-full"
          @uploader="onCoverUpload"
        />
        <p class="text-xs mt-1.5" style="color: var(--ink-muted)">
          Max 1MB · JPG, PNG, GIF
        </p>
      </div>

      <div
        v-if="selectedColor || coverPreview"
        class="rounded-xl border p-3 flex items-center gap-3"
        style="
          border-color: var(--card-border);
          background: var(--surface-muted);
        "
      >
        <div
          class="w-10 h-10 rounded-lg shrink-0 border"
          :style="{
            backgroundColor: selectedColor || 'var(--card-bg)',
            borderColor: 'var(--card-border)',
          }"
        />
        <p class="text-xs" style="color: var(--ink-secondary)">
          Preview of your project tile color
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          severity="secondary"
          text
          class="rounded-xl! text-sm!"
          @click="visible = false"
        />
        <Button
          label="Save"
          class="bg-(--accent)! border-none! rounded-xl! text-sm! font-semibold!"
          @click="save"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import FileUpload from "primevue/fileupload";
import Button from "primevue/button";
import type { Project } from "./project.types";

const props = defineProps<{
  modelValue: boolean;
  project: Project | null;
  initialColor: string;
  initialCover: string;
  colorPalette: string[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  save: [payload: { color: string; cover: string }];
}>();

const visible = ref(props.modelValue);
const selectedColor = ref(props.initialColor);
const coverPreview = ref(props.initialCover);
const coverData = ref(props.initialCover);

watch(
  () => props.modelValue,
  (v) => {
    visible.value = v;
    if (v) resetToInitial();
  },
);
watch(visible, (v) => emit("update:modelValue", v));

const resetToInitial = () => {
  selectedColor.value = props.initialColor;
  coverPreview.value = props.initialCover;
  coverData.value = props.initialCover;
};

const onCoverUpload = (event: any) => {
  const file = event.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    coverPreview.value = e.target?.result as string;
    coverData.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const removeCover = () => {
  coverPreview.value = "";
  coverData.value = "";
};

const save = () => {
  emit("save", { color: selectedColor.value, cover: coverData.value });
  visible.value = false;
};
</script>
