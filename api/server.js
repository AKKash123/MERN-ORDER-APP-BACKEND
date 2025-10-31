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
// ✅ MongoDB Connection (optimized for serverless)
// --------------------
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    // Reuse cached DB connection (prevents timeout)
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
    cachedConnection = conn;
    console.log("✅ MongoDB connected successfully");
    return conn;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
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

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --------------------
// ✅ Connect once when server starts (not per request)
// --------------------
await connectDB(); // Important — connect before routes load

// --------------------
// API Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

// Health check route (root test)
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Backend running successfully on Vercel!",
  });
});

// --------------------
// Export for Vercel
// --------------------
const handler = serverless(app);
export { handler };
export default handler;
