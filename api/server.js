import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import serverless from "serverless-http";

// Load env variables
dotenv.config();

// --------------------
// MongoDB Connection (cached globally for Vercel)
// --------------------
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set("strictQuery", false);
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      .then((mongoose) => mongoose);
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

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --------------------
// Routes
// --------------------
import authRoutes from "../src/routes/auth.js";
import itemRoutes from "../src/routes/items.js";
import orderRoutes from "../src/routes/orders.js";

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

// Root
app.get("/", async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ message: "🚀 Backend running successfully on Vercel!" });
  } catch (err) {
    res.status(500).json({ error: "Database connection failed", details: err.message });
  }
});

// --------------------
// Export Serverless Handler
// --------------------
export const handler = serverless(app);
export default handler;
