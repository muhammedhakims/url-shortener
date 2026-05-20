const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  device: {
    type: String,
    default: 'Desktop', // Desktop, Mobile, Tablet, etc.
  },
  os: {
    type: String,
    default: 'Unknown',
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  referrer: {
    type: String,
    default: 'Direct',
  },
  country: {
    type: String,
    default: 'Unknown',
  },
});

module.exports = mongoose.model('Analytics', analyticsSchema);
