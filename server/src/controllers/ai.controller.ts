import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Task } from "../models/Task";
import { Goal } from "../models/Goal";
import { User } from "../models/User";
import { llama } from "../lib/ai";
import PDFDocument from "pdfkit";
import {
  GoalHealth,
  ReportData,
  ReportPeriod,
  DailyFocusResult,
} from "../types/ai.types";
import { ITask } from "../types/tasks.types";
import { IGoal } from "../types/goals.types";
import { IUser } from "../types/user.types";

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
    Task.find({
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
    goals.reduce((s, g) => s + g.xpReward, 0);
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

Write exactly 6 bullet points covering:
1. Overall performance summary
2. Task completion highlights
3. Goal achievements
4. XP and leveling progress
5. Productivity patterns observed
6. Specific recommendations for next period

Respond with ONLY a JSON array of 6 strings. No bullet symbols, no markdown, no code blocks.
Example: ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6"]`);

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
    console.error("AI Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ── 2. Download Report (PDF) ───────────────────────────────────────
export const downloadReport = async (req: AuthRequest, res: Response) => {
  try {
    const period = getReportPeriod(new Date());
    const data = await gatherReportData(req.userId!, period.start, period.end);
    const { user, tasks } = data;

    // Group tasks by date
    const tasksByDate: Record<string, ITask[]> = {};
    tasks.forEach((t: ITask) => {
      if (!t.completedAt) return;
      const dateKey = new Date(t.completedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
      tasksByDate[dateKey].push(t);
    });;

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

    // ── Title ──
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

    // ── User info ──
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

    // ── Table ──
    const col1X = 50;
    const col2X = 200;
    const tableWidth = 512;
    const rowHeight = 20;
    const tableTopY = doc.y;

    // Header row
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

    // Rows
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

        // Alternate row background
        if (idx % 2 === 0) {
          doc.rect(col1X, startY, tableWidth, rowH).fillColor("#faf9f7").fill();
        }

        // Date cell
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor("#1a1714")
          .text(date, col1X + 5, startY + 5, { width: col2X - col1X - 10 });

        // Tasks cell
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

    // Table border
    doc
      .rect(col1X, tableTopY, tableWidth, tableBottomY - tableTopY)
      .strokeColor("#e8e4de")
      .stroke();

    // Vertical divider
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

// ── 3. Goal Health Check ───────────────────────────────────────────
export const goalHealthCheck = async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;
    const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const linkedTasks = await Task.find({ _id: { $in: goal.linkedTaskIds } });
    const completed = linkedTasks.filter((t) => t.status === "completed");
    const active = linkedTasks.filter((t) => t.status === "active");
    const progress = linkedTasks.length
      ? Math.round((completed.length / linkedTasks.length) * 100)
      : 0;

    const daysLeft = goal.deadline
      ? Math.ceil(
          (new Date(goal.deadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    const text =
      await llama(`Analyze the health of this goal and give a concise assessment.

Goal: "${goal.title}"
Timeframe: ${goal.timeframe}
Status: ${goal.status}
Progress: ${progress}% (${completed.length}/${linkedTasks.length} tasks done)
Active tasks remaining: ${active.length}
${daysLeft !== null ? `Days until deadline: ${daysLeft}` : "No deadline set"}
Active task titles: ${active.map((t) => t.title).join(", ") || "none"}

Respond with ONLY a JSON object, no markdown, no code blocks:
{
  "status": "on-track" | "at-risk" | "behind",
  "summary": "2 sentence assessment of current progress",
  "nextAction": "One specific concrete action to take right now",
  "recommendation": "Strategic advice for completing this goal"
}`);

    const clean = text.replace(/```json|```/g, "").trim();
    const health = JSON.parse(clean) as GoalHealth;

    res.json({
      goal: {
        _id: goal._id,
        title: goal.title,
        timeframe: goal.timeframe,
        deadline: goal.deadline,
        progress,
      },
      health,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("AI Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ── 4. Daily Focus Picker ──────────────────────────────────────────
export const getDailyFocus = async (req: AuthRequest, res: Response) => {
  try {
    const [tasks, goals] = await Promise.all([
      Task.find({ userId: req.userId, status: "active" }),
      Goal.find({ userId: req.userId, status: "active" }),
    ]);

    if (!tasks.length) {
      return res.json({ focus: [], overallStrategy: "No active tasks found." });
    }

    const today = new Date().toDateString();
    const taskList = tasks
      .map(
        (t) =>
          `- ID:${t._id} | "${t.title}" | ${t.priority} priority | ${Math.round(t.duration / 60)}min${t.dueDate ? ` | due ${new Date(t.dueDate).toLocaleDateString()}` : ""}`,
      )
      .join("\n");

    const goalList =
      goals.map((g) => `- "${g.title}" (${g.timeframe})`).join("\n") ||
      "No active goals";

    const text =
      await llama(`You are a productivity coach. Pick the top 3 tasks to focus on today.

Today: ${today}

Active tasks:
${taskList}

Active goals:
${goalList}

Selection criteria: prioritize high priority tasks, tasks due soon, and tasks aligned with active goals.

Respond with ONLY a JSON object, no markdown, no code blocks:
{
  "focus": [
    {
      "taskId": "the task _id string",
      "title": "task title",
      "reason": "one sentence why this task should be done today",
      "suggestedDuration": 25
    }
  ],
  "overallStrategy": "One sentence on how to approach today"
}`);

    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean) as DailyFocusResult;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI error" });
  }
};
