const RoomChangeRequest = require('../models/RoomChangeRequest');
const Room = require('../models/Room');
const StudentApplication = require('../models/StudentApplication');
const User = require('../models/User');

// @desc    Submit a room change request
// @route   POST /api/room-change-requests
// @access  Private (student only)
const submitRoomChangeRequest = async (req, res) => {
  try {
    const { currentRoom, requestedRoom, reason } = req.body;
    const studentId = req.user._id;

    console.log('Submitting room change request:', {
      studentId,
      currentRoom,
      requestedRoom,
      reason
    });

    // Validate required fields
    if (!currentRoom || !requestedRoom || !reason) {
      return res.status(400).json({ 
        message: 'Current room, requested room, and reason are required' 
      });
    }

    // Check if student has a pending request
    const hasPending = await RoomChangeRequest.hasPendingRequest(studentId);
    if (hasPending) {
      return res.status(400).json({ 
        message: 'You already have a pending room change request' 
      });
    }

    // Verify rooms exist
    const currentRoomDoc = await Room.findById(currentRoom);
    const requestedRoomDoc = await Room.findById(requestedRoom);

    if (!currentRoomDoc || !requestedRoomDoc) {
      return res.status(404).json({ 
        message: 'One or both rooms not found' 
      });
    }

    // Check if requested room has capacity (allow request even if full)
    const isRequestedRoomFull = requestedRoomDoc.occupiedBeds >= requestedRoomDoc.capacity;
    
    // Create the request
    const roomChangeRequest = new RoomChangeRequest({
      studentId,
      currentRoom,
      requestedRoom,
      reason
    });

    await roomChangeRequest.save();

    // Populate room details for response
    await roomChangeRequest.populate([
      { path: 'currentRoom', select: 'roomNumber' },
      { path: 'requestedRoom', select: 'roomNumber capacity occupiedBeds' }
    ]);

    console.log('Room change request submitted successfully:', roomChangeRequest._id);

    res.status(201).json({
      message: 'Room change request submitted successfully',
      request: roomChangeRequest,
      isRequestedRoomFull
    });

  } catch (error) {
    console.error('Submit room change request error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get all room change requests (admin)
// @route   GET /api/room-change-requests
// @access  Private (admin only)
const getAllRoomChangeRequests = async (req, res) => {
  try {
    console.log('Fetching all room change requests for admin');

    const requests = await RoomChangeRequest.find()
      .populate({ 
        path: 'studentId', 
        select: 'name email',
        strictPopulate: false 
      })
      .populate({ 
        path: 'currentRoom', 
        select: 'roomNumber type',
        strictPopulate: false 
      })
      .populate({ 
        path: 'requestedRoom', 
        select: 'roomNumber capacity occupiedBeds',
        strictPopulate: false 
      })
      .sort({ createdAt: -1 });

    console.log(`Found ${requests.length} room change requests`);
    console.log('Sample request:', requests[0]);

    // Calculate statistics
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length
    };

    res.json({
      requests,
      stats
    });

  } catch (error) {
    console.error('Get all room change requests error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get student's own room change requests
// @route   GET /api/room-change-requests/my-request
// @access  Private (student only)
const getMyRoomChangeRequests = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    console.log('Fetching room change requests for student:', studentId);

    const requests = await RoomChangeRequest.find({ studentId })
      .populate('currentRoom', 'roomNumber')
      .populate('requestedRoom', 'roomNumber capacity occupiedBeds')
      .sort({ createdAt: -1 });

    console.log(`Found ${requests.length} requests for student ${studentId}`);

    res.json({ requests });

  } catch (error) {
    console.error('Get my room change requests error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Approve a room change request
// @route   PATCH /api/room-change-requests/:id/approve
// @access  Private (admin only)
const approveRoomChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Approving room change request:', id);

    const request = await RoomChangeRequest.findById(id)
      .populate('studentId', 'name email')
      .populate('currentRoom', 'roomNumber occupiedBeds')
      .populate('requestedRoom', 'roomNumber capacity occupiedBeds');

    if (!request) {
      return res.status(404).json({ 
        message: 'Room change request not found' 
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'This request has already been processed' 
      });
    }

    // Check if requested room still has capacity
    if (request.requestedRoom.occupiedBeds >= request.requestedRoom.capacity) {
      return res.status(400).json({ 
        message: 'Requested room is now full. Cannot approve this request.' 
      });
    }

    // Start transaction
    const session = await RoomChangeRequest.startSession();
    session.startTransaction();

    try {
      // Update student's application room
      await StudentApplication.updateOne(
        { studentId: request.studentId._id },
        { room: request.requestedRoom._id },
        { session }
      );

      // Update old room (decrease occupied beds)
      await Room.findByIdAndUpdate(
        request.currentRoom._id,
        { $inc: { occupiedBeds: -1 } },
        { session }
      );

      // Update new room (increase occupied beds)
      await Room.findByIdAndUpdate(
        request.requestedRoom._id,
        { $inc: { occupiedBeds: 1 } },
        { session }
      );

      // Update request status
      request.status = 'approved';
      await request.save({ session });

      await session.commitTransaction();
      session.endSession();

      console.log('Room change request approved successfully:', id);

      res.json({
        message: 'Room change request approved successfully',
        request
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('Approve room change request error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Reject a room change request
// @route   PATCH /api/room-change-requests/:id/reject
// @access  Private (admin only)
const rejectRoomChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminComment } = req.body;
    
    console.log('Rejecting room change request:', id);

    const request = await RoomChangeRequest.findById(id);

    if (!request) {
      return res.status(404).json({ 
        message: 'Room change request not found' 
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'This request has already been processed' 
      });
    }

    // Update request
    request.status = 'rejected';
    request.adminComment = adminComment || '';
    await request.save();

    console.log('Room change request rejected successfully:', id);

    res.json({
      message: 'Room change request rejected',
      request
    });

  } catch (error) {
    console.error('Reject room change request error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Add comment to room change request
// @route   PATCH /api/room-change-requests/:id/comment
// @access  Private (admin only)
const commentRoomChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminComment } = req.body;
    
    console.log('Adding comment to room change request:', id);

    if (!adminComment) {
      return res.status(400).json({ 
        message: 'Admin comment is required' 
      });
    }

    const request = await RoomChangeRequest.findById(id);

    if (!request) {
      return res.status(404).json({ 
        message: 'Room change request not found' 
      });
    }

    // Update comment (don't change status)
    request.adminComment = adminComment;
    await request.save();

    console.log('Comment added to room change request:', id);

    res.json({
      message: 'Comment added successfully',
      request
    });

  } catch (error) {
    console.error('Comment room change request error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

module.exports = {
  submitRoomChangeRequest,
  getAllRoomChangeRequests,
  getMyRoomChangeRequests,
  approveRoomChangeRequest,
  rejectRoomChangeRequest,
  commentRoomChangeRequest
};
