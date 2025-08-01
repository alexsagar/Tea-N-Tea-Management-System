import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Helper for unique 4-digit shopId
async function generateUniqueShopId() {
  let shopId;
  while (true) {
    shopId = (Math.floor(1000 + Math.random() * 9000)).toString();
    const exists = await Shop.findOne({ shopId });
    if (!exists) break;
  }
  return shopId;
}

// POST /api/auth/signup-shop
router.post('/signup-shop', async (req, res) => {
  try {
    const { shopName, address, ownerName, ownerEmail, ownerPassword } = req.body;
    if (!shopName || !ownerName || !ownerEmail || !ownerPassword) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Unique shopId
    const shopId = await generateUniqueShopId();

    // Create shop
    const shop = await Shop.create({ name: shopName, address, shopId });

    // Create first user (admin)
    
    const user = await User.create({
  name: ownerName,
  email: ownerEmail,
  password: ownerPassword,  // raw password here
  role: 'admin',
  shopId
});

    res.status(201).json({ shopId, message: 'Shop and admin created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Signup error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { shopId, email, password } = req.body;
  console.log('Login attempt:', { shopId, email, password });

  const user = await User.findOne({ shopId, email, isActive: true });
  console.log('User found:', user);

  if (!user) {
    console.log('User not found or inactive');
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(password);
  console.log('Password match:', isMatch);

  if (!isMatch) {
    console.log('Password incorrect');
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Success flow
  const token = jwt.sign(
    { userId: user._id, shopId: user.shopId, role: user.role, permissions: user.permissions },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      shopId: user.shopId
    }
  });
});


// Register (Admin only, for their shop)
router.post('/register', authMiddleware, async (req, res) => {
  try {
    // Only allow admins to register new users for their shop
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can add staff' });
    }

    const { name, email, password, role, permissions } = req.body;

    // Check if user exists (shopId+email)
    const existingUser = await User.findOne({ email, shopId: req.user.shopId });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user (staff, cashier, etc.)
   
  const user = new User({
  name,
  email,
  password, // raw password
  role,
  permissions,
  shopId: req.user.shopId
});

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopId: user.shopId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, address },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Change password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password (hash it!)
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
