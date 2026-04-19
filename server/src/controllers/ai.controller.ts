import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import PersonalTask from "../models/PersonalTask";
import { Goal } from "../models/Goal";
import { User } from "../models/User";
import { llama } from "../lib/ai";
import PDFDocument from "pdfkit";
import type { IPersonalTask } from "../types/personalTask.types";
import type {
  ReportData,
  ReportPeriod,
  TaskDescription,
  TriagedTask,
  GoalSuggestion,
  StreakCoach,
} from "../types/ai.types";

// ── Helpers ────────────────────────────────────────────────────────
const getReportPeriod = (date: Date): ReportPeriod => {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  if (day >= 11 && day <= 25) {
    return {
      start: new Date(year, month, 11),
      end: new Date(year, month, 25, 23, 59, 59),
      label: `${date.toLocaleString("en-US", { month: "long" })} 11–25, ${year}`,
    };
  } else if (day >= 26) {
    return {
      start: new Date(year, month, 26),
      end: new Date(year, month + 1, 10, 23, 59, 59),
      label: `${date.toLocaleString("en-US", { month: "long" })} 26 – ${new Date(year, month + 1, 10).toLocaleString("en-US", { month: "long" })} 10, ${year}`,
    };
  } else {
    return {
      start: new Date(year, month - 1, 26),
      end: new Date(year, month, 10, 23, 59, 59),
      label: `${new Date(year, month - 1).toLocaleString("en-US", { month: "long" })} 26 – ${date.toLocaleString("en-US", { month: "long" })} 10, ${year}`,
    };
  }
};

