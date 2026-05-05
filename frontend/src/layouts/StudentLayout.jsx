import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaBed, 
  FaUser, 
  FaSignOutAlt,
  FaBars,
  FaBullhorn,
  FaExclamationTriangle,
  FaExchangeAlt
} from 'react-icons/fa';
import { useState } from 'react';
import NotificationBell from '../components/NotificationBell';
import DarkModeToggle from '../components/DarkModeToggle';

const StudentLayout = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const menuItems = [
    { path: '/student', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/student/notices', label: 'Notice Board', icon: FaBullhorn },
    { path: '/student/complaints', label: 'Complaints', icon: FaExclamationTriangle },
    { path: '/student/room-change', label: 'Room Change', icon: FaExchangeAlt },
    { path: '/student/my-room', label: 'My Room', icon: FaBed },
    { path: '/student/profile', label: 'Profile', icon: FaUser },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-dark-bg transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 dark:bg-dark-surface text-white transition-all duration-300 flex flex-col border-r border-gray-700 dark:border-dark-border`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FaBed className="text-white" />
              </div>
              <span className="text-lg font-bold">Student</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-dark-hover transition-colors"
          >
            <FaBars />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 dark:hover:bg-dark-hover hover:text-white'
                    }`}
                  >
                    <Icon className="text-lg" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700 dark:border-dark-border">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors w-full"
          >
            <FaSignOutAlt className="text-lg" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-dark-surface shadow-sm dark:border-b dark:border-dark-border px-6 py-4 flex justify-between items-center transition-colors duration-300">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text transition-colors duration-300">Student Dashboard</h1>
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <NotificationBell />
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-dark-bg p-6 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
