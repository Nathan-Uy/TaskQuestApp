import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import goalRoutes from "./routes/goals.routes";
import aiRoutes from "./routes/ai.routes";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
console.log("CLIENT_URL:", process.env.CLIENT_URL);

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/ai", aiRoutes);

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`✅ Server running on http://localhost:${process.env.PORT}`),
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
