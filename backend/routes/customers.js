import express from 'express';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Get all customers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, sortBy = 'name', order = 'asc' } = req.query;
    let query = { shopId: req.user.shopId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single customer
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, shopId: req.user.shopId });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const orders = await Order.find({ customer: req.params.id, shopId: req.user.shopId })
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ customer, recentOrders: orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create customer
router.post('/', authMiddleware, checkPermission('customers', 'create'), async (req, res) => {
  try {
    const existingCustomer = await Customer.findOne({ phone: req.body.phone, shopId: req.user.shopId });
    if (existingCustomer) return res.status(400).json({ message: 'Customer with this phone number already exists' });

    const customer = new Customer({ ...req.body, shopId: req.user.shopId });
    await customer.save();

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update customer
router.put('/:id', authMiddleware, checkPermission('customers', 'update'), async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      req.body,
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete (soft) customer
router.delete('/:id', authMiddleware, checkPermission('customers', 'delete'), async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      { isActive: false },
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    res.json({ message: 'Customer deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update loyalty points
router.patch('/:id/loyalty', authMiddleware, async (req, res) => {
  try {
    const { points, operation } = req.body;
    const customer = await Customer.findOne({ _id: req.params.id, shopId: req.user.shopId });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    if (operation === 'add') customer.loyaltyPoints += points;
    else if (operation === 'subtract') {
      if (customer.loyaltyPoints < points)
        return res.status(400).json({ message: 'Insufficient loyalty points' });
      customer.loyaltyPoints -= points;
    }

    await customer.save();
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get customer's order history
router.get('/:id/orders', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const orders = await Order.find({ customer: req.params.id, shopId: req.user.shopId })
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Order.countDocuments({ customer: req.params.id, shopId: req.user.shopId });

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
