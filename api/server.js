import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import serverless from "serverless-http";

// Import Routes
import authRoutes from "../src/routes/auth.js";
import itemRoutes from "../src/routes/items.js";
import orderRoutes from "../src/routes/orders.js";

// Load environment variables
dotenv.config();

// ----------------------
// 🔗 Database Connection
// ----------------------
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return; // Prevent multiple connections (important for serverless)

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connections[0].readyState;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  }
};

// ----------------------
// ⚙️ Express App Setup
// ----------------------
const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Connect DB before handling routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ----------------------
// 🚀 API Routes
// ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

// ----------------------
// 🏠 Root Endpoint
// ----------------------
app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully on Vercel!");
});

// ----------------------
// 🧩 Export for Vercel
// ----------------------
export const handler = serverless(app);
export default handler;
