const Room = require('../models/Room');

// @desc    Create new room
// @route   POST /api/admin/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
  try {
    const { roomNumber, floor, capacity, hostelBlock } = req.body;

    // Check if room already exists
    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({ message: 'Room already exists' });
    }

    const room = await Room.create({
      roomNumber,
      floor,
      capacity,
      hostelBlock,
      occupiedBeds: 0
    });

    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ 
      _id: { $exists: true },
      roomNumber: { $exists: true, $ne: null }
    }).sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available rooms
// @route   GET /api/rooms/available
// @access  Private/Admin
const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      $expr: { $lt: ['$occupiedBeds', '$capacity'] }
    }).sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Private
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update room
// @route   PUT /api/admin/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
  try {
    const { roomNumber, floor, capacity, hostelBlock } = req.body;
    
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.roomNumber = roomNumber || room.roomNumber;
    room.floor = floor || room.floor;
    room.capacity = capacity || room.capacity;
    room.hostelBlock = hostelBlock || room.hostelBlock;

    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete room
// @route   DELETE /api/admin/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await room.deleteOne();
    res.json({ message: 'Room removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getAvailableRooms,
  getRoomById,
  updateRoom,
  deleteRoom
};
