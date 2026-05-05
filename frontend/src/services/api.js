import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  setupAdmin: (adminData) => api.post('/auth/setup-admin', adminData)
};

// Application Services
export const applicationService = {
  submitApplication: (data) => {
    const config = {
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    };
    return api.post('/apply', data, config);
  },
  getAllApplications: () => api.get('/admin/applications'),
  approveApplication: (id, roomId) => api.put(`/admin/approve/${id}`, { roomId }),
  rejectApplication: (id) => api.put(`/admin/reject/${id}`),
  getApprovedStudents: () => api.get('/admin/approved-students')
};

// Room Services
export const roomService = {
  createRoom: (data) => api.post('/admin/rooms', data),
  getAllRooms: () => api.get('/rooms'),
  getAvailableRooms: () => api.get('/rooms/available'),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  updateRoom: (id, data) => api.put(`/admin/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/admin/rooms/${id}`)
};

// Student Services
export const studentService = {
  getMyRoom: () => api.get('/student/my-room'),
  getProfile: () => api.get('/student/profile'),
  getAllStudents: () => api.get('/admin/students'),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  getRoomsWithStudents: () => api.get('/admin/rooms-with-students')
};

// Notice Services
export const noticeService = {
  getAllNotices: (activeOnly = false) => api.get(`/notices${activeOnly ? '?activeOnly=true' : ''}`),
  createNotice: (data) => api.post('/notices', data),
  updateNotice: (id, data) => api.put(`/notices/${id}`, data),
  deleteNotice: (id) => api.delete(`/notices/${id}`),
  toggleNotice: (id) => api.patch(`/notices/${id}/toggle`)
};

// Complaint Services
export const complaintService = {
  submitComplaint: (data) => api.post('/complaints', data),
  getMyComplaints: () => api.get('/complaints/my'),
  getAllComplaints: (status) => api.get(`/admin/complaints${status ? `?status=${status}` : ''}`),
  updateComplaintStatus: (id, data) => api.put(`/admin/complaints/${id}`, data)
};

// Room Change Services
export const roomChangeService = {
  submitRequest: (data) => api.post('/room-change/request', data),
  getMyRequests: () => api.get('/room-change/my'),
  getAllRequests: (status) => api.get(`/admin/room-change-requests${status ? `?status=${status}` : ''}`),
  approveRequest: (id) => api.put(`/admin/room-change/${id}/approve`),
  rejectRequest: (id, rejectionComment) => api.put(`/admin/room-change/${id}/reject`, { rejectionComment })
};

// Notification Services
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

// AI Chat Services
export const chatService = {
  sendMessage: (message) => api.post('/chat', { message }),
  clearHistory: () => api.delete('/chat/clear'),
};

export default api;
