import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  shopId: { type: String, required: true }, // Added for multi-tenant
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['tea-leaves', 'milk', 'sugar', 'spices', 'snacks', 'cups', 'others']
  },
  currentStock: { type: Number, required: true, min: 0 },
  minStock: { type: Number, min: 0 },
  maxStock: { type: Number, min:0 },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'l', 'ml', 'pieces', 'packets', 'bottles']
  },
  costPerUnit: { type: Number, required: true, min: 0 },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  expiryDate: { type: Date, required: false },
  batchNumber: { type: String, trim: true },
  location: { type: String, trim: true },
  lastRestocked: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

inventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Inventory', inventorySchema);
