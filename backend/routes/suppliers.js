import express from 'express';
import Supplier from '../models/Supplier.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Get all suppliers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { active, search } = req.query;
    let query = { shopId: req.user.shopId }; // Multi-tenant: only your shop

    if (active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(query).sort({ name: 1 });

    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single supplier
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, shopId: req.user.shopId });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create supplier
router.post('/', authMiddleware, checkPermission('suppliers', 'create'), async (req, res) => {
  try {
    const supplier = new Supplier({ ...req.body, shopId: req.user.shopId }); // Always set shopId
    await supplier.save();

    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update supplier
router.put('/:id', authMiddleware, checkPermission('suppliers', 'update'), async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId }, // Multi-tenant
      req.body,
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete supplier (soft delete)
router.delete('/:id', authMiddleware, checkPermission('suppliers', 'delete'), async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndDelete({
      _id: req.params.id,
      shopId: req.user.shopId // still multi-tenant secure
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


export default router;
