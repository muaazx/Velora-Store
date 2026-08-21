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
  OrderStatus,
  CartItem,
  WishlistItem
} from '../../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_USERS,
  INITIAL_ADDRESSES,
  INITIAL_COUPONS,
  INITIAL_BANNERS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS
} from '../data/seed';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(process.cwd(), 'db_storage.json');

class DataStore {
  private products: Product[] = [...INITIAL_PRODUCTS];
  private categories: Category[] = [...INITIAL_CATEGORIES];
  private orders: Order[] = [...INITIAL_ORDERS];
  private users: User[] = [...INITIAL_USERS];
  private addresses: Address[] = [...INITIAL_ADDRESSES];
  private coupons: Coupon[] = [...INITIAL_COUPONS];
  private banners: Banner[] = [...INITIAL_BANNERS];
  private reviews: Review[] = [...INITIAL_REVIEWS];
  private notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  private settings: StoreSettings = { ...INITIAL_SETTINGS };
  private userCarts: Map<string, CartItem[]> = new Map();
  private userWishlists: Map<string, WishlistItem[]> = new Map();

  constructor() {
    this.loadFromDisk();

    // Seed initial cart for customer 1
    this.userCarts.set('user-cust-1', [
      {
        id: 'cart-init-1',
        productId: 'prod-8',
        product: this.products.find(p => p.id === 'prod-8') || this.products[0],
        quantity: 1,
      }
    ]);

    // Seed initial wishlist
    this.userWishlists.set('user-cust-1', [
      {
        id: 'wish-init-1',
        productId: 'prod-9',
        product: this.products.find(p => p.id === 'prod-9') || this.products[0],
        createdAt: new Date().toISOString(),
      }
    ]);

    this.updateCategoryProductCounts();
  }

