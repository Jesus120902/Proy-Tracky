const mongoose = require('mongoose');

const locationHistorySchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  date: {
    type: String, // format YYYY-MM-DD for easy querying
    required: true
  },
  path: [{
    lat: Number,
    lng: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Índice para búsquedas rápidas por conductor y fecha
locationHistorySchema.index({ driver: 1, date: 1 });

module.exports = mongoose.model('LocationHistory', locationHistorySchema);
