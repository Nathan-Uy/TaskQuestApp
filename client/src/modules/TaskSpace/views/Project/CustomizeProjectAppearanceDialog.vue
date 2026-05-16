<template>
  <Dialog
    v-model:visible="visible"
    header="Customize Project"
    :modal="true"
    :draggable="false"
    class="w-full max-w-md"
    @hide="resetToInitial"
  >
    <div class="flex flex-col gap-4">
      <!-- Background Color -->
      <div class="flex flex-col gap-2">
        <label
          for="background-color"
          style="
            font-size: 0.7rem;
            font-weight: 800;
            color: var(--ink-primary);
            text-transform: uppercase;
            letter-spacing: 0.08em;
          "
        >
          Background Color
        </label>
        <div
          style="
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 8px;
          "
        >
          <button
            v-for="color in colorPalette"
            :key="color"
            :style="{
              backgroundColor: color,
              width: '40px',
              height: '40px',
              border:
                selectedColor === color
                  ? '3px solid #1a1714'
                  : '2px solid #1a1714',
              boxShadow:
                selectedColor === color
                  ? '3px 3px 0 #1a1714'
                  : '2px 2px 0 #1a1714',
              cursor: 'pointer',
              transform:
                selectedColor === color ? 'translate(-1px, -1px)' : 'none',
              transition: 'all 80ms ease',
            }"
            @click="selectedColor = color"
          />
        </div>
        <div>
          <label
            for="custom-color"
            style="
              font-size: 0.65rem;
              font-weight: 700;
              color: var(--ink-muted);
              text-transform: uppercase;
              letter-spacing: 0.08em;
              display: block;
              margin-bottom: 6px;
            "
          >
            Custom color
          </label>
          <ColorPicker v-model="selectedColor" inline class="w-full" />
        </div>
      </div>

      <!-- Cover Image -->
      <div class="flex flex-col gap-2">
        <label
          for="cover-image"
          style="
            font-size: 0.7rem;
            font-weight: 800;
            color: var(--ink-primary);
            text-transform: uppercase;
            letter-spacing: 0.08em;
          "
        >
          Cover Image
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

        <div
          v-if="coverPreview"
          style="
            position: relative;
            width: 100%;
            height: 120px;
            overflow: hidden;
            border: 2px solid #1a1714;
            box-shadow: 3px 3px 0 #1a1714;
            margin-bottom: 8px;
          "
        >
          <img
            :src="coverPreview"
            style="width: 100%; height: 100%; object-fit: cover"
            alt="Cover preview"
          />
          <Button
            icon="pi pi-times"
            text
            size="small"
            style="
              position: absolute;
              top: 6px;
              right: 6px;
              background: #fff;
              border: 2px solid #1a1714;
              width: 28px;
              height: 28px;
            "
            @click="removeCover"
          />
        </div>

        <input
          type="file"
          accept="image/*"
          style="
            display: block;
            width: 100%;
            font-size: 0.8rem;
            color: var(--ink-muted);
            cursor: pointer;
            border: 2px solid #1a1714;
            padding: 8px;
            background: #fff;
            box-shadow: 2px 2px 0 #1a1714;
          "
          @change="onFileChange"
        />

        <p
          v-if="isProcessing"
          style="
            font-size: 0.7rem;
            color: var(--ink-muted);
            font-weight: 600;
            margin: 0;
          "
        >
          Processing image...
        </p>
        <p
          v-if="uploadError"
          style="
            font-size: 0.7rem;
            color: var(--danger);
            font-weight: 700;
            margin: 0;
            background: var(--danger-soft);
            border: 1.5px solid var(--danger);
            padding: 6px 10px;
          "
        >
          {{ uploadError }}
        </p>
        <p
          style="
            font-size: 0.65rem;
            color: var(--ink-muted);
            margin: 0;
            font-weight: 600;
          "
        >
          Max size 1MB. Supported: JPG, PNG, GIF
        </p>
      </div>
    </div>

    <div
      style="
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        border-top: 2px solid var(--surface-muted);
        padding-top: 16px;
        margin-top: 16px;
      "
    >
      <Button
        label="Cancel"
        severity="secondary"
        text
        @click="visible = false"
      />
      <Button
        label="Save"
        style="background: var(--accent); color: #fff; font-weight: 800"
        @click="save"
      />
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
