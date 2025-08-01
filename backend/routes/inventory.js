import express from 'express';
import Inventory from '../models/Inventory.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Get all inventory items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    let query = { shopId: req.user.shopId };

    if (category) query.category = category;
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$currentStock', '$minStock'] };
    }

    const inventoryItems = await Inventory.find(query)
      .populate('supplier', 'name contactPerson')
      .sort({ name: 1 });

    res.json(inventoryItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single inventory item
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Inventory.findOne({ _id: req.params.id, shopId: req.user.shopId })
      .populate('supplier', 'name contactPerson email phone');

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create inventory item
router.post('/', authMiddleware, checkPermission('inventory', 'create'), async (req, res) => {
  try {
    const item = new Inventory({ ...req.body, shopId: req.user.shopId });
    await item.save();

    const populatedItem = await Inventory.findById(item._id)
      .populate('supplier', 'name contactPerson');

    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update inventory item
router.put('/:id', authMiddleware, checkPermission('inventory', 'update'), async (req, res) => {
  try {
    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      req.body,
      { new: true }
    ).populate('supplier', 'name contactPerson');

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update stock
router.patch('/:id/stock', authMiddleware, checkPermission('inventory', 'update'), async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    const item = await Inventory.findOne({ _id: req.params.id, shopId: req.user.shopId });
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (operation === 'add') {
      item.currentStock += quantity;
      item.lastRestocked = new Date();
    } else if (operation === 'subtract') {
      if (item.currentStock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      item.currentStock -= quantity;
    }

    await item.save();

    // Check for low stock and emit alert
    if (item.currentStock <= item.minStock) {
      if (req.io) {
        req.io.emit('low-stock-alert', {
          item: item.name,
          currentStock: item.currentStock,
          minStock: item.minStock
        });
      }
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete inventory item
router.delete('/:id', authMiddleware, checkPermission('inventory', 'delete'), async (req, res) => {
  try {
    const item = await Inventory.findOneAndDelete({ _id: req.params.id, shopId: req.user.shopId });

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get low stock alerts
router.get('/alerts/low-stock', authMiddleware, async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      shopId: req.user.shopId,
      $expr: { $lte: ['$currentStock', '$minStock'] }
    }).populate('supplier', 'name contactPerson');

    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
