import Order from '../models/Order.js';
import Item from '../models/Item.js';
import { sendEmail } from '../utils/email.js';

/**
 * @desc Create new order
 * @route POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    const { userEmail, items, totalAmount, designUrl } = req.body;

    // Update item stock
    for (const item of items) {
      const dbItem = await Item.findById(item.itemId);
      if (dbItem) {
        dbItem.stock -= item.quantity;
        await dbItem.save();
      }
    }

    const order = await Order.create({ userEmail, items, totalAmount, designUrl });

    // Send confirmation email
    await sendEmail(
      userEmail,
      'Order Confirmation - DentoVilla',
      `Thank you for your order! Your total amount is ₹${totalAmount}.`
    );

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ error: 'Order creation failed' });
  }
};

/**
 * @desc Get all orders (Admin)
 * @route GET /api/orders
 */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

/**
 * @desc Update order status
 * @route PUT /api/orders/:id
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    await order.save();

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    console.error('Update Order Error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};
