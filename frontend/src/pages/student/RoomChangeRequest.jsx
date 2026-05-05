import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const RoomChangeRequest = () => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [reason, setReason] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCurrentRoom();
    fetchRooms();
    fetchMyRequests();
  }, []);

  const fetchCurrentRoom = async () => {
    try {
      const response = await api.get('/student/my-room');
      setCurrentRoom(response.data);
    } catch (error) {
      console.error('Error fetching current room:', error);
      toast.error('Could not fetch current room information');
    }
  };

  const fetchRooms = async () => {
    try {
      console.log('Fetching rooms from /rooms endpoint...');
      console.log('Token exists:', !!localStorage.getItem('token'));
      console.log('Token:', localStorage.getItem('token')?.substring(0, 20) + '...');
      
      const response = await api.get('/rooms');
      console.log('Rooms fetched successfully:', response.data);
      console.log('Number of rooms:', Array.isArray(response.data) ? response.data.length : 'Not an array');
      
      if (Array.isArray(response.data)) {
        setRooms(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        toast.error('Invalid rooms data format');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Please log in again to access rooms');
      } else {
        toast.error('Could not fetch available rooms');
      }
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await api.get('/room-change-requests/my-request');
      setMyRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching my requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentRoom) {
      toast.error('Current room information not available');
      return;
    }

    if (!selectedRoom) {
      toast.error('Please select a room');
      return;
    }

    if (selectedRoom === currentRoom.room._id) {
      toast.error('Please select a different room');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the room change');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/room-change-requests', {
        currentRoom: currentRoom.room._id,
        requestedRoom: selectedRoom,
        reason: reason.trim()
      });

      toast.success(response.data.message);
      if (response.data.isRequestedRoomFull) {
        toast.info('Note: The requested room is currently full. Your request will be reviewed by admin.');
      }

      // Reset form
      setSelectedRoom('');
      setReason('');
      
      // Refresh requests
      fetchMyRequests();
      
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getAvailableRooms = () => {
    if (!currentRoom || !currentRoom.room) return rooms || [];
    
    return (rooms || []).filter(room => 
      room && room._id !== currentRoom.room._id
    );
  };

  const isRoomFull = (room) => {
    if (!room) return false;
    return (room.occupiedBeds || 0) >= (room.capacity || 0);
  };

  const hasPendingRequest = myRequests.some(req => req.status === 'pending');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Room Change Request</h1>

      {/* Current Room Info */}
      {currentRoom && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Current Room</h2>
          <div className="text-blue-700">
            <p><span className="font-medium">Room Number:</span> {currentRoom?.room?.roomNumber || 'Not assigned'}</p>
            <p><span className="font-medium">Floor:</span> {currentRoom?.room?.floor || 'N/A'}</p>
            <p><span className="font-medium">Type:</span> {currentRoom?.room?.type || 'N/A'}</p>
            <p><span className="font-medium">Occupancy:</span> {currentRoom?.room?.occupiedBeds || 0}/{currentRoom?.room?.capacity || 0}</p>
          </div>
        </div>
      )}

      {/* Room Change Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Submit New Request</h2>
        
        {hasPendingRequest ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              You already have a pending room change request. Please wait for it to be processed before submitting a new one.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requested Room *
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select a room...</option>
                {getAvailableRooms() && getAvailableRooms().filter(room => room !== null && room !== undefined).map(room => {
                  const isFull = isRoomFull(room);
                  const availableBeds = (room?.capacity || 0) - (room?.occupiedBeds || 0);
                  return (
                    <option key={room?._id || Math.random()} value={room?._id || ''}>
                      {room?.roomNumber || 'N/A'} - {room?.type || 'N/A'} - {room?.occupiedBeds || 0}/{room?.capacity || 0} beds
                      {isFull ? ' (FULL)' : ` (${availableBeds} available)`}
                    </option>
                  );
                })}
              </select>
              {selectedRoom && (() => {
                const room = rooms.find(r => r._id === selectedRoom);
                return room && isRoomFull(room) && (
                  <p className="mt-2 text-sm text-orange-600">
                    This room is currently full. You can still submit a request, but it will be reviewed by admin.
                  </p>
                );
              })()}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Room Change *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Please explain why you need to change your room..."
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                {reason.length}/500 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}
      </div>

      {/* Previous Requests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Previous Requests</h2>
        
        {myRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No room change requests found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin Comment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myRequests.map((request) => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request?.requestedRoom?.roomNumber || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request?.requestedRoom?.type || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {request.adminComment || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Success Banner for Approved Requests */}
        {myRequests.some(req => req.status === 'approved') && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  Your room has been changed! Check your updated room information.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomChangeRequest;
