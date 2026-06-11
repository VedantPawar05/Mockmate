import { Request, Response } from "express";
import { LearningProgressModel } from "../models/learning.model";
import { playlists } from "../config/playlists";
import axios from "axios";

// Helper to normalize topics
const normalizeTopic = (topic: string) => {
  if (!topic) return "DSA";
  if (topic.includes("Tech") || topic.includes("Stack")) return "System Design";
  if (topic.includes("Core") || topic.includes("Subject")) return "OS";
  return topic;
};

export const getPlaylist = async (req: Request, res: Response) => {
  try {
    let { topic } = req.params;
    
    // Quick map for specific tech topics to our standard playlists
    if (!playlists[topic]) {
      if (topic.toLowerCase().includes("tech") || topic.toLowerCase().includes("system")) {
        topic = "System Design";
      } else if (topic.toLowerCase().includes("core") || topic.toLowerCase().includes("os") || topic.toLowerCase().includes("operating")) {
        topic = "OS";
      } else {
        topic = "DSA"; // fallback
      }
    }

    const playlist = playlists[topic] || [];

    // Gemini API call for smart suggestions
    let aiSuggestions: any[] = [];
    try {
      const prompt = `The user is weak in ${topic}. They have a placement interview coming up. Give me 3 specific concepts within ${topic} they must focus on first, and for each concept give one key point to remember in one sentence. Return ONLY a valid JSON array of objects with keys "concept" and "keyPoint".`;
      
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          params: { key: process.env.GEMINI_API_KEY },
          headers: { "Content-Type": "application/json" },
        }
      );

      const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
      aiSuggestions = JSON.parse(cleanJson);
    } catch (error) {
      console.error("Gemini suggestion failed:", error);
      aiSuggestions = [];
    }

    return res.status(200).json({ playlist, suggestions: aiSuggestions, mappedTopic: topic });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const saveProgress = async (req: Request, res: Response) => {
  try {
    const { topic, videoId } = req.body;
    const userId = req.user._id;

    if (!topic || !videoId) {
      return res.status(400).json({ error: "Topic and videoId are required" });
    }

    const normalizedTopic = normalizeTopic(topic);
    const playlist = playlists[normalizedTopic] || playlists["DSA"];
    const totalVideos = playlist.length;

    let progress = await LearningProgressModel.findOne({ userId, topic: normalizedTopic });

    if (!progress) {
      progress = new LearningProgressModel({
        userId,
        topic: normalizedTopic,
        watchedVideos: [videoId],
        completionPercent: Math.round((1 / totalVideos) * 100),
      });
    } else {
      if (!progress.watchedVideos.includes(videoId)) {
        progress.watchedVideos.push(videoId);
        progress.completionPercent = Math.round((progress.watchedVideos.length / totalVideos) * 100);
      }
      progress.lastWatchedAt = new Date();
    }

    await progress.save();
    return res.status(200).json(progress);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProgress = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Ensure the requester is asking for their own data
    if (req.user._id.toString() !== userId) {
       return res.status(403).json({ error: "Forbidden" });
    }

    const progressList = await LearningProgressModel.find({ userId });
    return res.status(200).json(progressList);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const resetProgress = async (req: Request, res: Response) => {
  try {
    const { userId, topic } = req.params;

    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const normalizedTopic = normalizeTopic(topic);

    await LearningProgressModel.findOneAndUpdate(
      { userId, topic: normalizedTopic },
      { $set: { watchedVideos: [], completionPercent: 0, lastWatchedAt: new Date() } }
    );

    return res.status(200).json({ message: "Progress reset successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
