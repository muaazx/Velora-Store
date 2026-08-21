import {
  Product,
  Category,
  Order,
  User,
  Address,
  Coupon,
  Banner,
  Review,
  StoreSettings,
  NotificationItem,
  DashboardStats,
  ProductFilterParams,
  CartItem,
  WishlistItem,
  OrderStatus,
} from '../types';

import { getFirebaseIdToken } from './firebase';

const BASE_URL = '/api';

// ==================== ADMIN TOKEN MANAGEMENT ====================
let _adminToken: string | null = null;

export function setAdminToken(token: string | null) {
  _adminToken = token;
}

export function getAdminToken(): string | null {
  return _adminToken;
}

// ==================== FETCH HELPERS ====================

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const { headers: optHeaders, ...restOptions } = options || {};
  const res = await fetch(`${BASE_URL}${url}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(optHeaders as Record<string, string>),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

/**
 * Fetch helper that injects the Firebase admin token as a Bearer header.
 * Automatically refreshes the ID token if expired.
 */
async function fetchAdminJSON<T>(url: string, options?: RequestInit): Promise<T> {
  let token = _adminToken;
  if (!token) {
    token = await getFirebaseIdToken();
    if (token) setAdminToken(token);
  }

  if (!token) {
    throw new Error('Admin authentication required. Please sign in as admin.');
  }

  try {
    return await fetchJSON<T>(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err: any) {
    // If token expired, attempt to refresh once
    if (err.message?.includes('expired') || err.message?.includes('401')) {
      const freshToken = await getFirebaseIdToken();
      if (freshToken) {
        setAdminToken(freshToken);
        return await fetchJSON<T>(url, {
          ...options,
          headers: {
            ...options?.headers,
            Authorization: `Bearer ${freshToken}`,
          },
        });
      }
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (email: string, password?: string) =>
    fetchJSON<{ user: User; token: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; phone?: string }) =>
    fetchJSON<{ user: User; token: string; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin login via Firebase
  adminLogin: (idToken: string) =>
    fetchJSON<{ user: User; isAdmin: boolean; message: string }>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),

  updateProfile: (data: { userId: string; name?: string; phone?: string; avatar?: string }) =>
    fetchJSON<{ user: User; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Admin user management (protected)
  getUsers: () => fetchAdminJSON<User[]>('/admin/customers'),
  updateUserRole: (id: string, role: string) =>
    fetchAdminJSON<User>(`/admin/customers/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  deleteUser: (id: string) =>
    fetchAdminJSON<{ success: boolean }>(`/admin/customers/${id}`, { method: 'DELETE' }),

  // Products (reads are public, writes are admin-protected)
  getProducts: (params?: ProductFilterParams) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.brand) query.append('brand', params.brand);
    if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
    if (params?.minRating !== undefined) query.append('minRating', params.minRating.toString());
    if (params?.inStockOnly) query.append('inStockOnly', 'true');
    if (params?.onSaleOnly) query.append('onSaleOnly', 'true');
    if (params?.flashSaleOnly) query.append('flashSaleOnly', 'true');
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return fetchJSON<{ products: Product[]; total: number; brands: string[] }>(`/products?${query.toString()}`);
  },

  getProduct: (idOrSlug: string) =>
    fetchJSON<{ product: Product; reviews: Review[] }>(`/products/${idOrSlug}`),

  createProduct: (data: Partial<Product>) =>
    fetchAdminJSON<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),

  updateProduct: (id: string, data: Partial<Product>) =>
    fetchAdminJSON<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteProduct: (id: string) =>
    fetchAdminJSON<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),

  archiveProduct: (id: string) =>
    fetchAdminJSON<Product>(`/products/${id}/archive`, { method: 'PATCH' }),

  // Categories (reads are public, writes are admin-protected)
  getCategories: () => fetchJSON<Category[]>('/categories'),
  createCategory: (data: Partial<Category>) =>
    fetchAdminJSON<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Partial<Category>) =>
    fetchAdminJSON<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    fetchAdminJSON<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: (userId: string) => fetchJSON<CartItem[]>(`/cart?userId=${userId}`),
  addToCart: (userId: string, productId: string, quantity = 1, variant?: string) =>
    fetchJSON<CartItem[]>('/cart', {
      method: 'POST',
      body: JSON.stringify({ userId, productId, quantity, variant }),
    }),
  updateCartItem: (userId: string, itemId: string, quantity: number) =>
    fetchJSON<CartItem[]>(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ userId, quantity }),
    }),
  removeCartItem: (userId: string, itemId: string) =>
    fetchJSON<CartItem[]>(`/cart/${itemId}?userId=${userId}`, { method: 'DELETE' }),
  clearCart: (userId: string) =>
    fetchJSON<CartItem[]>(`/cart?userId=${userId}`, { method: 'DELETE' }),

  // Wishlist
  getWishlist: (userId: string) => fetchJSON<WishlistItem[]>(`/wishlist?userId=${userId}`),
  toggleWishlist: (userId: string, productId: string) =>
    fetchJSON<{ wishlist: WishlistItem[]; isAdded: boolean }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ userId, productId }),
    }),

  // Orders (reads are public, status/tracking updates are admin-protected)
  getOrders: (userId?: string) =>
    fetchJSON<Order[]>(`/orders${userId ? `?userId=${userId}` : ''}`),
  getOrder: (id: string) => fetchJSON<Order>(`/orders/${id}`),
  getOrderById: (id: string) => fetchJSON<Order>(`/orders/${id}`),
  createOrder: (data: any) =>
    fetchJSON<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id: string, status: OrderStatus) =>
    fetchAdminJSON<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateOrderTracking: (id: string, trackingNumber: string) =>
    fetchAdminJSON<Order>(`/orders/${id}/tracking`, { method: 'PATCH', body: JSON.stringify({ trackingNumber, trackingCode: trackingNumber }) }),
  cancelOrder: (id: string, reason?: string) =>
    fetchJSON<Order>(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Coupons (reads/validation are public, mutations are admin-protected)
  getCoupons: () => fetchJSON<Coupon[]>('/coupons'),
  validateCoupon: (code: string, subtotal: number) =>
    fetchJSON<{ valid: boolean; coupon?: Coupon; discountAmount: number; message: string }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),
  createCoupon: (data: Partial<Coupon>) =>
    fetchAdminJSON<Coupon>('/coupons', { method: 'POST', body: JSON.stringify(data) }),
  toggleCoupon: (id: string) =>
    fetchAdminJSON<Coupon>(`/coupons/${id}/toggle`, { method: 'PATCH' }),
  deleteCoupon: (id: string) =>
    fetchAdminJSON<{ success: boolean }>(`/coupons/${id}`, { method: 'DELETE' }),

  // Reviews (reads/create are public, moderation/deletion are admin-protected)
  getReviews: (productId?: string) =>
    fetchJSON<Review[]>(`/reviews${productId ? `?productId=${productId}` : ''}`),
  createReview: (data: { userId: string; productId: string; rating: number; title: string; comment: string; images?: string[] }) =>
    fetchJSON<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  moderateReview: (id: string, status: 'APPROVED' | 'REJECTED') =>
    fetchAdminJSON<Review>(`/reviews/${id}/moderate`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteReview: (id: string) =>
    fetchAdminJSON<{ success: boolean }>(`/reviews/${id}`, { method: 'DELETE' }),

  // Banners (reads are public, mutations are admin-protected)
  getBanners: (all = false) => fetchJSON<Banner[]>(`/banners${all ? '?all=true' : ''}`),
  createBanner: (data: Partial<Banner>) =>
    fetchAdminJSON<Banner>('/banners', { method: 'POST', body: JSON.stringify(data) }),
  updateBanner: (id: string, data: Partial<Banner>) =>
    fetchAdminJSON<Banner>(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBanner: (id: string) =>
    fetchAdminJSON<{ success: boolean }>(`/banners/${id}`, { method: 'DELETE' }),

  // Addresses
  getAddresses: (userId: string) => fetchJSON<Address[]>(`/addresses?userId=${userId}`),
  addAddress: (userId: string, data: any) =>
    fetchJSON<Address>('/addresses', { method: 'POST', body: JSON.stringify({ userId, ...data }) }),
  updateAddress: (id: string, data: Partial<Address>) =>
    fetchJSON<Address>(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAddress: (userId: string, id: string) =>
    fetchJSON<{ success: boolean }>(`/addresses/${id}?userId=${userId}`, { method: 'DELETE' }),
  setDefaultAddress: (userId: string, id: string) =>
    fetchJSON<Address[]>(`/addresses/${id}/default?userId=${userId}`, { method: 'PATCH' }),

  // Notifications
  getNotifications: (userId?: string) =>
    fetchJSON<NotificationItem[]>(`/notifications${userId ? `?userId=${userId}` : ''}`),
  createNotification: (data: { title: string; message: string; type: string; userId?: string | null; linkUrl?: string }) =>
    fetchJSON<NotificationItem>('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  markNotificationRead: (id: string) =>
    fetchJSON<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: (userId?: string) =>
    fetchJSON<{ success: boolean }>('/notifications/read-all', { method: 'POST', body: JSON.stringify({ userId }) }),

  // Settings (reads are public, writes are admin-protected)
  getSettings: () => fetchJSON<StoreSettings>('/settings'),
  updateSettings: (data: Partial<StoreSettings>) =>
    fetchAdminJSON<StoreSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Admin Dashboard (protected)
  getDashboardStats: () => fetchAdminJSON<DashboardStats>('/admin/stats'),
  getAdminDashboardStats: () => fetchAdminJSON<DashboardStats>('/admin/stats'),
  getCustomers: () => fetchAdminJSON<any[]>('/admin/customers'),
  suspendCustomer: (id: string) =>
    fetchAdminJSON<User>(`/admin/customers/${id}/suspend`, { method: 'PATCH' }),
  deleteCustomer: (id: string) =>
    fetchAdminJSON<{ success: boolean }>(`/admin/customers/${id}`, { method: 'DELETE' }),
};
