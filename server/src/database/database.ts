import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
}

let isConnected = false; 

export const connectDB = async () => {
    if (isConnected) {
        console.log("Using existing MongoDB connection");
        return;
    }

    try {
        const db = await mongoose.connect(MONGO_URI, {
            tls: true,
            tlsAllowInvalidCertificates: true,
        });
        isConnected = db.connections[0].readyState === 1;
        console.log("MongoDB connected successfully");

        // Dynamically seed default test user if it doesn't exist
        try {
            const { UserModel } = await import("../models/user.model");
            const bcrypt = await import("bcryptjs");
            const existingUser = await UserModel.findOne({ email: "test@gmail.com" });
            if (!existingUser) {
                const hashedPassword = await bcrypt.default.hash("test123", 10);
                const defaultUser = new UserModel({
                    name: "Test User",
                    email: "test@gmail.com",
                    password: hashedPassword,
                    interviewList: [],
                    streakCount: 0
                });
                await defaultUser.save();
                console.log("Default test user seeded successfully (email: test@gmail.com, password: test123)");
            } else {
                console.log("Default test user already exists in database");
            }
        } catch (seedError) {
            console.error("Failed to seed default test user:", seedError);
        }

    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw new Error("Failed to connect to MongoDB");
    }
};

export default connectDB;
