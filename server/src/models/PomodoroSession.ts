import { Schema, model, Document, Types } from "mongoose";

export interface IPomodoroSession extends Document {
  userId: Types.ObjectId;
  phase: "work" | "short-break" | "long-break";
  duration: number;
  completedAt: Date;
}

const PomodoroSessionSchema = new Schema<IPomodoroSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    phase: {
      type: String,
      enum: ["work", "short-break", "long-break"],
      required: true,
    },
    duration: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const PomodoroSession = model<IPomodoroSession>(
  "PomodoroSession",
  PomodoroSessionSchema,
);
