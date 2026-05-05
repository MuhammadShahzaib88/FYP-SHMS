import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const RoomChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentInput, setCommentInput] = useState({});
  const [processing, setProcessing] = useState({});
  const [rejectMode, setRejectMode] = useState({}); // Track which request is in reject mode

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      console.log('Fetching room change requests...');
      const response = await api.get('/room-change-requests');
      console.log('API Response:', response.data);
      
      // Ensure requests is always an array
      const requestsData = Array.isArray(response.data) ? response.data : response.data.requests || [];
      console.log('Requests data:', requestsData);
      
      setRequests(requestsData);
      setStats(response.data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
      setError(null);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError(error.message || 'Failed to fetch room change requests');
      toast.error('Failed to fetch room change requests');
      setRequests([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setProcessing(prev => ({ ...prev, [requestId]: 'approve' }));
    
    try {
      const response = await api.patch(`/room-change-requests/${requestId}/approve`);
      toast.success('Room changed successfully');
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const handleReject = async (requestId) => {
    const comment = commentInput[requestId];
    if (!comment || !comment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(prev => ({ ...prev, [requestId]: 'reject' }));
    
    try {
      const response = await api.patch(`/room-change-requests/${requestId}/reject`, {
        adminComment: comment.trim()
      });
      toast.success('Request rejected successfully');
      
      // Clear comment input and reject mode
      setCommentInput(prev => ({ ...prev, [requestId]: '' }));
      setRejectMode(prev => ({ ...prev, [requestId]: false }));
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const toggleRejectMode = (requestId) => {
    setRejectMode(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
    // Clear comment input when exiting reject mode
    if (rejectMode[requestId]) {
      setCommentInput(prev => ({ ...prev, [requestId]: '' }));
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

  const isRoomFull = (room) => {
    return room.occupiedBeds >= room.capacity;
  };

  const canApprove = (request) => {
    return request.status === 'pending' && !isRoomFull(request.requestedRoom);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-2">Error Loading Data</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={fetchRequests}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Room Change Requests</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Requests</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-500">Rejected</div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">All Requests</h2>
        </div>
        
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No room change requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests && requests.length > 0 ? (
                  requests.map((request) => (
                    request && (
                      <tr key={request._id || Math.random()}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request?.studentId?.name || 'Unknown Student'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request?.studentId?.email || 'No email'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {request?.currentRoom?.roomNumber || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request?.currentRoom?.type || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {request?.requestedRoom?.roomNumber || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request?.requestedRoom?.occupiedBeds || 0}/{request?.requestedRoom?.capacity || 0} beds
                              </div>
                            </div>
                            {request?.requestedRoom && (request.requestedRoom.occupiedBeds >= request.requestedRoom.capacity) && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                Full
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {request?.reason || 'No reason provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(request?.status || 'pending')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request?.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="space-y-2">
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            {canApprove(request) && (
                              <button
                                onClick={() => handleApprove(request._id)}
                                disabled={processing[request._id]}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                              >
                                {processing[request._id] === 'approve' ? '...' : 'Approve'}
                              </button>
                            )}
                            {!rejectMode[request._id] ? (
                              <button
                                onClick={() => toggleRejectMode(request._id)}
                                disabled={processing[request._id]}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleRejectMode(request._id)}
                                disabled={processing[request._id]}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        )}
                        
                        {/* Reject with Comment Input */}
                        {rejectMode[request._id] && (
                          <div className="space-y-2">
                            <textarea
                              value={commentInput[request._id] || ''}
                              onChange={(e) => setCommentInput(prev => ({
                                ...prev,
                                [request._id]: e.target.value
                              }))}
                              placeholder="Enter rejection reason..."
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                              rows={2}
                            />
                            <button
                              onClick={() => handleReject(request._id)}
                              disabled={processing[request._id] || !commentInput[request._id]?.trim()}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                              {processing[request._id] === 'reject' ? '...' : 'Submit Rejection'}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Show admin comment for rejected requests */}
                      {request?.status === 'rejected' && request?.adminComment && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <strong>Rejection reason:</strong> {request.adminComment}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
                  )
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <p className="text-lg font-medium">No room change requests found</p>
                        <p className="text-sm mt-1">Requests will appear here when students submit them</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomChangeRequests;
