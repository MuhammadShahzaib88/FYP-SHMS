import { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaSpinner, 
  FaBed,
  FaBuilding,
  FaLayerGroup,
  FaEnvelope,
  FaPhone,
  FaSearch,
  FaUserCircle
} from 'react-icons/fa';
import { applicationService } from '../../services/api';

const ApprovedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchApprovedStudents();
  }, []);

  const fetchApprovedStudents = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getApprovedStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching approved students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase()) ||
    student.department.toLowerCase().includes(search.toLowerCase()) ||
    (student.roomId?.roomNumber && student.roomId.roomNumber.toLowerCase().includes(search.toLowerCase()))
  );

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
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Approved Students</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">
            Total approved: <strong>{students.length}</strong> students
          </p>
        </div>
        
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300"
          />
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStudents.map((student) => (
          <div key={student._id} className="bg-white dark:bg-dark-surface rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow transition-colors duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                {student.photo ? (
                  <img
                    src={`http://localhost:5000${student.photo}`}
                    alt={student.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-xl">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-300">{student.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{student.department} • {student.semester} Semester</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Approved
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-300 transition-colors duration-300">
                <FaEnvelope className="w-4 h-4 mr-3 text-gray-400" />
                {student.email}
              </div>
              <div className="flex items-center text-gray-600">
                <FaPhone className="w-4 h-4 mr-3 text-gray-400" />
                {student.phone}
              </div>
              <div className="flex items-center text-gray-600">
                <FaUsers className="w-4 h-4 mr-3 text-gray-400" />
                Father: {student.fatherName}
              </div>
            </div>

            {student.roomId && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 transition-colors duration-300">Room Assignment</h4>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    <FaBed className="mr-2 text-primary-600" />
                    Room {student.roomId.roomNumber}
                  </span>
                  <span className="flex items-center text-gray-600">
                    <FaLayerGroup className="mr-2 text-primary-600" />
                    Floor {student.roomId.floor}
                  </span>
                  <span className="flex items-center text-gray-600">
                    <FaBuilding className="mr-2 text-primary-600" />
                    Block {student.roomId.hostelBlock}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-xl shadow-md transition-colors duration-300">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
            <FaUsers className="text-gray-400 dark:text-gray-500 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-300">
            {search ? 'No students found matching your search' : 'No approved students yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
            {search ? 'Try a different search term' : 'Approve student applications to see them here'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ApprovedStudents;
