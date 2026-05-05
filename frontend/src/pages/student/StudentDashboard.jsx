import { useState, useEffect } from 'react';
import { 
  FaBed, 
  FaClock, 
  FaCheckCircle,
  FaSpinner,
  FaUser,
  FaBuilding,
  FaLayerGroup,
  FaExchangeAlt
} from 'react-icons/fa';
import { studentService } from '../../services/api';

const StudentDashboard = () => {
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchRoomInfo();
  }, []);

  const fetchRoomInfo = async () => {
    try {
      setLoading(true);
      const response = await studentService.getMyRoom();
      setRoomInfo(response.data);
    } catch (error) {
      console.error('Error fetching room info:', error);
    } finally {
      setLoading(false);
    }
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <FaUser className="text-primary-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Welcome, {user.name}!</h2>
            <p className="text-primary-100 mt-1">
              {roomInfo?.application?.department} • {roomInfo?.application?.semester} Semester
            </p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6 transition-colors duration-300">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              roomInfo?.status === 'approved' ? 'bg-green-100' : 
              roomInfo?.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              {roomInfo?.status === 'approved' ? (
                <FaCheckCircle className="text-green-600 text-2xl" />
              ) : roomInfo?.status === 'pending' ? (
                <FaClock className="text-yellow-600 text-2xl" />
              ) : (
                <FaClock className="text-red-600 text-2xl" />
              )}
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">Application Status</p>
              <p className={`text-xl font-bold capitalize ${
                roomInfo?.status === 'approved' ? 'text-green-600' : 
                roomInfo?.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {roomInfo?.status}
              </p>
            </div>
          </div>
          
          {roomInfo?.status === 'pending' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 transition-colors duration-300">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm transition-colors duration-300">
                Your application is currently under review. You will be notified once it's approved.
              </p>
            </div>
          )}
          
          {roomInfo?.status === 'rejected' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-colors duration-300">
              <p className="text-red-800 dark:text-red-200 text-sm transition-colors duration-300">
                Unfortunately, your application was not approved. Please contact the hostel administration for more information.
              </p>
            </div>
          )}
        </div>

        {/* Room Info Card */}
        {roomInfo?.status === 'approved' && roomInfo?.room && (
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6 transition-colors duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                <FaBed className="text-primary-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">Your Room</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
                  Room {roomInfo.room.roomNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-colors duration-300">
                <FaBuilding className="mx-auto text-primary-600 mb-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Block</p>
                <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">{roomInfo.room.hostelBlock}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-colors duration-300">
                <FaLayerGroup className="mx-auto text-primary-600 mb-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Floor</p>
                <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">{roomInfo.room.floor}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-colors duration-300">
                <FaBed className="mx-auto text-primary-600 mb-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Occupancy</p>
                <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">
                  {roomInfo.room.occupiedBeds}/{roomInfo.room.capacity}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6 transition-colors duration-300">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/student/my-room"
            className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-300"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FaBed className="text-primary-600 text-xl" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">My Room</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">View your room details</p>
            </div>
          </a>

          <a
            href="/student/profile"
            className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-300"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaUser className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">My Profile</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">View your profile information</p>
            </div>
          </a>

          <a
            href="/student/room-change"
            className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-300"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaExchangeAlt className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">Room Change</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Apply to change your room</p>
            </div>
          </a>
        </div>
      </div>

      {/* Hostel Rules Reminder */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6 transition-colors duration-300">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">Remember</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 transition-colors duration-300">
            <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1 transition-colors duration-300">Gate Closing</p>
            <p className="text-sm text-blue-600 dark:text-blue-300 transition-colors duration-300">Main gate closes at 10:00 PM</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 transition-colors duration-300">
            <p className="font-semibold text-purple-800 dark:text-purple-200 mb-1 transition-colors duration-300">Visitor Hours</p>
            <p className="text-sm text-purple-600 dark:text-purple-300 transition-colors duration-300">4:00 PM - 8:00 PM only</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 transition-colors duration-300">
            <p className="font-semibold text-orange-800 dark:text-orange-200 mb-1 transition-colors duration-300">Study Hours</p>
            <p className="text-sm text-orange-600 dark:text-orange-300 transition-colors duration-300">Quiet hours 9:00 PM - 6:00 AM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
