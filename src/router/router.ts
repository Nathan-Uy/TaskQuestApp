import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: () => import("@/components/LandingView.vue"),
      meta: { guest: true },
    },
    {
      path: "/login",
      component: () => import("@/components/LandingView.vue"),
      meta: { guest: true },
    },
    {
      path: "/tasks",
      component: () => import("@/modules/Tasks/TasksView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/pomodoro",
      component: () => import("@/modules/Pomodoro/PomodoroView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/calendar",
      component: () => import("@/modules/Calendar/CalendarView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/goals",
      component: () => import("@/modules/Goals/GoalsView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/analytics",
      component: () => import("@/modules/Analytics/AnalyticsView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      component: () => import("@/modules/Settings/SettingsView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, _, next) => {
  const auth = useAuthStore();

  // Try to fetch user if token exists but user is not loaded
  if (auth.token && !auth.user) {
    await auth.fetchMe();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next("/");
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return next("/tasks");
  }

  next();
});

export default router;
