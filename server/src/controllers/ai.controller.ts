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
    const bullets = await generateBullets(data, period.label);
    const { user, tasks } = data;

    // Group by date
    const tasksByDate: Record<string, IPersonalTask[]> = {};
    tasks.forEach((t: IPersonalTask) => {
      if (!t.completedAt) return;
      const dk = new Date(t.completedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      (tasksByDate[dk] ??= []).push(t);
    });
    const sortedDates = Object.keys(tasksByDate).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="taskquest-report-${Date.now()}.pdf"`,
    );
    doc.pipe(res);

    // ── Constants ────────────────────────────────────────────────
    const ML = 40,
      MR = 555,
      PW = MR - ML;
    const BLACK = "#000000";
    const GRAY = "#666666";
    const LGRAY = "#f2f2f2";
    const BORDER = "#999999";

    // helper: draw cell with border
    const cell = (
      x: number,
      y: number,
      w: number,
      h: number,
      fill?: string,
    ) => {
      if (fill) doc.rect(x, y, w, h).fill(fill);
      doc.rect(x, y, w, h).stroke(BORDER);
    };
    const txt = (
      text: string,
      x: number,
      y: number,
      w: number,
      opts: {
        size?: number;
        bold?: boolean;
        color?: string;
        align?: "left" | "center" | "right";
      } = {},
    ) => {
      doc
        .fontSize(opts.size ?? 8)
        .font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .fillColor(opts.color ?? BLACK)
        .text(text, x + 3, y + 3, {
          width: w - 6,
          align: opts.align ?? "left",
        });
    };

    // ── HEADER ───────────────────────────────────────────────────
    const HDR_H = 60;
    doc.rect(ML, 40, PW, HDR_H).fill(LGRAY).stroke(BORDER);

    // Left: app name
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor(BLACK)
      .text("TaskQuest", ML + 10, 52);
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(GRAY)
      .text("Gamified Productivity Tracker", ML + 10, 72);

    // Right: report label
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(BLACK)
      .text("PRODUCTIVITY REPORT", ML, 56, { width: PW - 10, align: "right" });
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(GRAY)
      .text(period.label, ML, 70, { width: PW - 10, align: "right" });

    // Divider line under header
    doc
      .moveTo(ML, 100)
      .lineTo(MR, 100)
      .strokeColor(BLACK)
      .lineWidth(1.5)
      .stroke();
    doc.lineWidth(0.5);

    // ── INFO TABLE (PSA-style: FOR THE PERIOD OF / NAME / etc.) ──
    let y = 108;
    const INFO_H = 16;
    const LBL_W = 130;

    const infoRows = [
      ["FOR THE PERIOD OF:", period.label],
      ["NAME:", user?.displayName ?? "—"],
      ["LEVEL / XP:", `Level ${user?.level}  |  ${user?.totalXP} Total XP`],
      [
        "STREAK / TASKS:",
        `${user?.streakDays} Day Streak  |  ${user?.tasksCompleted} Tasks Completed`,
      ],
    ];

    infoRows.forEach(([label, value]) => {
      cell(ML, y, LBL_W, INFO_H, LGRAY);
      cell(ML + LBL_W, y, PW - LBL_W, INFO_H);
      txt(label, ML, y, LBL_W, { bold: true, size: 7.5 });
      txt(value, ML + LBL_W, y, PW - LBL_W, { size: 7.5 });
      y += INFO_H;
    });

    y += 10;

    // ── MAIN TABLE ────────────────────────────────────────────────
    // Columns: Date | Qty | Output (Task Title) | Status | Time Hrs | Mins | Remarks
    const C = {
      date: { x: ML, w: 90 },
      qty: { x: ML + 90, w: 25 },
      output: { x: ML + 115, w: 220 },
      status: { x: ML + 335, w: 50 },
      hrs: { x: ML + 385, w: 30 },
      mins: { x: ML + 415, w: 30 },
      remarks: { x: ML + 445, w: MR - ML - 445 },
    };

    // ── Table header: top two rows (PSA-style merged cells) ───────
    const TH1 = 14; // first header row height
    const TH2 = 14; // second header row height

    // Row 1 — top labels
    cell(C.date.x, y, C.date.w, TH1, BLACK);
    cell(C.qty.x, y, C.qty.w, TH1, BLACK);
    cell(C.output.x, y, C.output.w, TH1, BLACK);
    cell(C.status.x, y, C.status.w, TH1, BLACK);
    cell(C.hrs.x, y, C.hrs.w + C.mins.w, TH1, BLACK); // "Time Spent" spans Hrs+Mins
    cell(C.remarks.x, y, C.remarks.w, TH1, BLACK);

    txt("Project/Activity/Task", C.date.x, y, C.date.w + C.qty.w + C.output.w, {
      bold: true,
      size: 7,
      color: "#ffffff",
      align: "center",
    });
    txt("", C.status.x, y, C.status.w, {
      bold: true,
      size: 7,
      color: "#ffffff",
      align: "center",
    });
    txt("Time Spent", C.hrs.x, y, C.hrs.w + C.mins.w, {
      bold: true,
      size: 7,
      color: "#ffffff",
      align: "center",
    });
    txt("REMARKS", C.remarks.x, y, C.remarks.w, {
      bold: true,
      size: 7,
      color: "#ffffff",
      align: "center",
    });

    y += TH1;

    // Row 2 — sub-labels
    cell(C.date.x, y, C.date.w, TH2, LGRAY);
    cell(C.qty.x, y, C.qty.w, TH2, LGRAY);
    cell(C.output.x, y, C.output.w, TH2, LGRAY);
    cell(C.status.x, y, C.status.w, TH2, LGRAY);
    cell(C.hrs.x, y, C.hrs.w, TH2, LGRAY);
    cell(C.mins.x, y, C.mins.w, TH2, LGRAY);
    cell(C.remarks.x, y, C.remarks.w, TH2, LGRAY);

    txt("Date", C.date.x, y, C.date.w, {
      bold: true,
      size: 7,
      align: "center",
    });
    txt("Qty", C.qty.x, y, C.qty.w, { bold: true, size: 7, align: "center" });
    txt("Output", C.output.x, y, C.output.w, {
      bold: true,
      size: 7,
      align: "center",
    });
    txt("Status", C.status.x, y, C.status.w, {
      bold: true,
      size: 7,
      align: "center",
    });
    txt("Hrs", C.hrs.x, y, C.hrs.w, { bold: true, size: 7, align: "center" });
    txt("Mins", C.mins.x, y, C.mins.w, {
      bold: true,
      size: 7,
      align: "center",
    });
    txt("", C.remarks.x, y, C.remarks.w, {
      bold: true,
      size: 7,
      align: "center",
    });

    y += TH2;

    // ── Data rows ─────────────────────────────────────────────────
    if (sortedDates.length === 0) {
      const ERH = 20;
      cell(ML, y, PW, ERH);
      txt("No tasks completed during this period.", ML, y, PW, {
        color: GRAY,
        align: "center",
      });
      y += ERH;
    } else {
      sortedDates.forEach((date, di) => {
        const dayTasks = tasksByDate[date];
        const ROW_H = Math.max(16, dayTasks.length * 13 + 6);
        const rowFill = di % 2 === 0 ? "#ffffff" : LGRAY;

        cell(C.date.x, y, C.date.w, ROW_H, rowFill);
        cell(C.qty.x, y, C.qty.w, ROW_H, rowFill);
        cell(C.output.x, y, C.output.w, ROW_H, rowFill);
        cell(C.status.x, y, C.status.w, ROW_H, rowFill);
        cell(C.hrs.x, y, C.hrs.w, ROW_H, rowFill);
        cell(C.mins.x, y, C.mins.w, ROW_H, rowFill);
        cell(C.remarks.x, y, C.remarks.w, ROW_H, rowFill);

        // Date (bold, vertically centered)
        txt(date, C.date.x, y + ROW_H / 2 - 6, C.date.w, {
          bold: true,
          size: 7,
        });

        // Qty
        txt(`${dayTasks.length}`, C.qty.x, y + ROW_H / 2 - 6, C.qty.w, {
          size: 7,
          align: "center",
        });

        // Tasks list
        dayTasks.forEach((task, ti) => {
          const ty = y + 3 + ti * 13;
          const isSprintTask = task.isSprintTask;
          doc
            .fontSize(7)
            .font(isSprintTask ? "Helvetica-Oblique" : "Helvetica")
            .fillColor(BLACK)
            .text(
              `${isSprintTask ? "[Sprint] " : ""}${task.title}`,
              C.output.x + 3,
              ty,
              { width: C.output.w - 6 },
            );
        });

        // Status — 100% since all are completed
        txt("100%", C.status.x, y + ROW_H / 2 - 6, C.status.w, {
          size: 7,
          align: "center",
        });

        // Time: duration in hrs/mins (sum of tasks)
        const totalSecs = dayTasks.reduce(
          (s, t) => s + (t.duration ?? 1500),
          0,
        );
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        txt(hrs > 0 ? `${hrs}` : "0", C.hrs.x, y + ROW_H / 2 - 6, C.hrs.w, {
          size: 7,
          align: "center",
        });
        txt(
          mins > 0 ? `${mins}` : "00",
          C.mins.x,
          y + ROW_H / 2 - 6,
          C.mins.w,
          { size: 7, align: "center" },
        );

        // Remarks: priority badge
        const priorityLabel = dayTasks
          .map((t) => t.priority.toUpperCase()[0])
          .join(",");
        txt(priorityLabel, C.remarks.x, y + ROW_H / 2 - 6, C.remarks.w, {
          size: 6.5,
          align: "center",
          color: GRAY,
        });

        y += ROW_H;
      });
    }

    // Total row
    const TOT_H = 16;
    cell(ML, y, PW, TOT_H, LGRAY);
    txt("Total", ML, y, LBL_W, { bold: true, size: 8 });
    txt(`${tasks.length} tasks`, ML + LBL_W, y, PW - LBL_W, {
      bold: true,
      size: 8,
      align: "right",
    });
    y += TOT_H + 16;

    // ── AI INSIGHTS (as Remarks/Notes section) ────────────────────
    cell(ML, y, PW, 14, BLACK);
    txt("AI PRODUCTIVITY INSIGHTS", ML, y, PW, {
      bold: true,
      size: 8,
      color: "#ffffff",
      align: "center",
    });
    y += 14;

    bullets.forEach((bullet, i) => {
      const bh = 22;
      cell(ML, y, PW, bh, i % 2 === 0 ? "#ffffff" : LGRAY);
      // Number badge
      doc.rect(ML + 3, y + 4, 13, 13).fill(BLACK);
      doc
        .fontSize(7)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text(`${i + 1}`, ML + 3, y + 7, { width: 13, align: "center" });
      // Text
      doc
        .fontSize(7)
        .font("Helvetica")
        .fillColor(BLACK)
        .text(bullet, ML + 20, y + 4, { width: PW - 25 });
      y += bh;
    });

    y += 20;

    // ── SIGNATURE BLOCK (PSA-style 3-column) ─────────────────────
    const SIG_W = PW / 3;
    const SIG_H = 50;
    const sigData = [
      {
        role: "PREPARED BY:",
        name: user?.displayName ?? "—",
        title: "TaskQuest User",
      },
      { role: "NOTED BY:", name: "—", title: "Team Lead" },
      { role: "APPROVED BY:", name: "—", title: "Division Head" },
    ];

    // Top border
    doc.moveTo(ML, y).lineTo(MR, y).strokeColor(BLACK).lineWidth(1).stroke();
    doc.lineWidth(0.5);
    y += 4;

    sigData.forEach((s, i) => {
      const sx = ML + i * SIG_W;
      cell(sx, y, SIG_W, SIG_H);
      // Role label
      doc
        .fontSize(7)
        .font("Helvetica-Bold")
        .fillColor(BLACK)
        .text(s.role, sx + 4, y + 4, { width: SIG_W - 8 });
      // Signature line
      doc
        .moveTo(sx + 10, y + 32)
        .lineTo(sx + SIG_W - 10, y + 32)
        .strokeColor(BLACK)
        .lineWidth(0.5)
        .stroke();
      // Name
      doc
        .fontSize(7.5)
        .font("Helvetica-Bold")
        .fillColor(BLACK)
        .text(s.name, sx, y + 34, { width: SIG_W, align: "center" });
      // Title
      doc
        .fontSize(6.5)
        .font("Helvetica")
        .fillColor(GRAY)
        .text(s.title, sx, y + 43, { width: SIG_W, align: "center" });
    });

    y += SIG_H + 10;

    // ── FOOTER ───────────────────────────────────────────────────
    doc.moveTo(ML, y).lineTo(MR, y).strokeColor(BLACK).lineWidth(1).stroke();
    y += 4;
    doc
      .fontSize(7)
      .font("Helvetica")
      .fillColor(GRAY)
      .text(
        `Generated by TaskQuest  •  ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
        ML,
        y,
        { width: PW, align: "center" },
      );

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
