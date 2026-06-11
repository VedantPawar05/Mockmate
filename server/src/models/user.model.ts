import { model, Schema, Types } from "mongoose";
import MockInterviewModel, { MockInterview } from "./mockinterview.model";

export default interface User {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  password?: string;
  firebaseUID?: string;
  interviewList: MockInterview[] | [];
  streakCount: number;
  lastPracticed?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<User>(
  {
    firebaseUID: {
      type: Schema.Types.String,
      required: false,
    },
    name: {
      type: Schema.Types.String,
      required: true,
    },
    email: {
      type: Schema.Types.String,
      unique: true,
      required: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
    },
    streakCount: {
      type: Number,
      default: 0,
    },
    lastPracticed: {
      type: Date,
    },
    interviewList: [{
      type: Schema.Types.ObjectId,
      ref: "MockInterview",
    }]
  },
  { timestamps: true }
);

export const UserModel = model<User>("User", userSchema);
