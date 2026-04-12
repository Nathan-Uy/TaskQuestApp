import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { TeamMember } from "./workspace.types";

export const useWorkspaceMembersStore = defineStore("workspaceMembers", () => {
  const members = ref<TeamMember[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const memberList = computed(() => members.value);

  const membersByRole = computed(() => ({
    owner: members.value.filter((m) => m.role === "owner"),
    admin: members.value.filter((m) => m.role === "admin"),
    member: members.value.filter((m) => m.role === "member"),
  }));

  const setMembers = (newMembers: TeamMember[]) => {
    members.value = newMembers;
  };

  const addMember = (member: TeamMember) => {
    const exists = members.value.find((m) => m.userId === member.userId);
    if (!exists) {
      members.value.push(member);
    }
  };

  const removeMember = (userId: string) => {
    members.value = members.value.filter((m) => m.userId !== userId);
  };

  const clearMembers = () => {
    members.value = [];
  };

  return {
    members,
    memberList,
    membersByRole,
    loading,
    error,
    setMembers,
    addMember,
    removeMember,
    clearMembers,
  };
});
