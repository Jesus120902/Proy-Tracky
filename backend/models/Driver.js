const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const driverSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' }, // Vincular con cuenta de login
    phone: { type: String, default: '' },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    vehicle: {
      type: { type: String, default: 'Van' },
      plate: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['available', 'on-delivery', 'offline'],
      default: 'available',
    },
    location: {
      lat: { type: Number, default: 40.7128 },
      lng: { type: Number, default: -74.006 },
    },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Driver', driverSchema);
