import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { sprintsApi } from "./workspace.api";
import type { Sprint } from "./workspace.types";

export const useWorkspaceSprintsStore = defineStore("workspaceSprints", () => {
  const sprints = ref<Sprint[]>([]);
  const currentSprintId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const currentSprint = computed(() =>
    currentSprintId.value
      ? sprints.value.find((s) => s._id === currentSprintId.value)
      : null,
  );

  const sprintList = computed(() => sprints.value);

  const fetchSprints = async (teamId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await sprintsApi.listSprints(teamId);
      sprints.value = data;
      if (data.length > 0 && !currentSprintId.value) {
        currentSprintId.value = data[0]!._id;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch sprints";
    } finally {
      loading.value = false;
    }
  };

  // NEW: Fetch a single sprint by ID (with caching)
  const fetchSprintById = async (sprintId: string) => {
    loading.value = true;
    error.value = null;
    try {
      // Check cache first
      let sprint = sprints.value.find((s) => s._id === sprintId);
      if (sprint) {
        return sprint;
      }
      // Otherwise fetch from API
      const { data } = await sprintsApi.getSprint(sprintId);
      sprints.value.push(data);
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch sprint";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createSprint = async (
    teamId: string,
    name: string,
    startDate: string,
    endDate: string,
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await sprintsApi.createSprint({
        teamId,
        name,
        startDate,
        endDate,
      });
      sprints.value.push(data);
      currentSprintId.value = data._id;
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create sprint";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSprint = async (sprintId: string, updates: Partial<Sprint>) => {
    try {
      const { data } = await sprintsApi.updateSprint(sprintId, updates);
      const idx = sprints.value.findIndex((s) => s._id === sprintId);
      if (idx !== -1) sprints.value[idx] = data;
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update sprint";
      throw err;
    }
  };

  const deleteSprint = async (sprintId: string) => {
    try {
      await sprintsApi.deleteSprint(sprintId);
      sprints.value = sprints.value.filter((s) => s._id !== sprintId);
      if (currentSprintId.value === sprintId) {
        currentSprintId.value = sprints.value[0]?._id || null;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete sprint";
      throw err;
    }
  };

  const setCurrentSprint = (sprintId: string) => {
    currentSprintId.value = sprintId;
  };

  return {
    sprints,
    currentSprintId,
    currentSprint,
    sprintList,
    loading,
    error,
    fetchSprints,
    fetchSprintById, // exported
    createSprint,
    updateSprint,
    deleteSprint,
    setCurrentSprint,
  };
});
