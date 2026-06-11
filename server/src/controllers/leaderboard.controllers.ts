// src/controllers/leaderboard.controllers.ts
import { Request, Response } from "express";
import MockInterviewModel from "../models/mockinterview.model";
import { UserModel } from "../models/user.model";

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?._id?.toString();

    // Fetch all completed interviews (those with a rating > 0)
    const interviews = await MockInterviewModel.find({ overallRating: { $gt: 0 } })
      .populate("user", "name email")
      .sort({ overallRating: -1 })
      .limit(50);

    // Build leaderboard entries
    const topScores = interviews.slice(0, 10).map((iv: any, i: number) => ({
      rank: i + 1,
      name: iv.user?.name || "Anonymous",
      company: iv.targetCompany || "N/A",
      score: iv.overallRating,
      date: iv.createdAt,
      isCurrentUser: iv.user?._id?.toString() === currentUserId,
    }));

    // Find current user's rank and best score
    let userRank: number | null = null;
    let userBest: any = null;

    if (currentUserId) {
      const allSorted = interviews.map((iv: any, i: number) => ({
        userId: iv.user?._id?.toString(),
        score: iv.overallRating,
        company: iv.targetCompany,
        date: iv.createdAt,
        rank: i + 1,
      }));

      const userEntries = allSorted.filter((e: any) => e.userId === currentUserId);
      if (userEntries.length > 0) {
        userBest = {
          score: userEntries[0].score,
          company: userEntries[0].company,
          date: userEntries[0].date,
        };
        userRank = userEntries[0].rank;
      }
    }

    return res.status(200).json({ topScores, userRank, userBest });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
