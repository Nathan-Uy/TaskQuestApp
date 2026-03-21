<template>
  <div class="min-h-screen flex items-center justify-center bg-(--surface-bg)">
    <div
      class="bg-white rounded-3xl border border-stone-200 p-8 w-full max-w-md shadow-[0_20px_60px_rgba(26,23,20,0.10)]"
    >
      <h2 class="font-serif text-2xl text-stone-800 mb-2">Reset password</h2>
      <p class="text-xs text-stone-400 mb-6">Enter your new password below.</p>

      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 -translate-y-1"
        leave-to-class="opacity-0"
      >
        <div
          v-if="message"
          :class="[
            'flex items-center gap-2 rounded-xl px-4 py-3 mb-5 text-xs font-medium',
            success
              ? 'bg-emerald-50 border border-emerald-100 text-emerald-600'
              : 'bg-red-50 border border-red-100 text-red-600',
          ]"
        >
          <i
            :class="[
              'pi text-sm',
              success ? 'pi-check-circle' : 'pi-exclamation-circle',
            ]"
          />
          {{ message }}
        </div>
      </Transition>

      <div v-if="!success" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label
            class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
            >New Password</label
          >
          <Password
            v-model="password"
            placeholder="••••••••"
            :feedback="false"
            toggle-mask
            input-class="w-full"
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label
            class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
            >Confirm Password</label
          >
          <Password
            v-model="confirmPassword"
            placeholder="••••••••"
            :feedback="false"
            toggle-mask
            input-class="w-full"
            class="w-full"
          />
        </div>
        <button
          :disabled="loading"
          class="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-px disabled:opacity-50 bg-(--accent)"
          @click="handleReset"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <i class="pi pi-spinner pi-spin text-sm" /> Resetting...
          </span>
          <span v-else>Reset Password</span>
        </button>
      </div>

      <button
        v-else
        class="w-full mt-4 text-sm font-semibold text-(--accent) hover:underline"
        @click="router.push('/')"
      >
        Back to sign in →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Password from "primevue/password";
import api from "@/api/axios";

const route = useRoute();
const router = useRouter();

const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const message = ref("");
const success = ref(false);

const handleReset = async () => {
  if (!password.value || !confirmPassword.value) {
    message.value = "Please fill in all fields";
    return;
  }
  if (password.value.length < 6) {
    message.value = "Password must be at least 6 characters";
    return;
  }
  if (password.value !== confirmPassword.value) {
    message.value = "Passwords do not match";
    return;
  }

  loading.value = true;
  message.value = "";
  try {
    await api.post("/auth/reset-password", {
      token: route.query.token,
      password: password.value,
    });
    success.value = true;
    message.value = "Password reset successfully! You can now sign in.";
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    message.value = err.response?.data?.message || "Something went wrong";
  } finally {
    loading.value = false;
  }
};
</script>
