const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrackedWebsite'
  },
  type: {
    type: String,
    enum: ['ssl_expiring', 'ssl_expired', 'ssl_invalid', 'performance_degraded', 'website_down', 'check_failed'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    url: String,
    daysRemaining: Number,
    expiryDate: Date,
    performanceScore: Number,
    previousScore: Number
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient queries
notificationSchema.index({ userId: 1, read: 1, severity: 1, createdAt: -1 });

// Static method to create notification with severity levels
notificationSchema.statics.createNotification = async function(data) {
  const severityMap = {
    'ssl_expired': 'critical',
    'ssl_invalid': 'critical',
    'website_down': 'critical',
    'ssl_expiring': data.daysRemaining <= 7 ? 'critical' : 'warning',
    'performance_degraded': data.performanceScore < 50 ? 'critical' : 'warning',
    'check_failed': 'warning'
  };

  return this.create({
    ...data,
    severity: data.severity || severityMap[data.type] || 'info'
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
