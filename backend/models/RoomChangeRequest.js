const mongoose = require('mongoose');

const roomChangeRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  currentRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Current room is required']
  },
  requestedRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Requested room is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminComment: {
    type: String,
    default: '',
    trim: true,
    maxlength: [300, 'Admin comment cannot exceed 300 characters']
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

// Indexes for faster queries
roomChangeRequestSchema.index({ studentId: 1, status: 1 });
roomChangeRequestSchema.index({ status: 1, createdAt: -1 });
roomChangeRequestSchema.index({ requestedRoom: 1, status: 1 });

// Pre-save middleware to update updatedAt
roomChangeRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware to update updatedAt
roomChangeRequestSchema.pre(['updateOne', 'update'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Static method to check if student has pending request
roomChangeRequestSchema.statics.hasPendingRequest = async function(studentId) {
  const existingRequest = await this.findOne({ 
    studentId, 
    status: 'pending' 
  });
  return !!existingRequest;
};

// Virtual for formatted date
roomChangeRequestSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Ensure virtuals are included in JSON output
roomChangeRequestSchema.set('toJSON', { virtuals: true });
roomChangeRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('RoomChangeRequest', roomChangeRequestSchema);
