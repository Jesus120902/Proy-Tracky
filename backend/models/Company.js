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
    plan: { type: String, enum: ['free', 'premium', 'enterprise'], default: 'free' },
  },
  active: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
