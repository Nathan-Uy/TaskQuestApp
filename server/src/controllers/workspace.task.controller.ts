import { Request, Response } from "express";
import WorkspaceTask from "../models/WorkspaceTask";
import WorkspaceSprint from "../models/WorkspaceSprint";
import WorkspaceTeam from "../models/WorkspaceTeam";

interface AuthRequest extends Request {
  userId?: string;
}

const isTeamMember = (team: any, userId?: string): boolean => {
  return team.owner === userId || team.members.some((m: any) => m.userId === userId);
};

const updateTaskField = (
  task: any,
  field: string,
  value: any,
  validOptions?: string[],
): void => {
  if (value === undefined) return;

  if (field === "title" && value?.trim()) {
    task.title = value.trim();
  } else if (field === "description") {
    task.description = value?.trim() || "";
  } else if (field === "status" && validOptions?.includes(value)) {
    task.status = value;
  } else if (field === "priority" && validOptions?.includes(value)) {
    task.priority = value;
  } else if (field === "assignedTo") {
    task.assignedTo = value || null;
  } else if (field === "ownerName") {
    task.ownerName = value || null;
  } else if (field === "dueDate") {
    task.dueDate = value ? new Date(value) : null;
  } else if (field === "duration") {
    task.duration = value ?? null;
  }
};

// Get tasks by sprint
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { sprintId } = req.params;
    const userId = req.userId;
    const { status } = req.query;

    const sprint = await WorkspaceSprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    const team = await WorkspaceTeam.findById(sprint.teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const isMember =
      team.owner === userId || team.members.some((m) => m.userId === userId);
    if (!isMember)
      return res
        .status(403)
        .json({ error: "Not authorized to view sprint tasks" });

    const query: any = { sprintId };
    if (status) query.status = status;

    const tasks = await WorkspaceTask.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// Get single task
export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await WorkspaceTask.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const team = await WorkspaceTeam.findById(task.teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const isMember =
      team.owner === userId || team.members.some((m) => m.userId === userId);
    if (!isMember)
      return res
        .status(403)
        .json({ error: "Not authorized to view this task" });

    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
};

// Create task
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { sprintId } = req.params;
    const {
      title,
      description,
      priority,
      assignedTo,
      dueDate,
      duration,
      ownerName,
    } = req.body;
    const userId = req.userId;

    const sprint = await WorkspaceSprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    const team = await WorkspaceTeam.findById(sprint.teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const isMember =
      team.owner === userId || team.members.some((m) => m.userId === userId);
    if (!isMember)
      return res
        .status(403)
        .json({ error: "Not authorized to create task in this sprint" });

    if (!title?.trim())
      return res.status(400).json({ error: "Task title is required" });

    if (assignedTo && !team.members.some((m) => m.userId === assignedTo)) {
      return res
        .status(400)
        .json({ error: "Assigned user is not a team member" });
    }

    const task = new WorkspaceTask({
      sprintId,
      teamId: sprint.teamId,
      title: title.trim(),
      description: description?.trim() || "",
      priority: priority || "medium",
      assignedTo: assignedTo || null,
      ownerName: ownerName || null,
      createdBy: userId,
      dueDate: dueDate ? new Date(dueDate) : null,
      duration: duration ?? null,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

// Update task
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      duration,
      ownerName,
    } = req.body;
    const userId = req.userId;

    const task = await WorkspaceTask.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const team = await WorkspaceTeam.findById(task.teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (!isTeamMember(team, userId)) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this task" });
    }

    if (assignedTo && !team.members.some((m: any) => m.userId === assignedTo)) {
      return res
        .status(400)
        .json({ error: "Assigned user is not a team member" });
    }

    updateTaskField(task, "title", title);
    updateTaskField(task, "description", description);
    updateTaskField(task, "status", status, ["todo", "in-progress", "done"]);
    updateTaskField(task, "priority", priority, ["low", "medium", "high"]);
    updateTaskField(task, "assignedTo", assignedTo);
    updateTaskField(task, "ownerName", ownerName);
    updateTaskField(task, "dueDate", dueDate);
    updateTaskField(task, "duration", duration);

    await task.save();
    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

// Delete task
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await WorkspaceTask.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const team = await WorkspaceTeam.findById(task.teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const isMember =
      team.owner === userId || team.members.some((m) => m.userId === userId);
    if (!isMember)
      return res
        .status(403)
        .json({ error: "Not authorized to delete this task" });

    await WorkspaceTask.findByIdAndDelete(taskId);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};
