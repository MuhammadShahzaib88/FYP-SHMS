import { useEffect, useMemo, useState } from 'react';
import { FaCheck, FaSpinner, FaTimes, FaFilter, FaSearch } from 'react-icons/fa';
import { roomChangeService } from '../../services/api';

const RoomChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await roomChangeService.getAllRequests(statusFilter === 'all' ? '' : statusFilter);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching room change requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const name = request.studentId?.name || '';
      const email = request.studentId?.email || '';
      const currentRoom = request.currentRoomId?.roomNumber || '';
      const preferredRoom = request.preferredRoomId?.roomNumber || '';
      const searchText = search.toLowerCase();

      return (
        name.toLowerCase().includes(searchText) ||
        email.toLowerCase().includes(searchText) ||
        currentRoom.toLowerCase().includes(searchText) ||
        preferredRoom.toLowerCase().includes(searchText)
      );
    });
  }, [requests, search]);

  const handleApprove = async (requestId) => {
    if (!window.confirm('Approve this room change request?')) {
      return;
    }

    try {
      setProcessingId(requestId);
      await roomChangeService.approveRequest(requestId);
      fetchRequests();
    } catch (error) {
      console.error('Error approving room change request:', error);
      alert(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectionComment('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedRequest) {
      return;
    }

    if (rejectionComment.trim().length < 5) {
      alert('Please enter rejection comment with at least 5 characters.');
      return;
    }

    try {
      setProcessingId(selectedRequest._id);
      await roomChangeService.rejectRequest(selectedRequest._id, rejectionComment);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionComment('');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting room change request:', error);
      alert(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
      approved: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
      rejected: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Room Change Requests</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, room..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-72 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300"
            />
          </div>

          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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

      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Current Room</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Preferred Room</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Reason</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Submitted</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    No room change requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{request.studentId?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{request.studentId?.email || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-200 transition-colors duration-300">
                      Room {request.currentRoomId?.roomNumber} <br />
                      <span className="text-xs text-gray-500">Block {request.currentRoomId?.hostelBlock}, Floor {request.currentRoomId?.floor}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-200 transition-colors duration-300">
                      Room {request.preferredRoomId?.roomNumber} <br />
                      <span className="text-xs text-gray-500">Block {request.preferredRoomId?.hostelBlock}, Floor {request.preferredRoomId?.floor}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs transition-colors duration-300">
                      <p className="line-clamp-2">{request.reason}</p>
                      {request.status === 'rejected' && request.rejectionComment && (
                        <p className="mt-2 text-red-600 text-xs">Reject Comment: {request.rejectionComment}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">{formatDate(request.createdAt)}</td>
                    <td className="px-6 py-4">
                      {request.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(request._id)}
                            disabled={processingId === request._id}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {processingId === request._id ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => openRejectModal(request)}
                            disabled={processingId === request._id}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <FaTimes />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-xl max-w-lg w-full p-6 transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 transition-colors duration-300">Reject Room Change Request</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
              Student: <span className="font-medium">{selectedRequest.studentId?.name}</span>
            </p>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Rejection Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              minLength={5}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300"
              placeholder="Enter reason for rejection..."
              required
            ></textarea>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionComment('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId === selectedRequest._id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processingId === selectedRequest._id ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomChangeRequests;