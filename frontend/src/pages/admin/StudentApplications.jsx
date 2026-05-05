import { useState, useEffect } from 'react';
import { 
  FaCheck, 
  FaTimes, 
  FaSpinner,
  FaBed,
  FaSearch,
  FaFilter,
  FaUserCircle
} from 'react-icons/fa';
import { applicationService, roomService } from '../../services/api';

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, roomsRes] = await Promise.all([
        applicationService.getAllApplications(),
        roomService.getAvailableRooms()
      ]);
      setApplications(appsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (application) => {
    setSelectedApplication(application);
    setSelectedRoom('');
    setShowRoomModal(true);
  };

  const handleApprove = async () => {
    if (!selectedRoom) {
      alert('Please select a room');
      return;
    }

    try {
      setProcessing(selectedApplication._id);
      await applicationService.approveApplication(selectedApplication._id, selectedRoom);
      setShowRoomModal(false);
      fetchData();
    } catch (error) {
      console.error('Error approving application:', error);
      alert(error.response?.data?.message || 'Failed to approve application');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this application?')) return;

    try {
      setProcessing(id);
      await applicationService.rejectApplication(id);
      fetchData();
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert(error.response?.data?.message || 'Failed to reject application');
    } finally {
      setProcessing(null);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = 
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      app.department.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
      approved: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
      rejected: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Student Applications</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300"
            />
          </div>
          
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-colors duration-300"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Photo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Father's Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApplications.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td className="px-6 py-4">
                      {application.photo ? (
                        <img
                          src={`http://localhost:5000${application.photo}`}
                          alt={application.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <FaUserCircle className="w-12 h-12 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{application.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{application.cnic}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">{application.email}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">{application.fatherName}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">{application.phone}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{application.department}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{application.semester} Semester</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-6 py-4">
                      {application.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveClick(application)}
                            disabled={processing === application._id}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {processing === application._id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <>
                                <FaCheck />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(application._id)}
                            disabled={processing === application._id}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <FaTimes />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                      {application.status === 'approved' && application.roomId && (
                        <div className="text-sm text-gray-600">
                          <FaBed className="inline mr-1" />
                          Room: {application.roomId.roomNumber}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Assignment Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-md w-full p-6 transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">Assign Room</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
              Select a room for <strong>{selectedApplication?.name}</strong>
            </p>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Available Rooms
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    Room {room.roomNumber} - Floor {room.floor} 
                    ({room.capacity - room.occupiedBeds} beds available)
                  </option>
                ))}
              </select>
              
              {rooms.length === 0 && (
                <p className="text-red-600 dark:text-red-300 text-sm transition-colors duration-300">
                  No rooms available. Please create rooms first.
                </p>
              )}
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowRoomModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={!selectedRoom || processing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {processing ? <FaSpinner className="animate-spin mx-auto" /> : 'Approve & Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
