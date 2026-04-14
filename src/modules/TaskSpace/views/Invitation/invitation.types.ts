export interface Invitation {
  _id: string;
  projectId: string;
  projectName: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string | Date;
}
