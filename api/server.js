import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import serverless from "serverless-http";

import authRoutes from "../src/routes/auth.js";
import itemRoutes from "../src/routes/items.js";
import orderRoutes from "../src/routes/orders.js";

dotenv.config();

// --------------------
// MongoDB Connection (optimized for serverless)
// --------------------
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
};

// Connect immediately when function loads
await connectDB();

// --------------------
// Express Setup
// --------------------
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "🚀 Backend running successfully on Vercel!" });
});

const handler = serverless(app);
export { handler };
export default handler;
