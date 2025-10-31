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

// --------------------
// ✅ MongoDB Connection (optimized for Vercel)
// --------------------
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return; // Avoid reconnecting on every request
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if unreachable
    });
    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
};

// --------------------
// Express App Setup
// --------------------
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Ensure DB connection before handling routes
app.use(async (_req, res, next) => {
  await connectDB();
  next();
});

// --------------------
// API Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 Backend running successfully on Vercel!" });
});

// --------------------
// Export Serverless Handler
// --------------------
const handler = serverless(app);
export { handler };
export default handler;
