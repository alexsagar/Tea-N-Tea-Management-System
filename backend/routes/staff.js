import express from 'express';
import User from '../models/User.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Get all staff
router.get('/', authMiddleware, checkPermission('staff', 'read'), async (req, res) => {
  try {
    const { role, active } = req.query;
    let query = { shopId: req.user.shopId }; // multi-tenant isolation

    if (role) query.role = role;
    if (active !== undefined) query.isActive = active === 'true';

    const staff = await User.find(query)
      .select('-password')
      .sort({ name: 1 });

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single staff member
router.get('/:id', authMiddleware, checkPermission('staff', 'read'), async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, shopId: req.user.shopId }).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create staff member
router.post('/', authMiddleware, checkPermission('staff', 'create'), async (req, res) => {
  try {
    const { name, email, password, role, permissions, phone, address } = req.body;

    // Check if email already exists in this shop
    const existingUser = await User.findOne({ email, shopId: req.user.shopId });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const staff = new User({
      name,
      email,
      password,
      role,
      permissions,
      phone,
      address,
      shopId: req.user.shopId // multi-tenant
    });

    await staff.save();

    const staffResponse = await User.findById(staff._id).select('-password');
    res.status(201).json(staffResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update staff member
router.put('/:id', authMiddleware, checkPermission('staff', 'update'), async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      updateData,
      { new: true }
    ).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete staff member (soft delete)
router.delete('/:id', authMiddleware, checkPermission('staff', 'delete'), async (req, res) => {
  try {
    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      { isActive: false },
      { new: true }
    );
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json({ message: 'Staff member deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update staff permissions
router.patch('/:id/permissions', authMiddleware, checkPermission('staff', 'update'), async (req, res) => {
  try {
    const { permissions } = req.body;
    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      { permissions },
      { new: true }
    ).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
