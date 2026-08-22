import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Phone, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalTab, closeAuthModal, openAuthModal, login, register, loginWithGoogle, isLoading } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authModalTab === 'login') {
      await login(email, password);
    } else if (authModalTab === 'register') {
      await register({ name, email, phone });
    } else {
      success('Password Reset', `If an account exists for ${email}, a reset link was sent.`);
      closeAuthModal();
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('alex.morgan@example.com');
    setPassword('customer123');
    setName('Alex Morgan');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white relative">
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/25 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold tracking-tight text-lg">Velora Store</span>
            </div>
            <h2 className="text-xl font-bold">
              {authModalTab === 'login' && 'Welcome Back to Velora Store'}
              {authModalTab === 'register' && 'Create Your Customer Account'}
              {authModalTab === 'forgot' && 'Reset Your Password'}
            </h2>
            <p className="text-orange-100 text-xs mt-1">
              {authModalTab === 'login' && 'Sign in to access your orders, wishlist, and exclusive discounts'}
              {authModalTab === 'register' && 'Join thousands of happy shoppers for flash sales and rapid delivery'}
              {authModalTab === 'forgot' && 'Enter your email address to receive reset instructions'}
            </p>
          </div>

          {/* Quick Demo Pre-fill Bar */}
          <div className="bg-zinc-100 dark:bg-zinc-800/80 px-6 py-2.5 flex items-center justify-between text-xs border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Quick Demo:</span>
            <button
              type="button"
              onClick={() => handleQuickDemoFill()}
              className="px-2 py-1 bg-white dark:bg-zinc-700 rounded shadow-xs text-orange-600 dark:text-orange-400 font-medium hover:bg-orange-50 dark:hover:bg-zinc-600 transition-colors"
            >
              Fill Demo Customer
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Google Sign-In Option */}
            {authModalTab !== 'forgot' && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-750 shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-zinc-200 dark:border-zinc-700 w-full" />
                  <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider absolute">
                    or email
                  </span>
                </div>
              </div>
            )}

            {authModalTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex.morgan@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                />
              </div>
            </div>

            {authModalTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (415) 555-0192"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>
              </div>
            )}

            {authModalTab !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  {authModalTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => openAuthModal('forgot')}
                      className="text-xs text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>
              </div>
            )}



            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : authModalTab === 'login' ? (
                'Sign In to Account'
              ) : authModalTab === 'register' ? (
                'Create Account'
              ) : (
                'Send Reset Instructions'
              )}
            </button>

            {/* Footer switcher */}
            <div className="pt-2 text-center text-xs text-zinc-600 dark:text-zinc-400">
              {authModalTab === 'login' ? (
                <p>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => openAuthModal('register')}
                    className="font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    Register Now
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
