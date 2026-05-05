import { useState, useEffect } from 'react';
import { 
  FaBullhorn, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSpinner, 
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaExclamationTriangle,
  FaInfoCircle,
  FaBell
} from 'react-icons/fa';
import { noticeService } from '../../services/api';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal'
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await noticeService.getAllNotices();
      setNotices(response.data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      if (editingNotice) {
        await noticeService.updateNotice(editingNotice._id, formData);
      } else {
        await noticeService.createNotice(formData);
      }
      
      setShowCreateModal(false);
      setEditingNotice(null);
      setFormData({ title: '', content: '', priority: 'normal' });
      fetchNotices();
    } catch (error) {
      console.error('Error saving notice:', error);
      alert(error.response?.data?.message || 'Failed to save notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      priority: notice.priority
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (noticeId) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    
    try {
      await noticeService.deleteNotice(noticeId);
      fetchNotices();
    } catch (error) {
      console.error('Error deleting notice:', error);
      alert('Failed to delete notice');
    }
  };

  const handleToggleActive = async (noticeId) => {
    try {
      await noticeService.toggleNotice(noticeId);
      fetchNotices();
    } catch (error) {
      console.error('Error toggling notice:', error);
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      normal: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
      important: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800',
      urgent: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
    };
    const icons = {
      normal: FaInfoCircle,
      important: FaExclamationTriangle,
      urgent: FaBell
    };
    const Icon = icons[priority];
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[priority]}`}>
        <Icon className="mr-1" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      normal: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
      important: 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20',
      urgent: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
    };
    return colors[priority] || colors.normal;
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', priority: 'normal' });
    setEditingNotice(null);
    setShowCreateModal(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Notice Board</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">Manage and post notices for students</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FaPlus />
          <span>Post Notice</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Total Notices</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{notices.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaBullhorn className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-300 transition-colors duration-300">{notices.filter(n => n.isActive).length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaToggleOn className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Inactive</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-300 transition-colors duration-300">{notices.filter(n => !n.isActive).length}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaToggleOff className="text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Urgent</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-300 transition-colors duration-300">{notices.filter(n => n.priority === 'urgent').length}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FaBell className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-dark-card rounded-xl shadow-md transition-colors duration-300">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <FaBullhorn className="text-gray-400 dark:text-gray-500 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-300">No Notices Posted</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">Start by posting your first notice</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Post Notice
            </button>
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice._id} className={`bg-white dark:bg-dark-card rounded-xl shadow-md overflow-hidden border-l-4 ${getPriorityColor(notice.priority)} transition-colors duration-300`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaBullhorn className="text-primary-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-300">{notice.title}</h3>
                        {getPriorityBadge(notice.priority)}
                        {!notice.isActive && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium transition-colors duration-300">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-3 transition-colors duration-300">{notice.content}</p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4 transition-colors duration-300">
                        <span>Posted by {notice.createdBy?.name || 'Admin'}</span>
                        <span>•</span>
                        <span>{new Date(notice.createdAt).toLocaleDateString()} at {new Date(notice.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(notice._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        notice.isActive 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={notice.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {notice.isActive ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                    <button
                      onClick={() => handleEdit(notice)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(notice._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
                {editingNotice ? 'Edit Notice' : 'Post New Notice'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300"
                  placeholder="Enter notice title..."
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">{formData.title.length}/200 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Content *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300"
                  placeholder="Enter notice content..."
                  rows={6}
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">{formData.content.length}/2000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['normal', 'important', 'urgent'].map((priority) => (
                    <label key={priority} className="relative">
                      <input
                        type="radio"
                        name="priority"
                        value={priority}
                        checked={formData.priority === priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="sr-only"
                      />
                      <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.priority === priority
                          ? priority === 'normal' ? 'border-blue-500 bg-blue-50' :
                            priority === 'important' ? 'border-orange-500 bg-orange-50' :
                            'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center justify-center space-x-2">
                          {priority === 'normal' && <FaInfoCircle className={formData.priority === priority ? 'text-blue-600' : 'text-gray-400'} />}
                          {priority === 'important' && <FaExclamationTriangle className={formData.priority === priority ? 'text-orange-600' : 'text-gray-400'} />}
                          {priority === 'urgent' && <FaBell className={formData.priority === priority ? 'text-red-600' : 'text-gray-400'} />}
                          <span className={`font-medium ${
                            formData.priority === priority
                              ? priority === 'normal' ? 'text-blue-600' :
                                priority === 'important' ? 'text-orange-600' :
                                'text-red-600'
                              : 'text-gray-600'
                          }`}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FaSpinner className="animate-spin" />
                      <span>{editingNotice ? 'Updating...' : 'Posting...'}</span>
                    </div>
                  ) : (
                    <span>{editingNotice ? 'Update Notice' : 'Post Notice'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
