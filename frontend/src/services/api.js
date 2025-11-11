import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
  getUserPodcasts: (userId) => api.get(`/podcasts/user/${userId}`), // ← Fixed endpoint
};

export const playlistAPI = {
  getAll: () => api.get('/playlists'),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  addPodcast: (playlistId, podcastId) => api.post(`/playlists/${playlistId}/podcasts/${podcastId}`),
  removePodcast: (playlistId, podcastId) => api.delete(`/playlists/${playlistId}/podcasts/${podcastId}`),
};

export default api;
