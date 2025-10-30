import Item from "../models/Item.js";
import fs from "fs";
import path from "path";

// 🟢 Get all items
export const getItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching items" });
  }
};

// 🟢 Add new item
export const addItem = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const item = new Item({ name, description, price, stock, image });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ message: "Error adding item" });
  }
};

// 🟢 Update existing item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    const existingItem = await Item.findById(id);
    if (!existingItem) return res.status(404).json({ message: "Item not found" });

    // If new image uploaded, delete old one
    let imagePath = existingItem.image;
    if (req.file) {
      if (existingItem.image) {
        const oldImagePath = path.join("backend", existingItem.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      imagePath = `/uploads/${req.file.filename}`;
    }

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { name, description, price, stock, image: imagePath },
      { new: true }
    );

    res.json(updatedItem);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ message: "Error updating item" });
  }
};

// 🟢 Delete item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Item.findByIdAndDelete(id);
    if (!deletedItem) return res.status(404).json({ message: "Item not found" });

    // Delete image from folder
    if (deletedItem.image) {
      const imgPath = path.join("backend", deletedItem.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item" });
  }
};