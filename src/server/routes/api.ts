import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { OrderStatus } from '../../types';
import { requireAdmin } from '../middleware/requireAdmin';
import { adminAuth, db } from '../firebase-admin';

export const apiRouter = Router();

// ==================== AUTH ROUTES ====================
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = dbStore.getUserByEmail(email);
    if (!user) {
      // For demo convenience, allow quick sign in as Customer or Admin
      if (email.includes('admin')) {
        user = dbStore.createUser({
          name: 'Administrator',
          email,
          role: 'ADMIN',
        });
      } else {
        user = dbStore.createUser({
          name: email.split('@')[0].replace('.', ' '),
          email,
          role: 'CUSTOMER',
        });
      }
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    // Return user with simulated JWT session token
    const token = `token_${user.id}_${Date.now()}`;
    return res.json({
      user,
      token,
      refreshToken: `ref_${user.id}_${Date.now()}`,
      message: 'Login successful',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Authentication error' });
  }
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existing = dbStore.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Force CUSTOMER role — admins are managed via Firebase + Firestore whitelist
    const user = dbStore.createUser({
      name,
      email,
      phone,
      role: 'CUSTOMER',
    });

    const token = `token_${user.id}_${Date.now()}`;
    return res.status(201).json({
      user,
      token,
      message: 'Account created successfully',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Registration error' });
  }
});

apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  return res.json({ message: `Password reset instructions have been sent to ${email}` });
});

// ==================== ADMIN LOGIN (Firebase Google Sign-In) ====================
apiRouter.post('/auth/admin-login', async (req: Request, res: Response) => {
  try {
    if (!adminAuth || !db) {
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Firebase Admin SDK is not initialized. Please configure FIREBASE_SERVICE_ACCOUNT environment variable.',
      });
    }

    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID token is required' });
    }

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!email) {
      return res.status(401).json({ error: 'Google account does not have an email address.' });
    }

    // Check if email is in the Firestore admin whitelist
    const adminDoc = await db.collection('velorastoreadmins').doc(email).get();

    if (!adminDoc.exists) {
      return res.status(403).json({
        error: 'Access Denied',
        message: `The email ${email} is not authorized to access the admin dashboard.`,
      });
    }

    // Find or create admin user in our local store
    let user = dbStore.getUserByEmail(email);
    if (!user) {
      user = dbStore.createUser({
        name: decodedToken.name || 'Administrator',
        email,
        role: 'ADMIN',
      });
    } else if (user.role !== 'ADMIN') {
      user = dbStore.updateUser(user.id, { role: 'ADMIN' })!;
    }

    return res.json({
      user: {
        ...user,
        avatar: decodedToken.picture || user.avatar,
        name: decodedToken.name || user.name,
      },
      isAdmin: true,
      message: 'Admin login successful',
    });
  } catch (error: any) {
    console.error('Admin login error:', error.message);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired. Please sign in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
});

apiRouter.put('/auth/profile', (req: Request, res: Response) => {
  const { userId, name, phone, avatar } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });
  const updated = dbStore.updateUser(userId, { name, phone, avatar });
  if (!updated) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: updated, message: 'Profile updated' });
});

