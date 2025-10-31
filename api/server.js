// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import serverless from "serverless-http";

// --- Load environment variables ---
dotenv.config();

// --- Initialize Express App ---
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// --- __dirname workaround for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Database Connection (Optimized for Serverless) ---
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 4000,
      socketTimeoutMS: 4500,
    });

    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
};

// --- Routes Imports ---
import authRoutes from "../src/routes/auth.js";
import itemRoutes from "../src/routes/items.js";
import orderRoutes from "../src/routes/orders.js";

// --- Ensure DB Connection Before Handling Requests ---
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

// --- Static Files (Optional: e.g., images, uploads) ---
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --- Health Check Route ---
app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 Serverless backend running successfully on Vercel!" });
});

// --- Export Handler for Vercel ---
const handler = serverless(app);
export { handler };
export default handler;
