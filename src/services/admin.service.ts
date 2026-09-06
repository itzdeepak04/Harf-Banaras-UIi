import apiClient from '../config/axios.config';
import { Order } from '../types/common.types';
import { Product, ProductListResponse } from '../types/product.types';
import {
  AdminSummary,
  InventorySummary,
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
  StoreSettings,
} from '../types/admin.types';

export interface Category {
  _id: string;
  name: string;
  type: 'saree_type' | 'occasion' | 'collection';
}

export const categoryService = {
  list: async (type: Category['type']): Promise<Category[]> => {
    const res = await apiClient.get('/categories', { params: { type } });
    return res.data.data;
  },
  create: async (payload: { name: string; type: Category['type']; description?: string }): Promise<Category> => {
    const res = await apiClient.post('/categories', payload);
    return res.data.data;
  },
};

export const dashboardService = {
  adminSummary: async (): Promise<AdminSummary> => {
    const res = await apiClient.get('/dashboard/admin');
    return res.data.data;
  },
  inventorySummary: async (): Promise<InventorySummary> => {
    const res = await apiClient.get('/dashboard/inventory');
    return res.data.data;
  },
};

export const couponService = {
  list: async (): Promise<Coupon[]> => {
    const res = await apiClient.get('/coupons');
    return res.data.data;
  },
  create: async (dto: CreateCouponPayload): Promise<Coupon> => {
    const res = await apiClient.post('/coupons', dto);
    return res.data.data;
  },
  update: async (id: string, dto: UpdateCouponPayload): Promise<Coupon> => {
    const res = await apiClient.patch(`/coupons/${id}`, dto);
    return res.data.data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/coupons/${id}`);
  },
};

export const settingsService = {
  get: async (): Promise<StoreSettings> => {
    const res = await apiClient.get('/settings');
    return res.data.data;
  },
  update: async (dto: Partial<StoreSettings>): Promise<StoreSettings> => {
    const res = await apiClient.patch('/settings', dto);
    return res.data.data;
  },
};

export const adminOrderService = {
  list: async (status?: string): Promise<Order[]> => {
    const res = await apiClient.get('/orders', { params: status ? { status } : {} });
    return res.data.data;
  },
  updateStatus: async (id: string, status: string, note?: string): Promise<Order> => {
    const res = await apiClient.patch(`/orders/${id}/status`, { status, note });
    return res.data.data;
  },
};

// Reuses the same /products endpoints the shop uses, plus the stock-adjust
// endpoint, so Inventory Managers can browse & restock from one screen.
export const adminProductService = {
  create: async (payload: Record<string, unknown>): Promise<Product> => {
    const res = await apiClient.post('/products', payload);
    return res.data.data;
  },
  createImageSas: async (path: string, contentType: string, mode: 'upload' | 'read' = 'upload') => {
    const res = await apiClient.post('/products/image-sas', { path, contentType, mode });
    return res.data.data as { path: string; url: string; expiresOn: string };
  },
  uploadImage: async (file: File): Promise<string> => {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
    const path = `products/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const sas = await adminProductService.createImageSas(path, file.type);
    const response = await fetch(sas.url, {
      method: 'PUT',
      headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': file.type },
      body: file,
    });
    if (!response.ok) throw new Error('Image upload failed');
    return sas.path;
  },
  list: async (params: Record<string, string>): Promise<ProductListResponse> => {
    const res = await apiClient.post('/products/search', params);
    return res.data.data;
  },
  adjustStock: async (id: string, changeQuantity: number, reason: string): Promise<Product> => {
    const res = await apiClient.patch(`/products/${id}/stock`, { changeQuantity, reason });
    return res.data.data;
  },
  exportInventory: async (): Promise<Blob> => {
    const res = await apiClient.get('/products/inventory/export', { responseType: 'blob' });
    return res.data;
  },
  importInventory: async (csv: string): Promise<{ sku: string; updated: boolean; message?: string }[]> => {
    const res = await apiClient.post('/products/inventory/import', { csv });
    return res.data.data;
  },
};
