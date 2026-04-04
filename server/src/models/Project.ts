import { Schema, model, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  description: string;
  owner: string; // userId
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: { type: String, required: true },
  },
  { timestamps: true },
);

export default model<IProject>("Project", ProjectSchema);
