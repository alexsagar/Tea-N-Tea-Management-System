import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Get all menu items (public for the shop, multi-tenant)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, available } = req.query;
    let query = { shopId: req.user.shopId }; // Multi-tenant isolation

    if (category) query.category = category;
    if (available !== undefined) query.isAvailable = available === 'true';

    const menuItems = await MenuItem.find(query)
      .populate('ingredients.ingredient', 'name unit')
      .sort({ name: 1 });

    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single menu item
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Multi-tenant: Only fetch item for this shop
    const menuItem = await MenuItem.findOne({ _id: req.params.id, shopId: req.user.shopId })
      .populate('ingredients.ingredient', 'name unit currentStock');

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create menu item
router.post('/', authMiddleware, checkPermission('menu', 'create'), async (req, res) => {
  try {
    const menuItem = new MenuItem({ ...req.body, shopId: req.user.shopId }); // Always assign shopId!
    await menuItem.save();

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update menu item
router.put('/:id', authMiddleware, checkPermission('menu', 'update'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId }, // Multi-tenant isolation
      req.body,
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete menu item
router.delete('/:id', authMiddleware, checkPermission('menu', 'delete'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findOneAndDelete({ _id: req.params.id, shopId: req.user.shopId }); // Multi-tenant

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle availability
router.patch('/:id/availability', authMiddleware, checkPermission('menu', 'update'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId }, // Multi-tenant
      { isAvailable: req.body.isAvailable },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
