import { model, Schema, Types } from "mongoose";

export interface SavedProject {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  projectName: string;
  techStack: string[];
  addressesTopic: string;
  keyFeatures: string[];
  estimatedDays: number;
  status: "not started" | "in progress" | "completed";
  savedAt: Date;
}

const savedProjectSchema = new Schema<SavedProject>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  techStack: {
    type: [String],
    default: [],
  },
  addressesTopic: {
    type: String,
    required: true,
  },
  keyFeatures: {
    type: [String],
    default: [],
  },
  estimatedDays: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["not started", "in progress", "completed"],
    default: "not started",
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

export const SavedProjectModel = model<SavedProject>("SavedProject", savedProjectSchema);
