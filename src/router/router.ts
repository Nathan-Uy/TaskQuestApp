import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/tasks" },
    {
      path: "/tasks",
      name: "tasks",
      component: () => import("@/modules/Tasks/TasksView.vue"),
      meta: { title: "Tasks" },
    },
    {
      path: "/pomodoro",
      name: "pomodoro",
      component: () => import("@/modules/Pomodoro/PomodoroView.vue"),
      meta: { title: "Pomodoro" },
    },
    {
      path: "/calendar",
      name: "calendar",
      component: () => import("@/modules/Calendar/CalendarView.vue"),
      meta: { title: "Calendar" },
    },
    {
      path: "/goals",
      name: "goals",
      component: () => import("@/modules/Goals/GoalsView.vue"),
      meta: { title: "Goals" },
    },
    {
      path: "/analytics",
      name: "analytics",
      component: () => import("@/modules/Analytics/AnalyticsView.vue"),
      meta: { title: "Analytics" },
    },
    {
      path: "/settings",
      component: () => import("@/modules/Settings/SettingsView.vue"),
    },
  ],
});

router.afterEach((to) => {
  document.title = `${to.meta.title ?? "TaskQuest"} — TaskQuest`;
});

export default router;
