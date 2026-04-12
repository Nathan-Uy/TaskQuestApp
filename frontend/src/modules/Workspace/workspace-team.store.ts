import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { teamsApi } from "./workspace.api";
import type { Team } from "./workspace.types";

export const useWorkspaceTeamsStore = defineStore("workspaceTeams", () => {
  const teams = ref<Team[]>([]);
  const currentTeamId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const currentTeam = computed(() =>
    currentTeamId.value
      ? teams.value.find((t) => t._id === currentTeamId.value)
      : null,
  );

  const teamList = computed(() => teams.value);

  const fetchTeams = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await teamsApi.listTeams();
      teams.value = data;
      if (data.length > 0 && !currentTeamId.value) {
        currentTeamId.value = data[0]!._id;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch teams";
    } finally {
      loading.value = false;
    }
  };

  const fetchTeamById = async (teamId: string) => {
    loading.value = true;
    try {
      // Check cache first
      let team = teams.value.find((t) => t._id === teamId);
      if (!team) {
        const { data } = await teamsApi.getTeam(teamId);
        teams.value.push(data);
        team = data;
      }
      return team;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to fetch team";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createTeam = async (teamName: string, description: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await teamsApi.createTeam({ teamName, description });
      teams.value.push(data);
      currentTeamId.value = data._id;
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create team";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    try {
      const { data } = await teamsApi.updateTeam(teamId, updates);
      const idx = teams.value.findIndex((t) => t._id === teamId);
      if (idx !== -1) teams.value[idx] = data;
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update team";
      throw err;
    }
  };

  const setCurrentTeam = (teamId: string) => {
    currentTeamId.value = teamId;
  };

  const inviteMember = async (teamId: string, email: string) => {
    try {
      const { data } = await teamsApi.inviteMember(teamId, email);
      const idx = teams.value.findIndex((t) => t._id === teamId);
      if (idx !== -1) teams.value[idx] = data;
      return data;
    } catch (err) {
      throw err;
    }
  };

  const removeMember = async (teamId: string, userId: string) => {
    try {
      const { data } = await teamsApi.removeMember(teamId, userId);
      const idx = teams.value.findIndex((t) => t._id === teamId);
      if (idx !== -1) teams.value[idx] = data;
      return data;
    } catch (err) {
      throw err;
    }
  };

  return {
    teams,
    currentTeamId,
    currentTeam,
    teamList,
    loading,
    error,
    fetchTeams,
    fetchTeamById, // exported
    createTeam,
    updateTeam,
    setCurrentTeam,
    inviteMember,
    removeMember,
  };
});
