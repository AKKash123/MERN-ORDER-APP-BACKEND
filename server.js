import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import serverless from "serverless-http";

// Import routes
import authRoutes from "./src/routes/auth.js";
import itemRoutes from "./src/routes/items.js";
import orderRoutes from "./src/routes/orders.js";

// Load environment variables
dotenv.config();

// -----------------------------------------------------------------------------
// ✅ MongoDB Connection (optimized for Vercel)
// -----------------------------------------------------------------------------
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("🟢 Using existing MongoDB connection");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = conn.connections[0].readyState;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  }
};

// -----------------------------------------------------------------------------
// ✅ Express App Setup
// -----------------------------------------------------------------------------
const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

// Static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -----------------------------------------------------------------------------
// ✅ Routes
// -----------------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Health check route
app.get("/api", (req, res) => {
  res.status(200).send("✅ API is running successfully on Vercel!");
});

// ✅ Root route
app.get("/", (req, res) => {
  res.status(200).send("🚀 MERN Order App Backend deployed successfully!");
});

// -----------------------------------------------------------------------------
// ✅ Export serverless handler for Vercel
// -----------------------------------------------------------------------------
const handler = serverless(app);
export { handler };

// Vercel requires **default export** to be the handler
export default handler;
