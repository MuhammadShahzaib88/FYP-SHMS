const Groq = require('groq-sdk');
const Room = require('../models/Room');
const StudentApplication = require('../models/StudentApplication');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const RoomChangeRequest = require('../models/RoomChangeRequest');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// In-memory conversation store (per user session)
const conversationStore = new Map();

// Clean up old conversations every 30 minutes
setInterval(() => {
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  for (const [key, value] of conversationStore.entries()) {
    if (value.lastActivity < thirtyMinutesAgo) {
      conversationStore.delete(key);
    }
  }
}, 30 * 60 * 1000);

/**
 * Gather live hostel data from MongoDB for AI context
 */
const gatherHostelContext = async (user) => {
  try {
    // ---- Data everyone can see ----
    const allRooms = await Room.find().sort({ roomNumber: 1 });
    const availableRooms = allRooms.filter(r => r.occupiedBeds < r.capacity);
    const totalBeds = allRooms.reduce((sum, r) => sum + r.capacity, 0);
    const occupiedBeds = allRooms.reduce((sum, r) => sum + r.occupiedBeds, 0);

    const activeNotices = await Notice.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title content priority createdAt');

    let context = `
=== HOSTEL LIVE DATA (Real-time from database) ===

📊 ROOM STATISTICS:
- Total Rooms: ${allRooms.length}
- Available Rooms (with empty beds): ${availableRooms.length}
- Total Beds: ${totalBeds}
- Occupied Beds: ${occupiedBeds}
- Empty Beds: ${totalBeds - occupiedBeds}
- Occupancy Rate: ${totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0}%

🏠 AVAILABLE ROOMS LIST:
${availableRooms.length > 0
  ? availableRooms.map(r =>
    `  • Room ${r.roomNumber} | Block ${r.hostelBlock} | Floor ${r.floor} | ${r.occupiedBeds}/${r.capacity} beds occupied (${r.capacity - r.occupiedBeds} available)`
  ).join('\n')
  : '  No rooms available at the moment.'
}

📋 ALL ROOMS OVERVIEW:
${allRooms.map(r =>
  `  • Room ${r.roomNumber} | Block ${r.hostelBlock} | Floor ${r.floor} | ${r.occupiedBeds}/${r.capacity} beds | ${r.occupiedBeds >= r.capacity ? '🔴 Full' : r.occupiedBeds > 0 ? '🟡 Partial' : '🟢 Empty'}`
).join('\n')}

📢 ACTIVE NOTICES:
${activeNotices.length > 0
  ? activeNotices.map(n =>
    `  • [${n.priority.toUpperCase()}] ${n.title}: ${n.content.substring(0, 150)}${n.content.length > 150 ? '...' : ''} (${new Date(n.createdAt).toLocaleDateString()})`
  ).join('\n')
  : '  No active notices.'
}
`;

    // ---- Student-specific context ----
    if (user && user.role === 'student') {
      const myApplication = await StudentApplication.findOne({ email: user.email })
        .populate('roomId', 'roomNumber floor hostelBlock capacity occupiedBeds');

      const myComplaints = await Complaint.find({ studentId: user._id })
        .sort({ createdAt: -1 })
        .limit(5);

      const myRoomChangeRequests = await RoomChangeRequest.find({ studentId: user._id })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('currentRoomId', 'roomNumber')
        .populate('preferredRoomId', 'roomNumber');

      context += `
👤 YOUR PERSONAL INFO (Student: ${user.name}):
- Email: ${user.email}
- Application Status: ${myApplication ? myApplication.status : 'No application found'}
${myApplication && myApplication.status === 'approved' && myApplication.roomId ? `
- Your Room: Room ${myApplication.roomId.roomNumber}
- Block: ${myApplication.roomId.hostelBlock}
- Floor: ${myApplication.roomId.floor}
- Room Occupancy: ${myApplication.roomId.occupiedBeds}/${myApplication.roomId.capacity} beds
- Department: ${myApplication.department}
- Semester: ${myApplication.semester}
` : myApplication && myApplication.status === 'pending' ? `
- Your application is pending admin review.
- Department: ${myApplication.department}
- Semester: ${myApplication.semester}
` : ''}

📝 YOUR RECENT COMPLAINTS:
${myComplaints.length > 0
  ? myComplaints.map(c =>
    `  • [${c.status}] ${c.title} - ${c.category} (${new Date(c.createdAt).toLocaleDateString()})${c.adminReply ? ` | Admin Reply: ${c.adminReply}` : ''}`
  ).join('\n')
  : '  You have no complaints.'
}

🔄 YOUR ROOM CHANGE REQUESTS:
${myRoomChangeRequests.length > 0
  ? myRoomChangeRequests.map(r =>
    `  • [${r.status}] From Room ${r.currentRoomId?.roomNumber || 'N/A'} → Room ${r.preferredRoomId?.roomNumber || 'N/A'} | Reason: ${r.reason.substring(0, 80)}${r.reason.length > 80 ? '...' : ''}`
  ).join('\n')
  : '  No room change requests.'
}
`;
    }

    // ---- Admin-specific context ----
    if (user && user.role === 'admin') {
      const totalStudents = await User.countDocuments({ role: 'student' });
      const pendingApplications = await StudentApplication.countDocuments({ status: 'pending' });
      const approvedApplications = await StudentApplication.countDocuments({ status: 'approved' });
      const rejectedApplications = await StudentApplication.countDocuments({ status: 'rejected' });

      const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
      const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
      const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
      const totalComplaints = await Complaint.countDocuments({});

      const pendingRoomChanges = await RoomChangeRequest.countDocuments({ status: 'pending' });

      const recentComplaints = await Complaint.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title category status studentName roomNumber createdAt');

      context += `
🔧 ADMIN DASHBOARD DATA:
- Total Registered Students: ${totalStudents}
- Pending Applications: ${pendingApplications}
- Approved Applications: ${approvedApplications}
- Rejected Applications: ${rejectedApplications}
- Pending Room Change Requests: ${pendingRoomChanges}

📊 COMPLAINT STATISTICS:
- Total Complaints: ${totalComplaints}
- Pending: ${pendingComplaints}
- In Progress: ${inProgressComplaints}
- Resolved: ${resolvedComplaints}

🔥 RECENT COMPLAINTS:
${recentComplaints.map(c =>
  `  • [${c.status}] ${c.title} by ${c.studentName} (Room ${c.roomNumber}) - ${c.category} (${new Date(c.createdAt).toLocaleDateString()})`
).join('\n')}
`;
    }

    return context;
  } catch (error) {
    console.error('Error gathering hostel context:', error);
    return 'Error loading hostel data. Please try again.';
  }
};

