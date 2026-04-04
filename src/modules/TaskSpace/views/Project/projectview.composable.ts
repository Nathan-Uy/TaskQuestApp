import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import {
  useProjects,
  useCreateProject,
  useProject,
  useUpdateProject,
  useAddMember,
  useRemoveMember,
} from "./project.tanstack";
import type { Project, CreateProjectDto } from "./project.types";

export function useProjectView() {
  const router = useRouter();
  const toast = useToast();

  // Queries
  const { data: projects, isLoading, error, refetch } = useProjects();
  const projectsList = computed(() => projects.value || []);

  // Mutations
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const addMemberMutation = useAddMember();
  const removeMemberMutation = useRemoveMember();

  // UI state
  const showCreateDialog = ref(false);
  const showCustomizeDialog = ref(false);
  const customizingProject = ref<Project | null>(null);
  const tempColor = ref("");
  const tempCover = ref("");

  // Color palette
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

  // Local storage helpers for appearance
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

  const openCustomizeDialog = (project: Project) => {
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
    await refetch();
  };

  // ✅ Fixed: use the created project's ID from the response
  const handleCreateProject = async (payload: CreateProjectDto) => {
    try {
      const result = await createProjectMutation.mutateAsync(payload);
      const newProjectId = result.data._id; // extract ID
      toast.add({
        severity: "success",
        summary: "Project Created",
        detail: `${result.data.name} has been created.`,
        life: 3000,
      });
      showCreateDialog.value = false;
      await refetch();
      // Navigate to teams page of the new project
      router.push(`/taskspace/project/${newProjectId}/teams`);
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to create project";
      toast.add({
        severity: "error",
        summary: "Creation Failed",
        detail: message,
        life: 4000,
      });
    }
  };

  const selectProject = (projectId: string) => {
    router.push(`/taskspace/project/${projectId}/teams`);
  };

  return {
    projects: projectsList,
    isLoading,
    error,
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
    refetch,
  };
}
