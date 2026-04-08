import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Project } from "./project.types";

type ProjectStyle = {
  backgroundColor?: string;
  coverImage?: string;
};

type ProjectWithMeta = Project & {
  memberCount: number;
};

export const useProjectStore = defineStore("project", () => {
  // -----------------------------
  // Dialog / UI State
  // -----------------------------
  const showCreateDialog = ref(false);
  const showCustomizeDialog = ref(false);

  // -----------------------------
  // Project Selection / Local Cache
  // -----------------------------
  const selectedProjectId = ref<string | null>(null);
  const projects = ref<ProjectWithMeta[]>([]);

  // Current project being customized
  const customizingProject = ref<Project | null>(null);

  // Temporary appearance values for dialog
  const tempColor = ref("");
  const tempCover = ref("");

  // -----------------------------
  // Color Presets
  // -----------------------------
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

  // -----------------------------
  // Computed
  // -----------------------------
  const selectedProject = computed(() => {
    return (
      projects.value.find(
        (project) => project._id === selectedProjectId.value,
      ) ?? null
    );
  });

  // -----------------------------
  // Dialog Actions
  // -----------------------------
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

  // -----------------------------
  // Project Selection / Sync
  // -----------------------------
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

  // -----------------------------
  // Local Storage Style Helpers
  // -----------------------------
  const getStorageKey = (projectId: string) => `project_style_${projectId}`;

  const getProjectStyle = (projectId: string): ProjectStyle => {
    try {
      const saved = localStorage.getItem(getStorageKey(projectId));
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const saveProjectStyle = (
    projectId: string,
    color: string,
    cover: string,
  ) => {
    const style: ProjectStyle = {
      backgroundColor: color || undefined,
      coverImage: cover || undefined,
    };

    localStorage.setItem(getStorageKey(projectId), JSON.stringify(style));
  };

  const clearProjectStyle = (projectId: string) => {
    localStorage.removeItem(getStorageKey(projectId));
  };

  // -----------------------------
  // UI Style Helpers
  // -----------------------------
  const getTileStyle = (projectId: string) => {
    const style = getProjectStyle(projectId);

    return style.backgroundColor
      ? { backgroundColor: style.backgroundColor }
      : {};
  };

  const getCoverImage = (projectId: string): string | null => {
    return getProjectStyle(projectId).coverImage ?? null;
  };

  // -----------------------------
  // Expose Store
  // -----------------------------
  return {
    // state
    showCreateDialog,
    showCustomizeDialog,
    selectedProjectId,
    projects,
    customizingProject,
    tempColor,
    tempCover,
    colorPalette,

    // computed
    selectedProject,

    // dialog actions
    openCreate,
    closeCreate,
    openCustomize,
    closeCustomize,

    // selection / sync
    setSelectedProject,
    clearSelectedProject,
    setProjects,
    clearProjects,

    // style helpers
    getProjectStyle,
    saveProjectStyle,
    clearProjectStyle,
    getTileStyle,
    getCoverImage,
  };
});
