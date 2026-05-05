const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientType: {
    type: String,
    enum: ['admin', 'student'],
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
  type: {
    type: String,
    enum: [
      'application',
      'complaint',
      'notice',
      'approval',
      'rejection',
      'room_change',
      'room_change_approved',
      'room_change_rejected'
    ],
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientType: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
