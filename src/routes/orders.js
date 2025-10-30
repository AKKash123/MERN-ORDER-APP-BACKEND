import express from "express";
import Order from "../models/Order.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* -------------------------- CONFIGURE NODEMAILER -------------------------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* -------------------------- GET: ALL ORDERS (ADMIN) -------------------------- */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // latest first
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

/* -------------------------- POST: CREATE NEW ORDER -------------------------- */
router.post("/", async (req, res) => {
  try {
    const { userName, userEmail, userPhone,address,pincode, design, quantity,pricePerUnit,totalAmount } = req.body;

    if (!userName || !userEmail || !userPhone || !address || !pincode || !design || !quantity || !pricePerUnit || !totalAmount) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (userName, userEmail, userPhone,address,pincode,design, quantity,pricePerUnit,totalAmount,) are required.",
      });
    }

    const order = new Order({
      userName,
      userEmail,
      userPhone,
      address,
      pincode,
      design,
      quantity,
      pricePerUnit,
      totalAmount,
    });

    await order.save();

    // ✅ Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "🧶 Wollen Designs Order Confirmation",
      text: `Hi ${userName},

Your order for "${design}" (Quantity: ${quantity}) has been received successfully.
Total amount: inr ${order.totalAmount},
We'll contact you soon for shipping details.At your registered Address:
${order.address} , Postal Code: ${order.pincode}

Thank you for choosing Wollen Designs!

– Wollen Designs Team`,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Order creation failed. Please try again later.",
      error: error.message,
    });
  }
});

/* -------------------------- PUT: UPDATE ORDER STATUS -------------------------- */
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    order.status = status;
    await order.save();

    // ✅ Send email notification to customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: order.userEmail,
      subject: `🧶 Wollen Designs | Order Status Update`,
      text: `Hi ${order.userName},

Your order for "${order.design}" (Quantity: ${order.quantity}) Total amount: inr ${order.totalAmount} has been updated.

📦 New Status: ${status}

We'll keep you informed about further updates.

– Wollen Designs Team`,
    });

    res.json({
      success: true,
      message: "Order status updated and customer notified via email.",
      order,
    });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order and send notification.",
      error: error.message,
    });
  }
});

/* -------------------------- DELETE: REMOVE ORDER -------------------------- */
router.delete("/:id", async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    res.status(500).json({ success: false, message: "Failed to delete order" });
  }
});
/*------------Order Track-----------------------------------------------*/
// ✅ GET /api/orders/track?email= OR ?id=
router.get('/track', async (req, res) => {
  try {
    const { email, id } = req.query;

    let order;
    if (email) order = await Order.findOne({ userEmail: email }).sort({ createdAt: -1 });
    else if (id) order = await Order.findById(id);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found." });

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

export default router;
