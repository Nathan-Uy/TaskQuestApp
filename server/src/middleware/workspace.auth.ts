import { Response } from "express";
import Project from "../models/Project";
import Team from "../models/Team";
import Sprint from "../models/Sprint";
import type { IProject } from "../types/project.types";
import type { ITeam } from "../types/team.types";
import type { ISprint } from "../types/sprint.types";

export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export const getProject = async (
  projectId: string,
  userId: string,
): Promise<AuthResult<IProject>> => {
  const project = await Project.findById(projectId);
  if (!project) return { ok: false, status: 404, error: "Project not found" };
  const isMember = project.members.some(
    (m) => m.userId === String(userId) && m.inviteStatus === "accepted",
  );
  if (project.owner !== String(userId) && !isMember)
    return { ok: false, status: 403, error: "Not authorized" };

  return { ok: true, data: project };
};
export const getTeamWithAuth = async (
  teamId: string,
  userId: string,
): Promise<AuthResult<{ team: ITeam; project: IProject }>> => {
  const team = await Team.findById(teamId);
  if (!team) return { ok: false, status: 404, error: "Team not found" };

  const projectResult = await getProject(team.projectId.toString(), userId);
  if (!projectResult.ok) return projectResult;

  return { ok: true, data: { team, project: projectResult.data } };
};

export const getSprintWithAuth = async (
  sprintId: string,
  userId: string,
): Promise<AuthResult<{ sprint: ISprint; team: ITeam; project: IProject }>> => {
  const sprint = await Sprint.findById(sprintId);
  if (!sprint) return { ok: false, status: 404, error: "Sprint not found" };

  const teamResult = await getTeamWithAuth(sprint.teamId, userId);
  if (!teamResult.ok) return teamResult;

  return { ok: true, data: { sprint, ...teamResult.data } };
};

export const sendAuthError = (
  res: Response,
  result: { ok: false; status: number; error: string },
) => res.status(result.status).json({ error: result.error });
