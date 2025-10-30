import express from "express";
import multer from "multer";
import path from "path";
import {
  addItem,
  getItems,
  deleteItem,
  updateItem,
} from "../controllers/itemController.js";

const router = express.Router();

// Configure multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ ROUTES

// Get all items
router.get("/", getItems);

// Add new item with image upload
router.post("/", upload.single("image"), addItem);

// ✅ Update item (use :id to match frontend PUT request)
router.put("/:id", upload.single("image"), updateItem);

// Delete item
router.delete("/:id", deleteItem);

export default router;
