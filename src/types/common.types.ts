export type Role = 'customer' | 'inventory_manager' | 'admin';

export interface Address {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  role: Role;
  addresses: Address[];
}

export interface CartItem {
  product: any;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  couponCode?: string | null;
  discount?: number;
  couponError?: string | null;
  total?: number;
}

export interface OrderItem {
  product: string;
  name: string;
  sku: string;
  image: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  discount?: number;
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: 'cod' | 'upi' | 'card' | 'netbanking';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: string;
  createdAt: string;
  statusHistory?: { status: string; at: string; note?: string }[];
}

export interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user?: { name?: string };
}
