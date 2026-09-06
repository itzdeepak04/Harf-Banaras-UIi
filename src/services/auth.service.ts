import apiClient from '../config/axios.config';

export const authService = {
  getProfile: async () => {
    const res = await apiClient.get('/users/me');
    return res.data.data;
  },
  register: async (payload: { name: string; email?: string; mobile?: string; password: string }) => {
    const res = await apiClient.post('/auth/register', payload);
    return res.data.data;
  },
  login: async (payload: { identifier: string; password: string }) => {
    const res = await apiClient.post('/auth/login', payload);
    return res.data.data;
  },
  forgotPassword: async (identifier: string) => {
    const res = await apiClient.post('/auth/forgot-password', { identifier });
    return res.data.data;
  },
  resetPassword: async (token: string, newPassword: string) => {
    const res = await apiClient.post('/auth/reset-password', { token, newPassword });
    return res.data.data;
  },
};
