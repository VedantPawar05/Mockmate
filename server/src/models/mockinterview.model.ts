import { model, Schema, Types } from "mongoose";
import User from "./user.model";
interface Question {
  question: string;
  answer: string;
  correctAns?: string;
  review: string;
  marks?: number;
  timeSpent?: number;
  questionFormat?: "mcq" | "theory";
  options?: string[];
  correctAnswer?: string;
  selectedOption?: string;
}

export interface MockInterview {
  _id: Types.ObjectId;
  user: User;
  jobRole: string;
  overallReview: string;
  overallRating: number;
  experienceLevel: "Fresher" | "Junior" | "Mid-Level" | "Senior";
  targetCompany: string;
  skills?: string[];
  dsaQuestions?: Question[];
  technicalQuestions?: Question[];
  coreSubjectQuestions?: Question[];
  dsaRating?: number;
  technicalRating?: number;
  coreRating?: number;
  weakTopics?: string[];
  totalTimeSpent?: number;
  topic?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  numQuestions?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const mockInterviewSchema = new Schema<MockInterview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    overallReview: {
      type: String,
    },
    overallRating: {
      type: Number,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Fresher", "Junior", "Mid-Level", "Senior"],
      required: true,
    },
    targetCompany: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
    },
    dsaRating: {
      type: Number,
      default: 0,
    },
    technicalRating: {
      type: Number,
      default: 0,
    },
    coreRating: {
      type: Number,
      default: 0,
    },
    dsaQuestions: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true, default: "" },
        review: { type: String, required: true, default: "" },
        correctAns: { type: String },
        marks: { type: Number },
        timeSpent: { type: Number },
        questionFormat: { type: String, enum: ["mcq", "theory"], default: "theory" },
        options: { type: [String], default: [] },
        correctAnswer: { type: String },
        selectedOption: { type: String },
      },
    ],
    technicalQuestions: [
      {
        question: { type: String, required: true, default: "" },
        answer: { type: String, required: true, default: "" },
        review: { type: String, required: true, default: "" },
        correctAns: { type: String },
        marks: { type: Number },
        timeSpent: { type: Number },
        questionFormat: { type: String, enum: ["mcq", "theory"], default: "theory" },
        options: { type: [String], default: [] },
        correctAnswer: { type: String },
        selectedOption: { type: String },
      },
    ],
    coreSubjectQuestions: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true, default: "" },
        review: { type: String, required: true, default: "" },
        correctAns: { type: String },
        marks: { type: Number },
        timeSpent: { type: Number },
        questionFormat: { type: String, enum: ["mcq", "theory"], default: "theory" },
        options: { type: [String], default: [] },
        correctAnswer: { type: String },
        selectedOption: { type: String },
      },
    ],
    weakTopics: {
      type: [String],
      default: [],
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    topic: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    numQuestions: {
      type: Number,
      default: 15,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MockInterviewModel = model<MockInterview>(
  "MockInterview",
  mockInterviewSchema
);
export default MockInterviewModel;
