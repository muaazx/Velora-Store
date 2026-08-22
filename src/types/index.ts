// Shared TypeScript Types for Velora Store Platform

export type Role = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod =
  | 'PAYPAL'
  | 'PAYONEER'
  | 'CREDIT_CARD'
  | 'CASH_ON_DELIVERY';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export type BannerType = 'HERO_SLIDER' | 'PROMOTIONAL' | 'HOMEPAGE';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type NotificationType = 'ORDER' | 'PROMOTIONAL' | 'DISCOUNT' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: Role;
  isSuspended?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  title?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  bannerImage?: string;
  featured?: boolean;
  productCount?: number;
}

export interface ProductSpecification {
  [key: string]: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  discount: number; // percentage
  quantity: number;
  stockStatus?: StockStatus;
  brand: string;
  thumbnail: string;
  images: string[];
  featured?: boolean;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleEndTime?: string;
  specifications?: ProductSpecification;
  attributes?: Record<string, string>;
  reviews?: Review[];
  rating: number;
  reviewCount: number;
  soldCount?: number;
  isArchived?: boolean;
  categoryId: string;
  category?: Category;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  variant?: string;
  selectedVariant?: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSku?: string;
  price: number;
  quantity: number;
  discount?: number;
  total?: number;
  variant?: string;
}

export interface OrderTimelineEvent {
  id?: string;
  status: OrderStatus;
  timestamp: string;
  title?: string;
  description?: string;
  message?: string;
  completed?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
  address?: Address;
  shippingAddress?: Address;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total?: number;
  totalAmount?: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  trackingCode?: string;
  customerNotes?: string;
  couponCode?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  value?: number;
  discountValue?: number;
  minSpend?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiryDate?: string;
  expiresAt?: string;
  usageLimit?: number;
  timesUsed?: number;
  usedCount?: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName?: string;
  user?: {
    name: string;
    avatar?: string;
  };
  userAvatar?: string;
  productId: string;
  productName?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  status?: ReviewStatus;
  verifiedPurchase?: boolean;
  isVerifiedPurchase?: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  linkUrl: string;
  imageUrl: string;
  type: BannerType;
  order: number;
  isActive: boolean;
  bgColor?: string;
  accentColor?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface StoreSettings {
  siteName: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  shippingCharge: number;
  freeShippingAbove: number;
  taxPercentage: number;
  currency: string;
  currencySymbol: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialInstagram?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders?: number;
  deliveredOrders?: number;
  cancelledOrders?: number;
  averageOrderValue?: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
  lowStockProducts?: any[];
  recentOrders?: Order[];
  weeklyOrders?: {
    day: string;
    orders: number;
    revenue: number;
  }[];
  categoryDistribution?: {
    name: string;
    count: number;
    value: number;
  }[];
  monthlySales?: {
    month: string;
    revenue: number;
    orders: number;
  }[];
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  flashSaleOnly?: boolean;
  sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}
