const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Room = require('../models/Room');
const StudentApplication = require('../models/StudentApplication');
const RoomChangeRequest = require('../models/RoomChangeRequest');
const {
  submitRoomChangeRequest,
  getAllRoomChangeRequests,
  getMyRoomChangeRequests,
  approveRoomChangeRequest,
  rejectRoomChangeRequest,
  commentRoomChangeRequest
} = require('../controllers/roomChangeRequestController');

console.log('Room Change Request routes module loaded');

// POST /api/room-change-requests - Submit room change request (student only)
router.post('/', authMiddleware, (req, res, next) => {
  console.log('POST /api/room-change-requests - Route hit');
  console.log('User role:', req.user?.role);
  
  // Check if user is a student
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      message: 'Only students can submit room change requests' 
    });
  }
  
  next();
}, submitRoomChangeRequest);

// GET /api/room-change-requests - Get all requests (admin only)
router.get('/', authMiddleware, (req, res, next) => {
  console.log('GET /api/room-change-requests - Route hit');
  console.log('User role:', req.user?.role);
  
  // Check if user is an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Only admins can view all room change requests' 
    });
  }
  
  next();
}, getAllRoomChangeRequests);

// GET /api/room-change-requests/my-request - Get student's own requests (student only)
router.get('/my-request', authMiddleware, (req, res, next) => {
  console.log('GET /api/room-change-requests/my-request - Route hit');
  console.log('User role:', req.user?.role);
  
  // Check if user is a student
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      message: 'Only students can view their own room change requests' 
    });
  }
  
  next();
}, getMyRoomChangeRequests);

// PATCH /api/room-change-requests/:id/approve - Approve request (admin only)
router.patch('/:id/approve', authMiddleware, async (req, res) => {
  try {
    console.log('=== APPROVE ROUTE DEBUG ===');
    console.log('Request ID:', req.params.id);
    console.log('User:', req.user);
    
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Only admins can approve room change requests' 
      });
    }
    
    const request = await RoomChangeRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    console.log('Request found:', request);
    console.log('studentId:', request.studentId);
    console.log('currentRoom:', request.currentRoom);
    console.log('requestedRoom:', request.requestedRoom);
    console.log('status:', request.status);

    // Only approve pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Skip room capacity check if requestedRoom is null
    if (!request.requestedRoom) {
      return res.status(400).json({ message: 'No requested room found' });
    }

    const requestedRoom = await Room.findById(request.requestedRoom);
    if (!requestedRoom) {
      return res.status(400).json({ message: 'Requested room not found in database' });
    }

    console.log('Requested room details:', {
      roomNumber: requestedRoom.roomNumber,
      occupiedBeds: requestedRoom.occupiedBeds,
      capacity: requestedRoom.capacity
    });

    // Update application room using EXACT field names from StudentApplication model
    const application = await StudentApplication.findOne({
      studentId: request.studentId,  // Use studentId (not student)
      status: 'approved'
    });

    console.log('Application found:', application);

    if (application) {
      console.log('Before update - application.roomId:', application.roomId);
      // Use exact room field name from StudentApplication schema: roomId (not room)
      application.roomId = request.requestedRoom;
      await application.save();
      console.log('After update - application.roomId:', application.roomId);
      console.log('Application updated successfully');
    } else {
      console.log('No approved application found for student:', request.studentId);
    }

    // Update request status
    request.status = 'approved';
    await request.save();
    console.log('Request status updated to approved');

    console.log('=== APPROVE OPERATION SUCCESSFUL ===');
    res.json({ 
      message: 'Room changed successfully',
      requestedRoom: requestedRoom.roomNumber
    });
    
  } catch (err) {
    console.error('=== APPROVE ERROR DETAILS ===');
    console.error('Error message:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/room-change-requests/:id/reject - Reject request (admin only)
router.patch('/:id/reject', authMiddleware, (req, res, next) => {
  console.log('PATCH /api/room-change-requests/:id/reject - Route hit');
  console.log('User role:', req.user?.role);
  
  // Check if user is an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Only admins can reject room change requests' 
    });
  }
  
  next();
}, rejectRoomChangeRequest);

// PATCH /api/room-change-requests/:id/comment - Add comment (admin only)
router.patch('/:id/comment', authMiddleware, (req, res, next) => {
  console.log('PATCH /api/room-change-requests/:id/comment - Route hit');
  console.log('User role:', req.user?.role);
  
  // Check if user is an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Only admins can add comments to room change requests' 
    });
  }
  
  next();
}, commentRoomChangeRequest);

module.exports = router;
