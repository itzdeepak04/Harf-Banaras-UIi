import apiClient from '../config/axios.config';
import { User, Address } from '../types/common.types';

export const userService = {
  getProfile: async (): Promise<User> => {
    const res = await apiClient.get('/users/me');
    return res.data.data;
  },
  updateProfile: async (dto: { name?: string }): Promise<User> => {
    const res = await apiClient.patch('/users/me', dto);
    return res.data.data;
  },
  addAddress: async (dto: Address): Promise<Address[]> => {
    const res = await apiClient.post('/users/me/addresses', dto);
    return res.data.data;
  },
  removeAddress: async (index: number): Promise<Address[]> => {
    const res = await apiClient.delete(`/users/me/addresses/${index}`);
    return res.data.data;
  },
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.patch('/users/me/password', { currentPassword, newPassword });
  },
};