// ==================== PRODUCT ROUTES ====================
apiRouter.get('/products', (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      onSaleOnly,
      flashSaleOnly,
      sortBy,
      page,
      limit,
    } = req.query;

    const result = dbStore.getProducts({
      search: search as string,
      category: category as string,
      brand: brand as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      inStockOnly: inStockOnly === 'true',
      onSaleOnly: onSaleOnly === 'true',
      flashSaleOnly: flashSaleOnly === 'true',
      sortBy: sortBy as any,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/products/:idOrSlug', (req: Request, res: Response) => {
  const product = dbStore.getProductById(req.params.idOrSlug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const reviews = dbStore.getReviews(product.id);
  return res.json({ product, reviews });
});

apiRouter.post('/products', requireAdmin, (req: Request, res: Response) => {
  try {
    const product = dbStore.createProduct(req.body);
    return res.status(201).json(product);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

apiRouter.put('/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const product = dbStore.updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

apiRouter.delete('/products/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = dbStore.deleteProduct(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Product not found' });
  return res.json({ success: true, message: 'Product deleted' });
});

apiRouter.patch('/products/:id/archive', requireAdmin, (req: Request, res: Response) => {
  const product = dbStore.toggleArchiveProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  return res.json(product);
});

// ==================== CATEGORIES ROUTES ====================
apiRouter.get('/categories', (_req: Request, res: Response) => {
  return res.json(dbStore.getCategories());
});

apiRouter.post('/categories', requireAdmin, (req: Request, res: Response) => {
  try {
    const category = dbStore.createCategory(req.body);
    return res.status(201).json(category);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

apiRouter.put('/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const cat = dbStore.updateCategory(req.params.id, req.body);
  if (!cat) return res.status(404).json({ error: 'Category not found' });
  return res.json(cat);
});

apiRouter.delete('/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = dbStore.deleteCategory(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Category not found' });
  return res.json({ success: true });
});

// ==================== CART ROUTES ====================
apiRouter.get('/cart', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-cust-1';
  return res.json(dbStore.getCart(userId));
});

apiRouter.post('/cart', (req: Request, res: Response) => {
  const { userId = 'user-cust-1', productId, quantity = 1, variant } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId is required' });
  try {
    const cart = dbStore.addToCart(userId, productId, quantity, variant);
    return res.json(cart);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

apiRouter.put('/cart/:itemId', (req: Request, res: Response) => {
  const { userId = 'user-cust-1', quantity } = req.body;
  const cart = dbStore.updateCartItem(userId, req.params.itemId, quantity);
  return res.json(cart);
});

apiRouter.delete('/cart/:itemId', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-cust-1';
  const cart = dbStore.removeCartItem(userId, req.params.itemId);
  return res.json(cart);
});

apiRouter.delete('/cart', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-cust-1';
  dbStore.clearCart(userId);
  return res.json([]);
});

// ==================== WISHLIST ROUTES ====================
apiRouter.get('/wishlist', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-cust-1';
  return res.json(dbStore.getWishlist(userId));
});

apiRouter.post('/wishlist/toggle', (req: Request, res: Response) => {
  const { userId = 'user-cust-1', productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId required' });
  const result = dbStore.toggleWishlist(userId, productId);
  return res.json(result);
});

// ==================== ORDERS ROUTES ====================
apiRouter.get('/orders', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  return res.json(dbStore.getOrders(userId));
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const order = dbStore.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  return res.json(order);
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const { userId = 'user-cust-1', address, items, paymentMethod, couponCode, customerNotes } = req.body;
    if (!address || !items || items.length === 0) {
      return res.status(400).json({ error: 'Address and items are required' });
    }
    const order = dbStore.createOrder({
      userId,
      address,
      items,
      paymentMethod: paymentMethod || 'PAYPAL',
      couponCode,
      customerNotes,
    });
    return res.status(201).json(order);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

apiRouter.patch('/orders/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  const updated = dbStore.updateOrderStatus(req.params.id, status as OrderStatus);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  return res.json(updated);
});

apiRouter.patch('/orders/:id/tracking', (req: Request, res: Response) => {
  const { trackingNumber, trackingCode } = req.body;
  const code = trackingNumber || trackingCode;
  if (!code) return res.status(400).json({ error: 'Tracking code is required' });
  const order = dbStore.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.trackingCode = code;
  order.trackingNumber = code;
  return res.json(order);
});

apiRouter.post('/orders/:id/cancel', (req: Request, res: Response) => {
  const { userId = 'user-cust-1', reason } = req.body;
  try {
    const updated = dbStore.cancelOrder(req.params.id, userId, reason);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order: updated, message: 'Order has been cancelled successfully' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// ==================== COUPONS ROUTES ====================
apiRouter.get('/coupons', (_req: Request, res: Response) => {
  return res.json(dbStore.getCoupons());
});

apiRouter.post('/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });
  const result = dbStore.validateCoupon(code, Number(subtotal) || 0);
  return res.json(result);
});

apiRouter.post('/coupons', requireAdmin, (req: Request, res: Response) => {
  try {
    const coupon = dbStore.createCoupon(req.body);
    return res.status(201).json(coupon);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

apiRouter.patch('/coupons/:id/toggle', requireAdmin, (req: Request, res: Response) => {
  const coupon = dbStore.toggleCoupon(req.params.id);
  if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
  return res.json(coupon);
});

apiRouter.delete('/coupons/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = dbStore.deleteCoupon(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Coupon not found' });
  return res.json({ success: true });
});

// ==================== REVIEWS ROUTES ====================
apiRouter.get('/reviews', (req: Request, res: Response) => {
  const productId = req.query.productId as string;
  return res.json(dbStore.getReviews(productId));
});

apiRouter.post('/reviews', (req: Request, res: Response) => {
  try {
    const { userId = 'user-cust-1', productId, rating, title, comment, images } = req.body;
    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({ error: 'Missing required review fields' });
    }
    const review = dbStore.createReview({ userId, productId, rating: Number(rating), title, comment, images });
    return res.status(201).json(review);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

apiRouter.patch('/reviews/:id/moderate', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  const review = dbStore.moderateReview(req.params.id, status);
  if (!review) return res.status(404).json({ error: 'Review not found' });
  return res.json(review);
});

apiRouter.delete('/reviews/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = dbStore.deleteReview(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Review not found' });
  return res.json({ success: true });
});

// ==================== BANNERS ROUTES ====================
apiRouter.get('/banners', (req: Request, res: Response) => {
  const all = req.query.all === 'true';
  return res.json(all ? dbStore.getAllBanners() : dbStore.getBanners());
});

apiRouter.post('/banners', requireAdmin, (req: Request, res: Response) => {
  const banner = dbStore.createBanner(req.body);
  return res.status(201).json(banner);
});

apiRouter.put('/banners/:id', requireAdmin, (req: Request, res: Response) => {
  const banner = dbStore.updateBanner(req.params.id, req.body);
  if (!banner) return res.status(404).json({ error: 'Banner not found' });
  return res.json(banner);
});

apiRouter.delete('/banners/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = dbStore.deleteBanner(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Banner not found' });
  return res.json({ success: true });
});

