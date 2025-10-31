import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import serverless from "serverless-http";

// --------------------
// Load Environment Variables
// --------------------
dotenv.config();

// --------------------
// __dirname setup for ES modules
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// MongoDB Connection (Fast + Safe for Serverless)
// --------------------
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 3000, // ⏱ fail fast
      })
      .then((mongoose) => {
        console.log("✅ MongoDB connected");
        return mongoose;
      })
      .catch((err) => {
        console.warn("⚠️ MongoDB connection failed:", err.message);
        return null;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// --------------------
// Express App Setup
// --------------------
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --------------------
// Root Route — Responds Instantly
// --------------------
app.get("/", async (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Backend is live on Vercel!",
    dbConnected: !!cached.conn,
  });
});

// --------------------
// Lazy Load Routes (after DB connect)
// --------------------
app.use(async (req, res, next) => {
  await connectDB(); // Connect only when needed
  next();
});

// Import routes AFTER DB setup
import authRoutes from "../src/routes/auth.js";
import itemRoutes from "../src/routes/items.js";
import orderRoutes from "../src/routes/orders.js";

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

// --------------------
// Export for Vercel
// --------------------
const handler = serverless(app);
export { handler };
export default handler;
