<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Customize Team Appearance"
    :style="{ width: '32rem' }"
    :breakpoints="{ '640px': 'calc(100vw - 2rem)' }"
    @hide="onHide"
  >
    <div class="flex flex-col gap-5">
      <!-- ========================= -->
      <!-- Background Color -->
      <!-- ========================= -->
      <div class="flex flex-col gap-3">
        <label for="backgroundColor"
          class="text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-(--ink-primary)"
        >
          Background Color
        </label>

        <!-- Preset Colors -->
        <div class="grid grid-cols-5 gap-3">
          <button
            v-for="color in colorPalette"
            :key="color"
            type="button"
            :aria-label="`Select ${color}`"
            class="h-10 w-10 cursor-pointer transition-all duration-100"
            :style="{
              backgroundColor: color,
              border:
                selectedColor === color
                  ? '3px solid #1a1714'
                  : '2px solid #1a1714',
              boxShadow:
                selectedColor === color
                  ? '3px 3px 0 #1a1714'
                  : '2px 2px 0 #1a1714',
              transform:
                selectedColor === color
                  ? 'translate(-1px, -1px)'
                  : 'none',
            }"
            @click="selectedColor = color"
          >
            <span
              v-if="selectedColor === color"
              class="flex h-full w-full items-center justify-center text-sm font-black"
              :style="{
                color: getContrastColor(color),
              }"
            >
              ✓
            </span>
          </button>
        </div>

        <!-- Custom Color -->
        <div class="flex flex-col gap-2">
          <label for="customColor"
            class="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-(--ink-muted)"
          >
            Custom Color
          </label>

          <div
            class="flex items-center gap-3 border-2 border-(--ink-primary) bg-(--surface-muted) p-3 shadow-[2px_2px_0_var(--ink-primary)]"
          >
            <ColorPicker
              v-model="selectedColor"
              inline
            />

            <div class="min-w-0">
              <p
                class="m-0 text-[0.7rem] font-bold uppercase tracking-[0.05em] text-(--ink-muted)"
              >
                Selected
              </p>

              <p
                class="mt-1 break-all font-mono text-xs font-bold text-(--ink-primary)"
              >
                #{{ selectedColor }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <label for="coverimage"
          class="text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-(--ink-primary)"
        >
          Cover Image

          <span
            class="ml-1 font-medium normal-case tracking-normal text-(--ink-muted)"
          >
            (optional)
          </span>
        </label>

        <!-- Cover Preview -->
        <div
          v-if="coverPreview"
          class="relative h-32 w-full overflow-hidden border-2 border-(--ink-primary) bg-(--surface-muted) shadow-[3px_3px_0_var(--ink-primary)]"
        >
          <img
            :src="coverPreview"
            alt="Cover preview"
            class="h-full w-full object-cover"
          />

          <Button
            icon="pi pi-times"
            text
            rounded
            severity="secondary"
            aria-label="Remove cover image"
            class="absolute! right-2! top-2! h-7! w-7! border-2! border-(--ink-primary)! bg-white! p-0! text-(--ink-primary)! shadow-[2px_2px_0_var(--ink-primary)]!"
            @click="removeCover"
          />
        </div>

        <!-- PrimeVue File Upload -->
        <FileUpload
          mode="basic"
          name="cover"
          accept="image/jpeg,image/png,image/gif"
          :max-file-size="1000000"
          choose-label="Choose Cover Image"
          :auto="false"
          :custom-upload="true"
          class="w-full"
          @select="onFileSelect"
        />

        <!-- Processing -->
        <Message
          v-if="isProcessing"
          severity="info"
          :closable="false"
          class="m-0!"
        >
          Processing image...
        </Message>

        <!-- Error -->
        <Message
          v-if="uploadError"
          severity="error"
          :closable="false"
          class="m-0!"
        >
          {{ uploadError }}
        </Message>

        <!-- File Requirements -->
        <p
          class="m-0 text-[0.65rem] font-semibold text-(--ink-muted)"
        >
          Max size 1MB. Supported: JPG, PNG, GIF
        </p>
      </div>
    </div>

    <!-- ========================= -->
    <!-- Footer -->
    <!-- ========================= -->
    <template #footer>
      <div
        class="flex w-full justify-end gap-2 border-t-2 border-(--surface-muted) pt-4"
      >
        <Button
          label="Cancel"
          severity="secondary"
          text
          class="rounded-none!"
          @click="visible = false"
        />

        <Button
          label="Save"
          icon="pi pi-check"
          :loading="saving"
          class="rounded-none! border-2! border-(--ink-primary)! bg-(--accent)! font-extrabold! text-white! shadow-[2px_2px_0_var(--ink-primary)]!"
          @click="save"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import Dialog from "primevue/dialog";
