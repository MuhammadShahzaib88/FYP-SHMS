import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaBed, FaEnvelope, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import DarkModeToggle from '../components/DarkModeToggle';

const MainLayout = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white dark:bg-dark-surface shadow-lg dark:border-b dark:border-dark-border sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FaBed className="text-white text-xl" />
                </div>
                <span className="text-xl font-bold text-gray-800 dark:text-dark-text transition-colors duration-300">Smart Hostel</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <FaHome />
                <span>Home</span>
              </Link>
              <Link to="/about" className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <FaInfoCircle />
                <span>About</span>
              </Link>
              <Link to="/rooms" className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <FaBed />
                <span>Rooms</span>
              </Link>
              <Link to="/contact" className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <FaEnvelope />
                <span>Contact</span>
              </Link>
              
              <DarkModeToggle />
              
              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin' : '/student'}
                    className="flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <FaSignInAlt />
                    <span>Login</span>
                  </Link>
                  <Link to="/apply" className="flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <FaUserPlus />
                    <span>Apply</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
