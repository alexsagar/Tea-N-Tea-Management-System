import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  shopId: { type: String, required: true }, // Added for multi-tenant
  name: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  products: [{
    name: String,
    category: String,
    pricePerUnit: Number,
    unit: String
  }],
  paymentTerms: {
    type: String,
    enum: ['immediate', '15-days', '30-days', '45-days'],
    default: '30-days'
  },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  isActive: { type: Boolean, default: true },
  totalOrders: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  lastOrder: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

supplierSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Supplier', supplierSchema);
