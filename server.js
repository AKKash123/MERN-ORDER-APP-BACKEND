import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import { fileURLToPath } from "url";
import path from "path";

// Routes
import authRoutes from './src/routes/auth.js';
import itemRoutes from './src/routes/items.js';
import orderRoutes from './src/routes/orders.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Backend server is running successfully on Vercel 🚀");
});

//  Remove app.listen() – not used in serverless
// Instead, export the Express app for Vercel
export default app;
