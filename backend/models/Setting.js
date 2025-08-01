import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  shopId: { type: String, required: true, unique: true },
  shop: {
    name: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    logo: { type: String, default: null },
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' }
  },
  tax: {
    rate: { type: Number, default: 0.1 },
    inclusive: { type: Boolean, default: false }
  },
  payments: {
    methods: { type: [String], default: ['cash', 'card', 'qr', 'online'] },
    defaultMethod: { type: String, default: 'cash' }
  },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  system: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    currency: { type: String, default: 'USD' }
  }
});

export default mongoose.model('Setting', SettingSchema);
