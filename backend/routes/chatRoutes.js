const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendMessage, clearHistory } = require('../controllers/chatController');

// Optional auth middleware — doesn't block if no token, just attaches user if available
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Token invalid or expired — continue as anonymous
    req.user = null;
  }

  next();
};

// POST /api/chat — Send a message to AI assistant
router.post('/', optionalAuth, sendMessage);

// DELETE /api/chat/clear — Clear conversation history
router.delete('/clear', optionalAuth, clearHistory);

module.exports = router;
