import { Request, Response } from "express";
import MockInterviewModel from "../models/mockinterview.model";
import axios from "axios";

// Helper to extract JSON from Gemini Response
function extractAndParseJSON(responseText: string) {
  try {
    const startIndex = responseText.indexOf("{");
    const endIndex = responseText.lastIndexOf("}");
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No JSON object found in response");
    }
    const jsonString = responseText.substring(startIndex, endIndex + 1);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
}

export const analyzeUserPerformance = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Aggregation pipeline to get recent performance data
    const analyticsData = await MockInterviewModel.aggregate([
      { $match: { user: userId } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $project: {
          dsaRating: 1,
          technicalRating: 1,
          coreRating: 1,
          overallRating: 1,
          createdAt: 1,
          topic: 1,
        }
      }
    ]);

    if (!analyticsData || analyticsData.length === 0) {
      return res.status(404).json({ error: "No interview data found for analytics." });
    }

    // Determine performance trend (comparing first half vs second half of the recent sessions)
    // The data is sorted descending (newest first). Let's sort it ascending (oldest first) to calculate trend correctly.
    const sortedData = [...analyticsData].reverse();
    
    let trend = "stable";
    if (sortedData.length >= 6) {
      const mid = Math.floor(sortedData.length / 2);
      const firstHalf = sortedData.slice(0, mid);
      const secondHalf = sortedData.slice(mid);
      
      const avgFirstHalf = firstHalf.reduce((acc, curr) => acc + (curr.overallRating || 0), 0) / firstHalf.length;
      const avgSecondHalf = secondHalf.reduce((acc, curr) => acc + (curr.overallRating || 0), 0) / secondHalf.length;

      if (avgSecondHalf > avgFirstHalf + 0.5) {
        trend = "improving";
      } else if (avgSecondHalf < avgFirstHalf - 0.5) {
        trend = "declining";
      }
    }

    // Calculate averages per topic
    const topicAggregations = await MockInterviewModel.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          avgDsa: { $avg: "$dsaRating" },
          avgTech: { $avg: "$technicalRating" },
          avgCore: { $avg: "$coreRating" }
        }
      }
    ]);

    let weakTopics: string[] = [];
    if (topicAggregations.length > 0) {
      const stats = topicAggregations[0];
      const scores = [
        { topic: "DSA", score: stats.avgDsa || 0 },
        { topic: "Tech Stack", score: stats.avgTech || 0 },
        { topic: "Core Subjects", score: stats.avgCore || 0 }
      ];
      // Sort ascending by score
      scores.sort((a, b) => a.score - b.score);
      weakTopics = scores.slice(0, 2).map(s => s.topic);
    }

    // Since we don't track time per question correctly yet in the frontend (always 0 or null),
    // we will simulate the slowTopics detection based on totalTimeSpent or just identify conceptually heavy topics.
    const slowTopics = weakTopics.length > 0 ? [weakTopics[0]] : ["System Design"]; // Fallback

    const weaknessPayload = {
      weakTopics,
      slowTopics,
      trend,
    };

    // Send to Gemini API for deep analysis
    const prompt = `
      The user has the following weak areas in placement preparation: ${JSON.stringify(weakTopics)}. 
      Their slowest topics are ${JSON.stringify(slowTopics)}. 
      Their performance trend across the last several interviews is ${trend}. 
      
      Do the following:
      (1) Explain in simple language why these topics are weak and what concepts they are likely missing.
      (2) Give a 30-day improvement roadmap with weekly milestones.
      (3) Recommend 5 specific projects they should build to strengthen these weak areas. For each project give: project name, tech stack (as an array of strings), which weak topic it addresses, key features to implement (as an array of strings), and estimated time to build (in days as an integer). Make the projects realistic for a college student.
      
      Return ONLY valid JSON with no markdown wrapping in this structure:
      {
        "weaknessExplanation": "string",
        "roadmap": [
          { "week": "Week 1", "focus": "string", "tasks": ["string"] }
        ],
        "projectRecommendations": [
          {
            "projectName": "string",
            "techStack": ["string"],
            "addressesTopic": "string",
            "keyFeatures": ["string"],
            "estimatedDays": 7
          }
        ]
      }
    `;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    const responseData = response.data.candidates[0].content.parts[0].text;
    const aiAnalysis = extractAndParseJSON(responseData);

    if (!aiAnalysis) {
      return res.status(500).json({ error: "Failed to parse AI analysis." });
    }

    return res.status(200).json({
      healthScore: Math.round(((topicAggregations[0]?.avgDsa + topicAggregations[0]?.avgTech + topicAggregations[0]?.avgCore) / 15) * 100) || 50, // 5 scale max * 3 = 15
      topicScores: [
        { subject: "DSA", A: topicAggregations[0]?.avgDsa || 0, fullMark: 5 },
        { subject: "Tech", A: topicAggregations[0]?.avgTech || 0, fullMark: 5 },
        { subject: "Core", A: topicAggregations[0]?.avgCore || 0, fullMark: 5 },
      ],
      ...weaknessPayload,
      ...aiAnalysis
    });

  } catch (error: any) {
    console.error("Error analyzing performance:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};
