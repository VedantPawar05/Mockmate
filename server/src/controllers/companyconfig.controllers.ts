// src/controllers/companyconfig.controllers.ts
import { Request, Response } from "express";
import CompanyConfigModel from "../models/companyconfig.model";

export const getCompanyConfigs = async (req: Request, res: Response) => {
  try {
    const configs = await CompanyConfigModel.find({});
    return res.status(200).json(configs);
  } catch (error) {
    console.error("Error fetching company configs:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCompanyConfig = async (req: Request, res: Response) => {
  try {
    const { companyName } = req.params;
    const config = await CompanyConfigModel.findOne({
      companyName: { $regex: new RegExp(companyName, "i") },
    });
    if (!config) {
      return res.status(404).json({ message: "Company config not found" });
    }
    return res.status(200).json(config);
  } catch (error) {
    console.error("Error fetching company config:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const seedCompanyConfigs = async (req: Request, res: Response) => {
  try {
    const defaultConfigs = [
      {
        companyName: "Google",
        focusTopics: ["DSA", "System Design", "Problem Solving", "Algorithms", "Distributed Systems"],
        difficultyWeights: { easy: 0.1, medium: 0.4, hard: 0.5 },
        description: "Focus on algorithmic thinking, system design at scale, and Googleyness.",
      },
      {
        companyName: "Amazon",
        focusTopics: ["DSA", "Leadership Principles", "System Design", "OOP", "Scalability"],
        difficultyWeights: { easy: 0.15, medium: 0.45, hard: 0.4 },
        description: "Emphasis on Leadership Principles, customer obsession, and scalable system design.",
      },
      {
        companyName: "Microsoft",
        focusTopics: ["DSA", "System Design", "OOP", "Problem Solving", "Cloud Computing"],
        difficultyWeights: { easy: 0.2, medium: 0.5, hard: 0.3 },
        description: "Strong focus on problem solving, system design, and growth mindset.",
      },
      {
        companyName: "TCS",
        focusTopics: ["DBMS", "OS", "OOPs", "Aptitude", "Core CS"],
        difficultyWeights: { easy: 0.4, medium: 0.4, hard: 0.2 },
        description: "Fundamentals focused — CS basics, aptitude, and coding fundamentals.",
      },
      {
        companyName: "Infosys",
        focusTopics: ["DBMS", "OS", "OOPs", "Aptitude", "Puzzles"],
        difficultyWeights: { easy: 0.4, medium: 0.45, hard: 0.15 },
        description: "Emphasis on logical reasoning, CS fundamentals, and communication.",
      },
    ];

    for (const config of defaultConfigs) {
      await CompanyConfigModel.findOneAndUpdate(
        { companyName: config.companyName },
        config,
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({ message: "Company configs seeded successfully" });
  } catch (error) {
    console.error("Error seeding configs:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
