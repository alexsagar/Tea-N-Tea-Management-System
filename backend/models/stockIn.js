import mongoose from 'mongoose';

const stockInSchema = new mongoose.Schema({
  shopId: { type: String, required: true }, // multi-tenant
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  invoiceNumber: { type: String },
  purchaseDate: { type: Date, default: Date.now },
  notes: { type: String }
});

export default mongoose.model('StockIn', stockInSchema);
