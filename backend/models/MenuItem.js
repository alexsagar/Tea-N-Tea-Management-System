import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  shopId: { type: String, required: true }, // Added for multi-tenant
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['tea', 'coffee', 'snacks', 'desserts', 'beverages']
  },
  price: { type: Number, required: true, min: 0 },
  cost: { type: Number, required: true, min: 0 },
  image: { type: String, default: null },
  isAvailable: { type: Boolean, default: true },
  ingredients: [{
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory'
    },
    quantity: { type: Number, required: true },
    unit: { 
      type: String, 
      required: true,
       enum: ['ml', 'l', 'g', 'kg', 'pcs', 'tbsp', 'tsp']
     }
  }],
  preparationTime: { type: Number, default: 5 },
  tags: [String],
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

menuItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('MenuItem', menuItemSchema);
