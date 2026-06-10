import axios from 'axios';

const API = axios.create({
baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
});

// Ajoute automatiquement le token admin si connecté
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Events
export const getActiveEvents = () => API.get('/events');
export const getEventById = (id) => API.get(`/events/${id}`);

// Candidates
export const getCandidatesByEvent = (eventId) => API.get(`/events/${eventId}/candidates`);
export const getCandidatesWithResults = (eventId) => API.get(`/events/${eventId}/results`);
export const getCandidatesLive = (eventId, secretCode) =>
  API.get(`/events/${eventId}/candidates/live`, {
    headers: { 'x-secret-code': secretCode },
  });

// Votes
export const registerVote = (data) => API.post('/votes', data);

// Admin
export const adminLogin = (data) => API.post('/auth/login', data);
export const createEvent = (data) => API.post('/admin/events', data);
export const updateEvent = (id, data) => API.put(`/admin/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/admin/events/${id}`);
export const publishResults = (id) => API.post(`/admin/events/${id}/publish`);
export const createCandidate = (data) => API.post('/admin/candidates', data);
export const updateCandidate = (id, data) => API.put(`/admin/candidates/${id}`, data);
export const deleteCandidate = (id) => API.delete(`/admin/candidates/${id}`);
export const getVotesByEvent = (eventId) => API.get(`/admin/events/${eventId}/votes`);
export const getEventStats = (eventId) => API.get(`/admin/events/${eventId}/stats`);

export default API;