import express from 'express';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Customer from '../models/Customer.js';
import Inventory from '../models/Inventory.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Sales reports
router.get('/sales', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Add shopId to all $match stages - only count completed orders for revenue
    const baseMatch = { ...dateFilter, status: 'completed', shopId: req.user.shopId };

    // Total sales
    const totalSales = await Order.aggregate([
      { $match: baseMatch },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);

    // Sales by category
    const salesByCategory = await Order.aggregate([
      { $match: baseMatch },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $group: {
          _id: '$menuItem.category',
          total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          quantity: { $sum: '$items.quantity' }
        }
      }
    ]);

    // Sales by payment method
    const salesByPayment = await Order.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily sales trend
    const dailySales = await Order.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalSales: totalSales[0] || { total: 0, count: 0 },
      salesByCategory,
      salesByPayment,
      dailySales
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Product performance
router.get('/products', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const baseMatch = { ...dateFilter, status: 'completed', shopId: req.user.shopId };

    const productPerformance = await Order.aggregate([
      { $match: baseMatch },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $group: {
          _id: '$items.menuItem',
          name: { $first: '$menuItem.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          avgPrice: { $avg: '$items.price' }
        }
      },
      { $sort: { totalQuantity: -1 } }
    ]);

    res.json(productPerformance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Customer reports
router.get('/customers', authMiddleware, async (req, res) => {
  try {
    // Top customers by spending
    const topCustomers = await Customer.find({ isActive: true, shopId: req.user.shopId })
      .sort({ totalSpent: -1 })
      .limit(10);

    // Customer acquisition
    const customerAcquisition = await Customer.aggregate([
      { $match: { shopId: req.user.shopId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Loyalty points distribution
    const loyaltyDistribution = await Customer.aggregate([
      { $match: { shopId: req.user.shopId } },
      {
        $bucket: {
          groupBy: '$loyaltyPoints',
          boundaries: [0, 100, 500, 1000, 5000],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    res.json({
      topCustomers,
      customerAcquisition,
      loyaltyDistribution
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Inventory reports
router.get('/inventory', authMiddleware, async (req, res) => {
  try {
    // Current inventory levels
    const inventoryLevels = await Inventory.find({ shopId: req.user.shopId })
      .populate('supplier', 'name')
      .sort({ name: 1 });

    // Low stock items
    const lowStockItems = await Inventory.find({
      shopId: req.user.shopId,
      $expr: { $lte: ['$currentStock', '$minStock'] }
    });

    // Inventory value
    const inventoryValue = await Inventory.aggregate([
      { $match: { shopId: req.user.shopId } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$currentStock', '$costPerUnit'] } }
        }
      }
    ]);

    res.json({
      inventoryLevels,
      lowStockItems,
      totalValue: inventoryValue[0]?.totalValue || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Financial reports
router.get('/financial', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const baseMatch = { ...dateFilter, status: 'completed', shopId: req.user.shopId };

    // Revenue and profit
    const financialData = await Order.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalTax: { $sum: '$tax' },
          totalDiscount: { $sum: '$discount' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // Monthly revenue trend
    const monthlyRevenue = await Order.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      summary: financialData[0] || { totalRevenue: 0, totalTax: 0, totalDiscount: 0, orderCount: 0 },
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
