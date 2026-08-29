import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { sanitizeRequestInput } from "./utils/mongoSanitizer";
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

const LOCAL_CLIENT_URL = "http://localhost:5173";
const allowedOrigins = new Set(
  [process.env.CLIENT_URL, LOCAL_CLIENT_URL].filter(
    (origin): origin is string => Boolean(origin),
  ),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "X-Skip-Auth-Redirect",
    ],
  }),
);
app.use(express.json());

app.use((req, res, next) => {
  try {
    if (req.body && typeof req.body === "object") {
      sanitizeRequestInput(req.body, "body");
    }

    if (req.query && typeof req.query === "object") {
      sanitizeRequestInput(req.query, "query");
    }

    if (req.params && typeof req.params === "object") {
      sanitizeRequestInput(req.params, "params");
    }

    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid request payload";
    res.status(400).json({ message, error: "Mongo injection attempt blocked" });
  }
});

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
    process.stdout.write("Connected to MongoDB successfully\n");
  } catch (error) {
    process.stderr.write(
      `MongoDB connection error: ${
        error instanceof Error ? error.message : String(error)
      }\n`,
    );
    throw error;
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
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    process.stdout.write(`Server running on http://localhost:${PORT}\n`);
  });
}

// Export the application instance for Vercel
export default app;
