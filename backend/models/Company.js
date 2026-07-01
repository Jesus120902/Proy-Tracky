const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  logoUrl: {
    type: String,
    default: '',
  },
  branding: {
    primaryColor: { type: String, default: '#3b82f6' }, // Azul Tracky por defecto
    secondaryColor: { type: String, default: '#0f172a' },
  },
  settings: {
    maxDrivers: { type: Number, default: 10 },
  },
  subscription: {
    plan: { type: String, enum: ['free', 'pro', 'business'], default: 'free' },
    status: { type: String, enum: ['active', 'canceled', 'past_due', 'trialing'], default: 'trialing' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    mpSubscriptionId: { type: String, default: null },
    mpCustomerId: { type: String, default: null }
  },
  active: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
