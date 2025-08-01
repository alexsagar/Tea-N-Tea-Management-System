
import mongoose from 'mongoose';
const shopSchema = new mongoose.Schema({
  name: String,
  address: String,
  shopId: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Shop', shopSchema);
