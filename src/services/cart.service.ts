import apiClient from '../config/axios.config';
import { CartSummary } from '../types/common.types';

export const cartService = {
  getCart: async (): Promise<CartSummary> => {
    const res = await apiClient.get('/cart');
    return res.data.data;
  },
  addItem: async (productId: string, quantity = 1): Promise<CartSummary> => {
    const res = await apiClient.post('/cart/items', { productId, quantity });
    return res.data.data;
  },
  updateQuantity: async (productId: string, quantity: number): Promise<CartSummary> => {
    const res = await apiClient.post(`/cart/items/${productId}`, { quantity });
    return res.data.data;
  },
  removeItem: async (productId: string): Promise<CartSummary> => {
    const res = await apiClient.delete(`/cart/items/${productId}`);
    return res.data.data;
  },
  applyCoupon: async (code: string): Promise<CartSummary> => {
    const res = await apiClient.post('/cart/coupon', { code });
    return res.data.data;
  },
  removeCoupon: async (): Promise<CartSummary> => {
    const res = await apiClient.delete('/cart/coupon');
    return res.data.data;
  },
};
