<template>
  <Dialog
    v-model:visible="visible"
    header="Customize Project Appearance"
    :modal="true"
    :draggable="false"
    class="w-full max-w-md"
    @hide="resetToInitial"
  >
    <div class="space-y-4">
      <div>
        <label for="background-color" class="block text-sm font-medium mb-2"
          >Background Color</label
        >
        <div class="grid grid-cols-5 gap-2 mb-3">
          <div
            v-for="color in colorPalette"
            :key="color"
            :style="{ backgroundColor: color }"
            class="w-10 h-10 rounded-full cursor-pointer border-2 hover:scale-105 transition-transform"
            :class="
              selectedColor === color
                ? 'border-blue-500 shadow-lg'
                : 'border-transparent'
            "
            @click="selectedColor = color"
          />
        </div>
        <div class="flex items-center gap-2">
          <div class="flex-1">
            <label for="custom-color" class="block text-xs text-gray-500 mb-1"
              >Custom color</label
            >
            <ColorPicker v-model="selectedColor" inline class="w-full" />
          </div>
        </div>
      </div>

      <div>
        <label for="cover-image" class="block text-sm font-medium mb-2"
          >Cover Image (optional)</label
        >

        <div
          v-if="coverPreview"
          class="relative w-full h-32 rounded overflow-hidden mb-2"
        >
          <image :src="coverPreview" class="w-full h-full object-cover" />
          <Button
            icon="pi pi-times"
            rounded
            text
            size="small"
            class="absolute top-1 right-1 bg-white"
            @click="removeCover"
          />
        </div>

        <input
          type="file"
          accept="image/*"
          class="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
          @change="onFileChange"
        />

        <div v-if="isProcessing" class="text-xs mt-1 text-gray-500">
          Processing image...
        </div>
        <p v-if="uploadError" class="text-xs text-red-500 mt-1">
          {{ uploadError }}
        </p>
        <p class="text-xs text-gray-500 mt-1">
          Max size 1MB. Supported: JPG, PNG, GIF
        </p>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <Button label="Cancel" severity="secondary" @click="visible = false" />
      <Button label="Save" @click="save" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import ColorPicker from "primevue/colorpicker";
import Button from "primevue/button";
import type { Project } from "./project.types";
import { resizeToThumbnail } from "@/utils/imageUtils";

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
const uploadError = ref("");
const isProcessing = ref(false);

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
  uploadError.value = "";
};

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (file.size > 1_000_000) {
    uploadError.value = "File is too large. Max size is 1MB.";
    return;
  }

  uploadError.value = "";
  isProcessing.value = true;
  try {
    const thumbnail = await resizeToThumbnail(file);
    coverPreview.value = thumbnail;
    coverData.value = thumbnail;
  } catch {
    uploadError.value = "Failed to process image.";
  } finally {
    isProcessing.value = false;
  }
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
