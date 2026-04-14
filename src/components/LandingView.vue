<template>
  <div class="h-full overflow-hidden bg-(--surface-bg)">
    <div class="fixed inset-0 pointer-events-none landing-bg" />

    <nav class="relative z-10 flex items-center justify-between px-12 py-6">
      <p class="font-serif text-2xl text-stone-800">TaskQuest</p>
      <div class="flex items-center gap-3">
        <button
          type="button"
          :class="[
            'text-sm font-medium px-4 py-2 rounded-lg transition-all duration-150',
            activeForm === 'login'
              ? 'text-white bg-(--accent)'
              : 'text-stone-500 hover:text-stone-800',
          ]"
          @click="activeForm = 'login'"
        >
          Sign in
        </button>
        <button
          type="button"
          :class="[
            'text-sm font-medium px-4 py-2 rounded-lg transition-all duration-150',
            activeForm === 'register'
              ? 'text-white bg-(--accent)'
              : 'text-stone-500 hover:text-stone-800',
          ]"
          @click="activeForm = 'register'"
        >
          Get started
        </button>
      </div>
    </nav>

    <div
      class="relative z-10 grid grid-cols-2 gap-16 items-center px-12 py-8 max-w-6xl mx-auto min-h-[calc(100vh-80px)]"
    >
      <div>
        <div
          class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 text-xs font-semibold bg-(--accent-soft) text-(--accent)"
        >
          <i class="pi pi-star-fill text-[0.6rem]" />
          Gamified productivity
        </div>
        <h1 class="font-serif text-stone-800 leading-[1.05] mb-5 text-[3.5rem]">
          Turn your tasks<br />into
          <span class="text-(--accent)">achievements</span>
        </h1>
        <p class="text-stone-500 leading-relaxed mb-8 text-base max-w-105">
          TaskQuest transforms your daily work into an adventure. Complete
          tasks, earn XP, level up, and build streaks that keep you motivated
          every day.
        </p>
        <div class="flex flex-wrap gap-2 mb-10">
          <span
            v-for="f in features"
            :key="f"
            class="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-full px-3 py-1.5"
          >
            <span class="text-(--accent)">✓</span> {{ f }}
          </span>
        </div>
        <div class="flex items-center gap-8">
          <div v-for="stat in stats" :key="stat.label">
            <p class="font-serif text-2xl text-stone-800 leading-none mb-1">
              {{ stat.value }}
            </p>
            <p class="text-xs text-stone-400 font-medium">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-3xl border border-stone-200 p-8 shadow-[0_20px_60px_rgba(26,23,20,0.10)]"
      >
        <div class="flex gap-1 bg-stone-100 rounded-xl p-1 mb-7">
          <button
            v-for="tab in ['login', 'register']"
            :key="tab"
            type="button"
            :class="[
              'flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150 capitalize',
              activeForm === tab
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-400 hover:text-stone-600',
            ]"
            @click="activeForm = tab as 'login' | 'register'"
          >
            {{ tab === "login" ? "Sign in" : "Create account" }}
          </button>
        </div>

        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 -translate-y-1"
          leave-to-class="opacity-0"
        >
          <div
            v-if="error"
            class="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5"
          >
            <i class="pi pi-exclamation-circle text-red-500 text-sm" />
            <p class="text-xs text-red-600 font-medium">{{ error }}</p>
          </div>
        </Transition>

        <form
          v-if="activeForm === 'login'"
          class="flex flex-col gap-4"
          @submit.prevent="handleLogin"
          novalidate
        >
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
              >Email</label
            >
            <InputText
              v-model="loginForm.email"
              placeholder="you@example.com"
              type="email"
              class="w-full"
              :disabled="emailLocked"
              :class="emailLocked ? 'opacity-60 cursor-not-allowed' : ''"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <label
                class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
                >Password</label
              >
              <Transition
                enter-active-class="transition-all duration-300"
                enter-from-class="opacity-0 translate-x-2"
                leave-to-class="opacity-0"
              >
                <button
                  v-if="showForgotLink"
                  type="button"
                  class="text-xs font-semibold text-(--accent) hover:underline transition-colors duration-150"
                  @click="openForgotModal"
                >
                  Forgot password?
                </button>
              </Transition>
            </div>
            <div class="relative">
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all duration-150 pr-10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                @click="showPassword = !showPassword"
              >
                <i
                  :class="[
                    'pi text-sm',
                    showPassword ? 'pi-eye-slash' : 'pi-eye',
                  ]"
                />
              </button>
            </div>
          </div>

          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            leave-to-class="opacity-0"
          >
            <div
              v-if="failedAttempts > 0 && failedAttempts < 3"
              class="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2"
            >
              <i class="pi pi-exclamation-triangle text-xs" />
              {{ 3 - failedAttempts }} attempt{{
                3 - failedAttempts !== 1 ? "s" : ""
              }}
              remaining before account recovery
            </div>
          </Transition>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-xl text-sm font-bold text-white mt-2 transition-all duration-150 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed bg-(--accent)"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <i class="pi pi-spinner pi-spin text-sm" /> Signing in...
            </span>
            <span v-else>Sign in →</span>
          </button>
          <p class="text-center text-xs text-stone-400 mt-1">
            No account?
            <button
              type="button"
              class="font-semibold hover:underline text-(--accent)"
              @click="activeForm = 'register'"
            >
              Create one free
            </button>
          </p>
        </form>

        <form
          v-else
          class="flex flex-col gap-4"
          @submit.prevent="handleRegister"
          novalidate
        >
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
              >Display name</label
            >
            <InputText
              v-model="registerForm.displayName"
              placeholder="Your name"
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
              >Email</label
            >
            <InputText
              v-model="registerForm.email"
              placeholder="you@example.com"
              type="email"
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
              >Password</label
            >
            <div class="relative">
              <input
                v-model="registerForm.password"
                :type="showRegisterPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all duration-150 pr-10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                @click="showRegisterPassword = !showRegisterPassword"
              >
                <i
                  :class="[
                    'pi text-sm',
                    showRegisterPassword ? 'pi-eye-slash' : 'pi-eye',
                  ]"
                />
              </button>
            </div>
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-xl text-sm font-bold text-white mt-2 transition-all duration-150 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed bg-(--accent)"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <i class="pi pi-spinner pi-spin text-sm" /> Creating account...
            </span>
            <span v-else>Start your quest →</span>
          </button>
          <p class="text-center text-xs text-stone-400 mt-1">
            Already have an account?
            <button
              type="button"
              class="font-semibold hover:underline text-(--accent)"
              @click="activeForm = 'login'"
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showForgot"
        class="fixed inset-0 flex items-center justify-center z-50"
      >
        <div
          class="absolute inset-0 bg-black/20 backdrop-blur-sm"
          @click="closeForgot"
        />
        <div class="relative bg-white rounded-2xl p-6 shadow-xl w-80">
          <p class="text-sm font-semibold text-stone-800 mb-1">
            Forgot password?
          </p>
          <p class="text-xs text-stone-400 mb-4">
            We'll send a reset link to your email.
          </p>

          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <div
              v-if="forgotMessage"
              :class="[
                'text-xs font-medium px-3 py-2 rounded-lg mb-3 flex items-center gap-2',
                forgotSuccess
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-red-50 text-red-500',
              ]"
            >
              <i
                :class="[
                  'pi text-sm',
                  forgotSuccess ? 'pi-check-circle' : 'pi-exclamation-circle',
                ]"
              />
              {{ forgotMessage }}
            </div>
          </Transition>

          <InputText
            v-model="forgotEmail"
            placeholder="you@example.com"
            type="email"
            class="w-full mb-3 opacity-60 cursor-not-allowed"
            :disabled="true"
          />

          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-all duration-150"
              @click="closeForgot"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="forgotLoading || forgotSuccess"
              class="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-(--accent) hover:opacity-90 transition-all duration-150 disabled:opacity-50"
              @click="handleForgot"
            >
              <i
                v-if="forgotLoading"
                class="pi pi-spinner pi-spin mr-1 text-xs"
              />
              {{
                forgotLoading
                  ? "Sending..."
                  : forgotSuccess
                    ? "Sent!"
                    : "Send link"
              }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import InputText from "primevue/inputtext";
import { useAuthStore } from "@/stores/auth.store";
import api from "@/api/axios";

const router = useRouter();
const auth = useAuthStore();

const activeForm = ref<"login" | "register">("login");
const loading = ref(false);
const error = ref("");
const failedAttempts = ref(0);
const showForgotLink = ref(false);
const emailLocked = ref(false);
const showPassword = ref(false);
const showRegisterPassword = ref(false);

const loginForm = ref({ email: "", password: "" });
const registerForm = ref({ displayName: "", email: "", password: "" });

const showForgot = ref(false);
const forgotEmail = ref("");
const forgotLoading = ref(false);
const forgotMessage = ref("");
const forgotSuccess = ref(false);

const features = [
  "Task management",
  "Pomodoro timer",
  "Goal tracking",
  "XP & leveling",
  "Streak system",
  "Analytics",
];

const stats = [
  { value: "∞", label: "Tasks supported" },
  { value: "XP", label: "Earned per task" },
  { value: "🔥", label: "Streak tracking" },
];

watch(activeForm, () => {
  error.value = "";
  failedAttempts.value = 0;
  showForgotLink.value = false;
  emailLocked.value = false;
  showPassword.value = false;
});

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    error.value = "Please fill in all fields";
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    await auth.login(loginForm.value.email, loginForm.value.password);
    failedAttempts.value = 0;
    showForgotLink.value = false;
    emailLocked.value = false;
    router.push("/personal-tasks");
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    error.value = err.response?.data?.message || "Something went wrong";
    failedAttempts.value++;
    if (failedAttempts.value >= 3) {
      showForgotLink.value = true;
      emailLocked.value = true;
    }
  } finally {
    loading.value = false;
  }
};

