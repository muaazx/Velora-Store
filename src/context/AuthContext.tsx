import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api, setAdminToken } from '../lib/api';
import { useToast } from './ToastContext';
import {
  signInWithGooglePopup,
  firebaseSignOut,
  onFirebaseAuthChange,
  getFirebaseIdToken,
  type FirebaseUser,
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isAdminAuthenticated: boolean;
  isCustomer: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: { name: string; email: string; phone?: string }) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  adminLogin: () => Promise<boolean>;
  adminLogout: () => void;
  updateUserProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CUSTOMER: User = {
  id: 'user-cust-1',
  email: 'alex.morgan@example.com',
  name: 'Alex Morgan',
  phone: '+1 (415) 555-0192',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  role: 'CUSTOMER',
  isSuspended: false,
  createdAt: '2025-01-15T10:30:00.000Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bn_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bn_token') || null);
  const [isLoading, setIsLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Firebase admin auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminFirebaseUser, setAdminFirebaseUser] = useState<FirebaseUser | null>(null);

  const { success, error, info } = useToast();

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('bn_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bn_user');
    }
  }, [user]);

  // Listen for Firebase auth state changes to restore admin sessions
  useEffect(() => {
    const unsubscribe = onFirebaseAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          // Verify with our backend
          const res = await api.adminLogin(idToken);
          if (res.isAdmin) {
            setAdminFirebaseUser(firebaseUser);
            setIsAdminAuthenticated(true);
            setAdminToken(idToken);
            setUser(res.user);
          }
        } catch {
          // Token invalid or email not whitelisted — clear Firebase session
          setAdminFirebaseUser(null);
          setIsAdminAuthenticated(false);
          setAdminToken(null);
          await firebaseSignOut();
        }
      } else {
        setAdminFirebaseUser(null);
        setIsAdminAuthenticated(false);
        setAdminToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Periodically refresh the admin token before it expires (Firebase tokens expire in 1 hour)
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      const freshToken = await getFirebaseIdToken();
      if (freshToken) {
        setAdminToken(freshToken);
      }
    }, 45 * 60 * 1000); // Refresh every 45 minutes

    return () => clearInterval(refreshInterval);
  }, [isAdminAuthenticated]);

  const openAuthModal = (tab: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  // Customer login (existing demo flow)
  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('bn_token', res.token);
      success('Welcome back!', `Logged in as ${res.user.name}`);
      closeAuthModal();
      return true;
    } catch (err: any) {
      error('Login failed', err.message || 'Check your credentials');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Customer registration (role is always CUSTOMER now)
  const register = async (data: { name: string; email: string; phone?: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('bn_token', res.token);
      success('Account created!', `Welcome to Velora Store, ${res.user.name}`);
      closeAuthModal();
      return true;
    } catch (err: any) {
      error('Registration failed', err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Customer Google Login
  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { user: firebaseUser } = await signInWithGooglePopup();
      if (!firebaseUser.email) {
        throw new Error('Google account is missing an email address.');
      }

      let res;
      try {
        res = await api.login(firebaseUser.email);
      } catch {
        res = await api.register({
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
        });
      }

      const updatedUser: User = {
        ...res.user,
        name: firebaseUser.displayName || res.user.name,
        avatar: firebaseUser.photoURL || res.user.avatar,
      };

      setUser(updatedUser);
      setToken(res.token);
      localStorage.setItem('bn_token', res.token);
      success('Welcome!', `Signed in as ${updatedUser.name}`);
      closeAuthModal();
      return true;
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setIsLoading(false);
        return false;
      }
      error('Google Sign-In Failed', err.message || 'Could not authenticate with Google.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin login via Firebase Google Sign-In
  const adminLogin = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Trigger Google Sign-In popup
      const { user: firebaseUser, idToken } = await signInWithGooglePopup();

      // Verify with our backend (checks Firestore whitelist)
      const res = await api.adminLogin(idToken);

      if (res.isAdmin) {
        setAdminFirebaseUser(firebaseUser);
        setIsAdminAuthenticated(true);
        setAdminToken(idToken);
        setUser(res.user);
        success('Admin Access Granted', `Welcome, ${res.user.name}`);
        return true;
      } else {
        // Should not reach here since backend throws on non-admin
        await firebaseSignOut();
        error('Access Denied', 'Your Google account is not authorized for admin access.');
        return false;
      }
    } catch (err: any) {
      // If the popup was closed by user, don't show error
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setIsLoading(false);
        return false;
      }

      // Clear any partial Firebase session
      await firebaseSignOut();
      setAdminFirebaseUser(null);
      setIsAdminAuthenticated(false);
      setAdminToken(null);

      const message = err.message || 'Failed to authenticate as admin.';
      error('Admin Login Failed', message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin logout (separate from customer logout)
  const adminLogout = async () => {
    await firebaseSignOut();
    setAdminFirebaseUser(null);
    setIsAdminAuthenticated(false);
    setAdminToken(null);

    // Clear user session
    setUser(null);
    setToken(null);
    localStorage.removeItem('bn_user');
    localStorage.removeItem('bn_token');
    info('Admin Session Ended', 'You have been signed out of the admin console.');
  };

  // Customer logout
  const logout = () => {
    // Also clear admin session if active
    if (isAdminAuthenticated) {
      firebaseSignOut();
      setAdminFirebaseUser(null);
      setIsAdminAuthenticated(false);
      setAdminToken(null);
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem('bn_user');
    localStorage.removeItem('bn_token');
    info('Logged out', 'You have been signed out of your session.');
  };

  const updateUserProfile = async (data: { name?: string; phone?: string; avatar?: string }) => {
    if (!user) return;
    try {
      const res = await api.updateProfile({ userId: user.id, ...data });
      setUser(res.user);
      success('Profile updated', 'Your personal details have been saved.');
    } catch (err: any) {
      error('Update failed', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin: isAdminAuthenticated,
        isAdminAuthenticated,
        isCustomer: !isAdminAuthenticated && user?.role === 'CUSTOMER',
        isLoading,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        logout,
        adminLogin,
        adminLogout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
