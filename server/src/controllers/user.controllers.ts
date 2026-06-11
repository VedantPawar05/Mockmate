import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model";
import MockInterviewModel from "../models/mockinterview.model";
import { validationResult } from "express-validator";
import admin from "../firebase/firebase";

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = {
      ...req.user._doc,
      password: undefined,
      firebaseUID: undefined,
      _id: undefined,
      __v: undefined,
    };
    if (!user) {
      return res.status(404).json({ message: "User not Authorized" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, firebaseUID } = req.body;
  // console.log(name,email,password,firebaseUID);
  try {
    if (!name || !email || !(firebaseUID || password)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the user already exists
    let user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    user = new UserModel({
      name,
      email,
      password: hashedPassword,
      firebaseUID: firebaseUID || null,
    });

    await user.save();

    // Generate a JWT token
    const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET as string, {
      expiresIn: "5h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: "lax", // "strict" blocks cookies on cross-port requests (5173 → 8000)
      maxAge: 18000000,
    });
    // Send response
    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, password, firebaseUID } = req.body;

    if (firebaseUID) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(firebaseUID);
        if (!decodedToken?.email) {
          return res
            .status(400)
            .json({ message: "Invalid Firebase credentials" });
        }

        const user = await UserModel.findOne({ email: decodedToken.email });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        return generateAndSendToken(res, user.id);
      } catch (error) {
        console.error("Error in Firebase authentication:", error);
        return res
          .status(400)
          .json({ message: "Invalid Firebase credentials" });
      }
    }

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return generateAndSendToken(res, user.id);
  } catch (error) {
    console.error("Error in user login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logOutUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  return Promise.resolve(
    res.status(200).json({ message: "Logged out successfully" })
  );
};

const generateAndSendToken = (res: Response, userId: string): Response => {
  const JWT_SECRET = process.env.JWT_SECRET as string;
  const payload = { user: { id: userId } };

  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // "strict" blocks cookies on cross-port requests (5173 → 8000)
      maxAge: 18000000,
    });
    return res.json({ message: "User Logged in Successfully" });
  } catch (err) {
    console.error("JWT Sign Error:", err);
    return res.status(500).json({ message: "Token generation failed" });
  }
};

export const editUser = async (req: Request, res: Response) => {
  const { name, email, password, firebaseUID } = req.body;
  try {
    let user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "User not Found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const interviews = await MockInterviewModel.find({ user: userId });
    
    const totalInterviews = interviews.length;
    const totalScore = interviews.reduce((acc, curr) => acc + (curr.overallRating || 0), 0);
    const averageScore = totalInterviews > 0 ? (totalScore / totalInterviews).toFixed(2) : 0;

    // Calculate average ratings per topic
    const dsaAvg = totalInterviews > 0 
      ? (interviews.reduce((acc, curr) => acc + (curr.dsaRating || 0), 0) / totalInterviews).toFixed(2) 
      : 0;
    const techAvg = totalInterviews > 0 
      ? (interviews.reduce((acc, curr) => acc + (curr.technicalRating || 0), 0) / totalInterviews).toFixed(2) 
      : 0;
    const coreAvg = totalInterviews > 0 
      ? (interviews.reduce((acc, curr) => acc + (curr.coreRating || 0), 0) / totalInterviews).toFixed(2) 
      : 0;

    const topicScores = [
      { topic: "DSA", score: parseFloat(dsaAvg.toString()) },
      { topic: "Technical", score: parseFloat(techAvg.toString()) },
      { topic: "Core", score: parseFloat(coreAvg.toString()) },
    ];

    res.status(200).json({
      totalInterviews,
      averageScore: parseFloat(averageScore.toString()),
      streakCount: user.streakCount || 0,
      topicScores,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