/**
 * Build the system prompt for the AI
 */
const buildSystemPrompt = (user, hostelContext) => {
  const role = user ? (user.role === 'admin' ? 'an admin' : 'a student') : 'a visitor';
  const userName = user ? user.name : 'Visitor';

  return `You are "SHMS AI Assistant" — the smart, helpful, and friendly AI assistant for the Smart Hostel Management System.

🎓 You are currently helping: ${userName} (${role})

YOUR ROLE:
- Help students, admins, and visitors with hostel-related questions
- Provide accurate, real-time information based on the live hostel data below
- Be friendly, concise, and professional
- Use emojis sparingly to make responses engaging
- Answer in the SAME LANGUAGE the user asks in (English or Urdu/Roman Urdu)

WHAT YOU CAN DO:
- Tell which rooms are available and which are full
- Share room details (block, floor, capacity, occupancy)
- Inform about active notices
- Help students check their application status, room info, complaints
- Help admins with statistics, pending tasks, and overview
- Guide visitors about the hostel, how to apply, and room availability
- Answer general hostel-related questions (rules, timings, policies)

HOSTEL RULES & INFO (General Knowledge):
- Main gate closes at 10:00 PM
- Visitor hours: 4:00 PM - 8:00 PM
- Quiet/Study hours: 9:00 PM - 6:00 AM
- Students must carry their ID card at all times
- No cooking in rooms
- Mess timings: Breakfast 7-9 AM, Lunch 12-2 PM, Dinner 7-9 PM

WHAT YOU SHOULD NOT DO:
- Don't make up data — only use the information provided below
- Don't perform actions (you can only inform, not create/update/delete anything)
- Don't share other students' personal data with students (admins can see all data)
- Don't discuss topics unrelated to the hostel

${hostelContext}

Remember: Be helpful, accurate, and responsive. If you don't have the information, say so honestly and suggest who to contact (hostel admin office).`;
};

// @desc    Send a chat message
// @route   POST /api/chat
// @access  Public (with optional auth for personalized responses)
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: 'Message too long. Max 1000 characters.' });
    }

    // Identify user (may be null for visitors)
    const user = req.user || null;
    const sessionId = user ? user._id.toString() : (req.ip || 'anonymous');

    // Get or create conversation history
    if (!conversationStore.has(sessionId)) {
      conversationStore.set(sessionId, {
        messages: [],
        lastActivity: Date.now()
      });
    }
    const conversation = conversationStore.get(sessionId);
    conversation.lastActivity = Date.now();

    // Gather live hostel context
    const hostelContext = await gatherHostelContext(user);
    const systemPrompt = buildSystemPrompt(user, hostelContext);

    // Add user message to history
    conversation.messages.push({
      role: 'user',
      content: message
    });

    // Keep only last 10 messages to stay within context limits
    if (conversation.messages.length > 20) {
      conversation.messages = conversation.messages.slice(-20);
    }

    // Build messages array for Groq
    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...conversation.messages
    ];

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.';

    // Add AI response to history
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);

    if (error.status === 429) {
      return res.status(429).json({
        message: 'Too many requests. Please wait a moment and try again.'
      });
    }

    res.status(500).json({
      message: 'Failed to get AI response. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Clear conversation history
// @route   DELETE /api/chat/clear
// @access  Public
const clearHistory = (req, res) => {
  const user = req.user || null;
  const sessionId = user ? user._id.toString() : (req.ip || 'anonymous');

  conversationStore.delete(sessionId);

  res.json({ message: 'Conversation history cleared' });
};

module.exports = { sendMessage, clearHistory };
