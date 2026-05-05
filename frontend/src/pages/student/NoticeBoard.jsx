import { useState, useEffect } from 'react';
import { 
  FaBullhorn, 
  FaSpinner, 
  FaInfoCircle, 
  FaExclamationTriangle,
  FaBell,
  FaCalendar,
  FaUser
} from 'react-icons/fa';
import { noticeService } from '../../services/api';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastViewed, setLastViewed] = useState(null);

  useEffect(() => {
    fetchNotices();
    // Load last viewed time from localStorage
    const stored = localStorage.getItem('noticesLastViewed');
    if (stored) {
      setLastViewed(new Date(stored));
    }
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await noticeService.getAllNotices(true); // Only active notices
      setNotices(response.data);
      // Mark as viewed
      localStorage.setItem('noticesLastViewed', new Date().toISOString());
      setLastViewed(new Date());
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
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

  const isNewNotice = (notice) => {
    if (!lastViewed) return false;
    return new Date(notice.createdAt) > lastViewed;
  };

  const getUnreadCount = () => {
    if (!lastViewed) return notices.length;
    return notices.filter(notice => new Date(notice.createdAt) > lastViewed).length;
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
        <div className="flex items-center space-x-3">
          <div className="relative">
            <FaBullhorn className="text-2xl text-primary-600" />
            {getUnreadCount() > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {getUnreadCount()}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Notice Board</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">Stay updated with latest announcements</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            {notices.length} {notices.length === 1 ? 'notice' : 'notices'}
          </span>
          {getUnreadCount() > 0 && (
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-full text-xs font-medium transition-colors duration-300">
              {getUnreadCount()} new
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4 transition-colors duration-300">
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
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Important</p>
              <p className="text-2xl font-bold text-orange-600">{notices.filter(n => n.priority === 'important').length}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaExclamationTriangle className="text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Urgent</p>
              <p className="text-2xl font-bold text-red-600">{notices.filter(n => n.priority === 'urgent').length}</p>
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
          <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-xl shadow-md transition-colors duration-300">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <FaBullhorn className="text-gray-400 dark:text-gray-500 text-2xl transition-colors duration-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-300">No Notices Available</h3>
            <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Check back later for new announcements</p>
          </div>
        ) : (
          notices.map((notice) => (
            <div 
              key={notice._id} 
              className={`bg-white dark:bg-dark-surface rounded-xl shadow-md overflow-hidden border-l-4 ${getPriorityColor(notice.priority)} transition-colors duration-300 ${
                isNewNotice(notice) ? 'ring-2 ring-primary-200' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaBullhorn className="text-primary-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-300">{notice.title}</h3>
                      {getPriorityBadge(notice.priority)}
                      {isNewNotice(notice) && (
                        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-full text-xs font-medium animate-pulse transition-colors duration-300">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-4 transition-colors duration-300">{notice.content}</p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4 transition-colors duration-300">
                      <div className="flex items-center space-x-1">
                        <FaUser className="text-xs" />
                        <span>{notice.createdBy?.name || 'Admin'}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <FaCalendar className="text-xs" />
                        <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span>•</span>
                      <span>{new Date(notice.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Empty State for Unread */}
      {getUnreadCount() === 0 && notices.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">You're all caught up! No new notices.</p>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
