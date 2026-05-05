import { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaSpinner, 
  FaBed,
  FaBuilding,
  FaLayerGroup,
  FaUsers,
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaSearch,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
  FaMapMarker
} from 'react-icons/fa';
import { roomService } from '../../services/api';
import { studentService } from '../../services/api';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [expandedRooms, setExpandedRooms] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    capacity: '4',
    hostelBlock: 'A'
  });

  useEffect(() => {
    fetchRoomsWithStudents();
  }, []);

  const fetchRoomsWithStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getRoomsWithStudents();
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      try {
        const fallbackResponse = await roomService.getAllRooms();
        setRooms(fallbackResponse.data.map(room => ({
          ...room,
          type: room.capacity === 1 ? 'single' : room.capacity === 2 ? 'double' : 'triple',
          status: room.occupiedBeds >= room.capacity ? 'occupied' : room.occupiedBeds > 0 ? 'partially_occupied' : 'available',
          students: []
        })));
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandedRoom = (roomId) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId);
    } else {
      newExpanded.add(roomId);
    }
    setExpandedRooms(newExpanded);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await roomService.createRoom(formData);
      setShowAddModal(false);
      setFormData({ roomNumber: '', floor: '', capacity: '4', hostelBlock: 'A' });
      fetchRoomsWithStudents();
    } catch (error) {
      console.error('Error creating room:', error);
      alert(error.response?.data?.message || 'Failed to create room');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      setDeleting(id);
      await roomService.deleteRoom(id);
      fetchRoomsWithStudents();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert(error.response?.data?.message || 'Failed to delete room');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      available: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
      partially_occupied: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
      occupied: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
    };
    const labels = {
      available: 'Available',
      partially_occupied: 'Partially Occupied',
      occupied: 'Full'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'occupied' && room.occupiedBeds > 0) ||
      (filterStatus === 'available' && room.occupiedBeds < room.capacity);
    return matchesSearch && matchesFilter;
  });

  const totalOccupied = rooms.filter(r => r.occupiedBeds > 0).length;
  const totalAvailable = rooms.filter(r => r.occupiedBeds < r.capacity).length;
  const totalStudents = rooms.reduce((sum, r) => sum + r.occupiedBeds, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Room Management</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">Manage hostel rooms and view assigned students</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FaPlus />
          <span>Add Room</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{rooms.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaBuilding className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Occupied</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-300 transition-colors duration-300">{totalOccupied}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FaBed className="text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Available</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-300 transition-colors duration-300">{totalAvailable}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaBed className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Total Students</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 transition-colors duration-300">{totalStudents}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FaUserGraduate className="text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FaFilter className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
          >
            <option value="all">All Rooms</option>
            <option value="occupied">Occupied</option>
            <option value="available">Available</option>
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRooms.map((room) => (
          <div key={room._id} className="bg-white dark:bg-dark-surface rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            {/* Room Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FaBed className="text-primary-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-300">Room {room.roomNumber}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center transition-colors duration-300">
                      <FaMapMarker className="mr-1 text-xs" />
                      Block {room.hostelBlock} • Floor {room.floor}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(room.status)}
                  <button
                    onClick={() => handleDelete(room._id)}
                    disabled={deleting === room._id}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting === room._id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                </div>
              </div>

              {/* Room Stats */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-dark-surface rounded-lg transition-colors duration-300">
                  <FaLayerGroup className="mx-auto mb-2 text-gray-500 dark:text-gray-400 text-sm" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Type</p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300 capitalize">{room.type || (room.capacity === 1 ? 'single' : room.capacity === 2 ? 'double' : 'triple')}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-dark-surface rounded-lg transition-colors duration-300">
                  <FaBed className="mx-auto mb-2 text-gray-500 dark:text-gray-400 text-sm" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Capacity</p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{room.capacity} beds</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-dark-surface rounded-lg transition-colors duration-300">
                  <FaUsers className="mx-auto mb-2 text-gray-500 dark:text-gray-400 text-sm" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Occupied</p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{room.occupiedBeds} / {room.capacity}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      room.occupiedBeds === room.capacity ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(room.occupiedBeds / room.capacity) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {room.capacity - room.occupiedBeds} beds available
                </p>
              </div>
            </div>

            {/* Students List */}
            <div className="p-6 bg-gray-50 dark:bg-dark-surface transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800 dark:text-white flex items-center transition-colors duration-300">
                  <FaUsers className="mr-2" />
                  Assigned Students ({room.students?.length || 0})
                </h4>
                {room.students?.length > 0 && (
                  <button
                    onClick={() => toggleExpandedRoom(room._id)}
                    className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 flex items-center transition-colors duration-300"
                  >
                    {expandedRooms.has(room._id) ? (
                      <><FaEyeSlash className="mr-1" /> Show Less</>
                    ) : (
                      <><FaEye className="mr-1" /> View All</>
                    )}
                  </button>
                )}
              </div>

              {room.students?.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic transition-colors duration-300">No students assigned to this room</p>
              ) : (
                <div className="space-y-3">
                  {(expandedRooms.has(room._id) ? room.students : room.students.slice(0, 2)).map((student, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center space-x-3 transition-colors duration-300">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{student.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center transition-colors duration-300">
                          <FaEnvelope className="mr-1 text-xs" />
                          {student.email}
                        </p>
                        {student.assignedDate && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-1 transition-colors duration-300">
                            <FaCalendar className="mr-1" />
                            Assigned: {new Date(student.assignedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {room.students.length > 2 && !expandedRooms.has(room._id) && (
                    <button
                      onClick={() => toggleExpandedRoom(room._id)}
                      className="w-full py-2 text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-center transition-colors duration-300"
                    >
                      +{room.students.length - 2} more students
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-xl shadow-md transition-colors duration-300">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
            <FaBed className="text-gray-400 dark:text-gray-500 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-300">No Rooms Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Start by adding your first room'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Room
            </button>
          )}
        </div>
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-md w-full p-6 transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 transition-colors duration-300">Add New Room</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Room Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBed className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                    placeholder="e.g., 101, A-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Floor *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLayerGroup className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                      placeholder="e.g., 1, 2, Ground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Capacity *
                  </label>
                  <select
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-colors duration-300"
                  >
                    <option value="2">2 Beds</option>
                    <option value="3">3 Beds</option>
                    <option value="4">4 Beds</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Hostel Block *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.hostelBlock}
                    onChange={(e) => setFormData({ ...formData, hostelBlock: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                    placeholder="e.g., A, B, C"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
