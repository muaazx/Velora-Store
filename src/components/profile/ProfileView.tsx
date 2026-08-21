import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Mail, Plus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { Address } from '../../types';

export const ProfileView: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState(user?.name || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newCountry, setNewCountry] = useState('United States');

  const userId = user?.id || 'user-cust-1';

  useEffect(() => {
    const fetchAddrs = async () => {
      try {
        const list = await api.getAddresses(userId);
        setAddresses(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAddrs();
  }, [userId]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateUserProfile({ name, phone, avatar });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
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
      setIsAddressModalOpen(false);
      setNewStreet('');
      setNewCity('');
      setNewPostalCode('');
      success('Address Saved', 'New delivery address added');
    } catch (err: any) {
      error('Failed to add address', err.message);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await api.deleteAddress(userId, id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      success('Address Removed');
    } catch (err: any) {
      error('Delete failed', err.message);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await api.setDefaultAddress(userId, id);
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
      success('Default Address Updated');
    } catch (err: any) {
      error('Update failed', err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 text-xs">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Account Settings & Address Book
        </h1>
        <p className="text-zinc-500">
          Manage your personal details, credentials, and saved delivery locations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Details Card (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
          <div className="flex items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user?.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-orange-500 shadow-md"
            />
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">{user?.name}</h3>
              <p className="text-zinc-400 text-xs">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
                <ShieldCheck className="w-3 h-3" />
                {user?.role} Account
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email Address (Verified)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Profile Avatar URL
              </label>
              <input
                type="url"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Address Book Management (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">Saved Delivery Addresses</h3>
              <p className="text-zinc-400 text-xs">Used automatically for 1-click express checkout</p>
            </div>
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900 rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-orange-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Address
            </button>
          </div>

          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                <MapPin className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-zinc-500">No saved addresses</p>
              </div>
            ) : (
              addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-xl border-2 space-y-2 transition-all ${
                    addr.isDefault
                      ? 'border-orange-500 bg-orange-50/20 dark:bg-orange-950/10'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 rounded font-bold text-[10px] flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Default Address
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-zinc-600 dark:text-zinc-400">{addr.street}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {addr.city}, {addr.state} {addr.postalCode} • {addr.country}
                  </p>
                  <p className="text-zinc-400 text-[11px] pt-1">Phone: {addr.phone}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddressModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 z-10 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">Add Delivery Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={e => setNewFullName(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone Number</label>
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
                <label className="block font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street, apartment, suite"
                  value={newStreet}
                  onChange={e => setNewStreet(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newState}
                    onChange={e => setNewState(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Zip Code</label>
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
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg shadow-sm"
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
