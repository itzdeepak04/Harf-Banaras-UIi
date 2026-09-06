import apiClient from '../config/axios.config';
import { ProductListResponse, Product } from '../types/product.types';

export const productService = {
  list: async (params: Record<string, string>) => {
    const res = await apiClient.post<{ data: ProductListResponse }>('/products/search', params);
    return res.data.data;
  },
  search: async (params: Record<string, unknown>) => {
    const res = await apiClient.post<{ data: ProductListResponse }>('/products/search', params);
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<{ data: Product }>(`/products/${id}`);
    return res.data.data;
  },
  related: async (id: string): Promise<Product[]> => {
    const res = await apiClient.get<{ data: Product[] }>(`/products/${id}/related`);
    return res.data.data;
  },
};
