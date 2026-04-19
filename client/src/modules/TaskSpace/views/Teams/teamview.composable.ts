import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useTeamStore } from "./team.store";
import { useTeams, useCreateTeam, teamKeys } from "./team.tanstack";
import { useQueryClient } from "@tanstack/vue-query";
import type { CreateTeamDto } from "./team.types";

export function useTeamView() {
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const store = useTeamStore();
  const queryClient = useQueryClient(); // ✅ add this

  const projectId = computed(() => route.params.projectId as string);

  const { data: teamsData, isLoading } = useTeams(projectId.value);
  const createMutation = useCreateTeam();

  watch(
    teamsData,
    (newTeams) => {
      store.setTeams(newTeams ?? []);
    },
    { immediate: true },
  );

  const showCreateDialog = computed({
    get: () => store.showCreateDialog,
    set: (value: boolean) => {
      store.showCreateDialog = value;
    },
  });

  const showCustomizeDialog = computed({
    get: () => store.showCustomizeDialog,
    set: (value: boolean) => {
      store.showCustomizeDialog = value;
    },
  });

  const handleCreateTeam = async (payload: CreateTeamDto) => {
    if (!projectId.value) return;
    try {
      await createMutation.mutateAsync({
        projectId: projectId.value,
        data: payload,
      });
      toast.add({
        severity: "success",
        summary: "Team Created",
        detail: payload.name,
        life: 3000,
      });
      store.closeCreate();
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Creation Failed",
        detail: error.response?.data?.error ?? "Failed to create team",
        life: 4000,
      });
    }
  };

  // ✅ Now async — awaits save then invalidates TanStack cache
  const saveTeamAppearance = async (payload: {
    color: string;
    cover: string;
  }) => {
    const currentTeam = store.customizingTeam;
    if (!currentTeam) return;

    try {
      await store.saveTeamStyle(currentTeam._id, payload.color, payload.cover);

      // ✅ Invalidate so TanStack refetches fresh team data from backend
      await queryClient.invalidateQueries({
        queryKey: teamKeys.list(projectId.value),
      });

      toast.add({
        severity: "success",
        summary: "Appearance Updated",
        detail: `Customized appearance for ${currentTeam.name}`,
        life: 3000,
      });
    } catch {
      toast.add({
        severity: "error",
        summary: "Update Failed",
        detail: "Failed to save appearance",
        life: 4000,
      });
    } finally {
      store.closeCustomize();
    }
  };

  const selectTeam = (teamId: string) => {
    store.setSelectedTeam(teamId);
    router.push(`/taskspace/team/${teamId}/sprints`);
  };

  return {
    teams: teamsData,
    projectId,
    isLoading,
    showCreateDialog,
    showCustomizeDialog,
    customizingTeam: computed(() => store.customizingTeam),
    tempColor: computed(() => store.tempColor),
    tempCover: computed(() => store.tempCover),
    colorPalette: store.colorPalette,
    selectedTeamId: computed(() => store.selectedTeamId),
    getTileStyle: store.getTileStyle,
    getCoverImage: store.getCoverImage,
    openCustomizeDialog: store.openCustomize,
    openCreateDialog: store.openCreate,
    saveTeamAppearance,
    handleCreateTeam,
    selectTeam,
  };
}
