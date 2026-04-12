import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import {
  useSprints,
  useCreateSprint,
  useUpdateSprint,
  useDeleteSprint,
} from "./sprint.tanstack";
import type { Sprint, CreateSprintDto, SprintStatus } from "./sprint.types";

export function useSprintManager(teamId: string) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const { data: sprintsData, isLoading, error, refetch } = useSprints(teamId);
  const sprints = computed(() => sprintsData.value || []);

  const createSprint = useCreateSprint();
  const updateSprint = useUpdateSprint();
  const deleteSprint = useDeleteSprint();

  const showDialog = ref(false);
  const editingSprint = ref<Sprint | null>(null);
  const saving = ref(false);

  const openCreateDialog = () => {
    editingSprint.value = null;
    showDialog.value = true;
  };

  const openEditDialog = (sprint: Sprint) => {
    editingSprint.value = sprint;
    showDialog.value = true;
  };

  const handleSaveSprint = async (data: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: SprintStatus;
  }) => {
    saving.value = true;
    try {
      if (editingSprint.value) {
        await updateSprint.mutateAsync({
          sprintId: editingSprint.value._id,
          data,
        });
        toast.add({
          severity: "success",
          summary: "Sprint updated",
          life: 3000,
        });
      } else {
        await createSprint.mutateAsync({ teamId, data });
        toast.add({
          severity: "success",
          summary: "Sprint created",
          life: 3000,
        });
      }
      showDialog.value = false;
      await refetch();
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.error || "Failed to save sprint",
        life: 4000,
      });
    } finally {
      saving.value = false;
    }
  };

  const confirmDelete = (sprint: Sprint) => {
    confirm.require({
      message: `Delete sprint "${sprint.name}"? This will delete all tasks inside it.`,
      header: "Delete Sprint",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteSprint.mutateAsync(sprint._id);
          toast.add({
            severity: "success",
            summary: "Sprint deleted",
            life: 3000,
          });
          await refetch();
        } catch (error: any) {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: error.response?.data?.error || "Failed to delete sprint",
            life: 4000,
          });
        }
      },
    });
  };

  const goToSprint = (sprintId: string) => {
    router.push(`/taskspace/team/${teamId}/sprint/${sprintId}/tasks`);
  };

  return {
    sprints,
    isLoading,
    error,
    showDialog,
    editingSprint,
    saving,
    openCreateDialog,
    openEditDialog,
    handleSaveSprint,
    confirmDelete,
    goToSprint,
  };
}
