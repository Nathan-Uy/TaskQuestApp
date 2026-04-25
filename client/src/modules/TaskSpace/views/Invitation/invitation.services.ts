import api from "@/api/axios";
import type { Invitation } from "./invitation.types";

export const invitationApi = {
  getMyInvitations: () =>
    api.get<Invitation[]>("/invitations").then((r) => r.data),

  accept: (invitationId: string) =>
    api.patch(`/invitations/${invitationId}/accept`).then((r) => r.data),

  reject: (invitationId: string) =>
    api.patch(`/invitations/${invitationId}/reject`).then((r) => r.data),
};
