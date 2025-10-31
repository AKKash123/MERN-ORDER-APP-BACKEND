import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import serverless from "serverless-http";

// --------------------
// Load environment variables
// --------------------
dotenv.config();

// --------------------
// ES Module dirname setup
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// MongoDB Connection (lazy + cached)
// --------------------
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10, // maintain connection pool
      serverSelectionTimeoutMS: 3000, // prevent long hangs
    });
    isConnected = conn.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.warn("⚠️ MongoDB connection failed:", error.message);
  }
};

// --------------------
// Express App Setup
// --------------------
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --------------------
// Routes
// --------------------

// ✅ Lazy DB connect for each route group
import authRoutes from "../src/routes/auth.js";
import itemRoutes from "../src/routes/items.js";
import orderRoutes from "../src/routes/orders.js";

app.use("/api/auth", async (req, res, next) => {
  await connectDB();
  next();
}, authRoutes);

app.use("/api/items", async (req, res, next) => {
  await connectDB();
  next();
}, itemRoutes);

app.use("/api/orders", async (req, res, next) => {
  await connectDB();
  next();
}, orderRoutes);

// --------------------
// Root Route (Health Check)
// --------------------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Backend running successfully on Vercel!",
    environment: process.env.NODE_ENV || "production",
  });
});

// --------------------
// Export Serverless Handler
// --------------------
const handler = serverless(app);
export { handler };
export default handler;
