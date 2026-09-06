import apiClient from '../config/axios.config';
import { Product } from '../types/product.types';

export const wishlistService = {
  get: async (): Promise<{ products: Product[] }> => {
    const res = await apiClient.get('/wishlist');
    return res.data.data;
  },
  add: async (productId: string): Promise<{ products: Product[] }> => {
    const res = await apiClient.post(`/wishlist/${productId}`);
    return res.data.data;
  },
  remove: async (productId: string): Promise<{ products: Product[] }> => {
    const res = await apiClient.delete(`/wishlist/${productId}`);
    return res.data.data;
  },
};