// ==================== ADDRESSES ROUTES ====================
apiRouter.get('/addresses', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-cust-1';
  return res.json(dbStore.getUserAddresses(userId));
});

apiRouter.post('/addresses', (req: Request, res: Response) => {
  const { userId = 'user-cust-1', title, fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;
  if (!fullName || !phone || !street || !city || !postalCode) {
    return res.status(400).json({ error: 'Required address fields missing' });
  }
  const addr = dbStore.addAddress({ userId, title: title || 'Home', fullName, phone, street, city, state, postalCode, country: country || 'United States', isDefault: Boolean(isDefault) });
  return res.status(201).json(addr);
});

apiRouter.put('/addresses/:id', (req: Request, res: Response) => {
  const addr = dbStore.updateAddress(req.params.id, req.body);
  if (!addr) return res.status(404).json({ error: 'Address not found' });
  return res.json(addr);
});

apiRouter.patch('/addresses/:id/default', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-cust-1';
  const addrs = dbStore.getUserAddresses(userId);
  addrs.forEach(a => {
    a.isDefault = a.id === req.params.id;
  });
  return res.json(addrs);
});

apiRouter.delete('/addresses/:id', (req: Request, res: Response) => {
  const ok = dbStore.deleteAddress(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Address not found' });
  return res.json({ success: true });
});

// ==================== NOTIFICATIONS ROUTES ====================
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  return res.json(dbStore.getNotifications(userId));
});

apiRouter.post('/notifications', (req: Request, res: Response) => {
  const { title, message, type = 'PROMOTIONAL', userId, linkUrl } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Title and message are required' });
  const notif = dbStore.createNotification({ title, message, type, userId, linkUrl });
  return res.status(201).json(notif);
});

apiRouter.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const ok = dbStore.markNotificationRead(req.params.id);
  return res.json({ success: ok });
});

apiRouter.post('/notifications/read-all', (req: Request, res: Response) => {
  const { userId } = req.body;
  dbStore.markAllNotificationsRead(userId);
  return res.json({ success: true });
});

// ==================== SETTINGS ROUTES ====================
apiRouter.get('/settings', (_req: Request, res: Response) => {
  return res.json(dbStore.getSettings());
});

apiRouter.put('/settings', requireAdmin, (req: Request, res: Response) => {
  const settings = dbStore.updateSettings(req.body);
  return res.json(settings);
});

// ==================== ADMIN SPECIFIC ROUTES ====================
apiRouter.get('/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  return res.json(dbStore.getDashboardStats());
});

apiRouter.get('/admin/customers', requireAdmin, (_req: Request, res: Response) => {
  const users = dbStore.getUsers().filter(u => u.role === 'CUSTOMER');
  // Enrich with purchase history summaries
  const enriched = users.map(user => {
    const orders = dbStore.getOrders(user.id);
    const totalSpent = orders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      ...user,
      orderCount: orders.length,
      totalSpent: Number(totalSpent.toFixed(2)),
      lastOrderDate: orders[0]?.createdAt || null,
      orders,
    };
  });
  return res.json(enriched);
});

apiRouter.patch('/admin/customers/:id/role', requireAdmin, (req: Request, res: Response) => {
  const { role } = req.body;
  const user = dbStore.updateUser(req.params.id, { role });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(user);
});

apiRouter.patch('/admin/customers/:id/suspend', requireAdmin, (req: Request, res: Response) => {
  const user = dbStore.toggleSuspendUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'Customer not found' });
  return res.json(user);
});

apiRouter.delete('/admin/customers/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = dbStore.deleteUser(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Customer not found' });
  return res.json({ success: true });
});
