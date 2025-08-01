import express from 'express';
import Table from '../models/Table.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Get all tables
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, location } = req.query;
    let query = { shopId: req.user.shopId }; // Multi-tenant isolation

    if (status) query.status = status;
    if (location) query.location = location;

    const tables = await Table.find(query)
      .populate('currentOrder', 'orderNumber total status')
      .populate('reservation.customer', 'name phone')
      .sort({ number: 1 });

    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single table
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const table = await Table.findOne({ _id: req.params.id, shopId: req.user.shopId })
      .populate('currentOrder', 'orderNumber total status items')
      .populate('reservation.customer', 'name phone email');

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create table
router.post('/', authMiddleware, checkPermission('tables', 'create'), async (req, res) => {
  try {
    // Check if table number already exists for this shop
    const existingTable = await Table.findOne({ number: req.body.number, shopId: req.user.shopId });
    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    const table = new Table({ ...req.body, shopId: req.user.shopId });
    await table.save();

    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update table
router.put('/:id', authMiddleware, checkPermission('tables', 'update'), async (req, res) => {
  try {
    const table = await Table.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      req.body,
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update table status
router.patch('/:id/status', authMiddleware, checkPermission('tables', 'update'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const table = await Table.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      { status },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Emit real-time update
    if (req.io) req.io.emit('table-status-update', table);

    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete table
router.delete('/:id', authMiddleware, checkPermission('tables', 'delete'), async (req, res) => {
  try {
    const table = await Table.findOneAndDelete({ _id: req.params.id, shopId: req.user.shopId });

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Make reservation
router.post('/:id/reservation', authMiddleware, async (req, res) => {
  try {
    const { customer, reservationTime, duration, specialRequests } = req.body;
    
    const table = await Table.findOne({ _id: req.params.id, shopId: req.user.shopId });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (table.status !== 'available') {
      return res.status(400).json({ message: 'Table is not available for reservation' });
    }

    table.status = 'reserved';
    table.reservation = {
      customer,
      reservationTime: new Date(reservationTime),
      duration,
      specialRequests
    };

    await table.save();

    const populatedTable = await Table.findById(table._id)
      .populate('reservation.customer', 'name phone');

    res.json(populatedTable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel reservation
router.delete('/:id/reservation', authMiddleware, async (req, res) => {
  try {
    const table = await Table.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      { 
        status: 'available',
        $unset: { reservation: 1 }
      },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
