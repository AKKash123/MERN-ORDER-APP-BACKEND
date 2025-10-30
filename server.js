import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";

// Routes
import authRoutes from "./src/routes/auth.js";
import itemRoutes from "./src/routes/items.js";
import orderRoutes from "./src/routes/orders.js";

dotenv.config();

// Database connection (optimized for Vercel)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  }
};

// Express app
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// File path helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Backend running successfully on Vercel!");
});

// Export for Vercel (serverless)
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
