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
      path: "/personal-tasks",
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

    {
      path: "/taskspace",
      component: () => import("@/modules/TaskSpace/TaskSpaceLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "projects",
          name: "TaskSpaceProjects",
          component: () =>
            import("@/modules/TaskSpace/views/Project/ProjectView.vue"),
        },
        {
          path: "project/:projectId/teams",
          name: "TaskSpaceTeams",
          component: () =>
            import("@/modules/TaskSpace/views/Teams/TeamsView.vue"),
        },
        {
          path: "team/:teamId/members",
          name: "TaskSpaceTeamMembers",
          component: () =>
            import("@/modules/TaskSpace/views/Teams/TeamMembersView.vue"),
        },
        {
          path: "team/:teamId/chat",
          name: "TaskSpaceTeamChat",
          component: () =>
            import("@/modules/TaskSpace/views/Teams/TeamChatView.vue"),
        },
        {
          path: "team/:teamId/sprints",
          name: "TaskSpaceTeamSprints",
          component: () =>
            import("@/modules/TaskSpace/views/Sprint/TeamSprintsView.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "team/:teamId/sprint/:sprintId/tasks",
          name: "TaskSpaceSprintTasks",
          component: () =>
            import("@/modules/TaskSpace/views/Sprint/SprintTasksView.vue"),
          meta: { requiresAuth: true },
        },
        { path: "", redirect: "/taskspace/projects" },
      ],
    },
    {
      path: "/reset-password",
      component: () => import("@/components/ResetPasswordView.vue"),
      meta: { guest: true },
    },
  ],
});

let initialized = false;

export const setInitialized = (val: boolean) => {
  initialized = val;
};

router.beforeEach(async (to, _, next) => {
  const auth = useAuthStore();

  if (auth.token && !initialized) {
    if (!auth.user) {
      await auth.fetchMe();
    }
    await auth.syncStores();
    initialized = true;
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next("/");
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return next("/personal-tasks");
  }

  next();
});

export default router;
