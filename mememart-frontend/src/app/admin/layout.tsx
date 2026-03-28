'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

const sidebarItems = [
  { href: '/admin', label: 'Analytics Dashboard', icon: 'dashboard' },
  { href: '/admin/users', label: 'User Management', icon: 'group' },
  { href: '/admin/reports', label: 'Reported Modules', icon: 'flag' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't show sidebar on admin login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute adminOnly>
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-500 text-lg">admin_panel_settings</span>
          </div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Admin</h2>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 top-16 lg:top-0 z-50 w-64 bg-slate-50 dark:bg-slate-900/80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-500 text-xl">admin_panel_settings</span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Admin Panel</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Meme Mart</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
    </ProtectedRoute>
  );
}
