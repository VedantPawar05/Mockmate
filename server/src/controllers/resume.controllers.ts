// src/controllers/resume.controllers.ts
import { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
// @ts-ignore
const pdfParse = require("pdf-parse");

export const analyzeResume = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ message: "Could not extract meaningful text from PDF" });
    }

    const prompt = `You are an expert technical interviewer. Analyze the following resume and generate 10 targeted interview questions based on the candidate's skills, projects, and experience.

For each question, specify which skill or project it targets.

Resume Text:
${resumeText.substring(0, 5000)}

Respond in JSON format:
{
  "candidateSummary": "Brief summary of the candidate's profile",
  "questions": [
    {
      "question": "The interview question",
      "targetSkill": "The skill or project this question targets",
      "difficulty": "Easy|Medium|Hard",
      "type": "Technical|Behavioral|Project"
    }
  ]
}

Return only the JSON. No extra text.`;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      { contents: [{ parts: [{ text: prompt }] }] },
      {
        headers: { "Content-Type": "application/json" },
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    const responseText = response.data.candidates[0].content.parts[0].text;
    const startIdx = responseText.indexOf("{");
    const endIdx = responseText.lastIndexOf("}");
    const parsed = JSON.parse(responseText.substring(startIdx, endIdx + 1));

    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error("Error analyzing resume:", error.message);
    return res.status(500).json({ message: "Failed to analyze resume" });
  }
};