  public saveToDisk() {
    try {
      const data = {
        products: this.products,
        categories: this.categories,
        orders: this.orders,
        users: this.users,
        coupons: this.coupons,
        banners: this.banners,
        reviews: this.reviews,
        settings: this.settings,
        notifications: this.notifications,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save DB to disk:', err);
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.products && Array.isArray(data.products)) this.products = data.products;
        if (data.categories && Array.isArray(data.categories)) this.categories = data.categories;
        if (data.orders && Array.isArray(data.orders)) this.orders = data.orders;
        if (data.users && Array.isArray(data.users)) this.users = data.users;
        if (data.coupons && Array.isArray(data.coupons)) this.coupons = data.coupons;
        if (data.banners && Array.isArray(data.banners)) this.banners = data.banners;
        if (data.reviews && Array.isArray(data.reviews)) this.reviews = data.reviews;
        if (data.settings) this.settings = data.settings;
        if (data.notifications && Array.isArray(data.notifications)) this.notifications = data.notifications;
      }
    } catch (err) {
      console.error('Failed to load DB from disk:', err);
    }
  }

  // --- PRODUCTS ---
  getProducts(params?: ProductFilterParams): { products: Product[]; total: number; brands: string[] } {
    let filtered = [...this.products].filter(p => !p.isArchived);

    // Collect all unique brands for filter options
    const allBrands = Array.from(new Set(this.products.map(p => p.brand))).sort();

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (params?.category && params.category !== 'all') {
      const cat = this.categories.find(c => c.slug === params.category || c.id === params.category);
      if (cat) {
        filtered = filtered.filter(p => p.categoryId === cat.id);
      }
    }

    if (params?.brand && params.brand !== 'all') {
      filtered = filtered.filter(p => p.brand.toLowerCase() === params.brand?.toLowerCase());
    }

    if (params?.minPrice !== undefined) {
      filtered = filtered.filter(p => {
        const effectivePrice = p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price * (1 - p.discount / 100);
        return effectivePrice >= (params.minPrice ?? 0);
      });
    }

    if (params?.maxPrice !== undefined && params.maxPrice > 0) {
      filtered = filtered.filter(p => {
        const effectivePrice = p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price * (1 - p.discount / 100);
        return effectivePrice <= (params.maxPrice ?? Infinity);
      });
    }

    if (params?.minRating !== undefined && params.minRating > 0) {
      filtered = filtered.filter(p => p.rating >= (params.minRating ?? 0));
    }

    if (params?.inStockOnly) {
      filtered = filtered.filter(p => p.quantity > 0 && p.stockStatus === 'IN_STOCK');
    }

    if (params?.onSaleOnly) {
      filtered = filtered.filter(p => p.discount > 0 || p.isFlashSale);
    }

    if (params?.flashSaleOnly) {
      filtered = filtered.filter(p => p.isFlashSale);
    }

    // Sorting
    switch (params?.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => {
          const priceA = a.isFlashSale && a.flashSalePrice ? a.flashSalePrice : a.price * (1 - a.discount / 100);
          const priceB = b.isFlashSale && b.flashSalePrice ? b.flashSalePrice : b.price * (1 - b.discount / 100);
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        filtered.sort((a, b) => {
          const priceA = a.isFlashSale && a.flashSalePrice ? a.flashSalePrice : a.price * (1 - a.discount / 100);
          const priceB = b.isFlashSale && b.flashSalePrice ? b.flashSalePrice : b.price * (1 - b.discount / 100);
          return priceB - priceA;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => (b.soldCount - a.soldCount) || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        break;
    }

    const total = filtered.length;
    const page = params?.page || 1;
    const limit = params?.limit || 100;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    // Attach category object
    const populated = paginated.map(p => ({
      ...p,
      category: this.categories.find(c => c.id === p.categoryId)
    }));

    return { products: populated, total, brands: allBrands };
  }

  getProductById(idOrSlug: string): Product | null {
    const product = this.products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
    if (!product) return null;
    return {
      ...product,
      category: this.categories.find(c => c.id === product.categoryId)
    };
  }

  createProduct(data: Partial<Product>): Product {
    const id = `prod-${Date.now()}`;
    const slug = (data.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newProduct: Product = {
      id,
      name: data.name || 'Untitled Product',
      slug: data.slug || `${slug}-${Math.floor(Math.random() * 1000)}`,
      sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
      description: data.description || '',
      price: Number(data.price) || 0,
      discount: Number(data.discount) || 0,
      quantity: Number(data.quantity) || 0,
      stockStatus: data.quantity && data.quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      brand: data.brand || 'Generic',
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      images: data.images && data.images.length > 0 ? data.images : [data.thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
      featured: Boolean(data.featured),
      isFlashSale: Boolean(data.isFlashSale),
      flashSalePrice: data.flashSalePrice ? Number(data.flashSalePrice) : undefined,
      specifications: data.specifications || {},
      rating: 5.0,
      reviewCount: 0,
      soldCount: 0,
      isArchived: false,
      categoryId: data.categoryId || this.categories[0]?.id || 'cat-mobiles',
      createdAt: new Date().toISOString(),
    };

    const createdWithCategory = {
      ...newProduct,
      category: this.categories.find(c => c.id === newProduct.categoryId),
    };

    this.products.unshift(newProduct);
    this.updateCategoryProductCounts();
    this.saveToDisk();
    return createdWithCategory;
  }

  updateProduct(id: string, data: Partial<Product>): Product | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const existing = this.products[index];
    const updated: Product = {
      ...existing,
      ...data,
      price: data.price !== undefined ? Number(data.price) : existing.price,
      discount: data.discount !== undefined ? Number(data.discount) : existing.discount,
      quantity: data.quantity !== undefined ? Number(data.quantity) : existing.quantity,
      stockStatus: data.quantity !== undefined
        ? (Number(data.quantity) > 5 ? 'IN_STOCK' : Number(data.quantity) > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK')
        : existing.stockStatus,
    };

    this.products[index] = updated;
    this.updateCategoryProductCounts();
    this.saveToDisk();
    return updated;
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    this.updateCategoryProductCounts();
    this.saveToDisk();
    return true;
  }

  toggleArchiveProduct(id: string): Product | null {
    const product = this.products.find(p => p.id === id);
    if (!product) return null;
    product.isArchived = !product.isArchived;
    this.saveToDisk();
    return product;
  }

  // --- CATEGORIES ---
  getCategories(): Category[] {
    this.updateCategoryProductCounts();
    return [...this.categories];
  }

  createCategory(data: Partial<Category>): Category {
    const id = `cat-${Date.now()}`;
    const slug = (data.name || 'category')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newCat: Category = {
      id,
      name: data.name || 'New Category',
      slug: data.slug || slug,
      description: data.description || '',
      icon: data.icon || 'ShoppingBag',
      bannerImage: data.bannerImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      featured: Boolean(data.featured),
      productCount: 0,
    };
    this.categories.push(newCat);
    return newCat;
  }

  updateCategory(id: string, data: Partial<Category>): Category | null {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.categories[index] = { ...this.categories[index], ...data };
    return this.categories[index];
  }

  deleteCategory(id: string): boolean {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.categories.splice(index, 1);
    return true;
  }

  private updateCategoryProductCounts() {
    for (const cat of this.categories) {
      cat.productCount = this.products.filter(p => p.categoryId === cat.id && !p.isArchived).length;
    }
  }

  // --- CART ---
  getCart(userId: string): CartItem[] {
    const items = this.userCarts.get(userId) || [];
    // Ensure product details are fresh
    return items.map(item => {
      const liveProduct = this.products.find(p => p.id === item.productId) || item.product;
      return {
        ...item,
        product: liveProduct
      };
    });
  }

  addToCart(userId: string, productId: string, quantity = 1, variant?: string): CartItem[] {
    const cart = this.getCart(userId);
    const product = this.products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    const existingIndex = cart.findIndex(item => item.productId === productId && item.selectedVariant === variant);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId,
        product,
        quantity,
        selectedVariant: variant,
      });
    }

    this.userCarts.set(userId, cart);
    return this.getCart(userId);
  }

  updateCartItem(userId: string, itemId: string, quantity: number): CartItem[] {
    let cart = this.getCart(userId);
    if (quantity <= 0) {
      cart = cart.filter(item => item.id !== itemId);
    } else {
      const item = cart.find(i => i.id === itemId);
      if (item) {
        item.quantity = quantity;
      }
    }
    this.userCarts.set(userId, cart);
    return this.getCart(userId);
  }

  removeCartItem(userId: string, itemId: string): CartItem[] {
    const cart = this.getCart(userId).filter(item => item.id !== itemId);
    this.userCarts.set(userId, cart);
    return this.getCart(userId);
  }

  clearCart(userId: string): void {
    this.userCarts.set(userId, []);
  }

  // --- WISHLIST ---
  getWishlist(userId: string): WishlistItem[] {
    const items = this.userWishlists.get(userId) || [];
    return items.map(item => ({
      ...item,
      product: this.products.find(p => p.id === item.productId) || item.product
    }));
  }

  toggleWishlist(userId: string, productId: string): { wishlist: WishlistItem[]; isAdded: boolean } {
    const list = this.getWishlist(userId);
    const existingIndex = list.findIndex(item => item.productId === productId);
    let isAdded = false;

    if (existingIndex > -1) {
      list.splice(existingIndex, 1);
      isAdded = false;
    } else {
      const product = this.products.find(p => p.id === productId);
      if (product) {
        list.push({
          id: `wish-${Date.now()}`,
          productId,
          product,
          createdAt: new Date().toISOString(),
        });
        isAdded = true;
      }
    }

    this.userWishlists.set(userId, list);
    return { wishlist: this.getWishlist(userId), isAdded };
  }

  // --- ORDERS ---
  getOrders(userId?: string): Order[] {
    if (userId) {
      return this.orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...this.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | null {
    return this.orders.find(o => o.id === id || o.orderNumber === id) || null;
  }

  createOrder(data: {
    userId: string;
    address: Address;
    items: { productId: string; quantity: number }[];
    paymentMethod: Order['paymentMethod'];
    couponCode?: string;
    customerNotes?: string;
  }): Order {
    const user = this.users.find(u => u.id === data.userId);
    const orderNumber = `BN-${Math.floor(100000 + Math.random() * 900000)}`;

    let subtotal = 0;
    const orderItems = data.items.map(item => {
      const prod = this.products.find(p => p.id === item.productId);
      if (!prod) throw new Error(`Product ${item.productId} not found`);

      const price = prod.isFlashSale && prod.flashSalePrice ? prod.flashSalePrice : prod.price * (1 - prod.discount / 100);
      const total = price * item.quantity;
      subtotal += total;

      // Update soldCount & quantity in real inventory
      prod.soldCount += item.quantity;
      prod.quantity = Math.max(0, prod.quantity - item.quantity);
      if (prod.quantity === 0) prod.stockStatus = 'OUT_OF_STOCK';
      else if (prod.quantity < 5) prod.stockStatus = 'LOW_STOCK';

      return {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: prod.id,
        productName: prod.name,
        productImage: prod.thumbnail,
        productSku: prod.sku,
        price,
        quantity: item.quantity,
        discount: prod.discount,
        total,
      };
    });

    // Calculate coupon
    let discount = 0;
    if (data.couponCode) {
      const coupon = this.coupons.find(c => c.code.toUpperCase() === data.couponCode?.toUpperCase() && c.isActive);
      if (coupon && subtotal >= coupon.minSpend) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else {
          discount = Math.min(coupon.value, subtotal);
        }
        coupon.timesUsed += 1;
      }
    }

    const shippingFee = subtotal >= this.settings.freeShippingAbove ? 0 : this.settings.shippingCharge;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Number(((taxableAmount * this.settings.taxPercentage) / 100).toFixed(2));
    const totalAmount = Number((taxableAmount + shippingFee + tax).toFixed(2));

    const now = new Date().toISOString();
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: data.userId,
      user: user ? { name: user.name, email: user.email, phone: user.phone } : undefined,
      address: data.address,
      items: orderItems,
      subtotal: Number(subtotal.toFixed(2)),
      shippingFee,
      discount: Number(discount.toFixed(2)),
      tax,
      totalAmount,
      status: 'PENDING',
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID',
      trackingCode: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}US`,
      customerNotes: data.customerNotes,
      couponCode: data.couponCode,
      timeline: [
        {
          status: 'PENDING',
          timestamp: now,
          title: 'Order Placed',
          description: `Order successfully placed with ${data.paymentMethod.replace(/_/g, ' ')}.`,
          completed: true,
        }
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.orders.unshift(newOrder);
    this.clearCart(data.userId);

    // Send Notification to user
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: data.userId,
      title: `🛍️ Order Placed (#${orderNumber})`,
      message: `Your order for ${orderItems.length} item(s) totaling $${totalAmount} has been confirmed.`,
      type: 'ORDER',
      isRead: false,
      linkUrl: `/orders/${newOrder.id}`,
      createdAt: now,
    });

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();

    const titles: Record<OrderStatus, { title: string; desc: string }> = {
      PENDING: { title: 'Order Placed', desc: 'Order received by the store.' },
      CONFIRMED: { title: 'Order Confirmed', desc: 'Seller verified items and stock.' },
      PROCESSING: { title: 'Processing', desc: 'Items in picking queue at warehouse.' },
      PACKED: { title: 'Packed & Labeled', desc: 'Package boxed and sealed for courier handover.' },
      SHIPPED: { title: 'Shipped with Carrier', desc: `In transit with tracking #${order.trackingCode}.` },
      OUT_FOR_DELIVERY: { title: 'Out for Delivery', desc: 'Courier driver is on the delivery route.' },
      DELIVERED: { title: 'Delivered', desc: 'Package was successfully delivered.' },
      CANCELLED: { title: 'Order Cancelled', desc: 'Order was cancelled and inventory released.' },
      REFUNDED: { title: 'Refunded', desc: 'Payment was refunded back to original method.' },
    };

    // Add timeline event if not already present
    const existing = order.timeline.find(t => t.status === status);
    if (!existing) {
      order.timeline.push({
        status,
        timestamp: new Date().toISOString(),
        title: titles[status].title,
        description: titles[status].desc,
        completed: true,
      });
    }

    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }

    // Send Notification to user
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: order.userId,
      title: `📦 Order #${order.orderNumber} is now ${status.replace(/_/g, ' ')}`,
      message: titles[status].desc,
      type: 'ORDER',
      isRead: false,
      linkUrl: `/orders/${order.id}`,
      createdAt: new Date().toISOString(),
    });

    return order;
  }

  cancelOrder(orderId: string, userId: string, reason?: string): Order | null {
    const order = this.orders.find(o => o.id === orderId && (o.userId === userId || userId === 'admin'));
    if (!order) return null;

    // Can only cancel if not yet shipped
    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
      throw new Error('Cannot cancel an order that is already shipped or delivered');
    }

    return this.updateOrderStatus(orderId, 'CANCELLED');
  }

  // --- REVIEWS ---
  getReviews(productId?: string): Review[] {
    if (productId) {
      return this.reviews.filter(r => r.productId === productId && r.status === 'APPROVED');
    }
    return [...this.reviews];
  }

  createReview(data: {
    userId: string;
    productId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }): Review {
    const user = this.users.find(u => u.id === data.userId);
    const product = this.products.find(p => p.id === data.productId);
    if (!product) throw new Error('Product not found');

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      userId: data.userId,
      userName: user ? user.name : 'Verified Customer',
      userAvatar: user?.avatar,
      productId: data.productId,
      productName: product.name,
      rating: Math.min(5, Math.max(1, data.rating)),
      title: data.title,
      comment: data.comment,
      images: data.images || [],
      status: 'APPROVED', // Auto-approve for smooth UX, admin can moderate
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    this.reviews.unshift(newReview);

    // Recalculate product rating
    const approvedReviews = this.reviews.filter(r => r.productId === data.productId && r.status === 'APPROVED');
    const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
    product.rating = Number(avgRating.toFixed(1));
    product.reviewCount = approvedReviews.length;

    return newReview;
  }

  moderateReview(reviewId: string, status: 'APPROVED' | 'REJECTED'): Review | null {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) return null;
    review.status = status;
    return review;
  }

  deleteReview(reviewId: string): boolean {
    const index = this.reviews.findIndex(r => r.id === reviewId);
    if (index === -1) return false;
    this.reviews.splice(index, 1);
    return true;
  }

  // --- COUPONS ---
  getCoupons(): Coupon[] {
    return [...this.coupons];
  }

  validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; discountAmount: number; message: string } {
    const coupon = this.coupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive);
    if (!coupon) {
      return { valid: false, discountAmount: 0, message: 'Invalid or expired coupon code' };
    }

    if (new Date(coupon.expiryDate).getTime() < Date.now()) {
      return { valid: false, discountAmount: 0, message: 'This coupon code has expired' };
    }

    if (coupon.timesUsed >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, message: 'Coupon usage limit has been reached' };
    }

    if (subtotal < coupon.minSpend) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimum spend of $${coupon.minSpend.toFixed(2)} required for coupon ${coupon.code}`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = Math.min(coupon.value, subtotal);
    }

    return {
      valid: true,
      coupon,
      discountAmount: Number(discount.toFixed(2)),
      message: `Coupon ${coupon.code} applied! Saved $${discount.toFixed(2)}`,
    };
  }

  createCoupon(data: Partial<Coupon>): Coupon {
    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: (data.code || 'COUPON').toUpperCase().trim(),
      discountType: data.discountType || 'PERCENTAGE',
      value: Number(data.value) || 10,
      minSpend: Number(data.minSpend) || 0,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
      expiryDate: data.expiryDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      usageLimit: Number(data.usageLimit) || 500,
      timesUsed: 0,
      isActive: true,
    };
    this.coupons.unshift(newCoupon);
    return newCoupon;
  }

  toggleCoupon(id: string): Coupon | null {
    const coupon = this.coupons.find(c => c.id === id);
    if (!coupon) return null;
    coupon.isActive = !coupon.isActive;
    return coupon;
  }

  deleteCoupon(id: string): boolean {
    const index = this.coupons.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.coupons.splice(index, 1);
    return true;
  }

  // --- BANNERS ---
  getBanners(): Banner[] {
    return [...this.banners].filter(b => b.isActive).sort((a, b) => a.order - b.order);
  }

  getAllBanners(): Banner[] {
    return [...this.banners].sort((a, b) => a.order - b.order);
  }

  createBanner(data: Partial<Banner>): Banner {
    const newBanner: Banner = {
      id: `ban-${Date.now()}`,
      title: data.title || 'New Banner',
      subtitle: data.subtitle,
      badge: data.badge,
      linkUrl: data.linkUrl || '/catalog',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80',
      type: data.type || 'HERO_SLIDER',
      order: data.order || this.banners.length + 1,
      isActive: true,
      bgColor: data.bgColor || '#1e1b4b',
      accentColor: data.accentColor || '#f97316'
    };
    this.banners.push(newBanner);
    return newBanner;
  }

  updateBanner(id: string, data: Partial<Banner>): Banner | null {
    const index = this.banners.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.banners[index] = { ...this.banners[index], ...data };
    return this.banners[index];
  }

  deleteBanner(id: string): boolean {
    const index = this.banners.findIndex(b => b.id === id);
    if (index === -1) return false;
    this.banners.splice(index, 1);
    return true;
  }

  // --- USERS / CUSTOMERS ---
  getUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | null {
    return this.users.find(u => u.id === id) || null;
  }

  getUserByEmail(email: string): User | null {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  createUser(data: { name: string; email: string; phone?: string; role?: 'CUSTOMER' | 'ADMIN'; avatar?: string }): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      role: data.role || 'CUSTOMER',
      isSuspended: false,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: string, data: Partial<User>): User | null {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    Object.assign(user, data);
    return user;
  }

  toggleSuspendUser(id: string): User | null {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    user.isSuspended = !user.isSuspended;
    return user;
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  // --- ADDRESSES ---
  getUserAddresses(userId: string): Address[] {
    return this.addresses.filter(a => a.userId === userId);
  }

  addAddress(data: Omit<Address, 'id'>): Address {
    if (data.isDefault) {
      this.addresses.filter(a => a.userId === data.userId).forEach(a => { a.isDefault = false; });
    }
    const newAddress: Address = {
      ...data,
      id: `addr-${Date.now()}`,
    };
    this.addresses.push(newAddress);
    return newAddress;
  }

  updateAddress(id: string, data: Partial<Address>): Address | null {
    const addr = this.addresses.find(a => a.id === id);
    if (!addr) return null;
    if (data.isDefault) {
      this.addresses.filter(a => a.userId === addr.userId).forEach(a => { a.isDefault = false; });
    }
    Object.assign(addr, data);
    return addr;
  }

  deleteAddress(id: string): boolean {
    const index = this.addresses.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.addresses.splice(index, 1);
    return true;
  }

  // --- NOTIFICATIONS ---
  getNotifications(userId?: string): NotificationItem[] {
    return this.notifications.filter(n => n.userId === null || n.userId === userId);
  }

  createNotification(data: { title: string; message: string; type: NotificationItem['type']; userId?: string | null; linkUrl?: string }): NotificationItem {
    const item: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: data.userId ?? null,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: false,
      linkUrl: data.linkUrl,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(item);
    return item;
  }

  markNotificationRead(id: string): boolean {
    const item = this.notifications.find(n => n.id === id);
    if (!item) return false;
    item.isRead = true;
    return true;
  }

  markAllNotificationsRead(userId?: string): void {
    this.notifications.filter(n => n.userId === null || n.userId === userId).forEach(n => { n.isRead = true; });
  }

  // --- STORE SETTINGS ---
  getSettings(): StoreSettings {
    return { ...this.settings };
  }

  updateSettings(data: Partial<StoreSettings>): StoreSettings {
    this.settings = { ...this.settings, ...data };
    return { ...this.settings };
  }

  // --- ADMIN DASHBOARD ANALYTICS ---
  getDashboardStats(): DashboardStats {
    const nonCancelledOrders = this.orders.filter(o => o.status !== 'CANCELLED');
    const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = this.orders.length;
    const totalCustomers = this.users.filter(u => u.role === 'CUSTOMER').length;
    const totalProducts = this.products.filter(p => !p.isArchived).length;
    const pendingOrders = this.orders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status)).length;
    const deliveredOrders = this.orders.filter(o => o.status === 'DELIVERED').length;
    const cancelledOrders = this.orders.filter(o => o.status === 'CANCELLED').length;

    // Monthly sales simulation data
    const monthlySales = [
      { month: 'Sep', revenue: 4200, orders: 48 },
      { month: 'Oct', revenue: 5800, orders: 62 },
      { month: 'Nov', revenue: 8400, orders: 95 },
      { month: 'Dec', revenue: 12600, orders: 140 },
      { month: 'Jan', revenue: 9800, orders: 105 },
      { month: 'Feb', revenue: 11450, orders: 128 },
    ];

    // Weekly breakdown
    const weeklyOrders = [
      { day: 'Mon', orders: 18, revenue: 1650 },
      { day: 'Tue', orders: 24, revenue: 2100 },
      { day: 'Wed', orders: 20, revenue: 1800 },
      { day: 'Thu', orders: 29, revenue: 2650 },
      { day: 'Fri', orders: 35, revenue: 3200 },
      { day: 'Sat', orders: 42, revenue: 3950 },
      { day: 'Sun', orders: 38, revenue: 3400 },
    ];

    // Category distribution
    const categoryDistribution = this.categories.map(cat => {
      const prods = this.products.filter(p => p.categoryId === cat.id);
      const val = prods.reduce((sum, p) => sum + (p.price * p.soldCount), 0);
      return {
        name: cat.name,
        count: prods.length,
        value: val || 500,
      };
    });

    const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

    const lowStockProducts = this.products.filter(p => p.quantity < 5 && !p.isArchived);

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      averageOrderValue,
      revenueGrowth: 18.4,
      ordersGrowth: 12.8,
      monthlySales,
      weeklyOrders,
      categoryDistribution,
      recentOrders: this.orders.slice(0, 6),
      lowStockProducts,
    };
  }
}

export const dbStore = new DataStore();
