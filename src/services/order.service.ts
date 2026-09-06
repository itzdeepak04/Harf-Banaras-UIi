import apiClient from '../config/axios.config';
import { Order, Address } from '../types/common.types';

export const orderService = {
  placeOrder: async (shippingAddress: Address, giftMessage = '', isGiftWrapped = false): Promise<Order> => {
    const res = await apiClient.post('/orders', { shippingAddress, giftMessage, isGiftWrapped });
    return res.data.data;
  },
  myOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get('/orders/my');
    return res.data.data;
  },
  getById: async (id: string): Promise<Order> => {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data.data;
  },
  cancel: async (id: string, reason: string): Promise<Order> => {
    const res = await apiClient.patch(`/orders/${id}/cancel`, { reason });
    return res.data.data;
  },
};
