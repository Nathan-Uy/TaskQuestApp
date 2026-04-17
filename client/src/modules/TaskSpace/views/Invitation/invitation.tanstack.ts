import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { invitationApi } from "./invitation.services";

export const INVITATIONS_KEY = ["invitations"] as const;

export const useInvitations = () =>
  useQuery({
    queryKey: INVITATIONS_KEY,
    queryFn: invitationApi.getMyInvitations,
    staleTime: 1000 * 30,
  });

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => invitationApi.accept(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useRejectInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => invitationApi.reject(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITATIONS_KEY });
    },
  });
};
