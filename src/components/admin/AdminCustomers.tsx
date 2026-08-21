import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, ShieldAlert, Trash2, Mail, Phone } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { User } from '../../types';
import { formatDateTime } from '../../lib/utils';

export const AdminCustomers: React.FC = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const list = await api.getUsers();
      setUsers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    try {
      await api.updateUserRole(userId, nextRole);
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: nextRole as any } : u))
      );
      success('Role Updated', `User role changed to ${nextRole}`);
    } catch (err: any) {
      error('Failed to change role', err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this user account?')) return;
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      success('User Deleted');
    } catch (err: any) {
      error('Delete failed', err.message);
    }
  };

  const filteredUsers = users.filter(u => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Customer & User Accounts
        </h1>
        <p className="text-zinc-500">
          Manage buyer profiles, role permissions, and access privileges
        </p>
      </div>

      <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs dark:text-white focus:outline-none"
          />
        </div>
        <span className="text-zinc-400 font-semibold">{filteredUsers.length} total members</span>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Role Access</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">{u.name}</p>
                      <span className="text-[10px] text-zinc-400 font-mono">ID: {u.id}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="space-y-0.5">
                    <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-zinc-400" /> {u.email}
                    </span>
                    {u.phone && (
                      <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3 text-zinc-400" /> {u.phone}
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <button
                    onClick={() => handleRoleToggle(u.id, u.role)}
                    className={`px-2.5 py-1 rounded-full font-bold text-[10px] flex items-center gap-1 transition-all ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-200'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200'
                    }`}
                    title="Click to toggle Role"
                  >
                    {u.role === 'ADMIN' ? (
                      <>
                        <ShieldCheck className="w-3 h-3" /> System Admin
                      </>
                    ) : (
                      <>
                        <Users className="w-3 h-3" /> Customer
                      </>
                    )}
                  </button>
                </td>

                <td className="py-3 px-4 text-zinc-400">
                  {formatDateTime(u.createdAt)}
                </td>

                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Delete user"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
