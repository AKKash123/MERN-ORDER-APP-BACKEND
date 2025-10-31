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

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// ES module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --------------------
// ✅ Lazy MongoDB Connection
// --------------------
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000, // Timeout quickly if unreachable
    });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.warn("⚠️ MongoDB not connected (continuing anyway):", err.message);
  }
};

// --------------------
// Routes
// --------------------
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

// Root route
app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 Backend running successfully on Vercel!" });
});

// --------------------
// Export
// --------------------
const handler = serverless(app);
export { handler };
export default handler;
