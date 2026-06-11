import { Request, Response } from "express";
import { SavedProjectModel } from "../models/project.model";

export const saveProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { projectName, techStack, addressesTopic, keyFeatures, estimatedDays } = req.body;

    const newProject = new SavedProjectModel({
      userId,
      projectName,
      techStack,
      addressesTopic,
      keyFeatures,
      estimatedDays,
      status: "not started",
    });

    const savedProject = await newProject.save();
    return res.status(201).json(savedProject);
  } catch (error: any) {
    console.error("Error saving project:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

export const updateProjectStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["not started", "in progress", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedProject = await SavedProjectModel.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { status },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.status(200).json(updatedProject);
  } catch (error: any) {
    console.error("Error updating project status:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const projects = await SavedProjectModel.find({ userId }).sort({ savedAt: -1 });
    return res.status(200).json(projects);
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};
