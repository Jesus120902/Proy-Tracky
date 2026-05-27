const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: () => `ORD-${Date.now()}`,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    customer: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
      }
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in-transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    items: { type: String, default: '' },
    notes: { type: String, default: '' },
    estimatedDelivery: { type: Date, default: null },
    assignedAt: Date,
    transitStartedAt: Date,
    deliveredAt: Date,
    evidence: {
      signature: String, // Base64
      photo: String,     // Base64
      recipientName: String,
      deliveredLocation: {
        lat: Number,
        lng: Number
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
