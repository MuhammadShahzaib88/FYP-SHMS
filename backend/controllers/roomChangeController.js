const RoomChangeRequest = require('../models/RoomChangeRequest');
const StudentApplication = require('../models/StudentApplication');
const Room = require('../models/Room');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Submit room change request
// @route   POST /api/room-change/request
// @access  Private/Student
const submitRoomChangeRequest = async (req, res) => {
  try {
    const { preferredRoomId, reason } = req.body;

    if (!preferredRoomId || !reason || reason.trim().length < 10) {
      return res.status(400).json({
        message: 'Preferred room and a reason of at least 10 characters are required'
      });
    }

    const application = await StudentApplication.findOne({
      email: req.user.email,
      status: 'approved'
    }).populate('roomId', 'roomNumber floor hostelBlock occupiedBeds capacity');

    if (!application || !application.roomId) {
      return res.status(400).json({
        message: 'Only students with an assigned room can request room change'
      });
    }

    const existingPendingRequest = await RoomChangeRequest.findOne({
      studentId: req.user._id,
      status: 'pending'
    });

    if (existingPendingRequest) {
      return res.status(400).json({
        message: 'You already have a pending room change request'
      });
    }

    if (application.roomId._id.toString() === preferredRoomId) {
      return res.status(400).json({
        message: 'Preferred room must be different from your current room'
      });
    }

    const preferredRoom = await Room.findById(preferredRoomId);
    if (!preferredRoom) {
      return res.status(404).json({ message: 'Preferred room not found' });
    }

    if (preferredRoom.occupiedBeds >= preferredRoom.capacity) {
      return res.status(400).json({ message: 'Preferred room is currently full' });
    }

    const request = await RoomChangeRequest.create({
      studentId: req.user._id,
      applicationId: application._id,
      currentRoomId: application.roomId._id,
      preferredRoomId,
      reason: reason.trim(),
      status: 'pending'
    });

    try {
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        await createNotification(
          adminUser._id,
          'admin',
          'New Room Change Request',
          `${req.user.name} requested room change from Room ${application.roomId.roomNumber} to Room ${preferredRoom.roomNumber}`,
          'room_change',
          request._id
        );
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    const populatedRequest = await RoomChangeRequest.findById(request._id)
      .populate('currentRoomId', 'roomNumber floor hostelBlock')
      .populate('preferredRoomId', 'roomNumber floor hostelBlock');

    res.status(201).json({
      message: 'Room change request submitted successfully',
      request: populatedRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in student's room change requests
// @route   GET /api/room-change/my
// @access  Private/Student
const getMyRoomChangeRequests = async (req, res) => {
  try {
    const requests = await RoomChangeRequest.find({ studentId: req.user._id })
      .populate('currentRoomId', 'roomNumber floor hostelBlock')
      .populate('preferredRoomId', 'roomNumber floor hostelBlock')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all room change requests
// @route   GET /api/admin/room-change-requests
// @access  Private/Admin
const getAllRoomChangeRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const requests = await RoomChangeRequest.find(query)
      .populate('studentId', 'name email')
      .populate('currentRoomId', 'roomNumber floor hostelBlock')
      .populate('preferredRoomId', 'roomNumber floor hostelBlock occupiedBeds capacity')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve room change request
// @route   PUT /api/admin/room-change/:id/approve
// @access  Private/Admin
const approveRoomChangeRequest = async (req, res) => {
  try {
    const request = await RoomChangeRequest.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('currentRoomId', 'roomNumber occupiedBeds capacity')
      .populate('preferredRoomId', 'roomNumber occupiedBeds capacity');

    if (!request) {
      return res.status(404).json({ message: 'Room change request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be approved' });
    }

    const application = await StudentApplication.findById(request.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Student application not found' });
    }

    const currentRoom = await Room.findById(request.currentRoomId);
    const preferredRoom = await Room.findById(request.preferredRoomId);

    if (!preferredRoom) {
      return res.status(404).json({ message: 'Preferred room not found' });
    }

    if (preferredRoom.occupiedBeds >= preferredRoom.capacity) {
      return res.status(400).json({ message: 'Preferred room is currently full' });
    }

    if (currentRoom && currentRoom.occupiedBeds > 0) {
      currentRoom.occupiedBeds -= 1;
      await currentRoom.save();
    }

    preferredRoom.occupiedBeds += 1;
    await preferredRoom.save();

    application.roomId = preferredRoom._id;
    await application.save();

    request.status = 'approved';
    request.rejectionComment = null;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    try {
      await createNotification(
        request.studentId._id,
        'student',
        'Room Change Approved',
        `Your room change request has been approved. New room assigned: ${preferredRoom.roomNumber}`,
        'room_change_approved',
        request._id
      );
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    const updatedRequest = await RoomChangeRequest.findById(request._id)
      .populate('studentId', 'name email')
      .populate('currentRoomId', 'roomNumber floor hostelBlock')
      .populate('preferredRoomId', 'roomNumber floor hostelBlock')
      .populate('reviewedBy', 'name email');

    res.json({
      message: 'Room change request approved successfully',
      request: updatedRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject room change request
// @route   PUT /api/admin/room-change/:id/reject
// @access  Private/Admin
const rejectRoomChangeRequest = async (req, res) => {
  try {
    const { rejectionComment } = req.body;

    if (!rejectionComment || rejectionComment.trim().length < 5) {
      return res.status(400).json({
        message: 'Rejection comment is required and must be at least 5 characters'
      });
    }

    const request = await RoomChangeRequest.findById(req.params.id).populate('studentId', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Room change request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be rejected' });
    }

    request.status = 'rejected';
    request.rejectionComment = rejectionComment.trim();
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    try {
      await createNotification(
        request.studentId._id,
        'student',
        'Room Change Rejected',
        `Your room change request was rejected. Reason: ${request.rejectionComment}`,
        'room_change_rejected',
        request._id
      );
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    const updatedRequest = await RoomChangeRequest.findById(request._id)
      .populate('studentId', 'name email')
      .populate('currentRoomId', 'roomNumber floor hostelBlock')
      .populate('preferredRoomId', 'roomNumber floor hostelBlock')
      .populate('reviewedBy', 'name email');

    res.json({
      message: 'Room change request rejected successfully',
      request: updatedRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitRoomChangeRequest,
  getMyRoomChangeRequests,
  getAllRoomChangeRequests,
  approveRoomChangeRequest,
  rejectRoomChangeRequest
};