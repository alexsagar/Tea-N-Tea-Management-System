import express from 'express';
import StockIn from '../models/stockIn.js';
import Inventory from '../models/Inventory.js';
import Supplier from '../models/Supplier.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Add a stock-in/purchase entry
router.post('/', authMiddleware, checkPermission('inventory', 'create'), async (req, res) => {
  try {
    const {
      supplier, // supplier ObjectId
      product, // inventory ObjectId
      quantity,
      unit,
      unitPrice,
      totalPrice,
      invoiceNumber,
      purchaseDate,
      notes
    } = req.body;

    // 1. Validate supplier and product
    const inventoryItem = await Inventory.findOne({ _id: product, shopId: req.user.shopId });
    if (!inventoryItem) {
      return res.status(400).json({ message: 'Inventory item not found.' });
    }

    const supplierDoc = await Supplier.findOne({ _id: supplier, shopId: req.user.shopId });
    if (!supplierDoc) {
      return res.status(400).json({ message: 'Supplier not found.' });
    }

    // 2. Update Inventory
    inventoryItem.currentStock += Number(quantity);
    inventoryItem.lastRestocked = new Date(purchaseDate || Date.now());
    await inventoryItem.save();

    // 3. Update Supplier stats
    supplierDoc.totalOrders += 1;
    supplierDoc.totalAmount += Number(totalPrice);
    supplierDoc.lastOrder = new Date(purchaseDate || Date.now());
    await supplierDoc.save();

    // 4. Save StockIn
    const stockIn = new StockIn({
      shopId: req.user.shopId,
      supplier,
      product,
      quantity,
      unit,
      unitPrice,
      totalPrice,
      invoiceNumber,
      purchaseDate,
      notes
    });
    await stockIn.save();

    res.status(201).json(stockIn);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// (Optional) GET /stockin - list all purchases for the shop
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, supplier, product } = req.query;
    let query = { shopId: req.user.shopId };
    if (supplier) query.supplier = supplier;
    if (product) query.product = product;
    if (startDate && endDate) {
      query.purchaseDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const stockIns = await StockIn.find(query)
      .populate('supplier', 'name')
      .populate('product', 'name unit')
      .sort({ purchaseDate: -1 });
    res.json(stockIns);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
