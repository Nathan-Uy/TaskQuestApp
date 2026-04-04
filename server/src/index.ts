import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import goalRoutes from "./routes/goals.routes";
import aiRoutes from "./routes/ai.routes";
import projectRoutes from "./routes/project.routes";

import workspaceTeamRoutes from "./routes/workspace.team.routes";
import workspaceSprintRoutes from "./routes/workspace.sprint.routes";
import workspaceTaskRoutes from "./routes/workspace.task.routes";
import workspaceChatRoutes from "./routes/workspace.chat.routes";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/projects", projectRoutes);

app.use("/api/workspace/teams", workspaceTeamRoutes);
app.use("/api/workspace/sprints", workspaceSprintRoutes);
app.use("/api/workspace/tasks", workspaceTaskRoutes);
app.use("/api/workspace/chat", workspaceChatRoutes);

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server running on http://localhost:${process.env.PORT}`),
    );
  })
  .catch((err) => {
    process.exit(1);
  });
