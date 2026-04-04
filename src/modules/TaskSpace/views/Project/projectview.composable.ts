// src/modules/TaskSpace/Project/projectview.composable.ts
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useWorkspaceTeamsStore } from "@/modules/Workspace/workspace-team.store";
import { useWorkspaceSprintsStore } from "@/modules/Workspace/workspace-sprints.store";

export function useProjectView() {
  const teamsStore = useWorkspaceTeamsStore();
  const sprintsStore = useWorkspaceSprintsStore();
  const router = useRouter();
  const toast = useToast();

  const projects = ref<any[]>([]);
  const showCreateDialog = ref(false);
  const showCustomizeDialog = ref(false);
  const customizingProject = ref<any>(null);
  const tempColor = ref("");
  const tempCover = ref("");

  const colorPalette = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#64748b",
    "#475569",
    "#1e293b",
  ];

  const loadProjects = async () => {
    if (teamsStore.teams.length === 0) await teamsStore.fetchTeams();
    projects.value = teamsStore.teams;
  };

  const getProjectStyle = (projectId: string) => {
    const saved = localStorage.getItem(`project_style_${projectId}`);
    return saved ? JSON.parse(saved) : {};
  };

  const getTileStyle = (projectId: string) => {
    const style = getProjectStyle(projectId);
    return style.backgroundColor
      ? { backgroundColor: style.backgroundColor }
      : {};
  };

  const getCoverImage = (projectId: string) => {
    const style = getProjectStyle(projectId);
    return style.coverImage || null;
  };

  const openCustomizeDialog = (project: any) => {
    customizingProject.value = project;
    const style = getProjectStyle(project._id);
    tempColor.value = style.backgroundColor || "";
    tempCover.value = style.coverImage || "";
    showCustomizeDialog.value = true;
  };

  const saveProjectAppearance = async (payload: {
    color: string;
    cover: string;
  }) => {
    if (!customizingProject.value) return;
    const style = {
      backgroundColor: payload.color,
      coverImage: payload.cover,
    };
    localStorage.setItem(
      `project_style_${customizingProject.value._id}`,
      JSON.stringify(style),
    );
    toast.add({
      severity: "success",
      summary: "Appearance Updated",
      detail: `Customized appearance for ${customizingProject.value.name}`,
      life: 3000,
    });
    showCustomizeDialog.value = false;
    projects.value = [...projects.value];
  };

  const handleCreateProject = async (payload: {
    name: string;
    description: string;
  }) => {
    try {
      const created = await teamsStore.createTeam(
        payload.name,
        payload.description,
      );
      toast.add({
        severity: "success",
        summary: "Project Created",
        detail: `${created.name} has been created.`,
        life: 3000,
      });
      await loadProjects();
      await selectProject(created._id);
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to create project";
      toast.add({
        severity: "error",
        summary: "Creation Failed",
        detail: message,
        life: 4000,
      });
      throw error;
    }
  };

  const selectProject = async (projectId: string) => {
    localStorage.setItem("taskSpace_lastProjectId", projectId);
    await sprintsStore.fetchSprints(projectId);
    const sprints = sprintsStore.sprints;
    if (sprints.length > 0) {
      const firstSprint = sprints[0]!;
      router.push(
        `/taskspace/project/${projectId}/sprint/${firstSprint._id}/tasks`,
      );
    } else {
      toast.add({
        severity: "warn",
        summary: "No Sprints",
        detail: "This project has no sprints. Create a sprint first.",
        life: 4000,
      });
    }
  };

  onMounted(() => {
    loadProjects();
  });

  return {
    projects,
    showCreateDialog,
    showCustomizeDialog,
    customizingProject,
    tempColor,
    tempCover,
    colorPalette,
    getTileStyle,
    getCoverImage,
    openCustomizeDialog,
    saveProjectAppearance,
    handleCreateProject,
    selectProject,
  };
}
