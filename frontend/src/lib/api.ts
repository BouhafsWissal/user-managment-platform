import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

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

export const auth = {
  register: async (data: { email: string; password: string; name: string; isCreator: boolean }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

export const courses = {
  create: async (data: { title: string; description: string }) => {
    const response = await api.post('/courses', data);
    return response.data;
  },
  getCreated: async () => {
    const response = await api.get('/courses/created');
    return response.data;
  },
  getEnrolled: async () => {
    const response = await api.get('/courses/enrolled');
    return response.data;
  },
  invite: async (courseId: number, userId: number) => {
    const response = await api.post(`/courses/${courseId}/invite`, { userId });
    return response.data;
  },
  removeUser: async (courseId: number, userId: number) => {
    const response = await api.delete(`/courses/${courseId}/users/${userId}`);
    return response.data;
  },
  getUsers: async (courseId: number) => {
    const response = await api.get(`/courses/${courseId}/users`);
    return response.data;
  },
  leave: async (courseId: number) => {
    const response = await api.delete(`/courses/${courseId}/leave`);
    return response.data;
  },
};

export const invites = {
  respond: async (inviteId: number, accept: boolean) => {
    const response = await api.post(`/invites/${inviteId}/respond`, { accept });
    return response.data;
  },
  getPending: async () => {
    const response = await api.get('/invites/pending');
    return response.data;
  },
};