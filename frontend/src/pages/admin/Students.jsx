import { useState, useEffect } from 'react';
import { 
  FaUserGraduate, 
  FaSpinner, 
  FaTrash, 
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaBed,
  FaUserCircle
} from 'react-icons/fa';
import { studentService } from '../../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getAllStudents();
      setStudents(response.data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName, roomNumber) => {
    let message = `Are you sure you want to delete student "${studentName}"?\n\nThis will also delete their application data.`;
    
    if (roomNumber) {
      message += `\n\n⚠️ WARNING: This student has Room ${roomNumber} assigned. Deleting will free up this room.`;
    }
    
    message += `\n\nThis action cannot be undone.`;
    
    if (!window.confirm(message)) {
      return;
    }

    try {
      setDeleteLoading(studentId);
      const response = await studentService.deleteStudent(studentId);
      
      // Remove student from local state
      setStudents(students.filter(s => s._id !== studentId));
      
      let successMessage = `Student "${studentName}" has been deleted successfully.`;
      if (response.data.freedRoom) {
        successMessage += `\n\n✅ Room ${response.data.freedRoom.roomNumber} has been freed up.`;
      }
      
      alert(successMessage);
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('Failed to delete student. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusBadge = (status, hasApplication) => {
    if (!hasApplication) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
          <FaExclamationTriangle className="mr-1" />
          No Application
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Manage Students</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center transition-colors duration-300">
          <FaTimesCircle className="mx-auto text-4xl text-red-500 mb-4" />
          <p className="text-red-600 dark:text-red-300 transition-colors duration-300">{error}</p>
          <button 
            onClick={fetchStudents}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Manage Students</h2>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Total Students:</span>
          <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full font-semibold">
            {students.length}
          </span>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-8 text-center transition-colors duration-300">
          <FaUserGraduate className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 transition-colors duration-300">No Students Found</h3>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">There are no student accounts in the system yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Room</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Joined Date</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {student.photo ? (
                          <img
                            src={`http://localhost:5000${student.photo}`}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-bold">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{student.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">{student.email}</td>
                    <td className="px-6 py-4">
                      {student.roomNumber ? (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          <FaBed className="mr-1" />
                          Room {student.roomNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 transition-colors duration-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(student.applicationStatus, student.hasApplication)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteStudent(student._id, student.name, student.roomNumber)}
                        disabled={deleteLoading === student._id}
                        className="inline-flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {deleteLoading === student._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <>
                            <FaTrash className="mr-1" />
                            Delete
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
