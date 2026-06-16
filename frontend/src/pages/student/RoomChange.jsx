import { useEffect, useMemo, useState } from 'react';
import { FaPaperPlane, FaSpinner, FaExchangeAlt, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { roomChangeService, roomService, studentService } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

const RoomChange = () => {
  const { darkMode } = useTheme();
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoomData, setCurrentRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    preferredRoomId: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestRes, roomsRes, myRoomRes] = await Promise.all([
        roomChangeService.getMyRequests(),
        roomService.getAllRooms(),
        studentService.getMyRoom()
      ]);

      setRequests(requestRes.data);
      setRooms(roomsRes.data);
      setCurrentRoomData(myRoomRes.data);
    } catch (error) {
      console.error('Error loading room change data:', error);
      setErrorMessage('Unable to load room change data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const hasPendingRequest = useMemo(
    () => requests.some((request) => request.status === 'pending'),
    [requests]
  );

  const isEligible = currentRoomData?.status === 'approved' && currentRoomData?.room?._id;
  const currentRoomId = currentRoomData?.room?._id;

  const availableRooms = useMemo(() => {
    return rooms.filter(
      (room) => room._id !== currentRoomId && room.occupiedBeds < room.capacity
    );
  }, [rooms, currentRoomId]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');

    if (!formData.preferredRoomId || formData.reason.trim().length < 10) {
      setErrorMessage('Please select preferred room and write at least 10 characters in reason.');
      return;
    }

    try {
      setSubmitting(true);
      await roomChangeService.submitRequest(formData);
      setMessage('Room change request submitted successfully.');
      setFormData({ preferredRoomId: '', reason: '' });
      fetchData();
    } catch (error) {
      console.error('Error submitting room change request:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to submit room change request.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
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
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6" style={{
        backgroundColor: darkMode ? '#1e293b' : '#ffffff'
      }}>
        <div className="flex items-center space-x-3 mb-2">
          <FaExchangeAlt className="text-primary-600 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800" style={{
            color: darkMode ? '#ffffff' : '#1f2937'
          }}>Apply for Room Change</h2>
        </div>
        <p className="text-gray-600">
          Submit your request to change room. Admin will review and approve or reject your request.
        </p>
      </div>

      {!isEligible && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <p className="text-yellow-800 font-medium">You are not eligible for room change request yet.</p>
          <p className="text-yellow-700 text-sm mt-1">
            Only students with approved application and assigned room can submit room change request.
          </p>
        </div>
      )}

      {isEligible && (
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{
                color: darkMode ? '#f1f5f9' : '#111827'
              }}>Submit New Request</h3>

          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4" style={{
            backgroundColor: darkMode ? '#0f172a' : '#eff6ff',
            color: darkMode ? '#e2e8f0' : '#1e40af',
            border: darkMode ? '1px solid #334155' : '1px solid #bfdbfe'
          }}>
            <p className="text-sm" style={{
              color: darkMode ? '#ffffff' : '#1e40af'
            }}>
              Current Room: <span className="font-semibold">{currentRoomData.room.roomNumber}</span> |
              Block {currentRoomData.room.hostelBlock} | Floor {currentRoomData.room.floor}
            </p>
          </div>

          {hasPendingRequest && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
              You already have one pending room change request. Wait for admin decision before submitting a new one.
            </div>
          )}

          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{
                color: darkMode ? '#e2e8f0' : '#374151'
              }}>Preferred Room</label>
              <select
                name="preferredRoomId"
                value={formData.preferredRoomId}
                onChange={handleChange}
                disabled={submitting || hasPendingRequest}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                style={{
                  color: darkMode ? '#e2e8f0' : '#374151'
                }}
                required
              >
                <option value="" style={{
                  color: darkMode ? '#1e293b' : '#374151'
                }}>Select preferred room</option>
                {availableRooms.map((room) => (
                  <option key={room._id} value={room._id} style={{
                    color: darkMode ? '#e2e8f0' : '#374151'
                  }}>
                    Room {room.roomNumber} - Block {room.hostelBlock}, Floor {room.floor} ({room.capacity - room.occupiedBeds} beds available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{
                color: darkMode ? '#e2e8f0' : '#374151'
              }}>Reason</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                disabled={submitting || hasPendingRequest}
                rows="4"
                minLength="10"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Please explain why you want to change your room..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting || hasPendingRequest || !isEligible}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{
                color: darkMode ? '#f1f5f9' : '#111827'
              }}>My Room Change Requests</h3>

        {requests.length === 0 ? (
          <p className="text-gray-500" style={{
                color: darkMode ? '#94a3b8' : '#6b7280'
              }}>No room change requests submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="border border-gray-200 rounded-lg p-4" style={{
                backgroundColor: darkMode ? '#334155' : '#f9fafb',
                color: darkMode ? '#e2e8f0' : '#374151'
              }}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-2">
                    {request.status === 'pending' && <FaClock className="text-yellow-600" />}
                    {request.status === 'approved' && <FaCheckCircle className="text-green-600" />}
                    {request.status === 'rejected' && <FaTimesCircle className="text-red-600" />}
                    <span className="font-medium text-gray-800" style={{
                      color: darkMode ? '#e2e8f0' : '#374151'
                    }}>Request #{request._id.slice(-6)}</span>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-gray-500" style={{
                    color: darkMode ? '#94a3b8' : '#6b7280'
                  }}>Current Room</p>
                    <p className="font-medium text-gray-800" style={{
                    color: darkMode ? '#e2e8f0' : '#374151'
                  }}>
                    Room {request.currentRoomId?.roomNumber} (Block {request.currentRoomId?.hostelBlock}, Floor {request.currentRoomId?.floor})
                  </p>
                  </div>
                  <div>
                    <p className="text-gray-500" style={{
                    color: darkMode ? '#94a3b8' : '#6b7280'
                  }}>Preferred Room</p>
                    <p className="font-medium text-gray-800" style={{
                    color: darkMode ? '#e2e8f0' : '#374151'
                  }}>
                    Room {request.preferredRoomId?.roomNumber} (Block {request.preferredRoomId?.hostelBlock}, Floor {request.preferredRoomId?.floor})
                  </p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-gray-500 text-sm" style={{
                    color: darkMode ? '#94a3b8' : '#6b7280'
                  }}>Reason</p>
                  <p className="text-gray-700 text-sm mt-1" style={{
                    color: darkMode ? '#e2e8f0' : '#374151'
                  }}>{request.reason}</p>
                </div>

                {request.status === 'rejected' && request.rejectionComment && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                    <p className="text-sm font-medium text-red-800">Admin Comment</p>
                    <p className="text-sm text-red-700 mt-1">{request.rejectionComment}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500">Submitted: {formatDate(request.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomChange;