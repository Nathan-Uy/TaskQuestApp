import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Project } from "./project.types";
import { projectApi } from "./project.services";

type ProjectStyle = {
  backgroundColor?: string;
  coverImage?: string;
};

type ProjectWithMeta = Project & {
  memberCount: number;
};

export const useProjectStore = defineStore("project", () => {
  const showCreateDialog = ref(false);
  const showCustomizeDialog = ref(false);
  const selectedProjectId = ref<string | null>(null);
  const projects = ref<ProjectWithMeta[]>([]);
  const customizingProject = ref<Project | null>(null);
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

  const selectedProject = computed(
    () => projects.value.find((p) => p._id === selectedProjectId.value) ?? null,
  );

  const openCreate = () => {
    showCreateDialog.value = true;
  };
  const closeCreate = () => {
    showCreateDialog.value = false;
  };

  const openCustomize = (project: Project) => {
    customizingProject.value = project;
    const style = getProjectStyle(project._id);
    tempColor.value = style.backgroundColor ?? "";
    tempCover.value = style.coverImage ?? "";
    showCustomizeDialog.value = true;
  };

  const closeCustomize = () => {
    showCustomizeDialog.value = false;
    customizingProject.value = null;
    tempColor.value = "";
    tempCover.value = "";
  };

  const setSelectedProject = (projectId: string) => {
    selectedProjectId.value = projectId;
  };
  const clearSelectedProject = () => {
    selectedProjectId.value = null;
  };
  const setProjects = (data: ProjectWithMeta[]) => {
    projects.value = data;
  };
  const clearProjects = () => {
    projects.value = [];
  };

  const getStorageKey = (projectId: string) => `project_style_${projectId}`;

  const getProjectStyle = (projectId: string): ProjectStyle => {
    // ✅ Check project data first (from MongoDB)
    const project = projects.value.find((p) => p._id === projectId);
    if (project) {
      return {
        backgroundColor: project.color ?? undefined,
        coverImage: project.coverPhoto ?? undefined,
      };
    }
    // fallback to localStorage
    try {
      const saved = localStorage.getItem(getStorageKey(projectId));
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  // ✅ Now async — saves to API and localStorage
  const saveProjectStyle = async (
    projectId: string,
    color: string,
    cover: string,
  ) => {
    const style: ProjectStyle = {
      backgroundColor: color || undefined,
      coverImage: cover || undefined,
    };
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(style));

    // ✅ Persist to MongoDB
    await Promise.all([
      projectApi.updateCoverPhoto(projectId, cover || null),
      projectApi.updateColor(projectId, color || null),
    ]);

    // ✅ Update local projects array immediately
    const existing = projects.value.find((p) => p._id === projectId);
    if (existing) {
      existing.coverPhoto = cover || null;
      existing.color = color || null;
    }
  };

  const clearProjectStyle = (projectId: string) => {
    localStorage.removeItem(getStorageKey(projectId));
  };

  const getTileStyle = (projectId: string) => {
    const style = getProjectStyle(projectId);
    return style.backgroundColor
      ? { backgroundColor: style.backgroundColor }
      : {};
  };

  const getCoverImage = (projectId: string): string | null => {
    return getProjectStyle(projectId).coverImage ?? null;
  };

  return {
    showCreateDialog,
    showCustomizeDialog,
    selectedProjectId,
    projects,
    customizingProject,
    tempColor,
    tempCover,
    colorPalette,
    selectedProject,
    openCreate,
    closeCreate,
    openCustomize,
    closeCustomize,
    setSelectedProject,
    clearSelectedProject,
    setProjects,
    clearProjects,
    getProjectStyle,
    saveProjectStyle,
    clearProjectStyle,
    getTileStyle,
    getCoverImage,
  };
});
