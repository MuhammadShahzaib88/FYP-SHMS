const express = require('express');
const router = express.Router();
const {
  submitRoomChangeRequest,
  getMyRoomChangeRequests,
  getAllRoomChangeRequests,
  approveRoomChangeRequest,
  rejectRoomChangeRequest
} = require('../controllers/roomChangeController');
const { authMiddleware, studentMiddleware, adminMiddleware } = require('../middleware/auth');

router.post('/room-change/request', authMiddleware, studentMiddleware, submitRoomChangeRequest);
router.get('/room-change/my', authMiddleware, studentMiddleware, getMyRoomChangeRequests);

router.get('/admin/room-change-requests', authMiddleware, adminMiddleware, getAllRoomChangeRequests);
router.put('/admin/room-change/:id/approve', authMiddleware, adminMiddleware, approveRoomChangeRequest);
router.put('/admin/room-change/:id/reject', authMiddleware, adminMiddleware, rejectRoomChangeRequest);

module.exports = router;