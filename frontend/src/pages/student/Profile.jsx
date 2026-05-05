import { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaGraduationCap,
  FaIdCard,
  FaUserTie,
  FaBuilding,
  FaBed,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { studentService } from '../../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getProfile();
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load profile.';
      
      // If no application found, show empty state instead of error
      if (errorMessage === 'Application not found') {
        setProfile(null);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    // Handle undefined/null status
    if (!status) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300">
          <FaClock className="mr-1" />
          Unknown
        </span>
      );
    }
    
    const styles = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
      approved: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
      rejected: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
    };
    const icons = {
      pending: FaClock,
      approved: FaCheckCircle,
      rejected: FaTimesCircle
    };
    const Icon = icons[status] || FaClock;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="mr-1" />
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

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">My Profile</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center transition-colors duration-300">
          <FaTimesCircle className="mx-auto text-4xl text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2 transition-colors duration-300">Error Loading Profile</h3>
          <p className="text-red-600 dark:text-red-300 mb-4 transition-colors duration-300">{error}</p>
          <button 
            onClick={fetchProfile}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile || !profile.application) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">My Profile</h2>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center transition-colors duration-300">
          <FaClock className="mx-auto text-4xl text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2 transition-colors duration-300">No Profile Data</h3>
          <p className="text-yellow-600 dark:text-yellow-300 transition-colors duration-300">Please submit a hostel application to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">My Profile</h2>

      {/* User Info Card */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md overflow-hidden transition-colors duration-300">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            {profile?.application?.photo ? (
              <img
                src={`http://localhost:5000${profile.application.photo}`}
                alt={profile?.application?.name || 'Profile'}
                className="w-24 h-24 rounded-full object-cover border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary-600 text-4xl font-bold">
                  {(profile?.application?.name?.charAt(0) || user?.name?.charAt(0) || 'S').toUpperCase()}
                </span>
              </div>
            )}
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold">{profile?.application?.name || user?.name || 'Student'}</h3>
              <p className="text-primary-100">{profile?.application?.email || user?.email || ''}</p>
              <div className="mt-2">
                {getStatusBadge(profile?.application?.status)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white pb-2 border-b border-gray-200 dark:border-dark-border transition-colors duration-300">
                Personal Information
              </h4>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Full Name</p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{profile?.application?.name}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Email Address</p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{profile?.application?.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaPhone className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Phone Number</p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{profile?.application?.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaIdCard className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">CNIC Number</p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{profile?.application?.cnic}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Address</p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{profile?.application?.address}</p>
                </div>
              </div>
            </div>

            {/* Academic & Guardian Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white pb-2 border-b border-gray-200 dark:border-dark-border transition-colors duration-300">
                Academic Information
              </h4>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaBuilding className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Department</p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{profile?.application?.department}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaGraduationCap className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Semester</p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{profile?.application?.semester} Semester</p>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 pt-4">
                Guardian Information
              </h4>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaUserTie className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Father's Name</p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{profile?.application?.fatherName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Guardian Email</p>
                  <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{profile?.application?.guardianEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Information */}
      {profile?.application?.status === 'approved' && profile?.application?.room && (
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 transition-colors duration-300">
          <h4 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
            Room Assignment
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg">
              <FaBed className="text-primary-600 text-xl" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Room Number</p>
                <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">{profile?.application?.room?.roomNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg">
              <FaBuilding className="text-primary-600 text-xl" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Hostel Block</p>
                <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">{profile?.application?.room?.hostelBlock}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg">
              <div className="w-5 h-5 border-2 border-primary-600 rounded flex items-center justify-center">
                <span className="text-primary-600 text-xs font-bold">F</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Floor</p>
                <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">{profile?.application?.room?.floor}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg">
              <FaUser className="text-primary-600 text-xl" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Occupancy</p>
                <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">
                  {profile?.application?.room?.occupiedBeds} / {profile?.application?.room?.capacity}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Timeline */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 transition-colors duration-300">
        <h4 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
          Application Timeline
        </h4>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaClock className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">Application Submitted</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                {new Date(profile?.application?.createdAt).toLocaleDateString()} at{' '}
                {new Date(profile?.application?.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {profile?.application?.status !== 'pending' && (
            <div className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                profile?.application?.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {profile?.application?.status === 'approved' ? (
                  <FaCheckCircle className="text-green-600" />
                ) : (
                  <FaTimesCircle className="text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white transition-colors duration-300">
                  Application {profile?.application?.status === 'approved' ? 'Approved' : 'Rejected'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  {new Date(profile?.application?.updatedAt).toLocaleDateString()} at{' '}
                  {new Date(profile?.application?.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
