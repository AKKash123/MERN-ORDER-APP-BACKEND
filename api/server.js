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

// Config
dotenv.config();

// MongoDB connection (safe for serverless)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
};

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Connect to DB before every request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 Backend running successfully on Vercel!" });
});

// Export for Vercel
export const handler = serverless(app);
export default handler;