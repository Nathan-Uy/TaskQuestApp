<template>
  <div
    style="
      min-height: 100vh;
      background: #f5f3ef;
    "
  >
    <!-- Nav -->
    <nav
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 3rem;
        border-bottom: 2px solid #1a1714;
      "
    >
      <p
        style="
          margin: 0;
          font-size: 1.25rem;
          font-weight: 900;
          color: #1a1714;
          letter-spacing: -0.03em;
        "
      >
        Task<span style="color: var(--accent)">Quest</span>
      </p>
      <span
        style="
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--ink-muted);
        "
      >
        Gamified Productivity
      </span>
    </nav>

    <!-- Hero -->
    <div
      style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        max-width: 1100px;
        margin: 0 auto;
        padding: 4rem 3rem;
        align-items: start;
      "
    >
      <!-- Left -->
      <div>
        <!-- Label -->
        <div
          style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--accent);
            color: #fff;
            padding: 4px 12px;
            font-size: 0.65rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border: 2px solid #1a1714;
            box-shadow: 3px 3px 0 #1a1714;
            margin-bottom: 1.5rem;
          "
        >
          <span
            style="
              width: 6px;
              height: 6px;
              background: #fff;
              display: inline-block;
            "
          />
          Gamified productivity
        </div>

        <h1
          style="
            font-size: 3.5rem;
            font-weight: 900;
            color: #1a1714;
            letter-spacing: -0.04em;
            line-height: 1;
            margin: 0 0 1.25rem;
          "
        >
          Turn your tasks<br />
          into
          <span
            style="
              color: var(--accent);
              text-decoration: underline;
              text-decoration-thickness: 3px;
            "
            >achievements</span
          >
        </h1>

        <p
          style="
            font-size: 1rem;
            line-height: 1.65;
            color: var(--ink-secondary);
            max-width: 420px;
            margin: 0 0 2rem;
            font-weight: 500;
          "
        >
          TaskQuest transforms your daily work into an adventure. Complete
          tasks, earn XP, level up, and build streaks that keep you motivated
          every single day.
        </p>

        <!-- Feature pills -->
        <div
          style="
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 2.5rem;
          "
        >
          <span
            v-for="f in features"
            :key="f"
            style="
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 5px 12px;
              font-size: 0.75rem;
              font-weight: 700;
              color: #1a1714;
              background: #fff;
              border: 2px solid #1a1714;
              letter-spacing: 0.02em;
            "
          >
            <span
              style="color: var(--accent); font-size: 0.65rem; font-weight: 900"
              >✓</span
            >
            {{ f }}
          </span>
        </div>

        <!-- Stats -->
        <div style="display: flex; align-items: center; gap: 0">
          <div
            v-for="(stat, i) in stats"
            :key="stat.label"
            :style="{
              borderLeft: i > 0 ? '2px solid #1a1714' : 'none',
              paddingLeft: i > 0 ? '1.5rem' : '0',
              marginLeft: i > 0 ? '1.5rem' : '0',
            }"
          >
            <p
              style="
                margin: 0 0 2px;
                font-size: 2rem;
                font-weight: 900;
                color: #1a1714;
                letter-spacing: -0.03em;
                line-height: 1;
              "
            >
              {{ stat.value }}
            </p>
            <p
              style="
                margin: 0;
                font-size: 0.6rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: var(--ink-muted);
              "
            >
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>

      <!-- Right — Login Card -->
      <div
        style="
          background: #fff;
          border: 2px solid #1a1714;
          box-shadow: 6px 6px 0 #1a1714;
          padding: 2.5rem;
        "
      >
        <p
          style="
            text-align: center;
            font-size: 0.65rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: var(--ink-muted);
            margin: 0 0 1.5rem;
          "
        >
          Start your quest
        </p>

        <GoogleLogin
          :callback="handleGoogleLogin"
          :auto-login="false"
          prompt
        />

        <p
          v-if="loading"
          style="
            text-align: center;
            font-size: 0.75rem;
            color: var(--ink-muted);
            margin: 8px 0;
            font-weight: 600;
          "
        >
          Signing in...
        </p>
        <p
          v-if="error"
          style="
            background: var(--danger-soft);
            border: 1.5px solid var(--danger);
            padding: 8px 12px;
            font-size: 0.75rem;
            color: var(--danger);
            margin: 8px 0;
            font-weight: 600;
            text-align: center;
          "
        >
          {{ error }}
        </p>

        <!-- Divider -->
        <div
          style="
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 1.5rem 0;
          "
        >
          <div style="flex: 1; height: 2px; background: #1a1714" />
          <span
            style="
              font-size: 0.6rem;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: var(--ink-muted);
              white-space: nowrap;
            "
            >What you unlock</span
          >
          <div style="flex: 1; height: 2px; background: #1a1714" />
        </div>

        <!-- Perks -->
        <div
          style="
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 1.5rem;
          "
        >
          <div
            v-for="perk in perks"
            :key="perk.title"
            style="
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 10px 12px;
              background: #f5f3ef;
              border: 2px solid #1a1714;
            "
          >
            <div
              style="
                width: 34px;
                height: 34px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
                border: 2px solid #1a1714;
                background: #fff;
              "
            >
              {{ perk.icon }}
            </div>
            <div>
              <p
                style="
                  margin: 0 0 2px;
                  font-size: 0.8rem;
                  font-weight: 700;
                  color: #1a1714;
                "
              >
                {{ perk.title }}
              </p>
              <p
                style="
                  margin: 0;
                  font-size: 0.7rem;
                  color: var(--ink-muted);
                  font-weight: 500;
                "
              >
                {{ perk.sub }}
              </p>
            </div>
          </div>
        </div>

        <p
          style="
            text-align: center;
            font-size: 0.65rem;
            font-weight: 600;
            color: var(--ink-muted);
            margin: 0;
            border-top: 2px solid #e8e4de;
            padding-top: 1rem;
          "
        >
          Free forever. No credit card required.
        </p>
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
    title: "Earn XP for every task",
    sub: "Track progress and level up over time",
  },
  {
    icon: "🔥",
    title: "Build daily streaks",
    sub: "Stay consistent and watch your streak grow",
  },
  {
    icon: "🏆",
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
    await router.push("/personal-tasks");
    await auth.syncStores();
  } catch (e: any) {
    if (e?.name?.includes("Navigation")) return;
    error.value =
      e.response?.data?.message ?? "Google sign-in failed. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>
