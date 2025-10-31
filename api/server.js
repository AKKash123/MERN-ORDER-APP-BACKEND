import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import serverless from "serverless-http";

// Import Routes
import authRoutes from "../src/routes/auth.js";
import itemRoutes from "../src/routes/items.js";
import orderRoutes from "../src/routes/orders.js";

// Load environment variables
dotenv.config();

// --------------------
// ✅ MongoDB Connection (Optimized for Serverless)
// --------------------
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10, // Reuse up to 10 connections
      serverSelectionTimeoutMS: 3000, // Quick fail if DB unreachable
      connectTimeoutMS: 4000,
      socketTimeoutMS: 4500,
    });
    isConnected = conn.connections[0].readyState;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  }
};

// --------------------
// ✅ Express App Setup
// --------------------
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --------------------
// ✅ Root Route (Fast Response)
// --------------------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Wollen Designs Backend is running successfully on Vercel!",
  });
});

// --------------------
// ✅ DB Connection Middleware (only connect if needed)
// --------------------
app.use(async (req, res, next) => {
  if (!isConnected) await connectDB();
  next();
});

// --------------------
// ✅ API Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

// --------------------
// ✅ Custom 404 Handler
// --------------------
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `🔍 The requested endpoint '${req.originalUrl}' was not found.`,
    availableRoutes: [
      "/api/auth",
      "/api/items",
      "/api/orders",
      "/uploads",
      "/",
    ],
  });
});

// --------------------
// ✅ Global Error Handler (for unexpected errors)
// --------------------
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error. Please try again later.",
    error: err.message,
  });
});

// --------------------
// ✅ Serverless Export for Vercel
// --------------------
const handler = serverless(app);
export { handler };
export default handler;
