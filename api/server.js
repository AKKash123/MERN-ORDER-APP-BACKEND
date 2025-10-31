import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import serverless from "serverless-http";

// Load env vars
dotenv.config();

// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------
// ✅ Cached MongoDB Connection (Vercel safe)
// -------------------------------------------------
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        maxPoolSize: 5,
        bufferCommands: false,
        serverSelectionTimeoutMS: 3000, // timeout after 3s
      })
      .then((mongoose) => {
        console.log("✅ MongoDB connected");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ MongoDB connect error:", err.message);
        return null;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// -------------------------------------------------
// Express setup
// -------------------------------------------------
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// -------------------------------------------------
// Root Route — respond instantly (no DB wait)
// -------------------------------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Backend running successfully on Vercel!",
  });
});

// -------------------------------------------------
// Load routes after DB connection
// -------------------------------------------------
app.use(async (req, res, next) => {
  await connectDB(); // Only connect when needed
  next();
});

import authRoutes from "../src/routes/auth.js";
import itemRoutes from "../src/routes/items.js";
import orderRoutes from "../src/routes/orders.js";

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

// -------------------------------------------------
// Export for Vercel
// -------------------------------------------------
const handler = serverless(app);
export { handler };
export default handler;
