import { model, Schema, Types } from "mongoose";

export interface LearningProgress {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  topic: string;
  watchedVideos: string[];
  completionPercent: number;
  startedAt: Date;
  lastWatchedAt: Date;
}

const learningProgressSchema = new Schema<LearningProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  watchedVideos: {
    type: [String],
    default: [],
  },
  completionPercent: {
    type: Number,
    default: 0,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now,
  },
});

export const LearningProgressModel = model<LearningProgress>("LearningProgress", learningProgressSchema);
