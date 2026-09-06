import apiClient from '../config/axios.config';
import { Review } from '../types/common.types';

export const reviewService = {
  forProduct: async (productId: string): Promise<Review[]> => {
    const res = await apiClient.get<{ data: Review[] }>(`/reviews/product/${productId}`);
    return res.data.data;
  },
};
