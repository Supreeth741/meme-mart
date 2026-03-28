'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await adminLogin(username, password);
      toast.success('Admin logged in');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-8 md:p-10 backdrop-blur-sm shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-2xl">admin_panel_settings</span>
            </div>
            <h1 className="text-2xl font-extrabold">Admin Login</h1>
            <p className="text-slate-400 text-sm mt-1">Access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-1 block">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full h-11 bg-slate-800/60 border border-slate-700 rounded-xl px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-11 bg-slate-800/60 border border-slate-700 rounded-xl px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
