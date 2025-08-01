import express from 'express';
import { authMiddleware, checkPermission } from '../middleware/auth.js';
import Setting from '../models/Setting.js'; // You must create this model!

const router = express.Router();

// Get all settings for current shop
router.get('/', authMiddleware, async (req, res) => {
  try {
    let shopSettings = await Setting.findOne({ shopId: req.user.shopId });
    // If not found, create default for this shop
    if (!shopSettings) {
      shopSettings = new Setting({ shopId: req.user.shopId });
      await shopSettings.save();
    }
    res.json(shopSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update shop settings
router.put('/shop', authMiddleware, checkPermission('settings', 'update'), async (req, res) => {
  try {
    let shopSettings = await Setting.findOne({ shopId: req.user.shopId });
    if (!shopSettings) {
      shopSettings = new Setting({ shopId: req.user.shopId });
    }
    shopSettings.shop = { ...shopSettings.shop, ...req.body };
    await shopSettings.save();
    res.json(shopSettings.shop);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update tax settings
router.put('/tax', authMiddleware, checkPermission('settings', 'update'), async (req, res) => {
  try {
    let shopSettings = await Setting.findOne({ shopId: req.user.shopId });
    if (!shopSettings) {
      shopSettings = new Setting({ shopId: req.user.shopId });
    }
    shopSettings.tax = { ...shopSettings.tax, ...req.body };
    await shopSettings.save();
    res.json(shopSettings.tax);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update payment settings
router.put('/payments', authMiddleware, checkPermission('settings', 'update'), async (req, res) => {
  try {
    let shopSettings = await Setting.findOne({ shopId: req.user.shopId });
    if (!shopSettings) {
      shopSettings = new Setting({ shopId: req.user.shopId });
    }
    shopSettings.payments = { ...shopSettings.payments, ...req.body };
    await shopSettings.save();
    res.json(shopSettings.payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update notification settings
router.put('/notifications', authMiddleware, checkPermission('settings', 'update'), async (req, res) => {
  try {
    let shopSettings = await Setting.findOne({ shopId: req.user.shopId });
    if (!shopSettings) {
      shopSettings = new Setting({ shopId: req.user.shopId });
    }
    shopSettings.notifications = { ...shopSettings.notifications, ...req.body };
    await shopSettings.save();
    res.json(shopSettings.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update system settings
router.put('/system', authMiddleware, checkPermission('settings', 'update'), async (req, res) => {
  try {
    let shopSettings = await Setting.findOne({ shopId: req.user.shopId });
    if (!shopSettings) {
      shopSettings = new Setting({ shopId: req.user.shopId });
    }
    shopSettings.system = { ...shopSettings.system, ...req.body };
    await shopSettings.save();
    res.json(shopSettings.system);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
