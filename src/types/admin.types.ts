export interface AdminSummary {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  newCustomers30d: number;
  pendingOrders: number;
  pendingReturns: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface StockMovement {
  _id: string;
  product: { _id: string; name: string; sku: string } | string;
  performedBy: { _id: string; name: string } | string;
  changeQuantity: number;
  reason: string;
  createdAt: string;
}

export interface InventorySummary {
  totalActive: number;
  addedToday: number;
  lowStock: number;
  outOfStock: number;
  drafts: number;
  recentMovements: StockMovement[];
}

export type CouponType = 'percentage' | 'flat';

export interface Coupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue: number;
  maxDiscount: number;
  expiresAt: string;
  isActive: boolean;
  usageLimit: number;
  timesUsed: number;
  description: string;
}

export interface CreateCouponPayload {
  code: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit?: number;
  description?: string;
}

export interface UpdateCouponPayload {
  value?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiresAt?: string;
  isActive?: boolean;
  usageLimit?: number;
  description?: string;
}

export interface StoreSettings {
  flatShippingFee: number;
  freeShippingThreshold: number;
  taxPercent: number;
}
