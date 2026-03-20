<template>
  <div class="h-full overflow-hidden bg-(--surface-bg)">
    <div class="fixed inset-0 pointer-events-none landing-bg" />

    <!-- Nav -->
    <nav class="relative z-10 flex items-center justify-between px-12 py-6">
      <p class="font-serif text-2xl text-stone-800">TaskQuest</p>
      <div class="flex items-center gap-3">
        <button
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

    <!-- Main -->
    <div
      class="relative z-10 grid grid-cols-2 gap-16 items-center px-12 py-8 max-w-6xl mx-auto min-h-[calc(100vh-80px)]"
    >
      <!-- Left: Hero -->
      <div>
        <div
          class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 text-xs font-semibold bg-(--accent-soft) text-(--accent)"
        >
          <i class="pi pi-star-fill text-[0.6rem]" />
          Gamified productivity
        </div>

        <h1 class="font-serif text-stone-800 leading-[1.05] mb-5 text-[3.5rem]">
          Turn your tasks<br />
          into <span class="text-(--accent)">achievements</span>
        </h1>

        <p class="text-stone-500 leading-relaxed mb-8 text-base max-w-105">
          TaskQuest transforms your daily work into an adventure. Complete
          tasks, earn XP, level up, and build streaks that keep you motivated
          every day.
        </p>

        <!-- Feature pills -->
        <div class="flex flex-wrap gap-2 mb-10">
          <span
            v-for="f in features"
            :key="f"
            class="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-full px-3 py-1.5"
          >
            <span class="text-(--accent)">✓</span> {{ f }}
          </span>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-8">
          <div v-for="stat in stats" :key="stat.label">
            <p class="font-serif text-2xl text-stone-800 leading-none mb-1">
              {{ stat.value }}
            </p>
            <p class="text-xs text-stone-400 font-medium">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Right: Auth card -->
      <div
        class="bg-white rounded-3xl border border-stone-200 p-8 shadow-[0_20px_60px_rgba(26,23,20,0.10)]"
      >
        <!-- Tabs -->
        <div class="flex gap-1 bg-stone-100 rounded-xl p-1 mb-7">
          <button
            v-for="tab in ['login', 'register']"
            :key="tab"
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

        <!-- Error -->
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

        <!-- Login form -->
        <div v-if="activeForm === 'login'" class="flex flex-col gap-4">
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
              @keyup.enter="handleLogin"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
              >Password</label
            >
            <Password
              v-model="loginForm.password"
              placeholder="••••••••"
              :feedback="false"
              toggle-mask
              input-class="w-full"
              class="w-full"
              @keyup.enter="handleLogin"
            />
          </div>
          <button
            :disabled="loading"
            class="w-full py-3 rounded-xl text-sm font-bold text-white mt-2 transition-all duration-150 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed bg-(--accent)"
            @click="handleLogin"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <i class="pi pi-spinner pi-spin text-sm" /> Signing in...
            </span>
            <span v-else>Sign in →</span>
          </button>
          <p class="text-center text-xs text-stone-400 mt-1">
            No account?
            <button
              class="font-semibold hover:underline text-(--accent)"
              @click="activeForm = 'register'"
            >
              Create one free
            </button>
          </p>
        </div>

        <!-- Register form -->
        <div v-else class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
              >Display name</label
            >
            <InputText
              v-model="registerForm.displayName"
              placeholder="Your name"
              class="w-full"
              @keyup.enter="handleRegister"
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
              @keyup.enter="handleRegister"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
              >Password</label
            >
            <Password
              v-model="registerForm.password"
              placeholder="••••••••"
              :feedback="false"
              toggle-mask
              input-class="w-full"
              class="w-full"
              @keyup.enter="handleRegister"
            />
          </div>
          <button
            :disabled="loading"
            class="w-full py-3 rounded-xl text-sm font-bold text-white mt-2 transition-all duration-150 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed bg-(--accent)"
            @click="handleRegister"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <i class="pi pi-spinner pi-spin text-sm" /> Creating account...
            </span>
            <span v-else>Start your quest →</span>
          </button>
          <p class="text-center text-xs text-stone-400 mt-1">
            Already have an account?
            <button
              class="font-semibold hover:underline text-(--accent)"
              @click="activeForm = 'login'"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { useAuthStore } from "@/stores/auth.store";

const router = useRouter();
const auth = useAuthStore();

const activeForm = ref<"login" | "register">("login");
const loading = ref(false);
const error = ref("");

const loginForm = ref({ email: "", password: "" });
const registerForm = ref({ displayName: "", email: "", password: "" });

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

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    error.value = "Please fill in all fields";
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    await auth.login(loginForm.value.email, loginForm.value.password);
    router.push("/tasks");
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    error.value = err.response?.data?.message || "Something went wrong";
  } finally {
    loading.value = false;
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
    router.push("/tasks");
  } catch (e: any) {
    error.value = e.response?.data?.message || "Registration failed";
  } finally {
    loading.value = false;
  }
};
</script>
