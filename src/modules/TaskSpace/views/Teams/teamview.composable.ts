import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { teamApi } from "./team.services";
import type { Team, CreateTeamDto } from "./team.types";

export function useTeamView(projectId: string) {
  const router = useRouter();
  const toast = useToast();

  // Data
  const teams = ref<Team[]>([]);
  const showCreateDialog = ref(false);
  const showCustomizeDialog = ref(false);
  const customizingTeam = ref<Team | null>(null);
  const tempColor = ref("");
  const tempCover = ref("");
  const isLoading = ref(false);

  // Color palette (same as before)
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
  const getTeamStyle = (teamId: string) => {
    const saved = localStorage.getItem(`team_style_${teamId}`);
    return saved ? JSON.parse(saved) : {};
  };

  const getTileStyle = (teamId: string) => {
    const style = getTeamStyle(teamId);
    return style.backgroundColor
      ? { backgroundColor: style.backgroundColor }
      : {};
  };

  const getCoverImage = (teamId: string) => {
    const style = getTeamStyle(teamId);
    return style.coverImage || null;
  };

  const openCustomizeDialog = (team: Team) => {
    customizingTeam.value = team;
    const style = getTeamStyle(team._id);
    tempColor.value = style.backgroundColor || "";
    tempCover.value = style.coverImage || "";
    showCustomizeDialog.value = true;
  };

  const saveTeamAppearance = async (payload: {
    color: string;
    cover: string;
  }) => {
    if (!customizingTeam.value) return;
    const style = {
      backgroundColor: payload.color,
      coverImage: payload.cover,
    };
    localStorage.setItem(
      `team_style_${customizingTeam.value._id}`,
      JSON.stringify(style),
    );
    toast.add({
      severity: "success",
      summary: "Appearance Updated",
      detail: `Customized appearance for ${customizingTeam.value.name}`,
      life: 3000,
    });
    showCustomizeDialog.value = false;
    // Refresh list to reflect changes (no API call, just UI update)
    teams.value = [...teams.value];
  };

  // Load teams for this project
  const loadTeams = async () => {
    if (!projectId) return;
    isLoading.value = true;
    try {
      const { data } = await teamApi.getTeams(projectId);
      teams.value = data;
    } catch (error) {
      console.error("Failed to load teams:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Could not load teams.",
        life: 3000,
      });
    } finally {
      isLoading.value = false;
    }
  };

  // Create a new team
  const handleCreateTeam = async (payload: CreateTeamDto) => {
    if (!projectId) return;
    try {
      const { data } = await teamApi.createTeam(projectId, payload);
      teams.value.push(data);
      toast.add({
        severity: "success",
        summary: "Team Created",
        detail: `${data.name} created.`,
        life: 3000,
      });
      showCreateDialog.value = false;
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to create team";
      toast.add({
        severity: "error",
        summary: "Creation Failed",
        detail: message,
        life: 4000,
      });
    }
  };

  // Select a team – navigate to its members page
  const selectTeam = (teamId: string) => {
    router.push(`/taskspace/team/${teamId}/members`);
  };

  // Load teams on mount and when projectId changes
  onMounted(() => {
    loadTeams();
  });

  watch(
    () => projectId,
    (newId) => {
      if (newId) loadTeams();
    },
  );

  return {
    teams,
    showCreateDialog,
    showCustomizeDialog,
    customizingTeam,
    tempColor,
    tempCover,
    colorPalette,
    getTileStyle,
    getCoverImage,
    openCustomizeDialog,
    saveTeamAppearance,
    handleCreateTeam,
    selectTeam,
    isLoading,
  };
}
