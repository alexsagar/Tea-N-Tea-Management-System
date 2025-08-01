import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  shopId: { type: String, required: true }, // Added for multi-tenant
  number: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'private'],
    default: 'indoor'
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  reservation: {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    reservationTime: Date,
    duration: Number,
    specialRequests: String
  },
  lastCleaned: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tableSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Table', tableSchema);
