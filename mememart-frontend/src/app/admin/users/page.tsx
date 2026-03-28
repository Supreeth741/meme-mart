'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { adminService } from '@/services/adminService';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/Pagination';

interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data } = await adminService.getAllUsers(page, 10);
      setUsers(data.data.data);
      setTotalPages(data.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-[1200px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">User Management</h1>
          <p className="text-slate-400 mt-1">View and manage all registered users</p>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">All Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-800">
                    <th className="pb-3 pr-4">Username</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-slate-800/50">
                      <td className="py-3 pr-4 font-semibold">{u.username}</td>
                      <td className="py-3 pr-4 text-slate-400">{u.email}</td>
                      <td className="py-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
