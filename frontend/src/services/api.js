import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ========== AUTH ==========
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ========== USERS ==========
export const usersApi = {
  getMe: () => api.get('/users/me'),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/me', data),
  search: (params) => api.get('/users/search', { params }),
  submitVerification: (documentUrl) => api.post('/users/me/submit-verification', { documentUrl }),
};

// ========== POSTS ==========
export const postsApi = {
  getAll: (params) => api.get('/posts', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  getByUser: (userId, params) => api.get(`/posts/user/${userId}`, { params }),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
};

// ========== COMMENTS ==========
export const commentsApi = {
  getByPost: (postId, params) => api.get(`/posts/${postId}/comments`, { params }),
  add: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
};

// ========== CONNECTIONS ==========
export const connectionsApi = {
  sendRequest: (userId) => api.post(`/connections/request/${userId}`),
  acceptRequest: (connectionId) => api.post(`/connections/accept/${connectionId}`),
  rejectRequest: (connectionId) => api.post(`/connections/reject/${connectionId}`),
  getStatus: (userId) => api.get(`/connections/status/${userId}`),
  getAccepted: () => api.get('/connections/my/accepted'),
  getPending: () => api.get('/connections/my/pending'),
  getSent: () => api.get('/connections/my/sent'),
};

// ========== AI INTEGRATION ==========
export const aiApi = {
  getIcebreaker: (recipientId) => api.get(`/ai/icebreaker/${recipientId}`),
};

// ========== MESSAGING ==========
export const messagesApi = {
  send: (recipientId, content) => api.post(`/messages/send/${recipientId}`, { content }),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getInbox: () => api.get('/messages/inbox'),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

// ========== LIKES ==========
export const likesApi = {
  togglePost: (postId) => api.post(`/likes/posts/${postId}`),
  toggleComment: (commentId) => api.post(`/likes/comments/${commentId}`),
};

// ========== JOBS ==========
export const jobsApi = {
  getAll: (params) => api.get('/jobs', { params }),
  create: (data) => api.post('/jobs', data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

// ========== ADMIN ==========
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getPendingVerifications: (params) => api.get('/admin/verifications/pending', { params }),
  reviewVerification: (userId, data) => api.patch(`/admin/verifications/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getAllUsers: (params) => api.get('/admin/users', { params }),
};

export default api;
