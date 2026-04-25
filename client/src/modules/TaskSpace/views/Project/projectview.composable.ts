import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useProjectStore } from "./project.store";
import {
  useProjects,
  useCreateProject,
  useAddMember,
  useRemoveMember,
  projectKeys, // ✅ make sure this is exported from project.tanstack
} from "./project.tanstack";
import { useQueryClient } from "@tanstack/vue-query";
import { useAuthStore } from "@/stores/auth.store";
import type { CreateProjectDto, AddMemberDto, Project } from "./project.types";

type ProjectWithMeta = Project & { memberCount: number };

export const useProjectComposable = () => {
  const router = useRouter();
  const toast = useToast();
  const store = useProjectStore();
  const auth = useAuthStore();
  const queryClient = useQueryClient(); // ✅ add this

  const { data: projectsData, isLoading, error } = useProjects();
  const createMutation = useCreateProject();
  const addMutation = useAddMember();
  const removeMutation = useRemoveMember();

  const normalizedProjects = computed<ProjectWithMeta[]>(() =>
    (projectsData.value ?? []).map((project) => ({
      ...project,
      members: Array.isArray(project.members) ? project.members : [],
      memberCount: Array.isArray(project.members) ? project.members.length : 0,
    })),
  );

  watch(
    normalizedProjects,
    (newProjects) => {
      store.setProjects(newProjects);
    },
    { immediate: true },
  );

  const handleCreateProject = async (payload: CreateProjectDto) => {
    try {
      const result = await createMutation.mutateAsync(payload);
      toast.add({
        severity: "success",
        summary: "Project Created",
        detail: result.name,
        life: 3000,
      });
      store.closeCreate();
      store.setSelectedProject(result._id);
      router.push(`/taskspace/project/${result._id}/teams`);
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: e.response?.data?.error ?? "Failed to create project",
        life: 4000,
      });
    }
  };

  // ✅ Now async with query invalidation
  const handleSaveAppearance = async (payload: {
    color: string;
    cover: string;
  }) => {
    if (!store.customizingProject) return;
    try {
      await store.saveProjectStyle(
        store.customizingProject._id,
        payload.color,
        payload.cover,
      );

      // ✅ Refetch projects so UI reflects new cover/color
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });

      toast.add({
        severity: "success",
        summary: "Appearance Saved",
        life: 2000,
      });
    } catch {
      toast.add({
        severity: "error",
        summary: "Failed to save appearance",
        life: 3000,
      });
    } finally {
      store.closeCustomize();
    }
  };

  const handleAddMember = async (projectId: string, data: AddMemberDto) => {
    try {
      await addMutation.mutateAsync({ projectId, data });
      toast.add({
        severity: "success",
        summary: "Member Invited",
        detail: data.email,
        life: 3000,
      });
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: e.response?.data?.error ?? "Failed to invite member",
        life: 4000,
      });
      throw e;
    }
  };

  const handleRemoveMember = async (
    projectId: string,
    userId: string,
    name: string,
  ) => {
    try {
      await removeMutation.mutateAsync({ projectId, userId });
      toast.add({
        severity: "success",
        summary: "Member Removed",
        detail: name,
        life: 3000,
      });
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: e.response?.data?.error ?? "Failed to remove member",
        life: 4000,
      });
      throw e;
    }
  };

  const selectProject = (projectId: string) => {
    store.setSelectedProject(projectId);
    router.push(`/taskspace/project/${projectId}/teams`);
  };

  return {
    projects: normalizedProjects,
    isLoading,
    error,
    currentUserId: auth.user?._id ?? "",
    store,
    handleCreateProject,
    handleSaveAppearance,
    handleAddMember,
    handleRemoveMember,
    selectProject,
  };
};
