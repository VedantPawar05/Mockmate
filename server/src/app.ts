import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/database";

import userRoutes from "./routes/user.routes";
import mockinterviewRoutes from "./routes/mockinterview.routes";
import geminiRoutes from "./routes/gemini.routes";
import healthRoutes from "./routes/health.routes";
import featuresRoutes from "./routes/features.routes";
import analyticsRoutes from "./routes/analytics.routes";
import projectRoutes from "./routes/project.routes";
import learningRoutes from "./routes/learning.routes";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.static("./public"));
app.use(express.json()); //To parse incoming JSON requests;

connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/mockinterview", mockinterviewRoutes);
app.use("/api/ai", geminiRoutes);
app.use("/api/health", healthRoutes);
app.use("/api", featuresRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/learning", learningRoutes);

export default app;
