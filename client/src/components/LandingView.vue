<template>
  <div
    class="relative min-h-screen overflow-hidden bg-[#f5f0e8] font-['DM_Sans',sans-serif]"
  >
    <!-- Noise texture via pseudo-element workaround: use a dedicated component or move to global CSS -->
    <!-- Background orbs -->
    <div
      class="pointer-events-none absolute -right-20 -top-28 z-0 h-120 w-120 rounded-full"
      style="
        background: radial-gradient(
          circle,
          rgba(210, 140, 80, 0.18) 0%,
          transparent 70%
        );
      "
    />
    <div
      class="pointer-events-none absolute -bottom-16 -left-24 z-0 h-90 w-90 rounded-full"
      style="
        background: radial-gradient(
          circle,
          rgba(180, 100, 60, 0.12) 0%,
          transparent 70%
        );
      "
    />

    <!-- Nav -->
    <nav class="relative z-10 flex items-center justify-between px-12 py-6">
      <p
        class="m-0 font-['Fraunces',serif] text-[22px] font-bold tracking-tight text-[#2c1f0e]"
      >
        Task<span class="text-[#c2622a]">Quest</span>
      </p>
    </nav>

    <!-- Hero -->
    <div
      class="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-275 grid-cols-2 items-center gap-12 px-12 pb-12 pt-8 max-[768px]:grid-cols-1 max-[768px]:px-6"
    >
      <!-- Left -->
      <div class="flex flex-col">
        <!-- Badge -->
        <div
          class="mb-6 inline-flex w-fit animate-[fadeUp_0.5s_0.05s_ease_both] items-center gap-1.5 rounded-full border border-[rgba(194,98,42,0.25)] bg-[rgba(194,98,42,0.1)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-widest text-[#a04a18]"
        >
          <span
            class="h-1.5 w-1.5 animate-[pulse_2s_ease-in-out_infinite] rounded-full bg-[#c2622a]"
          />
          Gamified productivity
        </div>

        <h1
          class="m-0 mb-5 animate-[fadeUp_0.5s_0.12s_ease_both] font-['Fraunces',serif] text-[56px] font-light leading-tight tracking-[-1.5px] text-[#1c1008] max-[768px]:text-[40px]"
        >
          Turn your tasks<br />
          into <em class="italic text-[#c2622a]">achievements</em>
        </h1>

        <p
          class="mb-8 max-w-105 animate-[fadeUp_0.5s_0.18s_ease_both] text-[15px] leading-[1.7] text-[#6b5540]"
        >
          TaskQuest transforms your daily work into an adventure. Complete
          tasks, earn XP, level up, and build streaks that keep you motivated
          every single day.
        </p>

        <!-- Feature pills -->
        <div
          class="mb-10 flex animate-[fadeUp_0.5s_0.25s_ease_both] flex-wrap gap-2"
        >
          <span
            v-for="f in features"
            :key="f"
            class="inline-flex items-center gap-1.5 rounded-full border border-[rgba(180,140,90,0.25)] bg-white/70 px-3.5 py-1.5 text-xs font-medium text-[#5a3e22]"
          >
            <span class="text-[11px] text-[#c2622a]">✓</span> {{ f }}
          </span>
        </div>

        <!-- Stats -->
        <div class="flex animate-[fadeUp_0.5s_0.32s_ease_both] items-center">
          <div
            v-for="(stat, i) in stats"
            :key="stat.label"
            class="flex items-center"
          >
            <div
              v-if="i > 0"
              class="mr-6 h-9 w-px shrink-0 bg-[rgba(180,140,90,0.25)]"
            />
            <div class="pr-6">
              <p
                class="m-0 mb-1 font-['Fraunces',serif] text-[28px] font-bold leading-none text-[#1c1008]"
              >
                {{ stat.value }}
              </p>
              <p
                class="m-0 text-[11px] font-medium uppercase tracking-widest text-[#9e7a52]"
              >
                {{ stat.label }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right — Card -->
      <div class="animate-[fadeUp_0.5s_0.2s_ease_both]">
        <div
          class="rounded-3xl border border-[rgba(180,140,90,0.2)] bg-white/92 p-10 shadow-[0_24px_64px_rgba(60,30,10,0.1),0_2px_8px_rgba(60,30,10,0.04)] backdrop-blur-lg"
        >
          <p
            class="mb-7 text-center text-[11px] font-medium uppercase tracking-widest text-[#9e7a52]"
          >
            Start your quest
          </p>

          <GoogleLogin
            :callback="handleGoogleLogin"
            :auto-login="false"
            prompt
            class="mb-2 w-full"
          />

          <p v-if="loading" class="my-1 text-center text-xs text-[#9e7a52]">
            Signing in...
          </p>
          <p
            v-if="error"
            class="my-1 rounded-lg bg-[rgba(194,98,42,0.08)] px-3 py-2 text-center text-xs text-[#c2622a]"
          >
            {{ error }}
          </p>

          <!-- Divider -->
          <div class="my-5 flex items-center gap-3">
            <div class="h-px flex-1 bg-[rgba(180,140,90,0.2)]" />
            <span
              class="whitespace-nowrap text-[11px] font-medium uppercase tracking-widest text-[#b8976a]"
            >
              What you unlock
            </span>
            <div class="h-px flex-1 bg-[rgba(180,140,90,0.2)]" />
          </div>

          <!-- Perks -->
          <div class="mb-7 flex flex-col gap-2.5">
            <div
              v-for="perk in perks"
              :key="perk.title"
              class="flex items-center gap-3 rounded-[10px] border border-[rgba(180,140,90,0.12)] bg-[#faf7f2] px-3.5 py-3"
            >
              <div
                class="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg text-base"
                :class="perk.iconBg"
              >
                {{ perk.icon }}
              </div>
              <div>
                <div class="mb-0.5 text-[13px] font-medium text-[#2c1f0e]">
                  {{ perk.title }}
                </div>
                <div class="text-[11px] text-[#9e7a52]">{{ perk.sub }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { GoogleLogin } from "vue3-google-login";

const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);
const error = ref("");

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

const perks = [
  {
    icon: "⚡",
    iconBg: "bg-[rgba(194,98,42,0.1)]",
    title: "Earn XP for every task",
    sub: "Track progress and level up over time",
  },
  {
    icon: "🔥",
    iconBg: "bg-[rgba(220,120,40,0.1)]",
    title: "Build daily streaks",
    sub: "Stay consistent and watch your streak grow",
  },
  {
    icon: "🏆",
    iconBg: "bg-[rgba(160,80,20,0.1)]",
    title: "Unlock achievements",
    sub: "Reach milestones and earn badges",
  },
];

const handleGoogleLogin = async (response: any) => {
  const credential = response?.credential ?? response?.access_token;
  if (!credential) {
    error.value = "No credential received from Google. Please try again.";
    return;
  }

  loading.value = true;
  error.value = "";
  try {
    await auth.googleLogin(credential);
    router.push("/personal-tasks");
  } catch (e: any) {
    error.value =
      e.response?.data?.message ?? "Google sign-in failed. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>
