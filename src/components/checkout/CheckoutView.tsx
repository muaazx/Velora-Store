import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  MapPin,
  Plus,
  CheckCircle2,
  ArrowRight,
  Lock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../lib/api';
import { Address, PaymentMethod } from '../../types';

export const CheckoutView: React.FC = () => {
  const { cart, subtotal, shippingFee, discount, tax, total, appliedCoupon, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const { setActiveView, setSelectedOrderId } = useStore();
  const { success, error } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PAYPAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState<any>(null);

  // Address modal form state
  const [isNewAddressOpen, setIsNewAddressOpen] = useState(false);
  const [newFullName, setNewFullName] = useState(user?.name || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newCountry, setNewCountry] = useState('United States');

  // Interactive Payment simulation states
  const [payPalEmail, setPayPalEmail] = useState(user?.email || 'alex.morgan@example.com');
  const [payoneerId, setPayoneerId] = useState('PAY-88492041');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('382');

  const userId = user?.id || 'user-cust-1';

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const list = await api.getAddresses(userId);
        setAddresses(list);
        const def = list.find(a => a.isDefault) || list[0];
        if (def) setSelectedAddressId(def.id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAddresses();
  }, [userId]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await api.addAddress(userId, {
        fullName: newFullName,
        phone: newPhone,
        street: newStreet,
        city: newCity,
        state: newState,
        postalCode: newPostalCode,
        country: newCountry,
        isDefault: addresses.length === 0,
      });
      setAddresses(prev => [...prev, added]);
      setSelectedAddressId(added.id);
      setIsNewAddressOpen(false);
      success('Address Saved', 'New shipping address added successfully');
    } catch (err: any) {
      error('Failed to save address', err.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!selectedAddressId) {
      error('Shipping Address Required', 'Please select or add a shipping address');
      return;
    }

    const selectedAddr = addresses.find(a => a.id === selectedAddressId);
    if (!selectedAddr) {
      error('Please choose a valid address');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        userId: user.id,
        items: cart.map(item => {
          const price = item.product.isFlashSale && item.product.flashSalePrice
            ? item.product.flashSalePrice
            : item.product.price * (1 - item.product.discount / 100);
          return {
            productId: item.productId,
            productName: item.product.name,
            productImage: item.product.thumbnail,
            quantity: item.quantity,
            price,
            variant: item.variant,
          };
        }),
        address: selectedAddr,
        shippingAddress: selectedAddr,
        paymentMethod,
        subtotal,
        shippingFee,
        discount,
        tax,
        total,
        couponCode: appliedCoupon?.code,
      };

      const createdOrder = await api.createOrder(orderPayload);
      await clearCart();
      setOrderPlacedSuccess(createdOrder);
      success('Order Placed Successfully!', `Order #${createdOrder.orderNumber} confirmed.`);
    } catch (err: any) {
      error('Order submission failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Success Celebration Screen
  if (orderPlacedSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            Thank You! Your Order is Confirmed
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Order Reference: <span className="font-bold text-orange-600">{orderPlacedSuccess.orderNumber}</span>
          </p>
          <p className="text-xs text-zinc-400">
            We've sent an order confirmation receipt to <strong className="text-zinc-700 dark:text-zinc-300">{user?.email}</strong>
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-left text-xs space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-500">Estimated Delivery Date</span>
            <span className="font-bold text-zinc-900 dark:text-white">2-3 Business Days</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-500">Payment Method</span>
            <span className="font-bold text-zinc-900 dark:text-white">{orderPlacedSuccess.paymentMethod} (PAID)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Total Paid</span>
            <span className="text-base font-black text-orange-600">{formatCurrency(orderPlacedSuccess.total)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setSelectedOrderId(orderPlacedSuccess.id);
              setActiveView('order-detail');
            }}
            className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Live Order Status</span>
          </button>
          <button
            onClick={() => setActiveView('catalog')}
            className="w-full sm:w-auto px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 font-bold text-xs sm:text-sm rounded-xl transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto" />
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">No Items to Checkout</h2>
        <button
          onClick={() => setActiveView('catalog')}
          className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs text-zinc-500">
          Complete your delivery destination and select payment provider
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Address + Payment Method (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Shipping Address Selection */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 space-y-4 shadow-xs text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h2 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                  Shipping Destination
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsNewAddressOpen(true)}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Address
              </button>
            </div>

            {/* Address Cards Grid */}
            {addresses.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                <MapPin className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-xs text-zinc-500">No delivery addresses saved yet.</p>
                <button
                  onClick={() => setIsNewAddressOpen(true)}
                  className="px-3 py-1.5 bg-orange-500 text-white font-bold text-xs rounded-lg"
                >
                  Create Shipping Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-zinc-900 dark:text-white">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-[10px] rounded font-semibold text-zinc-600 dark:text-zinc-400">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-snug">{addr.street}</p>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                    <p className="text-zinc-400 text-[11px] mt-1">{addr.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Payment Provider */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 space-y-4 shadow-xs text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xs">
                2
              </div>
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                Select Payment Method
              </h2>
            </div>

            {/* Payment Method Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* PayPal */}
              <button
                type="button"
                onClick={() => setPaymentMethod('PAYPAL')}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'PAYPAL'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 font-bold text-blue-700 dark:text-blue-300'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span>PayPal</span>
              </button>

              {/* Payoneer */}
              <button
                type="button"
                onClick={() => setPaymentMethod('PAYONEER')}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'PAYONEER'
                    ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 font-bold text-orange-700 dark:text-orange-300'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span>Payoneer</span>
              </button>

              {/* Credit Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold text-emerald-700 dark:text-emerald-300'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span>Credit Card</span>
              </button>

              {/* Cash On Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 font-bold text-purple-700 dark:text-purple-300'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600">
                  <Truck className="w-5 h-5" />
                </div>
                <span>Cash on Delivery</span>
              </button>
            </div>

            {/* Interactive Payment Configuration Area */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
              {paymentMethod === 'PAYPAL' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold text-xs">
                    <span>PayPal Instant Checkout Integration</span>
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-zinc-500 text-xs">
                    You will be securely routed through the PayPal payment gateway to complete authorization.
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      PayPal Account Email
                    </label>
                    <input
                      type="email"
                      value={payPalEmail}
                      onChange={e => setPayPalEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-medium dark:text-white"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'PAYONEER' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-orange-600 dark:text-orange-400 font-bold text-xs">
                    <span>Payoneer Commercial Account</span>
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-zinc-500 text-xs">
                    Seamless cross-border B2B and direct consumer payments via Payoneer Escrow.
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Payoneer Payee ID / Email
                    </label>
                    <input
                      type="text"
                      value={payoneerId}
                      onChange={e => setPayoneerId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-medium dark:text-white"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'CREDIT_CARD' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-bold text-xs text-zinc-800 dark:text-zinc-200">
                    <span>Card Information</span>
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'CASH_ON_DELIVERY' && (
                <div className="space-y-2">
                  <span className="font-bold text-xs text-purple-700 dark:text-purple-300">
                    Cash on Delivery (Pay at Doorstep)
                  </span>
                  <p className="text-zinc-500 text-xs">
                    Please keep exact cash ready upon arrival of the delivery courier. An OTP verification code will be sent to your phone.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Form: Order Summary & Place Order Button (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 space-y-4 shadow-xs text-xs">
            <h3 className="font-black text-sm text-zinc-900 dark:text-white uppercase tracking-wider pb-3 border-b border-zinc-100 dark:border-zinc-800">
              Items in Order ({cart.length})
            </h3>

            {/* List preview */}
            <div className="max-h-52 overflow-y-auto space-y-2.5 divide-y divide-zinc-100 dark:divide-zinc-800 pr-1">
              {cart.map(item => {
                const effPrice = item.product.isFlashSale && item.product.flashSalePrice
                  ? item.product.flashSalePrice
                  : item.product.price * (1 - item.product.discount / 100);
                return (
                  <div key={item.id} className="pt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={item.product.thumbnail} alt={item.product.name} className="w-9 h-9 rounded object-cover" />
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate text-[11px]">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-zinc-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {formatCurrency(effPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>Voucher Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatCurrency(shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>Tax (7.5%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-700 text-sm font-black text-zinc-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-lg text-orange-600 dark:text-orange-400">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authorizing Payment...
                </span>
              ) : (
                <>
                  <span>Place Order & Pay {formatCurrency(total)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Full Buyer Protection Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Address Modal */}
      {isNewAddressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsNewAddressOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 z-10 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Add New Delivery Address
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={e => setNewFullName(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                  value={newStreet}
                  onChange={e => setNewStreet(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newState}
                    onChange={e => setNewState(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={newPostalCode}
                    onChange={e => setNewPostalCode(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewAddressOpen(false)}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
