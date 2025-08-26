import express from 'express';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `ORD${year}${month}${day}${random}`;
};

// Calculate order totals helper
const calculateOrderTotals = async (items, shopId) => {
  let subtotal = 0;

  for (const item of items) {
    const menuItem = await MenuItem.findOne({ _id: item.menuItem, shopId });
    if (!menuItem) throw new Error(`Menu item ${item.menuItem} not found`);
    subtotal += menuItem.price * item.quantity;
  }

  const tax = 0; // no tax as requested
  const total = subtotal + tax;
  return { subtotal, tax, total };
};

// Get all orders (with optional filters)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, orderType, startDate, endDate, date, page = 1, limit = 10 } = req.query;
    let query = { shopId: req.user.shopId };

    if (status) query.status = status;
    if (orderType) query.orderType = orderType;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .populate('items.menuItem', 'name price')
      .populate('table', 'number')
      .populate('staff', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new order (no inventory deduction)
router.post('/', authMiddleware, checkPermission('orders', 'create'), async (req, res) => {
  try {
    const { items, customer, table, orderType, paymentMethod, notes } = req.body;

    const { subtotal, tax, total } = await calculateOrderTotals(items, req.user.shopId);

    // Validate menu items and prepare orderItems array
    const orderItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findOne({ _id: item.menuItem, shopId: req.user.shopId });
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item ${item.menuItem} not found` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is not available` });
      }

      orderItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions || ''
      });
    }

    const order = new Order({
      orderNumber: generateOrderNumber(),
      customer,
      items: orderItems,
      table,
      orderType,
      subtotal,
      tax,
      total,
      paymentMethod,
      staff: req.user.userId,
      notes,
      shopId: req.user.shopId
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone')
      .populate('items.menuItem', 'name price')
      .populate('table', 'number')
      .populate('staff', 'name');

    if (req.io) req.io.emit('new-order', populatedOrder);

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order (with totals recalculation)
router.put('/:id', authMiddleware, checkPermission('orders', 'update'), async (req, res) => {
  try {
    const { items } = req.body;

    const { subtotal, tax, total } = await calculateOrderTotals(items, req.user.shopId);

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      { ...req.body, subtotal, tax, total },
      { new: true }
    )
      .populate('customer', 'name phone')
      .populate('items.menuItem', 'name price')
      .populate('table', 'number');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status only
router.patch('/:id/status', authMiddleware, checkPermission('orders', 'update'), async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      { status },
      { new: true }
    )
      .populate('customer', 'name phone')
      .populate('items.menuItem', 'name price')
      .populate('table', 'number');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.io) req.io.emit('order-status-update', order);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel order (soft delete via status)
router.delete('/:id', authMiddleware, checkPermission('orders', 'delete'), async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.io) req.io.emit('order-cancelled', order);

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Permanently delete cancelled order
router.delete('/:id/permanent', authMiddleware, checkPermission('orders', 'delete'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, shopId: req.user.shopId });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow permanent deletion of cancelled orders
    if (order.status !== 'cancelled') {
      return res.status(400).json({ 
        message: 'Only cancelled orders can be permanently deleted' 
      });
    }

    // Permanently delete the order
    await Order.findByIdAndDelete(req.params.id);

    if (req.io) req.io.emit('order-deleted', { orderId: req.params.id });

    res.json({ message: 'Order permanently deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