const openForgotModal = () => {
  forgotEmail.value = loginForm.value.email;
  forgotMessage.value = "";
  forgotSuccess.value = false;
  showForgot.value = true;
};

const closeForgot = () => {
  showForgot.value = false;
  forgotMessage.value = "";
  forgotSuccess.value = false;
};

const handleForgot = async () => {
  if (!forgotEmail.value) {
    forgotMessage.value = "Please enter your email";
    forgotSuccess.value = false;
    return;
  }
  forgotLoading.value = true;
  forgotMessage.value = "";
  forgotSuccess.value = false;
  try {
    await api.post("/auth/forgot-password", { email: forgotEmail.value });
    forgotSuccess.value = true;
    forgotMessage.value = "Reset link sent! Check your email.";
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    forgotMessage.value = err.response?.data?.message || "Something went wrong";
    forgotSuccess.value = false;
  } finally {
    forgotLoading.value = false;
  }
};

const handleRegister = async () => {
  const { displayName, email, password } = registerForm.value;
  if (!displayName || !email || !password) {
    error.value = "Please fill in all fields";
    return;
  }
  if (password.length < 6) {
    error.value = "Password must be at least 6 characters";
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    await auth.register(displayName, email, password);
    router.push("/personal-tasks");
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    error.value = err.response?.data?.message || "Registration failed";
  } finally {
    loading.value = false;
  }
};
</script>
