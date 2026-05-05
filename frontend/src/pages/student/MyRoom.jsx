import { useState, useEffect } from 'react';
import { 
  FaBed, 
  FaBuilding, 
  FaLayerGroup, 
  FaUsers,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaWifi,
  FaBath,
  FaTable,
  FaBox
} from 'react-icons/fa';
import { studentService } from '../../services/api';

const MyRoom = () => {
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Pending or rejected status
  if (roomInfo?.status !== 'approved') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-8 text-center transition-colors duration-300">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            roomInfo?.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            {roomInfo?.status === 'pending' ? (
              <FaClock className="text-yellow-600 text-4xl" />
            ) : (
              <FaTimesCircle className="text-red-600 text-4xl" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">
            {roomInfo?.status === 'pending' ? 'Application Pending' : 'Application Rejected'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
            {roomInfo?.status === 'pending' 
              ? 'Your application is currently under review by the administration. You will be notified once a room is assigned to you.'
              : 'Unfortunately, your application was not approved. Please contact the hostel administration for more information.'}
          </p>

          <div className={`p-4 rounded-lg transition-colors duration-300 ${
            roomInfo?.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className={`text-sm transition-colors duration-300 ${
              roomInfo?.status === 'pending' ? 'text-yellow-800 dark:text-yellow-200' : 'text-red-800 dark:text-red-200'
            }`}>
              <strong>Status:</strong> {roomInfo?.status?.charAt(0).toUpperCase() + roomInfo?.status?.slice(1)}
            </p>
            {roomInfo?.application && (
              <p className={`text-sm mt-1 transition-colors duration-300 ${
                roomInfo?.status === 'pending' ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300'
              }`}>
                <strong>Applied on:</strong> {new Date(roomInfo.application.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Approved status with room
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">My Room</h2>
        <span className="px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full font-medium transition-colors duration-300">
          Approved
        </span>
      </div>

      {/* Room Details Card */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md overflow-hidden transition-colors duration-300">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center">
              <FaBed className="text-primary-600 text-4xl" />
            </div>
            <div>
              <p className="text-primary-100 text-sm">Your Assigned Room</p>
              <h3 className="text-4xl font-bold">Room {roomInfo?.room?.roomNumber}</h3>
              <p className="text-primary-100">Block {roomInfo?.room?.hostelBlock}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaBuilding className="text-primary-600" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Hostel Block</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{roomInfo?.room?.hostelBlock}</p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaLayerGroup className="text-primary-600" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Floor</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{roomInfo?.room?.floor}</p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaUsers className="text-primary-600" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Occupancy</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
                {roomInfo?.room?.occupiedBeds} / {roomInfo?.room?.capacity}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaCheckCircle className="text-green-600" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Status</p>
              <p className="text-xl font-bold text-green-600">Active</p>
            </div>
          </div>

          {/* Occupancy Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Room Occupancy</span>
              <span className="font-medium text-gray-800 dark:text-white transition-colors duration-300">
                {Math.round((roomInfo?.room?.occupiedBeds / roomInfo?.room?.capacity) * 100)}% Full
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 transition-colors duration-300">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all"
                style={{ 
                  width: `${(roomInfo?.room?.occupiedBeds / roomInfo?.room?.capacity) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Facilities */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 transition-colors duration-300">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">Room Facilities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
            <FaBed className="text-primary-600 text-xl" />
            <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Single Bed</span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
            <FaTable className="text-primary-600 text-xl" />
            <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Study Table</span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
            <FaBox className="text-primary-600 text-xl" />
            <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Wardrobe</span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
            <FaWifi className="text-primary-600 text-xl" />
            <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">WiFi</span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
            <FaBath className="text-primary-600 text-xl" />
            <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
              {roomInfo?.room?.capacity <= 2 ? 'Attached Bath' : 'Shared Bath'}
            </span>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 transition-colors duration-300">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 transition-colors duration-300">Important Notes</h4>
        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300 transition-colors duration-300">
          <li>• Please keep your room clean and tidy</li>
          <li>• Respect your roommates and maintain silence during study hours</li>
          <li>• No electrical appliances other than laptop, mobile charger, and electric kettle</li>
          <li>• Report any maintenance issues to the administration immediately</li>
          <li>• Room change requests must be submitted in writing to the hostel office</li>
        </ul>
      </div>
    </div>
  );
};

export default MyRoom;
