import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/api';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Other',
    description: '',
    roomNumber: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      const response = await complaintService.getMyComplaints();
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');

    try {
      await complaintService.submitComplaint(formData);
      setSuccessMessage('Complaint submitted successfully!');
      setFormData({
        title: '',
        category: 'Other',
        description: '',
        roomNumber: ''
      });
      fetchMyComplaints(); // Refresh list
    } catch (error) {
      console.error('Error submitting complaint:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Pending': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
      'In Progress': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
      'Resolved': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
      'Not Resolved': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">Complaints</h1>

      {/* SECTION A - Submit New Complaint */}
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 mb-8 transition-colors duration-300">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Submit New Complaint</h2>
        
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6 transition-colors duration-300">
            <div className="text-green-800 dark:text-green-200 transition-colors duration-300">{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                placeholder="Brief title of your complaint"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electricity">Electricity</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Noise">Noise</option>
                <option value="Security">Security</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Room Number *
            </label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
              placeholder="Your room number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
              placeholder="Detailed description of your complaint"
            ></textarea>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION B - My Complaints List */}
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 transition-colors duration-300">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">My Complaints</h2>

        {complaints.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">No complaints submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="border border-gray-200 dark:border-dark-border rounded-lg p-4 transition-colors duration-300">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">{complaint.title}</h3>
                  {getStatusBadge(complaint.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Category:</span>
                    <p className="font-medium">{complaint.category}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Room:</span>
                    <p className="font-medium">{complaint.roomNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Submitted:</span>
                    <p className="font-medium">{formatDate(complaint.createdAt)}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Description:</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1 transition-colors duration-300">{complaint.description}</p>
                </div>

                {complaint.adminReply && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 transition-colors duration-300">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200 transition-colors duration-300">Admin Response:</span>
                    <p className="text-blue-700 dark:text-blue-300 mt-1 transition-colors duration-300">{complaint.adminReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;
