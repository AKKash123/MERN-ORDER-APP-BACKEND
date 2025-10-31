import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import serverless from "serverless-http";

// Routes
import authRoutes from "../src/routes/auth.js";
import itemRoutes from "../src/routes/items.js";
import orderRoutes from "../src/routes/orders.js";

// Load environment variables
dotenv.config();

// -----------------------------
// ✅ MongoDB Connection (optimized for Vercel)
// -----------------------------
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return; // ✅ Reuse connection if already open

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000, // fail fast if DB unreachable
      connectTimeoutMS: 4000,
      socketTimeoutMS: 4500,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
};

// -----------------------------
// ✅ Express App Setup
// -----------------------------
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// -----------------------------
// ✅ Connect DB only for /api routes
// -----------------------------
app.use("/api", async (req, res, next) => {
  if (!isConnected) {
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();
  }
  next();
});

// -----------------------------
// ✅ API Routes
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

// -----------------------------
// ✅ Root Route (No DB delay)
// -----------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    message: "🚀 Meralay Wollen Designs backend is running successfully on Vercel!",
    status: "OK",
    environment: process.env.NODE_ENV || "development",
  });
});

// -----------------------------
// ✅ Export Serverless Handler
// -----------------------------
const handler = serverless(app);
export { handler };
export default handler;