const gatherReportData = async (
  userId: string,
  start: Date,
  end: Date,
): Promise<ReportData> => {
  const [user, tasks, goals] = await Promise.all([
    User.findById(userId).select("-password"),
    PersonalTask.find({
      userId,
      completedAt: { $gte: start, $lte: end },
      status: "completed",
    }),
    Goal.find({
      userId,
      completedAt: { $gte: start, $lte: end },
      status: "completed",
    }),
  ]);

  const byDay: Record<string, number> = {};
  tasks.forEach((t) => {
    if (!t.completedAt) return;
    const day = new Date(t.completedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    byDay[day] = (byDay[day] || 0) + 1;
  });

  const xpEarned =
    tasks.reduce((s, t) => s + t.xpReward, 0) +
    goals.reduce((s: number, g: any) => s + g.xpReward, 0);
  const mostProductiveDay =
    Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const priorityBreakdown = {
    high: tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low: tasks.filter((t) => t.priority === "low").length,
  };

  return {
    user,
    tasks,
    goals,
    byDay,
    xpEarned,
    mostProductiveDay,
    priorityBreakdown,
  };
};

const generateBullets = async (
  data: ReportData,
  periodLabel: string,
): Promise<string[]> => {
  const { user, tasks, goals, xpEarned, priorityBreakdown, mostProductiveDay } =
    data;

  const text =
    await llama(`Generate a productivity report for the period: ${periodLabel}

User: ${user?.displayName}, Level ${user?.level}
Tasks completed: ${tasks.length}
Goals completed: ${goals.length}
XP earned: ${xpEarned}
High priority tasks done: ${priorityBreakdown.high}
Medium priority tasks done: ${priorityBreakdown.medium}
Low priority tasks done: ${priorityBreakdown.low}
Most productive day: ${mostProductiveDay}

Write exactly 5 bullet points covering:
1. Overall performance summary
2. Task completion highlights
3. Goal achievements
4. Productivity patterns observed
5. Specific recommendations for next period

Respond with ONLY a JSON array of 5 strings. No bullet symbols, no markdown, no code blocks.
Example: ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"]`);

  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as string[];
};

// ── 1. Get Report (in-app) ─────────────────────────────────────────
export const getReport = async (req: AuthRequest, res: Response) => {
  try {
    const period = getReportPeriod(new Date());
    const data = await gatherReportData(req.userId!, period.start, period.end);
    const bullets = await generateBullets(data, period.label);

    res.json({
      period: period.label,
      tasksCompleted: data.tasks.length,
      goalsCompleted: data.goals.length,
      xpEarned: data.xpEarned,
      priorityBreakdown: data.priorityBreakdown,
      productivityByDay: data.byDay,
      mostProductiveDay: data.mostProductiveDay,
      bullets,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Report Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ── 2. Download Report PDF ─────────────────────────────────────────
export const downloadReport = async (req: AuthRequest, res: Response) => {
  try {
    const period = getReportPeriod(new Date());
    const data = await gatherReportData(req.userId!, period.start, period.end);
    const { user, tasks } = data;

    const tasksByDate: Record<string, IPersonalTask[]> = {};
    tasks.forEach((t: IPersonalTask) => {
      if (!t.completedAt) return;
      const dateKey = new Date(t.completedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
      tasksByDate[dateKey].push(t);
    });

    const sortedDates = Object.keys(tasksByDate).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="taskquest-report-${Date.now()}.pdf"`,
    );
    doc.pipe(res);

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("#1a1714")
      .text("TaskQuest", { align: "center" });
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#555")
      .text("Productivity Report", { align: "center" });
    doc.fontSize(10).fillColor("#888").text(period.label, { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor("#e8e4de").stroke();
    doc.moveDown(0.8);

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#1a1714")
      .text(user?.displayName || "User");
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#888")
      .text(
        `Level ${user?.level}  •  ${user?.totalXP} Total XP  •  ${user?.streakDays} Day Streak`,
      );
    doc.moveDown(0.8);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor("#e8e4de").stroke();
    doc.moveDown(0.8);

    const col1X = 50;
    const col2X = 200;
    const tableWidth = 512;
    const rowHeight = 20;
    const tableTopY = doc.y;

    doc.rect(col1X, doc.y, tableWidth, rowHeight).fillColor("#f2efe9").fill();
    const headerY = doc.y + 5;
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor("#1a1714")
      .text("DATE", col1X + 5, headerY, { width: col2X - col1X - 10 });
    doc.text("TASKS COMPLETED", col2X + 5, headerY, {
      width: tableWidth - (col2X - col1X) - 10,
    });
    doc.y = tableTopY + rowHeight;
    doc
      .moveTo(col1X, doc.y)
      .lineTo(col1X + tableWidth, doc.y)
      .strokeColor("#e8e4de")
      .stroke();

    if (sortedDates.length === 0) {
      doc.moveDown(0.5);
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#888")
        .text("No tasks completed during this period.", col1X + 5);
      doc.moveDown(1);
    } else {
      sortedDates.forEach((date, idx) => {
        const dayTasks = tasksByDate[date];
        const startY = doc.y;
        const rowH = Math.max(rowHeight, dayTasks.length * 16 + 10);

        if (idx % 2 === 0) {
          doc.rect(col1X, startY, tableWidth, rowH).fillColor("#faf9f7").fill();
        }

        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor("#1a1714")
          .text(date, col1X + 5, startY + 5, { width: col2X - col1X - 10 });

        dayTasks.forEach((task, taskIdx) => {
          doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor("#333")
            .text(`- ${task.title}`, col2X + 5, startY + 5 + taskIdx * 16, {
              width: tableWidth - (col2X - col1X) - 10,
            });
        });

        doc.y = startY + rowH;
        doc
          .moveTo(col1X, doc.y)
          .lineTo(col1X + tableWidth, doc.y)
          .strokeColor("#e8e4de")
          .stroke();
      });
    }

    const tableBottomY = doc.y;
    doc
      .rect(col1X, tableTopY, tableWidth, tableBottomY - tableTopY)
      .strokeColor("#e8e4de")
      .stroke();
    doc
      .moveTo(col2X, tableTopY)
      .lineTo(col2X, tableBottomY)
      .strokeColor("#e8e4de")
      .stroke();

    doc.moveDown(1);
    doc
      .fontSize(8)
      .fillColor("#aaa")
      .text("Generated by TaskQuest", { align: "center" });
    doc.end();
  } catch (err: unknown) {
    const error = err as Error;
    console.error("PDF Error:", error.message);
    res.status(500).json({ message: "PDF generation failed" });
  }
};

// ── 3. Task Description Generator ─────────────────────────────────
export const generateTaskDescription = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const text =
      await llama(`Generate a clear task description and suggested duration for this task.

Task title: "${title}"

Respond with ONLY a JSON object, no markdown, no code blocks:
{
  "notes": "2-3 sentence description of what this task involves and how to approach it",
  "duration": 1500
}
Duration must be in seconds. Use realistic estimates: quick tasks = 900 (15min), normal = 1500 (25min), complex = 3600 (1hr).`);

    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean) as TaskDescription;
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Task Description Error:", error.message);
    res.status(500).json({ message: "AI error" });
  }
};

// ── 4. Overdue Task Triage ─────────────────────────────────────────
export const triageOverdueTasks = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const tasks = await PersonalTask.find({
      userId: req.userId,
      status: "active",
      dueDate: { $lt: now },
    });

    if (!tasks.length) return res.json({ triaged: [] });

    const taskList = tasks
      .map(
        (t) =>
          `- ID:${t._id} | "${t.title}" | ${t.priority} priority | due ${new Date(t.dueDate!).toLocaleDateString()}`,
      )
      .join("\n");

    const text =
      await llama(`You are a productivity coach. Triage these overdue tasks.

Overdue tasks:
${taskList}

For each task decide: reschedule (still important), delegate (someone else should do it), or drop (no longer relevant).

Respond with ONLY a JSON array, no markdown, no code blocks:
[
  {
    "taskId": "task _id string",
    "title": "task title",
    "action": "reschedule" | "delegate" | "drop",
    "reason": "one sentence explanation"
  }
]`);

    const clean = text.replace(/```json|```/g, "").trim();
    const triaged = JSON.parse(clean) as TriagedTask[];
    res.json({ triaged });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Triage Error:", error.message);
    res.status(500).json({ message: "AI error" });
  }
};

// ── 5. Goal Title Suggester ────────────────────────────────────────
export const suggestGoalTitle = async (req: AuthRequest, res: Response) => {
  try {
    const { input } = req.body;
    if (!input) return res.status(400).json({ message: "Input is required" });

    const text =
      await llama(`Rewrite this vague goal into a clear, measurable, achievable goal.

User input: "${input}"

Respond with ONLY a JSON object, no markdown, no code blocks:
{
  "title": "Clear measurable goal title (max 60 chars)",
  "description": "One sentence explaining how to achieve it"
}`);

    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean) as GoalSuggestion;
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Goal Suggest Error:", error.message);
    res.status(500).json({ message: "AI error" });
  }
};

// ── 6. Weekly Streak Coach ─────────────────────────────────────────
export const getStreakCoach = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const lastWeekTasks = await PersonalTask.find({
      userId: req.userId,
      status: "completed",
      completedAt: { $gte: lastWeekStart },
    });

    const text =
      await llama(`You are a productivity streak coach. Analyze last week and suggest one habit for this week.

User: ${user.displayName}
Current streak: ${user.streakDays} days
Level: ${user.level}
Tasks completed last week: ${lastWeekTasks.length}
Total tasks completed all time: ${user.tasksCompleted}

Respond with ONLY a JSON object, no markdown, no code blocks:
{
  "habit": "One specific habit to build this week (max 80 chars)",
  "why": "One sentence why this habit will help based on their data",
  "howToStart": "One concrete first step to start today"
}`);

    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean) as StreakCoach;
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Streak Coach Error:", error.message);
    res.status(500).json({ message: "AI error" });
  }
};
