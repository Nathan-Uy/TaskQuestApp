<template>
  <Dialog
    v-model:visible="visible"
    header="Customize Project Appearance"
    :modal="true"
    class="w-full max-w-md"
    @hide="onHide"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Background Color</label>
        <div class="grid grid-cols-5 gap-2 mb-3">
          <div
            v-for="color in colorPalette"
            :key="color"
            :style="{ backgroundColor: color }"
            class="w-10 h-10 rounded-lg cursor-pointer border-2 hover:scale-105 transition-transform"
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
            <label class="block text-xs text-gray-500 mb-1">Custom color</label>
            <ColorPicker v-model="selectedColor" inline class="w-full" />
          </div>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2"
          >Cover Image (optional)</label
        >
        <FileUpload
          mode="basic"
          name="cover"
          accept="image/*"
          :maxFileSize="1000000"
          @uploader="onCoverUpload"
          chooseLabel="Upload Image"
          class="mb-2"
        />
        <div
          v-if="coverPreview"
          class="mt-2 relative w-full h-32 rounded overflow-hidden"
        >
          <img :src="coverPreview" class="w-full h-full object-cover" />
          <Button
            icon="pi pi-times"
            rounded
            text
            size="small"
            class="absolute top-1 right-1 bg-white"
            @click="removeCover"
          />
        </div>
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
import FileUpload from "primevue/fileupload";
import Button from "primevue/button";

const props = defineProps<{
  modelValue: boolean;
  project: any | null;
  initialColor: string;
  initialCover: string;
  colorPalette: string[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", payload: { color: string; cover: string }): void;
}>();

const visible = ref(props.modelValue);
const selectedColor = ref(props.initialColor);
const coverPreview = ref(props.initialCover);
const coverData = ref(props.initialCover);

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val) {
      selectedColor.value = props.initialColor;
      coverPreview.value = props.initialCover;
      coverData.value = props.initialCover;
    }
  },
);

watch(visible, (val) => emit("update:modelValue", val));

const onCoverUpload = (event: any) => {
  const file = event.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      coverPreview.value = e.target?.result as string;
      coverData.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
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

const onHide = () => {
  selectedColor.value = props.initialColor;
  coverPreview.value = props.initialCover;
  coverData.value = props.initialCover;
};
</script>
