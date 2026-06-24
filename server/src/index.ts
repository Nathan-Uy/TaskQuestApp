import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import personalTaskRoutes from "./routes/personalTask.routes";
import goalRoutes from "./routes/goals.routes";
import aiRoutes from "./routes/ai.routes";
import projectRoutes from "./routes/project.routes";
import teamRoutes from "./routes/team.routes";
import sprintRoutes from "./routes/sprint.routes";
import invitationRoutes from "./routes/invitation.routes";
import workspaceTeamRoutes from "./routes/workspace.team.routes";
import workspaceSprintRoutes from "./routes/workspace.sprint.routes";
import workspaceTaskRoutes from "./routes/workspace.task.routes";
import workspaceChatRoutes from "./routes/workspace.chat.routes";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);
app.use(express.json());

// ─── Rate limiters ────────────────────────────────────────────────────────────

const isProd = process.env.NODE_ENV === "production";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 500 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
  message: { error: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 20 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts, please try again later." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isProd ? 20 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) return auth.slice(7);
    return ipKeyGenerator(req.ip ?? "Unknown");
  },
  message: { error: "AI rate limit reached, please wait a moment." },
});

// ─── DB Connection helper (Cached for Serverless) ───────────────────────────

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
}

// Intercept incoming requests to ensure database connectivity
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/ai", apiLimiter, aiLimiter, aiRoutes);
app.use("/api/tasks", apiLimiter, taskRoutes);
app.use("/api/goals", apiLimiter, goalRoutes);
app.use("/api/projects", apiLimiter, projectRoutes);
app.use("/api/teams", apiLimiter, teamRoutes);
app.use("/api/sprints", apiLimiter, sprintRoutes);
app.use("/api/personal-tasks", apiLimiter, personalTaskRoutes);
app.use("/api/invitations", apiLimiter, invitationRoutes);
app.use("/api/workspace/teams", apiLimiter, workspaceTeamRoutes);
app.use("/api/workspace/sprints", apiLimiter, workspaceSprintRoutes);
app.use("/api/workspace/tasks", apiLimiter, workspaceTaskRoutes);
app.use("/api/workspace/chat", apiLimiter, workspaceChatRoutes);

// ─── DB + local server development ───────────────────────────────────────────

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the application instance for Vercel
export default app;
