import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Team } from "./team.types";

type TeamStyle = {
  backgroundColor?: string;
  coverImage?: string;
};

export const useTeamStore = defineStore("team", () => {
  const showCreateDialog = ref(false);
  const showCustomizeDialog = ref(false);

  const teams = ref<Team[]>([]);
  const selectedTeamId = ref<string | null>(null);
  const customizingTeam = ref<Team | null>(null);

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

  const selectedTeam = computed(() => {
    return (
      teams.value.find((team) => team._id === selectedTeamId.value) ?? null
    );
  });

  const openCreate = () => {
    showCreateDialog.value = true;
  };

  const closeCreate = () => {
    showCreateDialog.value = false;
  };

  const openCustomize = (team: Team) => {
    customizingTeam.value = team;

    const style = getTeamStyle(team._id);
    tempColor.value = style.backgroundColor ?? "";
    tempCover.value = style.coverImage ?? "";

    showCustomizeDialog.value = true;
  };

  const closeCustomize = () => {
    showCustomizeDialog.value = false;
    customizingTeam.value = null;
    tempColor.value = "";
    tempCover.value = "";
  };

  const setTeams = (data: Team[]) => {
    teams.value = data;
  };

  const addTeam = (team: Team) => {
    teams.value.push(team);
  };

  const clearTeams = () => {
    teams.value = [];
  };

  const setSelectedTeam = (teamId: string) => {
    selectedTeamId.value = teamId;
  };

  const clearSelectedTeam = () => {
    selectedTeamId.value = null;
  };

  const getStorageKey = (teamId: string) => `team_style_${teamId}`;

  const getTeamStyle = (teamId: string): TeamStyle => {
    try {
      const saved = localStorage.getItem(getStorageKey(teamId));
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const saveTeamStyle = (teamId: string, color: string, cover: string) => {
    const style: TeamStyle = {
      backgroundColor: color || undefined,
      coverImage: cover || undefined,
    };

    localStorage.setItem(getStorageKey(teamId), JSON.stringify(style));
  };

  const clearTeamStyle = (teamId: string) => {
    localStorage.removeItem(getStorageKey(teamId));
  };

  const getTileStyle = (teamId: string) => {
    const style = getTeamStyle(teamId);

    return style.backgroundColor
      ? { backgroundColor: style.backgroundColor }
      : {};
  };

  const getCoverImage = (teamId: string): string | null => {
    return getTeamStyle(teamId).coverImage ?? null;
  };

  return {
    // state
    showCreateDialog,
    showCustomizeDialog,
    teams,
    selectedTeamId,
    customizingTeam,
    tempColor,
    tempCover,
    colorPalette,

    // computed
    selectedTeam,

    // dialog actions
    openCreate,
    closeCreate,
    openCustomize,
    closeCustomize,

    // team state actions
    setTeams,
    addTeam,
    clearTeams,
    setSelectedTeam,
    clearSelectedTeam,

    // style helpers
    getTeamStyle,
    saveTeamStyle,
    clearTeamStyle,
    getTileStyle,
    getCoverImage,
  };
});
