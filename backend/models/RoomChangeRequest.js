const mongoose = require('mongoose');

const roomChangeRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentApplication',
      required: true
    },
    currentRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    preferredRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: 10
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionComment: {
      type: String,
      trim: true,
      default: null
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

roomChangeRequestSchema.index({ studentId: 1, status: 1 });
roomChangeRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('RoomChangeRequest', roomChangeRequestSchema);