// src/modules/TaskSpace/Team/teamview.composable.ts
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useWorkspaceTeamsStore } from "@/modules/Workspace/workspace-team.store";
import { useWorkspaceSprintsStore } from "@/modules/Workspace/workspace-sprints.store";

export function useTeamView() {
  const teamsStore = useWorkspaceTeamsStore();
  const sprintsStore = useWorkspaceSprintsStore();
  const router = useRouter();
  const toast = useToast();

  const teams = ref<any[]>([]);
  const showCreateDialog = ref(false);
  const showCustomizeDialog = ref(false);
  const customizingTeam = ref<any>(null);
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

  const loadTeams = async () => {
    if (teamsStore.teams.length === 0) await teamsStore.fetchTeams();
    teams.value = teamsStore.teams;
  };

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

  const openCustomizeDialog = (team: any) => {
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
    teams.value = [...teams.value];
  };

  const handleCreateTeam = async (payload: {
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
        summary: "Team Created",
        detail: `${created.name} has been created.`,
        life: 3000,
      });
      await loadTeams();
      await selectTeam(created._id);
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to create team";
      toast.add({
        severity: "error",
        summary: "Creation Failed",
        detail: message,
        life: 4000,
      });
      throw error;
    }
  };

  const selectTeam = async (teamId: string) => {
    localStorage.setItem("taskSpace_lastTeamId", teamId);
    await sprintsStore.fetchSprints(teamId);
    const sprints = sprintsStore.sprints;
    if (sprints.length > 0) {
      const firstSprint = sprints[0]!;
      router.push(`/taskspace/team/${teamId}/sprint/${firstSprint._id}/tasks`);
    } else {
      toast.add({
        severity: "warn",
        summary: "No Sprints",
        detail: "This team has no sprints. Create a sprint first.",
        life: 4000,
      });
    }
  };

  onMounted(() => {
    loadTeams();
  });

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
  };
}