import Button from "primevue/button";
import ColorPicker from "primevue/colorpicker";
import FileUpload from "primevue/fileupload";
import Message from "primevue/message";

import { resizeToThumbnail } from "@/utils/imageUtils";

const props = defineProps<{
  modelValue: boolean;
  team: any | null;
  initialColor: string;
  initialCover: string;
  colorPalette: string[];
}>();

const emit = defineEmits<{
  (
    e: "update:modelValue",
    value: boolean,
  ): void;

  (
    e: "save",
    payload: {
      color: string;
      cover: string;
    },
  ): void;
}>();

/**
 * Dialog state
 */
const visible = ref(props.modelValue);

/**
 * Appearance state
 */
const selectedColor = ref(props.initialColor);
const coverPreview = ref(props.initialCover);
const coverData = ref(props.initialCover);

/**
 * Upload state
 */
const uploadError = ref("");
const isProcessing = ref(false);
const saving = ref(false);

/**
 * Sync parent -> dialog
 */
watch(
  () => props.modelValue,
  (value) => {
    visible.value = value;

    if (value) {
      selectedColor.value =
        props.initialColor;

      coverPreview.value =
        props.initialCover;

      coverData.value =
        props.initialCover;

      uploadError.value = "";
      isProcessing.value = false;
    }
  },
);

/**
 * Sync dialog -> parent
 */
watch(
  visible,
  (value) => {
    emit("update:modelValue", value);
  },
);

/**
 * Handle PrimeVue FileUpload selection
 */
const onFileSelect = async (event: {
  files: File[];
}) => {
  const file = event.files?.[0];

  if (!file) {
    return;
  }

  /**
   * Validate size
   */
  if (file.size > 1_000_000) {
    uploadError.value =
      "File is too large. Max size is 1MB.";

    return;
  }

  /**
   * Validate type
   */
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
  ];

  if (!allowedTypes.includes(file.type)) {
    uploadError.value =
      "Unsupported image type. Use JPG, PNG, or GIF.";

    return;
  }

  uploadError.value = "";
  isProcessing.value = true;

  try {
    const thumbnail =
      await resizeToThumbnail(file);

    coverPreview.value = thumbnail;
    coverData.value = thumbnail;
  } catch {
    uploadError.value =
      "Failed to process image.";

    coverPreview.value =
      props.initialCover;

    coverData.value =
      props.initialCover;
  } finally {
    isProcessing.value = false;
  }
};

/**
 * Remove cover
 */
const removeCover = () => {
  coverPreview.value = "";
  coverData.value = "";
};

/**
 * Save appearance
 */
const save = async () => {
  if (isProcessing.value) {
    return;
  }

  if (uploadError.value) {
    return;
  }

  saving.value = true;

  try {
    emit("save", {
      color: selectedColor.value,
      cover: coverData.value,
    });

    visible.value = false;
  } finally {
    saving.value = false;
  }
};

/**
 * Reset state when dialog closes
 */
const onHide = () => {
  selectedColor.value =
    props.initialColor;

  coverPreview.value =
    props.initialCover;

  coverData.value =
    props.initialCover;

  uploadError.value = "";
  isProcessing.value = false;
};

/**
 * Determine whether black or white
 * gives better contrast against a color.
 */
const getContrastColor = (
  hex: string,
) => {
  const normalized =
    hex.replace("#", "");

  if (normalized.length !== 6) {
    return "#ffffff";
  }

  const r = Number.parseInt(
    normalized.substring(0, 2),
    16,
  );

  const g = Number.parseInt(
    normalized.substring(2, 4),
    16,
  );

  const b = Number.parseInt(
    normalized.substring(4, 6),
    16,
  );

  const brightness =
    (r * 299 +
      g * 587 +
      b * 114) /
    1000;

  return brightness > 155
    ? "#1a1714"
    : "#ffffff";
};
</script>