import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import serverless from "serverless-http";

import authRoutes from "./src/routes/auth.js";
import itemRoutes from "./src/routes/items.js";
import orderRoutes from "./src/routes/orders.js";

dotenv.config();

// ✅ Optimized DB connection (reusable for serverless)
const connectDB = async () => {
  if (global.mongoose && global.mongoose.connection.readyState === 1) {
    console.log("🟢 Using existing MongoDB connection");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    global.mongoose = conn;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  }
};

// ✅ Express app setup
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Static file handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).send("🚀 Wollen Designs Backend running successfully!");
});

// ✅ Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ✅ Export handler for Vercel
export default serverless(app);
