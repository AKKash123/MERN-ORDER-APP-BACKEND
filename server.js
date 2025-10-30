import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import serverless from "serverless-http"; // key library

// Routes
import authRoutes from "./src/routes/auth.js";
import itemRoutes from "./src/routes/items.js";
import orderRoutes from "./src/routes/orders.js";

dotenv.config();

// --- MongoDB Connection ---
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 1, // recommended for serverless
    };
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// --- Express App Setup ---
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Static uploads (non-persistent in Vercel)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("✅ Express + MongoDB Serverless backend running on Vercel");
});

// --- Serverless Handler ---
const handler = async (req, res) => {
  try {
    await connectDB();
    const expressHandler = serverless(app);
    return expressHandler(req, res);
  } catch (err) {
    console.error("❌ Serverless function error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
};

export default handler;