const mongoose = require('mongoose');

const trackedWebsiteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: 50
  },
  checkInterval: {
    type: Number,
    default: 24, // hours
    min: 1,
    max: 168 // max 1 week
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastCheck: {
    type: Date
  },
  nextCheck: {
    type: Date
  },
  status: {
    overall: {
      type: String,
      enum: ['healthy', 'warning', 'critical', 'unknown'],
      default: 'unknown'
    },
    ssl: {
      valid: Boolean,
      daysRemaining: Number,
      expiryDate: Date
    },
    performance: {
      score: Number,
      loadTime: Number
    },
    lastError: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
trackedWebsiteSchema.index({ userId: 1, url: 1 }, { unique: true });
trackedWebsiteSchema.index({ nextCheck: 1, isActive: 1 });

// Update timestamp on save
trackedWebsiteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TrackedWebsite', trackedWebsiteSchema);
