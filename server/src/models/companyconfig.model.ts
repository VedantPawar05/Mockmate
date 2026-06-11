// src/models/companyconfig.model.ts
import { model, Schema, Types } from "mongoose";

export interface CompanyConfig {
  _id: Types.ObjectId;
  companyName: string;
  focusTopics: string[];
  difficultyWeights: {
    easy: number;
    medium: number;
    hard: number;
  };
  description?: string;
}

const companyConfigSchema = new Schema<CompanyConfig>(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
    },
    focusTopics: {
      type: [String],
      required: true,
    },
    difficultyWeights: {
      easy: { type: Number, default: 0.2 },
      medium: { type: Number, default: 0.5 },
      hard: { type: Number, default: 0.3 },
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const CompanyConfigModel = model<CompanyConfig>("CompanyConfig", companyConfigSchema);
export default CompanyConfigModel;
