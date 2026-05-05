import { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaBed, 
  FaCheckCircle, 
  FaClock, 
  FaSpinner 
} from 'react-icons/fa';
import { applicationService, roomService } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedStudents: 0,
    totalRooms: 0,
    availableRooms: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [applicationsRes, roomsRes] = await Promise.all([
        applicationService.getAllApplications(),
        roomService.getAllRooms()
      ]);

      const applications = applicationsRes.data;
      const rooms = roomsRes.data;

      setStats({
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        approvedStudents: applications.filter(app => app.status === 'approved').length,
        totalRooms: rooms.length,
        availableRooms: rooms.filter(room => room.occupiedBeds < room.capacity).length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Applications', 
      value: stats.totalApplications, 
      icon: FaUsers, 
      color: 'bg-blue-500',
      link: '/admin/applications'
    },
    { 
      title: 'Pending Applications', 
      value: stats.pendingApplications, 
      icon: FaClock, 
      color: 'bg-yellow-500',
      link: '/admin/applications'
    },
    { 
      title: 'Approved Students', 
      value: stats.approvedStudents, 
      icon: FaCheckCircle, 
      color: 'bg-green-500',
      link: '/admin/approved-students'
    },
    { 
      title: 'Available Rooms', 
      value: `${stats.availableRooms}/${stats.totalRooms}`, 
      icon: FaBed, 
      color: 'bg-purple-500',
      link: '/admin/rooms'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <a
              key={index}
              href={stat.link}
              className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow transition-colors duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors duration-300">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2 transition-colors duration-300">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-14 h-14 rounded-full flex items-center justify-center`}>
                  <Icon className="text-white text-2xl" />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6 transition-colors duration-300">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/applications"
            className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FaUsers className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">Review Applications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Approve or reject student applications</p>
            </div>
          </a>

          <a
            href="/admin/rooms"
            className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaBed className="text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">Manage Rooms</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Add or update room information</p>
            </div>
          </a>

          <a
            href="/admin/approved-students"
            className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">View Students</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">See all approved students</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6 transition-colors duration-300">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">System Overview</h3>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <FaUsers className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">Total Applications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                {stats.pendingApplications} pending, {stats.approvedStudents} approved
              </p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <FaBed className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">Room Availability</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                {stats.availableRooms} rooms available out of {stats.totalRooms}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
