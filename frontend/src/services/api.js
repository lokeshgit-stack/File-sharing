import axios from 'axios';

// Dynamically use correct API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const podcastAPI = {
  getAll: () => api.get('/podcasts'),
  getById: (id) => api.get(`/podcasts/${id}`),
  upload: (formData) => api.post('/podcasts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/podcasts/${id}`),
  play: (id) => api.post(`/podcasts/${id}/play`),
  getUserPodcasts: (userId) => api.get(`/podcasts/user/${userId}`),
};

// Add new postAPI for multi-media posts
export const postAPI = {
  getAll: () => api.get('/posts'),
  getById: (id) => api.get(`/posts/${id}`),
  create: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/posts/${id}`),
  view: (id) => api.post(`/posts/${id}/view`),
  like: (id) => api.post(`/posts/${id}/like`),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`)
};

// Comment API (NEW - for post comments and discussions)
export const commentAPI = {
  // Get all comments for a specific post
  getByPost: (postId) => api.get(`/comments/post/${postId}`),
  
  // Create a new comment on a post
  create: (postId, data) => api.post(`/comments/post/${postId}`, data),
  
  // Upvote a comment
  upvote: (commentId) => api.post(`/comments/${commentId}/upvote`),
  
  // Downvote a comment
  downvote: (commentId) => api.post(`/comments/${commentId}/downvote`),
  
  // Delete a comment (soft delete)
  delete: (commentId) => api.delete(`/comments/${commentId}`)
};

export const playlistAPI = {
  getAll: () => api.get('/playlists'),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  addPodcast: (playlistId, podcastId) => api.post(`/playlists/${playlistId}/podcasts/${podcastId}`),
  removePodcast: (playlistId, podcastId) => api.delete(`/playlists/${playlistId}/podcasts/${podcastId}`),
};

// File Share API (for file sharing feature)
export const fileAPI = {
  // Get user's file shares (requires auth)
  getAll: () => api.get('/files'),
  
  // Upload single file (backward compatibility)
  upload: (formData) => api.post('/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Upload multiple files (up to 10)
  uploadMultiple: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Get shared files info (public - no auth required)
  getShared: (shareId, accessCode) => {
    const url = accessCode 
      ? `/files/share/${shareId}?accessCode=${accessCode}`
      : `/files/share/${shareId}`;
    return axios.get(`${API_URL}${url}`);
  },
  
  // Download files (public - no auth required)
  download: (shareId, data) => axios.post(`${API_URL}/files/download/${shareId}`, data),
  
  // Delete file share (requires auth)
  delete: (id) => api.delete(`/files/${id}`),
  
  // Get QR code (requires auth)
  getQRCode: (id) => api.get(`/files/${id}/qrcode`)
};

export default api;
