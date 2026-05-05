import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AIChatWidget from './components/AIChatWidget';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Apply from './pages/Apply';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentApplications from './pages/admin/StudentApplications';
import Rooms from './pages/admin/Rooms';
import ApprovedStudents from './pages/admin/ApprovedStudents';
import Students from './pages/admin/Students';
import NoticeBoard from './pages/admin/NoticeBoard';
import ComplaintsAdmin from './pages/admin/Complaints';
import RoomChangeRequests from './pages/admin/RoomChangeRequests';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyRoom from './pages/student/MyRoom';
import Profile from './pages/student/Profile';
import NoticeBoardStudent from './pages/student/NoticeBoard';
import ComplaintsStudent from './pages/student/Complaints';
import RoomChange from './pages/student/RoomChange';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout user={user} onLogout={handleLogout} />}>
              <Route index element={<Landing />} />
              <Route path="login" element={<Login onLogin={handleLogin} />} />
              <Route path="apply" element={<Apply />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout onLogout={handleLogout} />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="applications" element={<StudentApplications />} />
              <Route path="students" element={<Students />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="notices" element={<NoticeBoard />} />
              <Route path="complaints" element={<ComplaintsAdmin />} />
              <Route path="approved-students" element={<ApprovedStudents />} />
              <Route path="room-change-requests" element={<RoomChangeRequests />} />
            </Route>

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout onLogout={handleLogout} />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="notices" element={<NoticeBoardStudent />} />
              <Route path="complaints" element={<ComplaintsStudent />} />
              <Route path="my-room" element={<MyRoom />} />
              <Route path="profile" element={<Profile />} />
              <Route path="room-change" element={<RoomChange />} />
            </Route>
          </Routes>
          <AIChatWidget />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
