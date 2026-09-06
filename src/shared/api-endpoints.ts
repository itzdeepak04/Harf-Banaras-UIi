/**
 * Central endpoint registry, mirroring the reference project's
 * shared/api-endpoints.ts. Keeping every path in one place means a
 * backend route rename only needs to be updated here.
 */
export const API_ENDPOINTS = {
  //#region AUTH
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  PROFILE: '/users/me',
  UPDATE_PROFILE: '/users/me',
  UPDATE_PASSWORD: '/users/me/password',
  ADD_ADDRESS: '/users/me/addresses',
  //#endregion AUTH

  //#region PRODUCTS
  PRODUCTS: '/products',
  PRODUCT_SEARCH: '/products/search',
  PRODUCT_IMAGE_SAS: '/products/image-sas',
  PRODUCT_INVENTORY_EXPORT: '/products/inventory/export',
  PRODUCT_INVENTORY_IMPORT: '/products/inventory/import',
  CATEGORIES: '/categories',
  //#endregion PRODUCTS

  //#region CART
  CART: '/cart',
  CART_ITEMS: '/cart/items',
  CART_COUPON: '/cart/coupon',
  //#endregion CART

  //#region WISHLIST
  WISHLIST: '/wishlist',
  //#endregion WISHLIST

  //#region ORDERS
  ORDERS: '/orders',
  MY_ORDERS: '/orders/my',
  //#endregion ORDERS

  //#region ADMIN
  ADMIN_DASHBOARD: '/dashboard/admin',
  INVENTORY_DASHBOARD: '/dashboard/inventory',
  COUPONS: '/coupons',
  SETTINGS: '/settings'
  //#endregion ADMIN
};
